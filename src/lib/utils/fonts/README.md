# Easy Font Imports

A streamlined way to manage font imports. Instead of manually adding `<link>` and `<style>` tags in `svelte:head`, this tool allows you to define fonts in typescript, ensuring they are included **server-side** for immediate availability.

This approach improves **performance** by making fonts available as soon as the page loads, preventing layout shifts and ensuring better user experience.

**📌 When to Use:**
- Use this tool when you need to do a _custom_ font import either from the projects static assets or an arbitrary URL
- If your font is free and availadle from Google Fonts, then you're better off using [Fontsource](https://fontsource.org)

**✅ Best Practices:**

- Only preload fonts you use above-the-fold.
- **Use variable fonts when possible** to reduce file sizes.
- **Self-host fonts** for better privacy & performance.

**🚀 Quick Reference:**
Inside your `+page.svelte` or `+layout.svelte` file
```
<script lang="ts">
	import { createFonts, LoadFonts, url } from '$utils/Fonts'
	
	const Fonts = createFonts()

	Fonts.Face('Inter', {
		src: url('https://fonts.example.com/inter.woff2').format('woff2'),
		preload: true
	})
</script>

<LoadFonts {Fonts} />
```
---

## Usage

You can use this tool in `+page.svelte` or `+layout.svelte` files. Importing fonts into a layout file will make them available to all child routes.



### **1. Import the Fonts Utility**

Add `import { createFonts, LoadFonts, url } from '$utils/Fonts`

### **2. Initialize the fonts object**

Initialize a Fonts object using the createFonts() function

```
const Fonts = creatFonts()
```

### **3. Define your fonts**

Use **`Fonts.Face`** method to define a single font face:

```
Fonts.Face('Inter', {
	src: url('https://fonts.example.com/inter.woff2').format('woff2'),
	preload: true
})
```

Use **`Fonts.Family`** method to define a family with multiple faces:
- `Fonts.Family()` applies **shared settings** to all faces in the family.  
- Individual `faces` **override** any conflicting family-wide settings.
```
Fonts.Family('Roboto', {
	faces: [
		{
			src: url('/fonts/roboto-regular.woff2').format('woff2'),
			weight: '400',
			style: 'normal'
		},
		{
			src: url('/fonts/roboto-bold.woff2').format('woff2'),
			weight: '700',
			style: 'normal'
		},
		{
			src: url('/fonts/roboto-italic.woff2').format('woff2'),
			weight: '400',
			style: 'italic'
		}
	],
	preload: true
})
```

### **4. Load Fonts to Svelte**

In the svelte component (not in script tag) use the **`LoadFonts`** component
```
<LoadFonts {Fonts} />
```

---

## 📌 API Reference

### `Fonts.Face(name, options)`
Defines a **single font face**.
- `name` *(string)* – The name of the font face.  
- `options` *(object)* – Configuration options for the font (see table below).  
```
Fonts.Face('Custom Font', {
	src: url('/fonts/custom.woff2').format('woff2'),
	weight: '300',
	display: 'swap'
})
```
---

### `Fonts.Family(name, { faces, options})`
Defines a **font family** with multiple styles.

- `name` *(string)* – The font family name.  
- `options` *(object)* – Configuration options that apply to all faces **(can be overridden by individual faces)**.  
> **Note:** Any options in `Fonts.Family()` **apply to all faces** and can be overridden inside each face definition.

```
Fonts.Family('Lora', {
	faces: [
		{ src: url('/fonts/lora-regular.woff2').format('woff2'), weight: '400' },
		{ src: url('/fonts/lora-bold.woff2').format('woff2'), weight: '700' }
	],
	display: 'swap' // Applies to all faces unless overridden
})
```


---

### Setting src

Use either **`url()`** or **`local()`** imported from `$utils/Fonts` to define the font face's **src** (required)

Both have the methods:
- **`.format()`** to specify the file format (e.g., `'woff2'`).  
- **`.tech()`** for advanced font tech (e.g., `'variations'`).

#### **`url(path: string)`**
Creates a font source from an external URL or a self-hosted file.  

```
url('https://fonts.example.com/inter.woff2').format('woff2')
```

#### **`local(name: string)`**
References a system-installed font by name.  

```
local('Helvetica')
```

See [web spec](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) to understand differences

---

### **Options Reference**
All options available for `Fonts.Face()` and `Fonts.Family()`.

Conforms tightly to web spec. For property reference [view MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)

| Property         | Default   | Type                          | Description |
|-----------------|-----------|------------------------------|-------------|
| **`src`**           | **Required** | `Source` (from `url()` or `local()`) | The font file source, either a URL or local reference. |
| **`preload`**       | `true`    | `boolean`                     | Preloads the font (`<link rel="preload">`). |
| **`display`**       | `'auto'`  | `'auto' | 'block' | 'swap' | 'fallback' | 'optional'` | Controls how fonts are loaded. |
| `sizeAdjust`    | -         | `number`                      | Adjusts font rendering size (percentage). |
| `variable`      | -         | `boolean`                     | Marks font as a variable font. |
| **`style`**        | `'normal'` | `'normal' | 'italic' | 'oblique' | oblique-angle` | Font style. |
| **`weight`**        | `'normal'` | `number | string | Array<number | string>` | Font weight or multiple weight values. |
| `featureSettings` | -         | `string`                    | OpenType feature settings. |
| **`variationSettings`** | -         | `string`                  | Variable font settings. |
| `unicodeRange`  | -         | `string`                      | Unicode range specification. |
| `lineGapOverride` | -         | `number`                    | Overrides the line gap (percentage). |
| `ascentOverride` | -         | `number`                     | Adjusts ascent metric (percentage). |
| `descentOverride` | -         | `number`                     | Adjusts descent metric (percentage). |
| `stretch`       | -         | `'normal' | 'semi-condensed' | 'ultra-expanded' | ... | number` | Adjusts font width/stretch. |

