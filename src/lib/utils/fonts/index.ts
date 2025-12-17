import type { FontOptions, SourceFormat, SourceTech } from './properties'

import * as handlers from './properties'

export { default as LoadFonts } from './mount.svelte'

class Source {
	public _format?: SourceFormat
	public _tech?: SourceTech

	constructor(
		public path: string,
		public type: 'url' | 'local'
	) {}

	format(format: SourceFormat): this {
		this._format = format
		return this
	}

	tech(tech: SourceTech): this {
		this._tech = tech
		return this
	}
}
export function url(path: string): Source {
	return new Source(path, 'url')
}
export function local(name: string): Source {
	return new Source(name, 'local')
}

type FontFace = {
	src: Source | Array<Source>
} & Partial<FontOptions>

type FontFamilyOptions = {
	faces: FontFace[]
} & Partial<FontOptions>

type HeadElement = {
	type: 'css' | 'html'
	value: string
}

class TestClass {
	private headElements: Array<HeadElement>

	constructor(headElements: Array<HeadElement>) {
		this.headElements = headElements
	}

	// Add elements to the head elements array
	add(type: 'css' | 'html', value: string): void {
		this.headElements.push({ type, value })
	}
	// Generates the html to mount to the head, taking everything from headElements array
	gen(): string {
		const css = this.headElements
			.filter((elem) => elem.type === 'css')
			.map((elem) => elem.value)
			.join('\n')
		const preload = this.headElements
			.filter((elem) => elem.type === 'html')
			.map((elem) => elem.value)
			.join('\n')
		return `
			<!-- Font Imports -->
			<style>${css}</style>
			
			${preload}
			<!-- [END] Font Imports -->
		`
	}

	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

	// calls the process font face
	Face(name: string, definition: FontFace) {
		const { src, ...options } = definition
		this.processFontFace(name, src, options)
	}

	// looks at each face of the family and combines the family options and face options, preferring the face's value where conflicting
	Family(name: string, definition: FontFamilyOptions) {
		const { faces, ...familyOptions } = definition

		faces.forEach((face) => {
			const { src, ...faceOptions } = face
			const mergedOptions: Partial<FontOptions> = {
				...familyOptions,
				...faceOptions
			}

			this.processFontFace(name, src, mergedOptions)
		})
	}

	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

	processFontFace(name: string, src: Source | Array<Source>, options: FontOptions) {
		// CSS font-face Imports
		const css = this.processCss(name, src, options)
		this.add('css', css)

		// HTML Preload Links
		if (options?.preload ?? true) {
			const preload = this.processPreload(src)
			this.add('html', preload)
		}
	}

	processPreload(src: Source | Array<Source>): string {
		if (Array.isArray(src)) {
			src = src[0]
		}

		return `<link rel="preload" as="font" href="${src.path}" type="font/${src?._format ?? 'woff2'}" crossorigin />`
	}

	processCss(name: string, src: Source | Array<Source>, options: FontOptions): string {
		let generatedRules = ''

		let sourceValue = []
		for (const item of Array.isArray(src) ? src : [src]) {
			const resource = `${item.type}("${item.path}")`
			const format = item._format ? ` format(${item._format})` : ''
			const tech = item._tech ? ` tech(${item._tech})` : ''

			sourceValue.push(`${resource}${format}${tech}`)
		}
		generatedRules += `\nsrc: ${sourceValue.join(', \n')};`

		// get the key value pairs from the handler dictionary
		// handler dictionary contains option name as the key, and handler function name as the value
		// we then check whether the key is in the options passed for the font face
		// if it is, then we validate it, then will process it
		for (const [key, handler] of Object.entries(handlers.handlerDictionary)) {
			if (key in options) {
				if (handler.validate(options[key])) {
					const formattedValue = handler.format(options[key])
					generatedRules += `\n${handler.cssPropertyName}: ${formattedValue};`
				} else {
					console.error('Problem Processing Font Import')
					console.log(`${handler.cssPropertyName} - ${options[key]}`)
				}
			}
		}

		return `
			/* ${name} - ${options?.weight ?? 'Regular'} */
			@font-face {
				font-family: "${name}";${generatedRules}
			}
		`
	}
}
export function createFonts(): TestClass {
	const headElements: Array<HeadElement> = []
	return new TestClass(headElements)
}
