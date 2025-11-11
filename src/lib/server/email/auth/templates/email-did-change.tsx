import * as React from 'react'
import {
	Body,
	Preview,
	Container,
	Head,
	Heading,
	Html,
	Text,
	Tailwind,
	Section,
	Button
} from '@react-email/components'

import { HeaderGroup } from '../components/header-group'

type Options = {
	updatedEmail: string
	lockLink: string
}

const EmailDidChange = ({ updatedEmail, lockLink }: Options) => {
	return (
		<Html>
			<Preview>Your account's email has been changed to {updatedEmail}</Preview>
			<Tailwind>
				<Head>
					<meta name="color-scheme" content="light dark" />
					<meta name="supported-color-schemes" content="light dark" />
				</Head>
				<Body className="bg-white font-sans dark:bg-neutral-900">
					<Container className="w-full max-w-none bg-white pb-[40px] pt-[50px] dark:bg-neutral-900">
						<Section className="mx-auto max-w-[430px] px-1">
							<HeaderGroup
								headingText="Your account email has been changed"
								descriptiveText={
									<>
										You can now login to your account using{' '}
										<span className="text-neutral-700 dark:text-neutral-300">{updatedEmail}</span>
									</>
								}
							/>

							<Section className="mb-6 mt-8">
								<Button
									className="m-0 box-border h-[50px] w-full rounded-[14px] bg-black px-[24px] py-[14px] text-center text-[16px] font-medium text-white dark:bg-neutral-50 dark:text-black"
									href={lockLink}
								>
									Don't Recognize Activity
								</Button>
							</Section>
							<Text className="m-0 mb-[32px] text-left text-[16px] tracking-[-0.01em] text-neutral-500 dark:text-neutral-400">
								If you did not take this action, click this link to secure your account
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export default EmailDidChange

EmailDidChange.PreviewProps = {
	updatedEmail: 'john@apple.com',
	lockLink: 'localhost:5173/lock?test'
} as Options
