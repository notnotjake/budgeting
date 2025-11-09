import adapter from 'svelte-adapter-bun'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		experimental: {
			async: true
		}
	},
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		alias: {
			$remotes: 'src/lib/remotes',
			$ui: 'src/lib/components/',
			$utils: 'src/lib/utils/',
			$tailwind: 'src/lib/theme/app.css'
		}
	}
}

export default config
