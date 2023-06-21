#!/usr/bin/env node
import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { readFileSync, writeFileSync } from 'fs';

export function makeWorkspacePackageLinks(pkg) {
	let clean = true;
	['dependencies', 'devDependencies', 'peerDependencies'].forEach((depType) => {
		if (pkg?.deployConfig[depType] != undefined) {
			for (const [dep, version] of Object.entries(pkg?.deployConfig[depType])) {
				pkg[depType][dep] = 'workspace:*';
				clean = false;
			}
		}
	});
	return { pkg: pkg, clean: clean };
}

export function makeVersionedPackageLinks(pkg) {
	let clean = true;
	['dependencies', 'devDependencies', 'peerDependencies'].forEach((depType) => {
		if (pkg?.deployConfig[depType] != undefined) {
			for (const [dep, version] of Object.entries(pkg?.deployConfig[depType])) {
				pkg[depType][dep] = version;
				clean = false;
			}
		}
	});
	return { pkg: pkg, clean: clean };
}

export async function swapdeps() {
	let pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
	let clean = true;

	switch (process.argv.slice(2)[0]) {
		case 'workspace':
			console.log('Setting dependencies to workspace:^');
			({ pkg, clean } = makeWorkspacePackageLinks(pkg));
			break;
		case 'versioned':
			console.log('Setting dependencies to versioned');
			({ pkg, clean } = makeVersionedPackageLinks(pkg));
			break;
		case '-h':
		case 'h':
		case '--help':
		case 'help':
			console.log(
				'swapdeps [workspace|versioned] or no args for auto-',
			);
			break;
		default:
			const workspaceDir = await findWorkspaceDir(process.cwd());
			if (workspaceDir === undefined) {
				({ pkg, clean } = makeVersionedPackageLinks(pkg));
				console.log(clean)
			} else {
				({ pkg, clean } = makeWorkspacePackageLinks(pkg));
			}
	}
	if (clean === false) {
		writeFileSync('./package.json', JSON.stringify(pkg, null, 2), 'utf8');
	}
}

await swapdeps();
