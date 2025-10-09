<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { FieldInfo } from './enhanced-form-handler.svelte'
	
	interface Props {
		field: FieldInfo
		value: any
		label?: string
		type?: string
		placeholder?: string
		children?: Snippet<[{ field: FieldInfo }]>
		options?: Snippet
		errors?: Snippet<[{ errors: string[] }]>
		class?: string
		fieldClass?: string
		labelClass?: string
		errorClass?: string
	}
	
	let { 
		field,
		value = $bindable(),
		label, 
		type = 'text',
		placeholder,
		children,
		options,
		errors,
		class: className = '',
		fieldClass = '',
		labelClass = '',
		errorClass = ''
	}: Props = $props()
</script>

<div class="field {className}">
	{#if label}
		<label for={field.name} class={labelClass}>
			{label}
		</label>
	{/if}
	
	{#if children}
		{@render children({ field })}
	{:else if type === 'textarea'}
		<textarea
			id={field.name}
			name={field.name}
			bind:value
			{placeholder}
			class={fieldClass}
			aria-invalid={field.errors.length > 0 ? 'true' : undefined}
			data-invalid={field.errors.length > 0 ? '' : undefined}
			{...field.constraints}
		></textarea>
	{:else if type === 'select'}
		<select
			id={field.name}
			name={field.name}
			bind:value
			class={fieldClass}
			aria-invalid={field.errors.length > 0 ? 'true' : undefined}
			data-invalid={field.errors.length > 0 ? '' : undefined}
			{...field.constraints}
		>
			{#if options}
				{@render options()}
			{/if}
		</select>
	{:else}
		<input
			id={field.name}
			name={field.name}
			{type}
			bind:value
			{placeholder}
			class={fieldClass}
			aria-invalid={field.errors.length > 0 ? 'true' : undefined}
			data-invalid={field.errors.length > 0 ? '' : undefined}
			{...field.constraints}
		/>
	{/if}
	
	{#if field.errors.length > 0}
		{#if errors}
			{@render errors({ errors: field.errors })}
		{:else}
			<div class="error {errorClass}">{field.errors[0]}</div>
		{/if}
	{/if}
</div>

<style>
	.field {
		margin-bottom: 1rem;
	}
	
	label {
		display: block;
		font-weight: bold;
		margin-bottom: 0.25rem;
	}
	
	input,
	textarea,
	select {
		display: block;
		width: 100%;
		padding: 0.5rem;
		margin-top: 0.25rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	
	input[aria-invalid="true"],
	textarea[aria-invalid="true"],
	select[aria-invalid="true"] {
		border-color: #e74c3c;
	}
	
	.error {
		color: #e74c3c;
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}
</style>