Upgrade Hardhat and development toolchain (safe guidance)

This project includes Hardhat and related dev tools in `backend/devDependencies`.
Some transitive vulnerabilities may be fixed by upgrading those packages. The patch in `package.json` sets `hardhat` and `@nomicfoundation/hardhat-toolbox` to the `latest` tag so you can easily install the newest available versions and then test locally.

Steps (run from `mini/backend`):

1) Make a quick git stash/commit so you can revert if needed:

```powershell
cd c:\Users\achal\OneDrive\Documents\miniproject\mini\backend
git add package.json
git commit -m "chore: request latest hardhat/toolbox versions"
```

2) Install updated dev dependencies (this will update package-lock.json):

```powershell
npm install
```

3) Re-run audit to see remaining issues:

```powershell
npm audit
```

4) Run your Hardhat tests / build tasks to ensure compatibility. If any command breaks you can:

- Inspect which package caused the issue (npm will print conflicts) and revert to the previous commit:

```powershell
git reset --hard HEAD~1
npm ci
```

5) If everything passes, commit the updated lockfile:

```powershell
git add package-lock.json
git commit -m "chore: update dev deps to latest hardhat/toolbox"
```

Notes & cautions
- `npm audit` may still show some issues that cannot be fixed until upstream maintainers patch transitive dependencies.
- `npm audit fix --force` can upgrade major versions and potentially break behavior, so avoid it unless you can fully test and accept changes.
- For production servers, install only production dependencies (`npm ci --only=production`) so dev-tool vulnerabilities are not present on production hosts.

If you'd like, I can:
- Run a more conservative bump (pin to a specific known-good version) instead of `latest`.
- Attempt to update other transitive packages that `npm audit` reports (may require manual resolution).
