import type { ZodSchema, z } from 'zod'
import { createAttachmentKey } from 'svelte/attachments'

// Types
// Extract field names from Zod schema
type SchemaFields<T extends ZodSchema> = T extends z.ZodObject<infer Shape> ? keyof Shape : never

interface FormHandlerConfig<T extends ZodSchema> {
	schema?: T
	delayMs?: number
	timeoutMs?: number
	validation?: 'auto' | 'submit' // Defaults to 'auto'
	persist?: string
	preventMultipleSubmits?: boolean
	resetOnSuccess?: boolean
	
	// Callbacks
	onSubmit?: (args: { data: z.infer<T> }) => void | Promise<void>
	onResult?: (args: { result: any }) => void | Promise<void>
	onError?: (args: { error: any }) => void | Promise<void>
	onChange?: (args: { field: string; value: any }) => void | Promise<void>
	
	// Custom validators - type-safe based on schema fields
	validators?: Partial<Record<SchemaFields<T>, (value: any) => string | null | Promise<string | null>>>
	
	// Optimistic updates
	optimistic?: {
		apply: (data: z.infer<T>) => void
		rollback: (data: z.infer<T>, error: any) => void
	}
}

type RemoteForm = {
	method: string
	action: string
	onsubmit?: (event: SubmitEvent) => void | Promise<void>
	buttonProps?: any
	result?: any
	for?: any
	enhance: (callback?: any) => any
}

// Type for errors object with field-specific errors and 'all' property
type FormErrors<T extends ZodSchema> = {
	[K in SchemaFields<T>]?: string[]
} & {
	all: Array<{ field: string; message: string }>
}

