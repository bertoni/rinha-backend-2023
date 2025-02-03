#!/usr/bin/env bash

/app/node_modules/prisma/build/index.js generate

/app/node_modules/prisma/build/index.js migrate deploy

node --max-semi-space-size=256 --max-old-space-size=350 /app/index.js
