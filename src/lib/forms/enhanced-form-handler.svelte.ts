import type { ZodSchema, z } from 'zod'
import { createAttachmentKey } from 'svelte/attachments'

type SchemaFields<T extends ZodSchema> = T extends z.ZodObject<infer Shape> ? keyof Shape : never

type ValidationEvent = {
	change: boolean
	blur: boolean
	submit: boolean
}

type ValidationResult = {
	ok: () => null
	error: (message: string) => string
}

type ValidatorFunction<T = any> = (args: {
	value: T
	event: ValidationEvent
	res: ValidationResult
}) => string | null | Promise<string | null>

interface FormHandlerConfig<T extends ZodSchema> {
	schema?: T
	delayMs?: number
	timeoutMs?: number
	validation?: 'auto' | 'submit'
	persist?: string
	preventMultipleSubmits?: boolean
	resetOnSuccess?: boolean
	
	onSubmit?: (args: { data: z.infer<T> }) => void | Promise<void>
	onResult?: (args: { result: any }) => void | Promise<void>
	onError?: (args: { error: any }) => void | Promise<void>
	onChange?: (args: { field: string; value: any }) => void | Promise<void>
	
	validators?: Partial<Record<SchemaFields<T>, ValidatorFunction>>
	
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

type FormErrors<T extends ZodSchema> = {
	[K in SchemaFields<T>]?: string[]
} & {
	all: Array<{ field: string; message: string }>
}

type FieldInfo<T = any> = {
	name: string
	value: T
	errors: string[]  // Visible errors (only shown after touch/blur)
	allErrors: string[]  // All validation errors (always current)
	constraints: Record<string, any>
	touched: boolean
	dirty: boolean
}

// Helper to create validation event objects
const createValidationEvent = (type: 'change' | 'blur' | 'submit'): ValidationEvent => ({
	change: type === 'change',
	blur: type === 'blur',
	submit: type === 'submit'
})

export function createEnhancedFormHandler<T extends ZodSchema>(
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
	let allErrors = $state<Record<string, string[]>>({})
	let touched = $state<Set<string>>(new Set())
	let dirty = $state<Set<string>>(new Set())
	let isSubmitting = $state(false)
	
	// Run initial validation to populate allErrors
	let initialValidationDone = false
	
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
	
	// Reactive validation - continuously validate data for allErrors
	$effect(() => {
		// Only run after initial setup
		if (!initialValidationDone) {
			initialValidationDone = true
			// Run validation but don't update visible errors
			validateForm(data, false, 'change')
		} else {
			// On subsequent changes, validate but don't change visible errors
			// This keeps allErrors always up to date
			validateForm(data, false, 'change')
		}
	})
	
	function persistData() {
		if (config.persist && typeof window !== 'undefined') {
			try {
				localStorage.setItem(`form-${config.persist}`, JSON.stringify(data))
			} catch (e) {
				console.error('Failed to persist form data:', e)
			}
		}
	}
	
	function generateConstraints(): Record<string, any> {
		if (!config.schema) return {}
		
		const constraints: Record<string, any> = {}
		const shape = (config.schema as any).shape || {}
		
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
	
	async function validateField(field: string, value: any, eventType: 'change' | 'blur' | 'submit' = 'change'): Promise<string[]> {
		const event = createValidationEvent(eventType)
		const fieldErrors: string[] = []
		const isEmpty = value === '' || value === null || value === undefined
		
		// Schema validation
		if (config.schema) {
			const shape = (config.schema as any).shape
			if (shape) {
				const fieldSchema = shape[field]
				if (fieldSchema) {
					const result = fieldSchema.safeParse(value)
					if (!result.success) {
						if (isEmpty && !fieldSchema.isOptional()) {
							fieldErrors.push('Required')
						} else {
							fieldErrors.push(...result.error.issues.map((i: any) => i.message))
						}
					}
				}
			}
		}
		
		// Custom validation with context
		if (config.validators?.[field as keyof typeof config.validators]) {
			// Skip custom validation for empty values unless it's a submit event
			if (!isEmpty || event.submit) {
				const res: ValidationResult = {
					ok: () => null,
					error: (message: string) => message
				}
				
				const customError = await config.validators[field as keyof typeof config.validators]!({
					value,
					event,
					res
				})
				
				if (customError) {
					fieldErrors.push(customError)
				}
			}
		}
		
		return fieldErrors
	}
	
	async function validateForm(formData: Record<string, any>, updateVisible: boolean = true, eventType: 'change' | 'blur' | 'submit' = 'change'): Promise<boolean> {
		const event = createValidationEvent(eventType)
		const newErrors: Record<string, string[]> = {}
		let hasErrors = false
		
		// Schema validation
		if (config.schema) {
			const result = config.schema.safeParse(formData)
			if (!result.success) {
				const shape = (config.schema as any).shape || {}
				
				for (const issue of result.error.issues) {
					const path = issue.path.join('.')
					const value = formData[path]
					const isEmpty = value === '' || value === null || value === undefined
					
					if (!newErrors[path]) newErrors[path] = []
					
					if (isEmpty && shape[path] && !shape[path].isOptional()) {
						newErrors[path].push('Required')
					} else {
						newErrors[path].push(issue.message)
					}
				}
				hasErrors = true
			}
		}
		
		// Custom validators with context
		if (config.validators) {
			for (const [field, validator] of Object.entries(config.validators)) {
				const value = formData[field]
				const isEmpty = value === '' || value === null || value === undefined
				
				// Skip custom validation for empty values unless it's a submit event
				if (value !== undefined && (!isEmpty || event.submit)) {
					const res: ValidationResult = {
						ok: () => null,
						error: (message: string) => message
					}
					
					const error = await validator({
						value,
						event,
						res
					})
					
					if (error) {
						if (!newErrors[field]) newErrors[field] = []
						newErrors[field].push(error)
						hasErrors = true
					}
				}
			}
		}
		
		// Always update allErrors to reflect current validation state
		allErrors = newErrors
		
		// Only update visible errors if requested
		if (updateVisible) {
			const visibleErrors: Record<string, string[]> = {}
			for (const [field, fieldErrors] of Object.entries(newErrors)) {
				if (touched.has(field)) {
					visibleErrors[field] = fieldErrors
				}
			}
			errors = visibleErrors
		}
		
		return !hasErrors
	}
	
	// Create form validation attachment using event delegation
	const validate = (formElement: HTMLFormElement) => {
		let beforeUnloadHandler: ((e: BeforeUnloadEvent) => any) | null = null
		
		if (typeof window !== 'undefined') {
			beforeUnloadHandler = (e: BeforeUnloadEvent) => {
				if (config.persist && dirty.size > 0) {
					e.preventDefault()
					return
				}
			}
			
			window.addEventListener('beforeunload', beforeUnloadHandler)
		}
		
		async function handleInput(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
			
			const field = target.name
			const value = target.value
			
			// Update data
			data[field as keyof Data] = value as any
			
			// Mark as dirty
			dirty = new Set([...dirty, field])
			
			// Notify change
			config.onChange?.({ field, value })
			
			// Persist data
			persistData()
			
			// The reactive effect will update allErrors automatically
			// Wait a tick for the effect to run
			await new Promise(resolve => setTimeout(resolve, 0))
			
			// "Reward early, validate late" pattern for visible errors
			if ((config.validation || 'auto') === 'auto') {
				// Only update visible errors if they're already showing
				if (errors[field]) {
					// Check current validation state from allErrors
					if (allErrors[field]) {
						// Keep showing errors
						errors = { ...errors, [field]: allErrors[field] }
						target.setAttribute('aria-invalid', 'true')
						target.setAttribute('data-invalid', '')
					} else {
						// Field is now valid - immediately remove the error
						const newErrors = { ...errors }
						delete newErrors[field]
						errors = newErrors
						target.removeAttribute('aria-invalid')
						target.removeAttribute('data-invalid')
					}
				}
			}
		}
		
		async function handleBlur(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
			
			const field = target.name
			const value = target.value
			
			// Mark as touched
			touched = new Set([...touched, field])
			
			// Run validation with 'blur' event type
			const fieldErrors = await validateField(field, value, 'blur')
			
			// Update allErrors with the blur validation result
			if (fieldErrors.length > 0) {
				allErrors = { ...allErrors, [field]: fieldErrors }
			} else {
				const newAllErrors = { ...allErrors }
				delete newAllErrors[field]
				allErrors = newAllErrors
			}
			
			// "Validate late" - show errors on blur
			if ((config.validation || 'auto') === 'auto') {
				if (fieldErrors.length > 0) {
					errors = { ...errors, [field]: fieldErrors }
					target.setAttribute('aria-invalid', 'true')
					target.setAttribute('data-invalid', '')
				} else {
					if (errors[field]) {
						const newErrors = { ...errors }
						delete newErrors[field]
						errors = newErrors
					}
					target.removeAttribute('aria-invalid')
					target.removeAttribute('data-invalid')
				}
			}
		}
		
		async function handleFocus(event: Event) {
			const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			if (!target.name || !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
		}
		
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
		inputs.forEach(input => {
			const el = input as HTMLInputElement
			if (el.name && el.value) {
				data[el.name as keyof Data] = el.value as any
			}
		})
		
		// Set initial aria-invalid attributes
		updateFieldAttributes()
		
		// Add event delegation listeners
		formElement.addEventListener('input', handleInput)
		formElement.addEventListener('blur', handleBlur, true)
		formElement.addEventListener('focus', handleFocus, true)
		
		let lastErrorsState = JSON.stringify(errors)
		const checkErrorsChanged = () => {
			const currentErrorsState = JSON.stringify(errors)
			if (currentErrorsState !== lastErrorsState) {
				updateFieldAttributes()
				lastErrorsState = currentErrorsState
			}
		}
		
		scheduleErrorCheck = () => queueMicrotask(checkErrorsChanged)
		
		return () => {
			formElement.removeEventListener('input', handleInput)
			formElement.removeEventListener('blur', handleBlur, true)
			formElement.removeEventListener('focus', handleFocus, true)
			
			if (beforeUnloadHandler && typeof window !== 'undefined') {
				window.removeEventListener('beforeunload', beforeUnloadHandler)
			}
		}
	}
	
	const attachmentKey = createAttachmentKey()
	let scheduleErrorCheck: (() => void) | null = null
	
	// Create field proxy for convenient field access
	const fieldProxy = new Proxy({} as Record<Fields, FieldInfo>, {
		get(target, fieldName: string) {
			const constraints = generateConstraints()
			return {
				name: fieldName,
				value: data[fieldName as keyof Data],
				errors: errors[fieldName] || [],  // Visible errors
				allErrors: allErrors[fieldName] || [],  // All validation errors
				constraints: constraints[fieldName] || {},
				touched: touched.has(fieldName),
				dirty: dirty.has(fieldName)
			}
		}
	})
	
	const handler = {
		// Forward spreadable form properties
		get method() { return remote.method },
		get action() { return remote.action },
		get onsubmit() { return remote.onsubmit },
		
		// Add validation attachment
		get [attachmentKey]() { 
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
		
		// Field access - the new API!
		get field(): Record<Fields, FieldInfo> {
			return fieldProxy
		},
		
		// Errors (only shows touched fields)
		get errors(): FormErrors<T> {
			return new Proxy(errors, {
				get(target, prop) {
					if (prop === 'all') {
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
			touched = new Set([...touched, field])
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
			
			scheduleErrorCheck?.()
		},
		
		enhance(userCallback?: (args: any) => void | Promise<void>) {
			const enhancedProps = remote.enhance(async (args: any) => {
				if (config.preventMultipleSubmits !== false && isSubmitting) {
					return
				}
				
				isSubmitting = true
				pending = true
				delayed = false
				timeout = false
				
				clearTimeout(delayTimer)
				clearTimeout(timeoutTimer)
				
				if (config.delayMs) {
					delayTimer = setTimeout(() => {
						delayed = true
					}, config.delayMs)
				}
				
				if (config.timeoutMs) {
					timeoutTimer = setTimeout(() => {
						timeout = true
						pending = false
						isSubmitting = false
						handler.setError('_form', 'Request timed out')
					}, config.timeoutMs)
				}
				
				try {
					const formData = new FormData(args.form)
					const formDataObj = Object.fromEntries(formData)
					
					for (const [key, value] of Object.entries(formDataObj)) {
						data[key as keyof Data] = value as any
					}
					
					if ((config.validation || 'auto') !== 'submit' || config.schema) {
						const isValid = await validateForm(data as any, true, 'submit')
						if (!isValid) {
							for (const field of Object.keys(allErrors)) {
								touched = new Set([...touched, field])
							}
							errors = { ...allErrors }
							scheduleErrorCheck?.()
							return
						}
					}
					
					await config.onSubmit?.({ data: data as Data })
					
					if (config.optimistic) {
						config.optimistic.apply(data as Data)
					}
					
					if (userCallback) {
						await userCallback(args)
					} else {
						await args.submit()
					}
					
					if (config.resetOnSuccess) {
						handler.reset()
					} else if (config.persist && typeof window !== 'undefined') {
						try {
							localStorage.removeItem(`form-${config.persist}`)
						} catch (e) {
							console.error('Failed to clear persisted form data:', e)
						}
					}
					
					await config.onResult?.({ result: handler.result })
				} catch (error: any) {
					if (config.optimistic) {
						config.optimistic.rollback(data as Data, error)
					}
					
					if (error?.status === 400 && error?.body?.errors) {
						errors = error.body.errors
						allErrors = { ...allErrors, ...error.body.errors }
						
						for (const field of Object.keys(error.body.errors)) {
							touched = new Set([...touched, field])
						}
						
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
			
			return {
				...enhancedProps,
				[attachmentKey]: validate
			}
		}
	}
	
	return handler
}