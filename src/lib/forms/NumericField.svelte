<script lang="ts">
	import FormField from './FormField.svelte'
	import type { FieldInfo } from './enhanced-form-handler.svelte'
	import type { Snippet } from 'svelte'
	
	interface Props {
		field: FieldInfo
		value: any
		label?: string
		placeholder?: string
		errors?: Snippet<[{ errors: string[] }]>
		class?: string
		fieldClass?: string
		labelClass?: string
		errorClass?: string
	}
	
	let { field, value = $bindable(), ...props }: Props = $props()
</script>

<FormField {field} bind:value {...props}>
	{#snippet children({ field })}
		<input
			id={field.name}
			name={field.name}
			type="text"
			inputmode="numeric"
			pattern="[0-9]*"
			bind:value
			placeholder={props.placeholder}
			class={props.fieldClass}
			aria-invalid={field.errors.length > 0 ? 'true' : undefined}
			data-invalid={field.errors.length > 0 ? '' : undefined}
			{...field.constraints}
		/>
	{/snippet}
</FormField>