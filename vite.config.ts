import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'https'

function leetcodeDevPlugin() {
  return {
    name: 'leetcode-dev',
    configureServer(server: any) {
      server.middlewares.use('/api/leetcode', (_req: any, res: any) => {
        console.log('[LeetCode] dev middleware hit')
        const body = JSON.stringify({
          query: `query { matchedUser(username: "superkk1991") { userCalendar { submissionCalendar } badges { displayName icon creationDate } } }`,
        })
        const req2 = https.request(
          {
            hostname: 'leetcode.com',
            path: '/graphql',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body),
              'Referer': 'https://leetcode.com',
              'User-Agent': 'Mozilla/5.0',
            },
          },
          (r2) => {
            let data = ''
            r2.on('data', (chunk: any) => (data += chunk))
            r2.on('end', () => {
              try {
                const json = JSON.parse(data)
                const { userCalendar, badges } = json.data.matchedUser
                console.log('[LeetCode] got calendar, entries:', Object.keys(JSON.parse(userCalendar.submissionCalendar)).length, '| badges:', badges.length)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ submissionCalendar: userCalendar.submissionCalendar, badges }))
              } catch (e: any) {
                console.error('[LeetCode] parse error:', e.message, data.slice(0, 300))
                res.statusCode = 500
                res.end(JSON.stringify({ error: e.message }))
              }
            })
          }
        )
        req2.on('error', (e: any) => {
          console.error('[LeetCode] request error:', e.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: e.message }))
        })
        req2.write(body)
        req2.end()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), leetcodeDevPlugin()],
})