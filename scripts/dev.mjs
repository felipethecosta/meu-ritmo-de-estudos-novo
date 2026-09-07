#!/usr/bin/env node
// Wrapper around `next dev` that ignores YouHive-injected preview flags
// (e.g. --youhive-preview-owner=...) which otherwise get interpreted by
// Next.js as an invalid project directory and crash the dev server.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const rawArgs = process.argv.slice(2)
const passthrough = []
for (const arg of rawArgs) {
  if (arg === '--') continue
  if (arg.startsWith('--youhive')) continue
  passthrough.push(arg)
}

let nextBin
try {
  nextBin = require.resolve('next/dist/bin/next')
} catch (err) {
  console.error('[dev] failed to locate next binary:', err)
  process.exit(1)
}

const child = spawn(process.execPath, [nextBin, 'dev', ...passthrough], {
  stdio: 'inherit',
  env: process.env,
})

const forward = (signal) => {
  if (!child.killed) child.kill(signal)
}
process.on('SIGINT', () => forward('SIGINT'))
process.on('SIGTERM', () => forward('SIGTERM'))

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
