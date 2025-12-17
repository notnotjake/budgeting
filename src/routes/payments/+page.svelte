<script lang="ts">
	import { createCustomer, checkoutProMonthly, checkProStatus } from './payments.remote'
</script>

<p>Test</p>
<div
	class="flex flex-col items-start gap-3 px-5 py-5 [&>button]:rounded-xl [&>button]:bg-blue-500 [&>button]:px-4 [&>button]:py-1 [&>button]:text-white"
>
	<button
		onclick={async () => {
			const res = await createCustomer()
			console.log(res)
		}}>Create</button
	>

	<button
		onclick={async () => {
			const url = await checkoutProMonthly()

			if (url) {
				console.log(url)
				window.location.href = url
			}

			if (!url) {
				console.log('checkout url not returned')
			}
		}}>Subscribe</button
	>

	<button
		onclick={async () => {
			const res = await checkProStatus()

			console.log(res)
		}}>Check</button
	>
</div>
