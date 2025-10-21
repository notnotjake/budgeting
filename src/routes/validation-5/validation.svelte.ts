import type { RemoteForm } from '@sveltejs/kit'

type FieldState = {
	issues: string[] | null
	isShown: boolean
}

type ValidationState = Record<string, FieldState>

// Generic schema type that works with Zod, Valibot, ArkType, etc.
type Schema = {
	safeParse: (data: any) => {
		success: boolean
		error?: { issues: Array<{ path: any[]; message: string }> }
	}
}

export function createValidation<TSchema extends Schema>(
	form: RemoteForm<any, any>,
	schema: TSchema
) {
	let state = $state<ValidationState>({})

	// Track the version of server errors from the remote function
	// When this changes, we know the form was submitted and we should pull in server errors
	$effect(() => {
		const allServerIssues = form.fields.allIssues()

		if (allServerIssues && Object.keys(allServerIssues).length > 0) {
			// Server errors have been updated (form was submitted)
			// Pull them into our state and mark them as shown
			for (const [fieldName, issues] of Object.entries(allServerIssues)) {
				if (!state[fieldName]) {
					state[fieldName] = { issues: null, isShown: false }
				}

				state[fieldName].issues =
					issues && issues.length > 0 ? issues.map((issue: any) => issue.message) : null
				state[fieldName].isShown = true
			}
		}
	})

	function validateField(fieldName: string): string[] | null {
		const value = form.fields[fieldName]?.value()
		const result = (schema as any).safeParse({ [fieldName]: value })

		if (!result.success) {
			const fieldIssues = result.error.issues
				.filter((issue: any) => {
					// Handle nested path like ['fieldName'] or path starting with fieldName
					const path = issue.path
					return path.length > 0 && path[0] === fieldName
				})
				.map((issue: any) => issue.message)

			return fieldIssues.length > 0 ? fieldIssues : null
		}

		return null
	}

	function ensureFieldExists(fieldName: string) {
		if (!state[fieldName]) {
			state[fieldName] = { issues: null, isShown: false }
		}
	}

	function handleBlur(fieldName: string) {
		ensureFieldExists(fieldName)

		// Run client-side validation and mark as shown
		const issues = validateField(fieldName)
		state[fieldName].issues = issues
		state[fieldName].isShown = true
	}

	function handleInput(fieldName: string) {
		// Check if this field currently has visible issues
		const currentIssues = issuesProxy[fieldName]

		// Only validate if we're currently showing an error
		if (currentIssues && currentIssues.length > 0) {
			ensureFieldExists(fieldName)
			const issues = validateField(fieldName)
			state[fieldName].issues = issues
			// Keep isShown = true since it was already shown
		}
	}

	function reset() {
		state = {}
	}

	async function validateAll() {
		// Call the remote function's validate method
		await form.validate()

		// Get all server issues
		const allServerIssues = form.fields.allIssues()

		// Also run client-side validation on all fields
		// We need to get all field names from the form
		const fieldNames = Object.keys(form.fields).filter(
			(key) => typeof form.fields[key]?.value === 'function'
		)

		for (const fieldName of fieldNames) {
			ensureFieldExists(fieldName)

			// Check both client and server validation
			const clientIssues = validateField(fieldName)
			const serverIssues = allServerIssues?.[fieldName]

			// Prefer server issues if they exist, otherwise use client issues
			if (serverIssues && serverIssues.length > 0) {
				state[fieldName].issues = serverIssues.map((issue: any) => issue.message)
			} else {
				state[fieldName].issues = clientIssues
			}

			state[fieldName].isShown = true
		}
	}

	// Create a proxy for fields property access
	const fieldsProxy = new Proxy({} as Record<string, { onblur: () => void; oninput: () => void }>, {
		get(_target, fieldName: string) {
			return {
				onblur: () => handleBlur(fieldName),
				oninput: () => handleInput(fieldName)
			}
		}
	})

	// Create a proxy for issues property access
	const issuesProxy = new Proxy({} as Record<string, string[] | null>, {
		get(_target, fieldName: string) {
			const fieldState = state[fieldName]
			if (!fieldState || !fieldState.isShown) {
				return null
			}
			return fieldState.issues
		}
	})

	// Derived state for allIssues - only returns shown issues
	const allIssues = $derived.by(() => {
		const result: Record<string, string[] | null> = {}
		let hasAny = false

		for (const [fieldName, fieldState] of Object.entries(state)) {
			result[fieldName] = fieldState.issues
			if (fieldState.issues !== null) {
				hasAny = true
			}
		}

		return hasAny ? result : null
	})

	return {
		fields: fieldsProxy,
		issues: issuesProxy,
		get allIssues() {
			return allIssues
		},
		reset,
		validateAll
	}
}
