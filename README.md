When you want to have detached repositories co-located in a monorepo like the following:

monorepo/packages/mysharedlib   <- part of monorepo>
monorepo/sites/docsite          <- part of monorepo>
monorepo/sites/privatesite      <- from separate repo>

You need to change the dependency links of privatesite from "mysharedlib":"workspace:^" to "mysharedlib":"~1.0.0" when deploying the website so that the build process can succeed.

Similar to the publishConfig directive https://pnpm.io/package_json#publishconfig you just declare the versions for dependencies|devDependencies|peerDependencies in a deployConfig block and this tool will swap between those and workspace:^

You should trigger this command first in your scripts.build or potentially in scripts.install so that it adjusts the workspace links to the proper versions before the rest of the build.