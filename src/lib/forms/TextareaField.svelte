<script lang="ts">
	import FormField from './FormField.svelte'
	import type { FieldInfo } from './enhanced-form-handler.svelte'
	import type { Snippet } from 'svelte'
	
	interface Props {
		field: FieldInfo
		value: any
		label?: string
		placeholder?: string
		rows?: number
		errors?: Snippet<[{ errors: string[] }]>
		class?: string
		fieldClass?: string
		labelClass?: string
		errorClass?: string
	}
	
	let { field, value = $bindable(), rows, ...props }: Props = $props()
</script>

<FormField {field} bind:value type="textarea" {...props}>
	{#snippet children({ field })}
		<textarea
			id={field.name}
			name={field.name}
			bind:value
			placeholder={props.placeholder}
			{rows}
			class={props.fieldClass}
			aria-invalid={field.errors.length > 0 ? 'true' : undefined}
			data-invalid={field.errors.length > 0 ? '' : undefined}
			{...field.constraints}
		></textarea>
	{/snippet}
</FormField>