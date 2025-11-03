<script lang="ts">
	import { getUserSessions } from '$remotes/auth/session.remote'
	import { IconX, IconDeviceMobile, IconDeviceDesktop } from '@tabler/icons-svelte'
	import { DropdownMenu } from 'bits-ui'
	import { UAParser } from 'ua-parser-js'

	let sessions = $state(await getUserSessions())

	function relativeTimeString(date: Date): string {
		const now = new Date()

		const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

		// Time intervals in seconds
		const intervals: Record<string, number> = {
			month: 4 * 7 * 24 * 60 * 60,
			week: 7 * 24 * 60 * 60,
			day: 24 * 60 * 60,
			hour: 60 * 60,
			min: 60,
			sec: 1
		}

		// Check each interval
		for (const [unit, seconds] of Object.entries(intervals)) {
			const interval = Math.floor(secondsAgo / seconds)

			if (interval >= 1) {
				return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`
			}
		}

		return 'Just now'
	}

	function parseUserAgent(userAgent: string) {
		const res = UAParser(userAgent)

		return {
			browser: res.browser.name || 'Unkonw',
			platform: res.os.name || 'Unknown',
			deviceType: res.device.type || 'desktop'
		}
	}

	async function resolveLocation(ipAddress: string | null) {
		if (!ipAddress) {
			return null
		}

		try {
			let e = ipAddress
			if (ipAddress === '::1') {
				e = '73.251.1.194'
			}
			const res = await fetch(`https://get.geojs.io/v1/ip/geo/${e}.json`)
			const data = await res.json()
			return data
		} catch {
			return null
		}
	}

	const handleClick = () => {
		console.log('clicked')
	}
</script>

<div class="flex flex-col px-2 pb-3">
	{#each sessions.allSessions as session (session.id)}
		{@const parsedUserAgent = parseUserAgent(session.userAgent || '')}
		<div class="flex items-baseline justify-between rounded-2xl px-2 py-2 transition-all">
			<div class="flex w-full items-center">
				<div class="flex w-7 justify-start">
					{#if parsedUserAgent.deviceType === 'mobile'}
						<IconDeviceMobile class="text-neutral-500" size={22} />
					{:else}
						<IconDeviceDesktop class="text-neutral-500" size={22} />
					{/if}
				</div>
				<div class="flex grow items-baseline justify-start gap-1">
					<p class="text-[1.08rem] font-medium">{parsedUserAgent.platform}</p>
					<p class="font-medium text-neutral-300">{parsedUserAgent.browser}</p>
					{#await resolveLocation(session.ipAddress) then location}
						{#if location}
							<p class="pl-1 text-neutral-400">
								{location.city}, {location.region}, {location.country_code3}
							</p>
						{/if}
					{/await}
				</div>
				{#if session.id === sessions.currentSessionId}
					<p
						class="rounded-xl bg-neutral-700/60 px-2 py-1 text-[0.95rem] font-[450] text-neutral-300"
					>
						Current Device
					</p>
				{:else}
					<p class="text-[0.95rem] font-[450] text-neutral-300">
						Seen {relativeTimeString(session.lastSeenAt)}
					</p>
				{/if}
				<button
					onclick={handleClick}
					class="group ml-1 aspect-square rounded-xl p-1.5 hover:bg-neutral-500 active:scale-95"
				>
					<IconX class="text-neutral-400 group-hover:text-neutral-100" stroke={3} size={20} />
				</button>
			</div>
		</div>
	{/each}
</div>
