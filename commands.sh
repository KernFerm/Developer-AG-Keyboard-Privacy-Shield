#!/usr/bin/env bash

set -euo pipefail

npm run prepare:protected
npm run pack:protected
npm run dist:protected
