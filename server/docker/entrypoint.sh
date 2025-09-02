#!/bin/sh
set -e

echo "[entrypoint] Generating Prisma client"
npm run prisma:generate

echo "[entrypoint] Pushing schema (or apply migrations)"
npm run prisma:push || true

echo "[entrypoint] Seeding database"
npm run prisma:seed || true

echo "[entrypoint] Starting server (dev)"
npm run start:dev


