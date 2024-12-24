#! /usr/bin/env sh

/app/node_modules/prisma/build/index.js generate

/app/node_modules/prisma/build/index.js migrate deploy

node /app/index.js
