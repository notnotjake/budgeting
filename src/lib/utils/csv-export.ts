interface Subscription {
	id: string
	name: string
	company: string | null
	account: string | null
	tag: string | null
	amount: string
	frequency: 'day' | 'month'
	frequencyInterval: number
	dueDate: Date
	pauseDate: Date | null
	endDate: Date | null
}

function escapeCSVField(field: string): string {
	if (field.includes(',') || field.includes('"') || field.includes('\n')) {
		return `"${field.replace(/"/g, '""')}"`
	}
	return field
}

function formatPeriod(frequency: 'day' | 'month', frequencyInterval: number): string {
	if (frequency === 'day' && frequencyInterval === 7) return 'weekly'
	if (frequency === 'month' && frequencyInterval === 1) return 'monthly'
	if (frequency === 'month' && frequencyInterval === 12) return 'yearly'
	return `every ${frequencyInterval} ${frequency}${frequencyInterval > 1 ? 's' : ''}`
}

function formatDate(date: Date | null): string {
	if (!date) return ''
	return new Date(date).toISOString().split('T')[0]
}

function getStatus(sub: Subscription): string {
	if (sub.pauseDate) return 'paused'
	if (sub.endDate) return 'cancelled'
	return 'active'
}

export function subscriptionsToCSV(subscriptions: Subscription[]): string {
	const headers = ['Name', 'Company', 'Account', 'Tag', 'Amount', 'Period', 'Due Date', 'Status']
	const rows = subscriptions.map((sub) => [
		escapeCSVField(sub.name),
		escapeCSVField(sub.company ?? ''),
		escapeCSVField(sub.account ?? ''),
		escapeCSVField(sub.tag ?? ''),
		escapeCSVField(sub.amount),
		formatPeriod(sub.frequency, sub.frequencyInterval),
		formatDate(sub.dueDate),
		getStatus(sub)
	])

	return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export async function copyCSVToClipboard(csv: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(csv)
		return true
	} catch {
		return false
	}
}

export function downloadCSV(csv: string, filename: string = 'subscriptions.csv'): void {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
