import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const distDir = resolve(process.cwd(), 'dist')
const indexPath = resolve(distDir, 'index.html')
const outPath = resolve(distDir, '404.html')

const indexHtml = readFileSync(indexPath, 'utf8')
writeFileSync(outPath, indexHtml, 'utf8')

console.log('[copy404] Copied dist/index.html -> dist/404.html')

