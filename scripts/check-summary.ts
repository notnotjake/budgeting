#!/usr/bin/env bun

/**
 * Runs `bun run check` and outputs a summary of issues per file
 * Groups files when >5 share a common directory prefix
 */

export {}

const GROUP_THRESHOLD = 5
const DOMINANT_BRANCH_RATIO = 0.8 // If one branch has 80%+ of files, go deeper into it

const proc = Bun.spawn(['bun', 'run', 'check'], {
	stdout: 'pipe',
	stderr: 'pipe'
})

const stdout = await new Response(proc.stdout).text()
const stderr = await new Response(proc.stderr).text()
const output = stdout + stderr

// Parse svelte-check output
const fileStats = new Map<string, { errors: number; warnings: number }>()

const lines = output.split('\n')
let currentFile: string | null = null

for (const line of lines) {
	const fileMatch = line.match(/^(\/[^:]+\.(ts|svelte|js|tsx)):\d+:\d+/)
	if (fileMatch) {
		currentFile = fileMatch[1]
		if (!fileStats.has(currentFile)) {
			fileStats.set(currentFile, { errors: 0, warnings: 0 })
		}
	}

	if (currentFile) {
		if (line.includes('Error:')) {
			fileStats.get(currentFile)!.errors++
		} else if (line.includes('Warn:') || line.includes('Warning:') || line.includes('Hint:')) {
			fileStats.get(currentFile)!.warnings++
		}
	}
}

const cwd = process.cwd()

type FileEntry = { path: string; errors: number; warnings: number }

// Filter to files with issues and convert to relative paths
const filesWithIssues: FileEntry[] = [...fileStats.entries()]
	.filter(([, s]) => s.errors > 0 || s.warnings > 0)
	.map(([file, stats]) => ({ path: file.replace(cwd + '/', ''), ...stats }))

if (filesWithIssues.length === 0) {
	console.log('✓ No issues found')
	process.exit(0)
}

// Find the deepest common prefix shared by ALL paths in the set
function findCommonPrefix(paths: string[]): string {
	if (paths.length === 0) return ''
	if (paths.length === 1) {
		const parts = paths[0].split('/')
		return parts.slice(0, -1).join('/')
	}

	const parts = paths.map((p) => p.split('/'))
	const common: string[] = []

	for (let i = 0; i < parts[0].length - 1; i++) {
		const segment = parts[0][i]
		if (parts.every((p) => p[i] === segment)) {
			common.push(segment)
		} else {
			break
		}
	}

	return common.join('/')
}

function formatStats(errors: number, warnings: number): string {
	const parts: string[] = []
	if (errors > 0) parts.push(`${errors} error${errors > 1 ? 's' : ''}`)
	if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`)
	return `[${parts.join(', ')}]`
}

type GroupResult = { prefix: string | null; files: FileEntry[] }

// Split files by next directory level after the common prefix
function splitByNextLevel(files: FileEntry[], commonPrefix: string): Map<string, FileEntry[]> {
	const prefixDepth = commonPrefix ? commonPrefix.split('/').length : 0
	const branches = new Map<string, FileEntry[]>()

	for (const file of files) {
		const pathParts = file.path.split('/')
		const branchKey = pathParts.length > prefixDepth + 1 ? pathParts[prefixDepth] : '__file__'

		if (!branches.has(branchKey)) {
			branches.set(branchKey, [])
		}
		branches.get(branchKey)!.push(file)
	}

	return branches
}

// Recursively find optimal groupings
function findGroups(files: FileEntry[]): GroupResult[] {
	if (files.length <= GROUP_THRESHOLD) {
		return [{ prefix: null, files }]
	}

	const commonPrefix = findCommonPrefix(files.map((f) => f.path))
	const branches = splitByNextLevel(files, commonPrefix)

	// If only one branch, go deeper
	if (branches.size === 1 && !branches.has('__file__')) {
		const [, branchFiles] = [...branches.entries()][0]
		return findGroups(branchFiles)
	}

	// Check if there's a dominant branch (has most of the files)
	const branchSizes = [...branches.entries()]
		.filter(([k]) => k !== '__file__')
		.map(([k, v]) => ({ key: k, files: v, size: v.length }))
		.sort((a, b) => b.size - a.size)

	if (branchSizes.length > 0) {
		const largest = branchSizes[0]
		const ratio = largest.size / files.length

		if (ratio >= DOMINANT_BRANCH_RATIO && largest.size > GROUP_THRESHOLD) {
			// Process the dominant branch separately (go deeper)
			// and handle remaining files individually
			const results: GroupResult[] = []

			// Recurse into the dominant branch
			results.push(...findGroups(largest.files))

			// Add remaining files individually
			for (const branch of branchSizes.slice(1)) {
				results.push({ prefix: null, files: branch.files })
			}

			// Add direct files if any
			const directFiles = branches.get('__file__')
			if (directFiles) {
				results.push({ prefix: null, files: directFiles })
			}

			return results
		}
	}

	// No dominant branch - group at this level
	return [{ prefix: commonPrefix, files }]
}

const groups = findGroups(filesWithIssues)

type OutputItem =
	| { type: 'file'; path: string; errors: number; warnings: number }
	| {
			type: 'group'
			dir: string
			errors: number
			warnings: number
			files: FileEntry[]
	  }

const outputItems: OutputItem[] = []

for (const group of groups) {
	if (group.prefix === null) {
		for (const file of group.files) {
			outputItems.push({ type: 'file', ...file })
		}
	} else {
		const totalErrors = group.files.reduce((sum, f) => sum + f.errors, 0)
		const totalWarnings = group.files.reduce((sum, f) => sum + f.warnings, 0)

		outputItems.push({
			type: 'group',
			dir: group.prefix,
			errors: totalErrors,
			warnings: totalWarnings,
			files: group.files.sort((a, b) => b.errors + b.warnings - (a.errors + a.warnings))
		})
	}
}

// Sort: by total issues descending
outputItems.sort((a, b) => {
	const aTotal = a.errors + a.warnings
	const bTotal = b.errors + b.warnings
	return bTotal - aTotal
})

// Output
console.log('')

let totalErrors = 0
let totalWarnings = 0

for (let i = 0; i < outputItems.length; i++) {
	const item = outputItems[i]
	if (item.type === 'group') {
		console.log(`${item.dir}/ ${formatStats(item.errors, item.warnings)}`)
		for (const file of item.files) {
			const fileName = file.path.slice(item.dir.length + 1)
			console.log(`    ${fileName} ${formatStats(file.errors, file.warnings)}`)
		}
		totalErrors += item.errors
		totalWarnings += item.warnings
	} else {
		console.log(`${item.path} ${formatStats(item.errors, item.warnings)}`)
		totalErrors += item.errors
		totalWarnings += item.warnings
	}
	if (i < outputItems.length - 1) console.log('')
}

console.log(
	`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings in ${filesWithIssues.length} files`
)

process.exit(proc.exitCode ?? 0)
