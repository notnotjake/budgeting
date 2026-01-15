#!/usr/bin/env bun
/**
 * Checks that the specified Docker project's containers are running
 * Usage: bun scripts/check-docker.ts <project-name>
 */

const projectName = process.argv[2];

if (!projectName) {
	console.error("Usage: bun scripts/check-docker.ts <project-name>");
	process.exit(1);
}

async function getRunningContainers(): Promise<string[]> {
	const proc = Bun.spawn(["docker", "ps", "--format", "{{.Names}}"]);
	const text = await new Response(proc.stdout).text();
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		console.error("\x1b[31m✗ Docker is not available (is it installed and running?)\x1b[0m");
		process.exit(1);
	}
	return text.trim().split("\n").filter(Boolean);
}

async function main() {
	const running = await getRunningContainers();
	const projectContainers = running.filter((name) => name.startsWith(`${projectName}-`));
	const otherContainers = running.filter((name) => !name.startsWith(`${projectName}-`));

	if (projectContainers.length === 0) {
		if (otherContainers.length > 0) {
			console.error("\x1b[31m✗ Wrong project's Docker containers are running:\x1b[0m");
			otherContainers.forEach((name) => console.error(`  - ${name}`));
			console.error(`\nRun: \x1b[33mbun run docker:start\x1b[0m`);
		} else {
			console.error(`\x1b[31m✗ No Docker containers running for ${projectName}\x1b[0m`);
			console.error(`\nRun: \x1b[33mbun run docker:start\x1b[0m`);
		}
		process.exit(1);
	}

	console.log(`\x1b[32m✓ Docker verified (${projectContainers.length} containers)\x1b[0m`);
}

main().catch((err) => {
	console.error("\x1b[31m✗ Unexpected error:\x1b[0m", err.message);
	process.exit(1);
});
