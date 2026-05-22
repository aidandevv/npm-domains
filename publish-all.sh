#!/usr/bin/env bash
# Publish all placeholder packages to npm.
# Run: bash publish-all.sh
# Requires: npm login (npm adduser) first

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)/packages"

UNSCOPED=(aidan aidan-dev hire-aidan aidan-cli)
SCOPED=(@aidandev/aidan @aidandev/core @aidandev/cli)

echo "==> Publishing unscoped packages"
for pkg in "${UNSCOPED[@]}"; do
  echo "  -> $pkg"
  (cd "$ROOT/$pkg" && npm publish)
done

echo "==> Publishing scoped packages (public access)"
for pkg in "${SCOPED[@]}"; do
  echo "  -> $pkg"
  (cd "$ROOT/$pkg" && npm publish --access public)
done

echo "All done."
