<script lang="ts">
	import { Button } from '$ui/input'
	import { IconCash, IconCalendar, IconCreditCard } from '@tabler/icons-svelte'
	import { site } from '$lib/site-config'

	let { data } = $props()

	let loggedIn = $derived(data.loggedIn ?? false)
</script>

<div class="min-h-screen w-full bg-neutral-50">
	<!-- Nav -->
	<nav class="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
		<p class="text-lg font-semibold tracking-tight text-neutral-900">{site.name}</p>
		<Button href={loggedIn ? '/app' : '/login'} style="primary" rounded="full" class="bg-neutral-900 px-5">
			{loggedIn ? 'Open App' : 'Sign In'}
		</Button>
	</nav>

	<!-- Hero -->
	<main class="mx-auto max-w-3xl px-6 pt-24 pb-32">
		<div class="flex flex-col items-center text-center">
			<h1 class="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
				Know where your money goes
			</h1>
			<p class="mt-4 max-w-md text-lg text-neutral-500">
				Track your subscriptions in one place. See what you're paying, when it's due, and never be surprised by a charge again.
			</p>
			<div class="mt-8 flex gap-3">
				<Button href={loggedIn ? '/subscriptions' : '/login'} style="primary" rounded="full" class="bg-neutral-900 px-6 py-2.5">
					Get Started
				</Button>
			</div>
		</div>

		<!-- Features -->
		<div class="mt-32">
			<div class="h-px bg-gradient-to-r from-transparent from-5% via-neutral-300 to-transparent to-95%"></div>
			<div class="grid sm:grid-cols-3">
				<div class="flex flex-col items-center py-8 text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
						<IconCash size={24} class="text-neutral-600" />
					</div>
					<h3 class="mt-4 font-medium text-neutral-900">Track Spending</h3>
					<p class="mt-1 text-sm text-neutral-500">See your monthly total at a glance</p>
				</div>
				<div class="flex flex-col items-center border-x border-neutral-200 py-8 text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
						<IconCalendar size={24} class="text-neutral-600" />
					</div>
					<h3 class="mt-4 font-medium text-neutral-900">Due Dates</h3>
					<p class="mt-1 text-sm text-neutral-500">Know when each payment hits</p>
				</div>
				<div class="flex flex-col items-center py-8 text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
						<IconCreditCard size={24} class="text-neutral-600" />
					</div>
					<h3 class="mt-4 font-medium text-neutral-900">By Account</h3>
					<p class="mt-1 text-sm text-neutral-500">Organize by card or account</p>
				</div>
			</div>
			<div class="h-px bg-gradient-to-r from-transparent from-5% via-neutral-300 to-transparent to-95%"></div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="py-8 text-center text-sm text-neutral-400">
		{site.name}
	</footer>
</div>
