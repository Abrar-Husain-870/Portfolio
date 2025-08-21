import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

// Preload lightweight resume context once per lambda container
let resumeCtx = ''
try {
  // Prefer structured JSON if present
  const jsonPath = path.join(process.cwd(), 'src', 'content', 'resumeData.json')
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8')
    const data = JSON.parse(raw)
    resumeCtx = JSON.stringify(data)
  } else {
    const txtPath = path.join(process.cwd(), 'src', 'content', 'resume.txt')
    if (fs.existsSync(txtPath)) {
      resumeCtx = fs.readFileSync(txtPath, 'utf8')
    }
  }
} catch {}

const collabReply = "I’d be glad to collaborate on meaningful projects. You can reach me at husainabrar870@gmail.com, connect with me on LinkedIn, or explore my work on GitHub. Feel free to share your idea, and we can see how to build something impactful together."

function isCollabQuery(q: string) {
  const x = (q || '').toLowerCase()
  return x.includes('collaborate') || x.includes('collaboration') || x.includes('work together') || x.includes('partner') || x.includes('team up')
}

function answerFromResume(q: string): string {
  // Ultra-simple heuristic responder from resumeCtx
  const lower = q.toLowerCase()
  const lines: string[] = []

  if (resumeCtx.includes('Writify') && /writify/.test(lower)) {
    lines.push('• Writify: University assignment platform with Google OAuth, JWT, PostgreSQL, and responsive React + Tailwind UI.')
  }
  if (/skills?|top skills?/.test(lower)) {
    lines.push('• Core: React, TypeScript, TailwindCSS, Node/Express, PostgreSQL, Firebase, Next.js')
  }
  if (/experience|background|profile/.test(lower)) {
    lines.push('• Fullstack developer focused on performant, user-centered web apps, with projects across auth, analytics, and PWA.')
  }
  if (/projects?/.test(lower)) {
    lines.push('• Projects: Writify, Jamā’ah Journal (PWA, Firebase), Sahayak AI (NextAuth + Firestore), Keeper, Move It, Simon Game')
  }

  if (lines.length === 0) {
    // Default short response
    lines.push('I prefer to keep this chatbot focused on my professional experience. Feel free to ask about my skills, projects, or work.')
  }
  return lines.join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  try {
    const body = req.body || {}
    const msgs = body.messages || []
    const last = msgs.length ? msgs[msgs.length - 1].content || '' : ''

    if (isCollabQuery(last)) {
      return res.status(200).json({ message: collabReply })
    }

    const answer = answerFromResume(String(last || ''))
    return res.status(200).json({ message: answer })
  } catch (e) {
    return res.status(200).json({ message: 'Sorry, something went wrong. Please try again.' })
  }
}
