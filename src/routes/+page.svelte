<script>
	import { Button } from '$ui/input'
</script>

<div class="max-w-160 mx-auto flex min-h-full flex-col gap-2 bg-neutral-50 px-6 py-8">
	<h1 class="text-lg font-medium">SvelteKit Example</h1>

	<div
		class="flex flex-col gap-2 py-3 text-[0.92rem]/5 font-medium tracking-[-0.01em] text-neutral-600"
	>
		<p>
			When testing auth, you can sign up with email and after creating an account can continue just
			using your email for a passwordless experience, or you can add a passkey.
		</p>
	</div>

	<Button href="/login" style="primary" rounded="md" class="w-fit">Go to Login</Button>
</div>
