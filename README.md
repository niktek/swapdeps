When you want to have detached repositories co-located in a monorepo like the following:
```
monorepo/packages/mysharedlib   # part of monorepo
monorepo/sites/docsite          # part of monorepo
monorepo/sites/privatesite      # from separate repo
```


When co-located as above, the package.json dependencies in privatesite will have a reference such as "mysharedlib":"workspace:*" which will resolve.  However, when privatesite is checked out in a non co-located situation such as a CI/CD or just external development, this reference will fail to resolve.

To make this resolvable, we take a similar approach to the publishConfig directive https://pnpm.io/package_json#publishconfig and declare the versions for dependencies|devDependencies in a deployConfig block and this tool will swap between those and workspace:*

`pnpm swapdeps workspace [copy] | versioned`

`pnpm swapdeps -w[c] | -v`

Optionally, when setting versions to workspace versions, you can include a copy or c arg to copy the values from dependencies|devDependencies into the deployConfig.  This allows you to use normal pnpm update to get the latest values and copy them back into deployConfig without having to manually update them.

Sample settings in package.json:
```
{
  "deployConfig": {
    "dependencies": {
      "is-ci": "^4.0.1"
    },
    "devDependencies": {
      "@skeletonlabs/skeleton": "^4.9.0"
    }
  }
}
```