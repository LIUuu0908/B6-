// 零依赖静态服务器：npm run dev -- --port=7100 --host=127.0.0.1
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const args = process.argv.slice(2)
const arg = (k, d) => {
  const a = args.find((a) => a.startsWith(`--${k}=`)) || args.find((a, i) => a === `--${k}` && args[i + 1])
  if (!a) return d
  return a.includes('=') ? a.split('=')[1] : args[args.indexOf(a) + 1]
}
const port = Number(arg('port', process.env.PORT || 7100))
const host = arg('host', process.env.HOST || '127.0.0.1')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (p === '/') p = '/index.html'
    const file = normalize(join(root, p))
    if (!file.startsWith(normalize(root))) { res.writeHead(403); return res.end() }
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
    res.end(data)
  } catch {
    res.writeHead(404); res.end('not found')
  }
}).listen(port, host, () => console.log(`晒场 SUN FIELD dev server → http://${host}:${port}/`))
