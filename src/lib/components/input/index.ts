export { default as Button } from './button.svelte'
export { default as Textarea } from './textarea.svelte'

import InputButton from './button.svelte'
import Textarea from './textarea.svelte'

export const Input = {
	Button: InputButton,
	Textarea: Textarea
}
