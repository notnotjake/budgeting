# SvelteKit Remote Form Handler

A comprehensive form handler for SvelteKit remotes that provides validation, error handling, and state management similar to superforms but designed specifically for the new remotes pattern.

## Features

- **Single object API** - Everything through one form handler instance
- **Automatic validation** - Client-side validation with Zod schemas
- **"Reward early, validate late"** - Best UX validation pattern
  - Errors only show on blur initially
  - Once errors are visible, they update on input
  - Errors disappear immediately when field becomes valid
  - If field becomes invalid again, errors wait for blur
- **State management** - `pending`, `delayed`, `timeout` states
- **Error handling** - Field-specific errors with `errors.fieldName` and `errors.all`
- **HTML5 constraints** - Generated from Zod schema
- **Form attachment** - Uses Svelte 5 attachments with event delegation
- **Type-safe validators** - Custom validators are typed based on schema fields
- **Callbacks** - `onSubmit`, `onResult`, `onError`, `onChange`
- **Optimistic updates** - With rollback support
- **Persistence** - Auto-saves to localStorage, prevents browser warnings

## Basic Usage

```svelte
<script>
  import { createFormHandler } from '$lib/remotes'
  import { createNote } from './notes.remote'
  import { z } from 'zod'
  
  const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required')
  })
  
  const form = createFormHandler(createNote, {
    schema,
    delayMs: 150,
    validation: 'auto' // Default - can be omitted
  })
</script>

<form {...form.enhance()}>
  <input 
    name="title"
    bind:value={form.data.title}
    {...form.constraints.title}
  />
  {#if form.errors.title}
    <span>{form.errors.title[0]}</span>
  {/if}
  
  <button disabled={form.pending}>
    {form.delayed ? 'Saving...' : 'Save'}
  </button>
</form>
```

## Server Error Handling

Use the provided helpers for consistent error responses:

```ts
import { form } from '$app/server'
import { fieldErrors, fieldError } from '$lib/remotes/server'

export const createNote = form(async (data) => {
  // Field-specific errors
  if (!isValid) {
    throw fieldErrors({
      title: 'Title already exists',
      body: ['Too short', 'Must be unique']
    })
  }
  
  // Single field error
  throw fieldError('email', 'Email already taken')
})
```

## API Reference

### Form Handler Properties

- `form.data` - Reactive form data object
- `form.pending` - True while submitting
- `form.delayed` - True after delayMs
- `form.timeout` - True after timeoutMs
- `form.errors.fieldName` - Array of errors for field
- `form.errors.all` - Array of all errors
- `form.result` - Result from the remote (typed)
- `form.isTainted` - True if any field was modified
- `form.constraints` - HTML5 validation attributes

### Methods

- `form.enhance()` - Returns enhanced form props with validation attachment
- `form.setError(field, message)` - Set field error
- `form.reset(data?)` - Reset form with optional data

### Configuration Options

- `schema` - Zod schema for validation
- `validation` - 'auto' | 'submit' (default: 'auto')
  - `auto`: "Reward early, validate late" pattern (recommended)
  - `submit`: Only validate on form submission
- `delayMs` - Delay before showing loading state
- `timeoutMs` - Timeout for requests
- `resetOnSuccess` - Reset form after success
- `persist` - Key for localStorage persistence
- `preventMultipleSubmits` - Prevent concurrent submissions
- `validators` - Custom async field validators (type-safe!)
- `onSubmit/onResult/onError/onChange` - Event callbacks
- `optimistic` - Optimistic update configuration

### Type-Safe Custom Validators

The `validators` option is now type-safe based on your schema fields:

```ts
const form = createFormHandler(createUser, {
  schema: userSchema,
  validators: {
    // TypeScript knows these are the only valid fields!
    email: async (value) => {
      const exists = await checkEmailExists(value)
      return exists ? 'Email already taken' : null
    },
    // username: ... // TypeScript suggests available fields
  }
})
```