export function createFormHandler<T extends ZodSchema>(
	remote: RemoteForm,
	config: FormHandlerConfig<T> = {}
) {
	type Data = z.infer<T>
	type Fields = SchemaFields<T>
	
	// Reactive state
	let pending = $state(false)
	let delayed = $state(false)
	let timeout = $state(false)
	let data = $state<Data>({} as Data)
	let errors = $state<Record<string, string[]>>({})
	let allErrors = $state<Record<string, string[]>>({}) // All validation errors
	let touched = $state<Set<string>>(new Set())
	let dirty = $state<Set<string>>(new Set())
	let isSubmitting = $state(false)
	
	// Timers
	let delayTimer: any
	let timeoutTimer: any
	
	// Load persisted data on creation
	if (config.persist && typeof window !== 'undefined') {
		try {
			const stored = localStorage.getItem(`form-${config.persist}`)
			if (stored) {
				const parsed = JSON.parse(stored)
				data = { ...data, ...parsed }
			}
		} catch (e) {
			console.error('Failed to load persisted form data:', e)
		}
	}
	
	// Helper to persist data
	function persistData() {
		if (config.persist && typeof window !== 'undefined') {
			try {
				localStorage.setItem(`form-${config.persist}`, JSON.stringify(data))
			} catch (e) {
				console.error('Failed to persist form data:', e)
			}
		}
	}
	
	// Parse Zod schema to generate HTML5 constraints
	function generateConstraints(): Record<string, any> {
		if (!config.schema) return {}
		
		const constraints: Record<string, any> = {}
		
		// Get shape from ZodObject - check shape directly
		const shape = (config.schema as any).shape || {}
		if (!shape || Object.keys(shape).length === 0) {
			console.warn('[Form Handler] No shape found on schema for constraints generation')
			return {}
		}
		
		for (const [field, fieldSchema] of Object.entries(shape)) {
			const fieldConstraints: any = {}
			const def = (fieldSchema as any)._def
			
			// Required
			if (def.typeName === 'ZodString' || def.typeName === 'ZodNumber') {
				fieldConstraints.required = true
			}
			
			// String constraints
			if (def.typeName === 'ZodString') {
				for (const check of def.checks || []) {
					switch (check.kind) {
						case 'min':
							fieldConstraints.minlength = check.value
							break
						case 'max':
							fieldConstraints.maxlength = check.value
							break
						case 'email':
							fieldConstraints.type = 'email'
							break
						case 'url':
							fieldConstraints.type = 'url'
							break
						case 'regex':
							fieldConstraints.pattern = check.regex.source
							break
					}
				}
			}
			
			// Number constraints
			if (def.typeName === 'ZodNumber') {
				fieldConstraints.type = 'number'
				for (const check of def.checks || []) {
					switch (check.kind) {
						case 'min':
							fieldConstraints.min = check.value
							break
						case 'max':
							fieldConstraints.max = check.value
							break
					}
				}
			}
			
			constraints[field] = fieldConstraints
		}
		
		return constraints
	}
	
	// Validate single field
	async function validateField(field: string, value: any): Promise<string[]> {
		console.log('[Form Handler] validateField called for:', field, 'with value:', value)
		const fieldErrors: string[] = []
		
		// Check if value is empty (for better error messages)
		const isEmpty = value === '' || value === null || value === undefined
		console.log('[Form Handler] isEmpty:', isEmpty)
		
		// Schema validation
		if (config.schema) {
			console.log('[Form Handler] Schema exists, checking shape...')
			
			// Try to access shape directly since _def.typeName might not exist
			const shape = (config.schema as any).shape
			console.log('[Form Handler] Schema shape:', shape)
			
			if (shape) {
				const fieldSchema = shape[field]
				console.log('[Form Handler] Field schema for', field, ':', fieldSchema)
				
				if (fieldSchema) {
					console.log('[Form Handler] Running safeParse for field:', field, 'with value:', value)
					const result = fieldSchema.safeParse(value)
					console.log('[Form Handler] Validation result:', result)
					
					if (!result.success) {
						console.log('[Form Handler] Validation failed, errors:', result.error.issues)
						// If the field is empty and required, show "Required" instead of schema messages
						if (isEmpty && !fieldSchema.isOptional()) {
							console.log('[Form Handler] Field is empty and required, pushing "Required"')
							fieldErrors.push('Required')
						} else {
							console.log('[Form Handler] Pushing schema error messages')
							fieldErrors.push(...result.error.issues.map((i: any) => i.message))
						}
					} else {
						console.log('[Form Handler] Validation passed')
					}
				} else {
					console.log('[Form Handler] No schema found for field:', field)
				}
			} else {
				console.log('[Form Handler] No shape found on schema')
			}
		} else {
			console.log('[Form Handler] No schema provided')
		}
		
		// Custom validation (only run if not empty or validator explicitly handles empty)
		if (config.validators?.[field as keyof typeof config.validators] && !isEmpty) {
			console.log('[Form Handler] Running custom validator for:', field)
			const customError = await config.validators[field as keyof typeof config.validators]!(value)
			if (customError) {
				fieldErrors.push(customError)
			}
		}
		
		console.log('[Form Handler] Final field errors for', field, ':', fieldErrors)
		return fieldErrors
	}
	
	// Validate entire form
	async function validateForm(formData: Record<string, any>): Promise<boolean> {
		const newErrors: Record<string, string[]> = {}
		let hasErrors = false
		
		// Schema validation
		if (config.schema) {
			console.log('[Form Handler] Validating form data:', formData)
			const result = config.schema.safeParse(formData)
			console.log('[Form Handler] Form validation result:', result)
			if (!result.success) {
				// Get shape to check if fields are optional
				const shape = (config.schema as any).shape || {}
				
				for (const issue of result.error.issues) {
					const path = issue.path.join('.')
					const value = formData[path]
					const isEmpty = value === '' || value === null || value === undefined
					
					if (!newErrors[path]) newErrors[path] = []
					
					// Check if field is required and empty
					if (isEmpty && shape[path] && !shape[path].isOptional()) {
						newErrors[path].push('Required')
					} else {
						newErrors[path].push(issue.message)
					}
				}
				hasErrors = true
			}
		}
		
		// Custom validators
		if (config.validators) {
			for (const [field, validator] of Object.entries(config.validators)) {
				const value = formData[field]
				const isEmpty = value === '' || value === null || value === undefined
				
				// Only run custom validators on non-empty values
				if (value !== undefined && !isEmpty) {
					const error = await validator(value)
					if (error) {
						if (!newErrors[field]) newErrors[field] = []
						newErrors[field].push(error)
						hasErrors = true
					}
				}
			}
		}
		
		// Store all errors internally
		allErrors = newErrors
		
		// Only show errors for touched fields
		const visibleErrors: Record<string, string[]> = {}
		for (const [field, fieldErrors] of Object.entries(newErrors)) {
			if (touched.has(field)) {
				visibleErrors[field] = fieldErrors
			}
		}
		errors = visibleErrors
		
		return !hasErrors
	}
	
	// Create form validation attachment using event delegation
	const validate = (formElement: HTMLFormElement) => {
		console.log('[Form Handler] ATTACHMENT CALLED! Attaching validation to form element:', formElement)
		console.log('[Form Handler] Form element tagName:', formElement.tagName)
		console.log('[Form Handler] Form element id:', formElement.id || 'no-id')
		
		// Prevent browser's beforeunload warning if persistence is enabled
		let beforeUnloadHandler: ((e: BeforeUnloadEvent) => any) | null = null
		
		if (typeof window !== 'undefined') {
			beforeUnloadHandler = (e: BeforeUnloadEvent) => {
				// If we're persisting data, don't show the warning
				if (config.persist && dirty.size > 0) {
					// Prevent the default behavior and don't set returnValue
					e.preventDefault()
					// Return nothing (not even undefined) to suppress warning
					return
				}
				// Otherwise let browser handle it normally
			}
			
			window.addEventListener('beforeunload', beforeUnloadHandler)
		}
		
		// Handle input events (delegated)
		async function handleInput(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
			
			const field = target.name
			const value = target.value
			console.log('[Form Handler] Input event on field:', field, 'value:', value)
			
			// Update data
			data[field as keyof Data] = value as any
			
			// Mark as dirty - need to reassign for reactivity
			dirty = new Set([...dirty, field])
			
			// Notify change
			config.onChange?.({ field, value })
			
			// Persist data
			persistData()
			
			// Always validate to track errors internally
			const fieldErrors = await validateField(field, value)
			console.log('[Form Handler] Validation result for', field, ':', fieldErrors)
			
			if (fieldErrors.length > 0) {
				allErrors[field] = fieldErrors
			} else {
				delete allErrors[field]
			}
			
			// Update allErrors reactivity
			allErrors = { ...allErrors }
			console.log('[Form Handler] Updated allErrors:', allErrors)
			
			// "Reward early, validate late" pattern
			if ((config.validation || 'auto') === 'auto') {
				console.log('[Form Handler] Checking if field has visible errors:', field, errors[field])
				// Only update visible errors on input if errors are currently visible for this field
				if (errors[field]) {
					if (fieldErrors.length > 0) {
						// Keep showing errors
						console.log('[Form Handler] Keeping errors visible for field:', field)
						errors = { ...errors, [field]: fieldErrors }
						// Update aria-invalid attribute
						target.setAttribute('aria-invalid', 'true')
						target.setAttribute('data-invalid', '')
					} else {
						// Field is now valid - immediately remove the error
						console.log('[Form Handler] Field is now valid, removing error for:', field)
						const newErrors = { ...errors }
						delete newErrors[field]
						errors = newErrors
						// Remove aria-invalid attribute
						target.removeAttribute('aria-invalid')
						target.removeAttribute('data-invalid')
					}
				} else {
					console.log('[Form Handler] No visible errors for field, waiting for blur:', field)
				}
				// If no visible errors, don't show any (wait for blur)
			}
		}
		
		// Handle blur events (delegated)
		async function handleBlur(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
			
			const field = target.name
			const value = target.value
			console.log('[Form Handler] Blur event on field:', field, 'value:', value)
			
			// Always validate on blur to ensure we have current validation state
			const fieldErrors = await validateField(field, value)
			if (fieldErrors.length > 0) {
				allErrors[field] = fieldErrors
			} else {
				delete allErrors[field]
			}
			
			// Update allErrors reactivity
			allErrors = { ...allErrors }
			console.log('[Form Handler] Blur - Updated allErrors:', allErrors)
			
			// Mark as touched - need to reassign for reactivity
			touched = new Set([...touched, field])
			console.log('[Form Handler] Blur - Field touched:', field)
			
			// "Validate late" - show errors on blur if they exist in allErrors
			if ((config.validation || 'auto') === 'auto') {
				if (allErrors[field]) {
					console.log('[Form Handler] Blur - Showing errors for field:', field, allErrors[field])
					errors = { ...errors, [field]: allErrors[field] }
					// Set aria-invalid attribute
					target.setAttribute('aria-invalid', 'true')
					target.setAttribute('data-invalid', '')
				} else {
					console.log('[Form Handler] Blur - No errors for field:', field)
					// Only remove if it exists to avoid unnecessary reactivity updates
					if (errors[field]) {
						console.log('[Form Handler] Blur - Removing visible errors for field:', field)
						const newErrors = { ...errors }
						delete newErrors[field]
						errors = newErrors
					}
					// Remove aria-invalid attribute
					target.removeAttribute('aria-invalid')
					target.removeAttribute('data-invalid')
				}
			}
			
			console.log('[Form Handler] Blur - Final errors state:', errors)
		}
		
		// Handle focus events for debugging
		async function handleFocus(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
			
			console.log('[Form Handler] Focus event on field:', target.name)
		}
		
		// Helper function to update aria-invalid attributes for all fields
		function updateFieldAttributes() {
			const inputs = formElement.querySelectorAll('input, textarea, select')
			inputs.forEach(input => {
				const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
				if (el.name) {
					if (errors[el.name]) {
						el.setAttribute('aria-invalid', 'true')
						el.setAttribute('data-invalid', '')
					} else {
						el.removeAttribute('aria-invalid')
						el.removeAttribute('data-invalid')
					}
				}
			})
		}
		
		// Sync initial values from form
		const inputs = formElement.querySelectorAll('input, textarea, select')
		console.log('[Form Handler] Syncing initial values from', inputs.length, 'inputs')
		inputs.forEach(input => {
			const el = input as HTMLInputElement
			if (el.name && el.value) {
				data[el.name as keyof Data] = el.value as any
				console.log('[Form Handler] Initial value for', el.name, ':', el.value)
			}
		})
		
		// Set initial aria-invalid attributes
		updateFieldAttributes()
		
		// Add event delegation listeners
		formElement.addEventListener('input', handleInput)
		formElement.addEventListener('blur', handleBlur, true) // Use capture for blur
		formElement.addEventListener('focus', handleFocus, true) // Use capture for focus
		
		console.log('[Form Handler] Event listeners attached')
		
		// Watch for programmatic changes to errors (e.g., setError, form submission)
		// We'll update attributes after any operation that might change errors
		let lastErrorsState = JSON.stringify(errors)
		const checkErrorsChanged = () => {
			const currentErrorsState = JSON.stringify(errors)
			if (currentErrorsState !== lastErrorsState) {
				console.log('[Form Handler] Errors state changed programmatically, updating attributes')
				updateFieldAttributes()
				lastErrorsState = currentErrorsState
			}
		}
		
		// Check for changes on next tick after any potential state change
		scheduleErrorCheck = () => queueMicrotask(checkErrorsChanged)
		
		// Return cleanup function for attachment
		return () => {
			console.log('[Form Handler] ATTACHMENT CLEANUP called!')
			// Remove delegated listeners
			formElement.removeEventListener('input', handleInput)
			formElement.removeEventListener('blur', handleBlur, true)
			formElement.removeEventListener('focus', handleFocus, true)
			
			// Remove beforeunload handler
			if (beforeUnloadHandler && typeof window !== 'undefined') {
				window.removeEventListener('beforeunload', beforeUnloadHandler)
			}
		}
	}
	
	// Create attachment key for validation
	const attachmentKey = createAttachmentKey()
	
	// Store reference to scheduleErrorCheck for use in handler
	let scheduleErrorCheck: (() => void) | null = null
	
	// Create the form handler object
	const handler = {
		// Forward spreadable form properties
		get method() { return remote.method },
		get action() { return remote.action },
		get onsubmit() { return remote.onsubmit },
		
		// Add validation attachment
		get [attachmentKey]() { 
			console.log('[Form Handler] Attachment key getter called!')
			return validate 
		},
		
		// Forward other remote properties
		get buttonProps() { return remote.buttonProps },
		get result() { return remote.result },
		get for() { return remote.for },
		
		// Our state
		get pending() { return pending },
		get delayed() { return delayed },
		get timeout() { return timeout },
		get data(): Data { return data },
		get isTainted() { return dirty.size > 0 },
		
		// Errors (only shows touched fields)
		get errors(): FormErrors<T> {
			return new Proxy(errors, {
				get(target, prop) {
					if (prop === 'all') {
						// Return array of {field, message} objects
						const all: Array<{ field: string; message: string }> = []
						for (const [field, fieldErrors] of Object.entries(target)) {
							for (const message of fieldErrors) {
								all.push({ field, message })
							}
						}
						return all
					}
					return target[prop as string]
				}
			}) as FormErrors<T>
		},
		
		// All errors (includes untouched fields)
		get allErrors(): FormErrors<T> {
			return new Proxy(allErrors, {
				get(target, prop) {
					if (prop === 'all') {
						// Return array of {field, message} objects
						const all: Array<{ field: string; message: string }> = []
						for (const [field, fieldErrors] of Object.entries(target)) {
							for (const message of fieldErrors) {
								all.push({ field, message })
							}
						}
						return all
					}
					return target[prop as string]
				}
			}) as FormErrors<T>
		},
		
		// Constraints from schema
		get constraints(): Record<Fields, any> {
			return generateConstraints() as Record<Fields, any>
		},
		
		// Methods
		setError(field: Fields | string, message: string | string[]) {
			const messages = Array.isArray(message) ? message : [message]
			allErrors[field] = messages
			errors[field] = messages
			// Mark as touched so error shows
			touched = new Set([...touched, field])
			// Schedule attribute update
			scheduleErrorCheck?.()
		},
		
		reset(newData?: Partial<Data>) {
			data = (newData || {}) as Data
			errors = {}
			allErrors = {}
			touched = new Set()
			dirty = new Set()
			pending = false
			delayed = false
			timeout = false
			
			// Clear or update persisted data
			if (config.persist && typeof window !== 'undefined') {
				if (newData) {
					persistData()
				} else {
					try {
						localStorage.removeItem(`form-${config.persist}`)
					} catch (e) {
						console.error('Failed to clear persisted form data:', e)
					}
				}
			}
			
			// Schedule attribute update
			scheduleErrorCheck?.()
		},
		
		// Enhanced enhance method
		enhance(userCallback?: (args: any) => void | Promise<void>) {
			// Get the enhanced props from remote
			const enhancedProps = remote.enhance(async (args: any) => {
				// Prevent multiple submits
				if (config.preventMultipleSubmits !== false && isSubmitting) {
					return
				}
				
				isSubmitting = true
				pending = true
				delayed = false
				timeout = false
				
				// Clear timers
				clearTimeout(delayTimer)
				clearTimeout(timeoutTimer)
				
				// Start delay timer
				if (config.delayMs) {
					delayTimer = setTimeout(() => {
						delayed = true
					}, config.delayMs)
				}
				
				// Start timeout timer
				if (config.timeoutMs) {
					timeoutTimer = setTimeout(() => {
						timeout = true
						pending = false
						isSubmitting = false
						handler.setError('_form', 'Request timed out')
					}, config.timeoutMs)
				}
				
				try {
					// Get form data
					const formData = new FormData(args.form)
					const formDataObj = Object.fromEntries(formData)
					
					// Update data from form
					for (const [key, value] of Object.entries(formDataObj)) {
						data[key as keyof Data] = value as any
					}
					
					// Run validation
					if ((config.validation || 'auto') !== 'submit' || config.schema) {
						const isValid = await validateForm(data as any)
						if (!isValid) {
							// Mark all fields with errors as touched so they become visible
							for (const field of Object.keys(allErrors)) {
								touched = new Set([...touched, field])
							}
							// Update visible errors to show all validation errors
							errors = { ...allErrors }
							// Schedule attribute update
							scheduleErrorCheck?.()
							return // Don't submit if validation fails
						}
					}
					
					// Call onSubmit
					await config.onSubmit?.({ data: data as Data })
					
					// Apply optimistic update
					if (config.optimistic) {
						config.optimistic.apply(data as Data)
					}
					
					// Call user callback or default submit
					if (userCallback) {
						await userCallback(args)
					} else {
						await args.submit()
					}
					
					// Handle success
					if (config.resetOnSuccess) {
						handler.reset()
					} else if (config.persist && typeof window !== 'undefined') {
						// Clear persisted data on success even if not resetting form
						try {
							localStorage.removeItem(`form-${config.persist}`)
						} catch (e) {
							console.error('Failed to clear persisted form data:', e)
						}
					}
					
					await config.onResult?.({ result: handler.result })
				} catch (error: any) {
					// Rollback optimistic update
					if (config.optimistic) {
						config.optimistic.rollback(data as Data, error)
					}
					
					// Map server errors
					if (error?.status === 400 && error?.body?.errors) {
						// Server errors should be shown immediately
						errors = error.body.errors
						allErrors = { ...allErrors, ...error.body.errors }
						
						// Mark fields as touched so errors show
						for (const field of Object.keys(error.body.errors)) {
							touched = new Set([...touched, field])
						}
						
						// Schedule attribute update
						scheduleErrorCheck?.()
					}
					
					await config.onError?.({ error })
					throw error
				} finally {
					clearTimeout(delayTimer)
					clearTimeout(timeoutTimer)
					pending = false
					delayed = false
					isSubmitting = false
				}
			})
			
			// Return combined props including our attachment
			return {
				...enhancedProps,
				[attachmentKey]: validate
			}
		}
	}
	
	return handler
}