/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Font Face Options
https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type FontPropertyHandler<T> = {
	validate: (value: T) => boolean
	format: (value: T) => string
	cssPropertyName: string
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

//
// Preload - Special Property
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload
export type FontPreload = boolean

//
// Variable Fonts - Special Property
// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide
export type FontVariable = boolean

//
// Display Mode
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
export const fontDisplayHandler: FontPropertyHandler<FontDisplay> = {
	validate: (value): boolean => {
		return value != null
	},
	format: (value): string => value,
	cssPropertyName: 'font-display'
}

//
// Size Adjust
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust
export type FontSizeAdjust = number
export const fontSizeAdjustHandler: FontPropertyHandler<FontSizeAdjust> = {
	validate: (value): boolean => {
		return typeof value === 'number' && value >= 0 && isFinite(value)
	},
	format: (value): string => {
		return `${value * 100}%`
	},
	cssPropertyName: 'size-adjust'
}

//
// Font Style
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-style
export type FontStyle =
	| 'normal'
	| 'italic'
	| 'oblique'
	| `oblique ${number}deg ${number}deg`
	| `oblique ${number}deg`
export const fontStyleHandler: FontPropertyHandler<FontStyle> = {
	validate: (value): boolean => {
		return value != null
	},
	format: (value): string => value,
	cssPropertyName: 'font-style'
}

//
// Font Weight
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-weight
export type FontWeightValue =
	| number
	| 'thin' // 100
	| 'extralight' // 200
	| 'light' // 300
	| 'normal' // 400
	| 'medium' // 500
	| 'semibold' // 600
	| 'bold' // 700
	| 'extrabold' // 800
	| 'black' // 900
export type FontWeight = 'auto' | FontWeightValue | Array<FontWeightValue>
export const fontWeightHandler: FontPropertyHandler<FontWeight> = {
	validate: (value): boolean => {
		const isValid = (item: string | number): boolean =>
			typeof item === 'string' || (typeof item === 'number' && item >= 1 && item <= 1000)

		if (value === 'auto') {
			return true
		} else if (typeof value === 'string' || typeof value === 'number') {
			return isValid(value)
		} else if (Array.isArray(value)) {
			return value.every(isValid)
		} else {
			return false
		}
	},
	format: (value): string => {
		if (Array.isArray(value)) {
			return value.join(' ')
		} else {
			return value.toString()
		}
	},
	cssPropertyName: 'font-weight'
}

//
// Feature Settings
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-feature-settings
export type FontFeatureSettings = string
export const fontFeatureSettingsHandler: FontPropertyHandler<FontFeatureSettings> = {
	validate: (value): boolean => {
		return value != null
	},
	format: (value): string => value,
	cssPropertyName: 'font-feature-settings'
}

//
// Variation Settings
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-variation-settings
export type FontVariationSettings = string
export const fontVariationSettingsHandler: FontPropertyHandler<FontVariationSettings> = {
	validate: (value): boolean => {
		return value != null
	},
	format: (value): string => value,
	cssPropertyName: 'font-variation-settings'
}

//
// Unicode Range
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range
export type FontUnicodeRange = string
export const fontUnicodeRangeHandler: FontPropertyHandler<FontUnicodeRange> = {
	validate: (value): boolean => {
		return value != null
	},
	format: (value): string => value,
	cssPropertyName: 'unicode-range'
}

//
// Line Gap Override
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/line-gap-override
export type LineGapOverride = number
export const lineGapOverrideHandler: FontPropertyHandler<LineGapOverride> = {
	validate: (value): boolean => {
		return typeof value === 'number' && value >= 0 && isFinite(value)
	},
	format: (value): string => {
		return `${value * 100}%`
	},
	cssPropertyName: 'line-gap-override'
}

//
// Ascent Override
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/ascent-override
export type AscentOverride = number
export const ascentOverrideHandler: FontPropertyHandler<AscentOverride> = {
	validate: (value): boolean => {
		return typeof value === 'number' && value >= 0 && isFinite(value)
	},
	format: (value): string => {
		return `${value * 100}%`
	},
	cssPropertyName: 'ascent-override'
}

//
// Descent Override
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/descent-override
export type DescentOverride = number
export const descentOverrideHandler: FontPropertyHandler<DescentOverride> = {
	validate: (value): boolean => {
		return typeof value === 'number' && value >= 0 && isFinite(value)
	},
	format: (value): string => {
		return `${value * 100}%`
	},
	cssPropertyName: 'descent-override'
}

//
// Stretch
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-stretch
export type FontStretchValue =
	| number
	| 'normal'
	| 'semi-condensed'
	| 'condensed'
	| 'extra-condensed'
	| 'ultra-condensed'
	| 'semi-expanded'
	| 'expanded'
	| 'extra-expanded'
	| 'ultra-expanded'
export type FontStretch = FontStretchValue | Array<FontStretchValue>
export const fontStretchHandler: FontPropertyHandler<FontStretch> = {
	validate: (value): boolean => {
		const isValid = (item: string | number): boolean =>
			typeof item === 'string' || (typeof item === 'number' && item >= 0.5 && item <= 2.0)

		if (typeof value === 'string' || typeof value === 'number') {
			return isValid(value)
		}
		if (Array.isArray(value)) {
			return value.every(isValid)
		} else {
			return false
		}
	},
	format: (value): string => {
		const formatSingleValue = (item: string | number): string => {
			if (typeof item === 'number') {
				return `${item * 100}%`
			} else {
				return item
			}
		}

		if (Array.isArray(value)) {
			return value.map(formatSingleValue).join(' ')
		} else {
			return formatSingleValue(value)
		}
	},
	cssPropertyName: 'font-stetch'
}

//
// Source Format and Source Tech
// https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src
export type SourceFormat =
	| 'woff'
	| 'woff2'
	| 'truetype'
	| 'opentype'
	| 'embedded-opentype'
	| 'svg'
	| 'collection'
export type SourceTech =
	| 'color-cbdt'
	| 'color-colrv0'
	| 'color-colrv1'
	| 'color-sbix'
	| 'color-svg'
	| 'features-aat'
	| 'features-graphite'
	| 'features-opentype'
	| 'incremental'
	| 'palettes'
	| 'variations'

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

export type FontOptions = {
	// Controls the loading and displaying of the font
	preload?: FontPreload
	display?: FontDisplay
	sizeAdjust?: FontSizeAdjust

	// Describes the font as part of the font family
	variable?: FontVariable
	style?: FontStyle
	weight?: FontWeight
	featureSettings?: FontFeatureSettings
	variationSettings?: FontVariationSettings
	unicodeRange?: FontUnicodeRange

	// Options to control the font
	lineGapOverride?: LineGapOverride
	ascentOverride?: AscentOverride
	descentOverride?: DescentOverride
	stretch?: FontStretch
}

type HandlerDictionary = {
	[K in keyof FontOptions]: FontPropertyHandler<NonNullable<FontOptions[K]>>
}
export const handlerDictionary: HandlerDictionary = {
	display: fontDisplayHandler,
	sizeAdjust: fontSizeAdjustHandler,
	style: fontStyleHandler,
	weight: fontWeightHandler,
	featureSettings: fontFeatureSettingsHandler,
	variationSettings: fontVariationSettingsHandler,
	unicodeRange: fontUnicodeRangeHandler,
	lineGapOverride: lineGapOverrideHandler,
	ascentOverride: ascentOverrideHandler,
	descentOverride: descentOverrideHandler,
	stretch: fontStretchHandler
}
