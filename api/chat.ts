import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

// Preload lightweight resume context once per lambda container
let resumeCtx = ''
let resumeData: any = null
try {
  // Prefer structured JSON if present
  const jsonPath = path.join(process.cwd(), 'src', 'content', 'resumeData.json')
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8')
    const data = JSON.parse(raw)
    resumeCtx = JSON.stringify(data)
    resumeData = data
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
  // Richer heuristic responder drawing from resumeData when available
  const lower = q.toLowerCase()

  // If JSON is available, use structured responses
  if (resumeData && typeof resumeData === 'object') {
    const basic = resumeData.basicInfo || {}
    const projects = Array.isArray(resumeData.projects) ? resumeData.projects : []
    const skills = resumeData.skills || {}
    const profSummary = resumeData.professionalSummary as string | undefined

    const bullet = (s: string) => `• ${s}`

    // Location question
    if (/where.*(live|based)|location|city|hometown/.test(lower)) {
      const loc = basic?.contact?.location
      if (loc) return `I’m based in ${loc}.`
    }

    // Specific project: Writify or any project mentioned by name
    const mentionedProject = projects.find((p: any) =>
      typeof p?.name === 'string' && lower.includes(p.name.toLowerCase())
    ) || (/(writify)/.test(lower) ? projects.find((p: any) => p?.name === 'Writify') : null)

    if (mentionedProject) {
      const p = mentionedProject
      const parts: string[] = []
      if (p.name) parts.push(`**${p.name}**`)
      if (p.description) parts.push(p.description)
      if (Array.isArray(p.techStack) && p.techStack.length) parts.push(`Tech Stack: ${p.techStack.join(', ')}`)
      if (Array.isArray(p.achievements) && p.achievements.length) {
        parts.push('Key Achievements:')
        parts.push(...p.achievements.map((a: string) => bullet(a)))
      }
      if (p.liveLink) parts.push(`Link: ${p.liveLink}`)
      return parts.join('\n')
    }

    // Projects overview
    if (/\bprojects?\b/.test(lower)) {
      if (projects.length) {
        const lines: string[] = ['Here are some of my projects:']
        for (const p of projects) {
          const item: string[] = []
          if (p.name) item.push(`**${p.name}**`)
          if (p.description) item.push(p.description)
          if (Array.isArray(p.techStack) && p.techStack.length) item.push(`Stack: ${p.techStack.join(', ')}`)
          if (Array.isArray(p.achievements) && p.achievements.length) {
            item.push('Highlights:')
            item.push(...p.achievements.slice(0, 3).map((a: string) => bullet(a)))
          }
          if (p.liveLink) item.push(`Link: ${p.liveLink}`)
          lines.push(item.join('\n'))
        }
        return lines.join('\n\n')
      }
    }

    // Skills
    if (/skills?|top skills?/.test(lower)) {
      const lines: string[] = []
      if (Array.isArray(skills.languages)) lines.push(bullet(`Languages: ${skills.languages.join(', ')}`))
      if (Array.isArray(skills.frameworks)) lines.push(bullet(`Frameworks: ${skills.frameworks.join(', ')}`))
      if (Array.isArray(skills.developerTools)) lines.push(bullet(`Developer Tools: ${skills.developerTools.join(', ')}`))
      if (Array.isArray(skills.technologies)) lines.push(bullet(`Technologies: ${skills.technologies.join(', ')}`))
      if (Array.isArray(skills.pythonLibraries)) lines.push(bullet(`Python Libraries: ${skills.pythonLibraries.join(', ')}`))
      if (lines.length) return lines.join('\n')
    }

    // Experience / background
    if (/experience|background|profile|summary/.test(lower)) {
      if (profSummary) return profSummary
      return 'Fullstack developer focused on performant, user-centered web apps.'
    }
  }

  // Fallbacks (when JSON is missing or no match)
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
  if (/where.*(live|based)|location|city|hometown/.test(lower)) {
    lines.push('I’m based in Lucknow, Uttar Pradesh.')
  }

  if (lines.length === 0) {
    return 'I prefer to keep this chatbot focused on my professional experience. Feel free to ask about my skills, projects, or work.'
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
