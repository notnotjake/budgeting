import { error } from '@sveltejs/kit'

/**
 * Helper functions for consistent error responses in remotes
 */

/**
 * Create a field validation error response
 * @param errors - Object with field names as keys and error messages as values
 * @param message - Optional general error message
 */
export function fieldErrors(
	errors: Record<string, string | string[]>,
	message = 'Validation failed'
) {
	// Normalize errors to always be arrays
	const normalizedErrors: Record<string, string[]> = {}
	
	for (const [field, fieldError] of Object.entries(errors)) {
		normalizedErrors[field] = Array.isArray(fieldError) ? fieldError : [fieldError]
	}
	
	return error(400, {
		message,
		errors: normalizedErrors
	})
}

/**
 * Create a single field error
 * @param field - The field name
 * @param message - The error message
 */
export function fieldError(field: string, message: string) {
	return fieldErrors({ [field]: message })
}

/**
 * Create a general form error (not field-specific)
 * @param message - The error message
 */
export function formError(message: string) {
	return error(400, {
		message,
		errors: { _form: [message] }
	})
}