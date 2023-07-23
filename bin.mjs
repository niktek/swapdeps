#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';

function findPnpmWorkspaceSync(directory) {
	const absolutePath = resolve(directory);

	const pnpmWorkspacePath = join(absolutePath, 'pnpm-workspace.yaml');
	if (existsSync(pnpmWorkspacePath)) {
		return absolutePath;
	}

	const parentDir = dirname(absolutePath);
	if (parentDir === absolutePath) {
		return false;
	}

	return findPnpmWorkspaceSync(parentDir);
}

export function makeWorkspacePackageLinks(pkg) {
	console.log('Setting dependencies to workspace:*');
	let clean = true;
	['dependencies', 'devDependencies'].forEach((depType) => {
		if (pkg?.deployConfig[depType] != undefined) {
			for (const [dep, version] of Object.entries(pkg?.deployConfig[depType])) {
				const semver = pkg[depType][dep]
				// We never write workspace scoped references to deployConfig
				if (!semver.startsWith('workspace:')) {
					pkg.deployConfig[depType][dep] = pkg[depType][dep];
				}
				pkg[depType][dep] = 'workspace:*';
				clean = false;
			}
		}
	});

	if (clean === false) {
		writeFileSync('./package.json', JSON.stringify(pkg, null, 4), 'utf8');
	}
}

// Bring the semver version from deployConfig into the dependencies and devDependencies
export function makeVersionedPackageLinks(pkg) {
	console.log('Setting dependencies to versioned');
	let clean = true;
	['dependencies', 'devDependencies'].forEach((depType) => {
		if (pkg?.deployConfig[depType] != undefined) {
			for (const [dep, version] of Object.entries(pkg?.deployConfig[depType])) {
				pkg[depType][dep] = version;
				clean = false;
			}
		}
	});
	if (clean === false) {
		writeFileSync('./package.json', JSON.stringify(pkg, null, 4), 'utf8');
	}
}

export async function swapdeps() {
	let pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
	let clean = true;
	const argv = process.argv.slice(2);

	switch (argv) {
		case 'versioned':
			makeVersionedPackageLinks(pkg);
			break;
		case 'workspace':
			makeWorkspacePackageLinks(pkg);
			break;
		case 'help':
			const help = `
swapdeps workspace 		# sets dependencies to workspace:*
swapdeps versioned 		# sets dependencies to versioned
`;
			console.log(help);
			break;
		default:
			const workspaceDir = findPnpmWorkspaceSync(process.cwd());
			if (workspaceDir === false) {
				makeVersionedPackageLinks(pkg);
			} else {
				makeWorkspacePackageLinks(pkg);
			}
	}
}

await swapdeps();
