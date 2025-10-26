/**
 * A discriminated union type representing the result of an operation that can succeed or fail.
 *
 * @template T - The type of data returned on success
 *
 * @example
 * ```ts
 * // Success with data
 * const result: StructuredResponse<User> = { success: true, data: user }
 *
 * // Success without data
 * const result: StructuredResponse<never> = { success: true }
 *
 * // Failure with error message
 * const result: StructuredResponse<never> = { success: false, error: 'Not found' }
 * ```
 */
export type StructuredResponse<T> =
	| { success: true; data?: T; error?: never }
	| { success: false; data?: never; error?: string | null }

export const StructuredResponse = {
	/**
	 * Creates a successful response with optional data.
	 *
	 * @template T - The type of data being returned
	 * @param data - The data to include in the successful response
	 * @returns A StructuredResponse with success: true
	 *
	 * @example
	 * ```ts
	 * // With data
	 * return StructuredResponse.succeed(user)
	 *
	 * // Without data
	 * return StructuredResponse.succeed()
	 * ```
	 */
	succeed: <T>(data?: T): StructuredResponse<T> => {
		return { success: true, ...(data !== undefined && { data }) }
	},

	/**
	 * Creates a failed response with an optional error message.
	 *
	 * @param error - The error message describing what went wrong
	 * @returns A StructuredResponse with success: false
	 *
	 * @example
	 * ```ts
	 * return StructuredResponse.fail('User not found')
	 * ```
	 */
	fail: (error?: string | null): StructuredResponse<never> => {
		return { success: false, ...(error !== undefined && { error }) }
	}
}

/**
 * Unwraps a StructuredResponse, returning the data on success or invoking the error handler on failure.
 *
 * **Note:** Only use this with StructuredResponse results that return data (T is not never/void).
 * For operations that don't return data, check the success field directly instead.
 *
 * @template T - The type of data expected from the response
 * @param result - The StructuredResponse to unwrap
 * @param onError - Callback invoked with the error message if the response failed. Must not return (should throw or redirect).
 * @returns The data from the successful response
 *
 * @example
 * ```ts
 * const user = unwrap(
 *   await AuthCore.getUser({ identifier }),
 *   (msg) => { throw error(500, msg) }
 * )
 * ```
 */
export function unwrap<T>(result: StructuredResponse<T>, onError: (message: string) => never): T {
	if (!result.success) {
		return onError(result.error ?? 'Unknown error')
	}
	if (!result.data) {
		console.warn(
			'unwrap() throwing beacuse result has no data. Verify the function should return data otherwise remove unwrap call to prevent errors'
		)
		return onError(result.error ?? 'Data not returned in unwrap')
	}
	return result.data as T
}
