#!/usr/bin/env node
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { readFileSync, writeFileSync } from 'fs';
import mri from 'mri';

export function makeWorkspacePackageLinks(pkg, copyPackagesToDeployConfig = false) {
	console.log('Setting dependencies to workspace:*');
	let clean = true;
	['dependencies', 'devDependencies'].forEach((depType) => {
		if (pkg?.deployConfig[depType] != undefined) {
			for (const [dep, version] of Object.entries(pkg?.deployConfig[depType])) {
				if (copyPackagesToDeployConfig) {
					pkg.deployConfig[depType][dep] = pkg[depType][dep];
				}
				pkg[depType][dep] = 'workspace:*';
				clean = false;
			}
		}
	});
	if (clean === false) {
		writeFileSync('./package.json', JSON.stringify(pkg, null, 2), 'utf8');
	}
}

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
		writeFileSync('./package.json', JSON.stringify(pkg, null, 2), 'utf8');
	}
}

export async function swapdeps() {
	let pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
	let clean = true;
	const opts = {
		boolean: ['workspace', 'versioned', 'copy', 'help'],
		alias: { workspace: 'w', versioned: 'v', copy: 'c', help: 'h' }
	}
	const argv = process.argv.slice(2);
	const args = mri(argv, opts);
	if (args.help) {
		const help = `
swapdeps workspace 		# sets dependencies to workspace:*
swapdeps workspace copy # sets dependencies to workspace and copies current values to deployConfig
swapdeps versioned 		# sets dependencies to versioned
swapdeps -wc 			# short for workspace copy
swapdeps -v 			# short for versioned
`;
		console.log(help);
		return;
	}
	if (args.workspace && args.versioned) {
		console.error('Cannot set both workspace and versioned');
		return;
	}
	if (args.workspace) {
		makeWorkspacePackageLinks(pkg, args.copy);
		return;
	}
	if (args.versioned) {
		makeVersionedPackageLinks(pkg);
		return;
	}

	const workspaceDir = await findWorkspaceDir(process.cwd());
	if (workspaceDir === undefined) {
		makeVersionedPackageLinks(pkg);
	} else {
		makeWorkspacePackageLinks(pkg);
	}
}

await swapdeps();
