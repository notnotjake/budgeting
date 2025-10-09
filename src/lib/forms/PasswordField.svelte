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

<FormField {field} bind:value type="password" {...props} />