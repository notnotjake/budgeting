import { sendEmail } from '../send'

import PaymentUpcoming from './templates/payment-upcoming'

const SEND_FROM = 'LightDance <accounts@resend.notnotjake.com>'

export async function paymentUpcoming({ email }: { email: string }) {
	const result = await sendEmail(
		{
			from: SEND_FROM,
			to: email,
			subject: 'Test',
			react: PaymentUpcoming()
		},
		`Payment upcoming.`
	)

	if (!result?.success) {
		throw Error()
	}

	return
}

export const sendPaymentEmail = {
	paymentUpcoming
}
