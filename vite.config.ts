import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

// Silence TS about Buffer in Vite config context
declare const Buffer: any

// Dev-only /api/chat middleware. If a Gemini key is provided, it will call Gemini; otherwise falls back to heuristic mock.
const devChatMock = (geminiApiKey?: string, geminiModel?: string): Plugin => ({
  name: 'dev-chat-mock',
  apply: 'serve',
  configureServer(server) {
    const handler = async (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next()
      try {
        // Collect body
        const chunks: any[] = []
        for await (const chunk of req as any) chunks.push(chunk as any)
        const raw = Buffer.concat(chunks).toString('utf-8')
        const body = raw ? JSON.parse(raw) : {}

        // Read raw resume text only (single source of truth for AI)
        const resumeText: string = await (async () => {
          try {
            // Dynamic import of Node fs in Vite config context
            // @ts-ignore
            const fsMod: any = await import('fs/promises')
            const root = (server.config?.root || '.')
            const filePath = `${root}/src/content/resume.txt`
            const raw = await fsMod.readFile(filePath, 'utf-8')
            return raw
          } catch {
            return ''
          }
        })()

        const userMessage: string = body?.messages?.find((m: any) => m.role === 'user')?.content || ''
        const q = userMessage.toLowerCase()

        // Prefer structured resumeData.json if available
        const resumeData: any = await (async () => {
          try {
            // @ts-ignore
            const fsMod: any = await import('fs/promises')
            const root = (server.config?.root || '.')
            const filePath = `${root}/src/content/resumeData.json`
            const txt = await fsMod.readFile(filePath, 'utf-8')
            return JSON.parse(txt)
          } catch {
            return null
          }
        })()

        const replyFromStructured = async (data: any, msg: string): Promise<string | null> => {
          if (!data) return null
          const raw = (msg || '')
          const name = data?.basicInfo?.name || 'Syed Abrar Husain'

          // 1) Normalize query: lowercase, strip filler, expand synonyms
          const normalize = (q: string) => {
            let t = (q || '').toLowerCase()
            const fillers = [
              'can you', 'could you', 'would you', 'please', 'please share', 'i want to know',
              'tell me', 'let me know', 'i would like to know', 'share', 'about', 'in your',
              'where have you', 'where did you', 'from where did you', 'kindly', 'pls', 'plz'
            ]
            for (const f of fillers) t = t.replace(new RegExp(`\\b${f}\\b`, 'g'), ' ')
            // synonym expansion (map to canonical tokens)
            const syn: Record<string, string> = {
              'schooling': ' education ',
              'school': ' education ',
              'uni': ' university ',
              'college': ' university ',
              'stack': ' skills ',
              'tech stack': ' skills ',
              'frameworks': ' skills ',
              'tools': ' skills ',
              'finals': ' achievements ',
              'awards': ' achievements ',
              'prizes': ' achievements ',
              'hackathons': ' achievements ',
            }
            for (const [k, v] of Object.entries(syn)) t = t.replace(new RegExp(`\\b${k}\\b`, 'g'), v)
            return t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
          }
          const t = normalize(raw)

          const isGreeting = /^(hi|hello|hey|yo|hola|namaste|salam)[!,\s]*$/i.test(raw)
            || /(hi|hello|hey) there/i.test(raw)

          if (!raw || isGreeting) {
            return "Hi, I’m Syed Abrar Husain’s AI assistant. You can ask me about my skills, projects, or experience."
          }

          // 2) Semantic-like intent scoring (primary), regex (backup), and optional Gemini classification
          const classifyIntentGemini = async (question: string): Promise<
            'skills' | 'education' | 'projects' | 'achievements' | 'greeting' | 'summary' | 'other' | null
          > => {
            if (!geminiApiKey) return null
            try {
              const mod: any = await import('@google/genai')
              const GoogleGenerativeAI = mod.GoogleGenerativeAI || mod.default
              const genAI = new GoogleGenerativeAI(geminiApiKey)
              const model = genAI.getGenerativeModel({ model: (geminiModel || 'gemini-2.0-flash') })
              const prompt = [
                'Classify the user question into exactly one intent label from this set:',
                'skills | education | projects | achievements | greeting | summary | other',
                'Output ONLY the label, nothing else.',
                `Question: ${question}`,
              ].join('\n')
              const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
              const label = (result?.response?.text?.() || '').trim().toLowerCase()
              const allowed = ['skills','education','projects','achievements','greeting','summary','other']
              return (allowed.includes(label) ? (label as any) : null)
            } catch {
              return null
            }
          }
          const intents = {
            skills: ['skill', 'skills', 'technology', 'technologies', 'tech', 'stack', 'languages', 'frameworks', 'tools', 'libraries'],
            education: ['education', 'educational background', 'academic', 'academics', 'schooling', 'degree', 'university', 'college', 'school', 'cgpa', 'gpa', 'graduation', 'duration'],
            projects: ['project', 'projects', 'app', 'application', 'built', 'developed', 'writify', 'moveit', 'journal', 'jama'],
            achievements: ['achievement', 'achievements', 'award', 'awards', 'prize', 'hackathon', 'leadership', 'extracurricular'],
            contact: ['email', 'e-mail', 'mail', 'phone', 'mobile', 'contact', 'location', 'city', 'live', 'based', 'linkedin', 'github', 'address'],
            summary: ['summary', 'background', 'who are you', 'experience'],
          }
          const scoreFor = (bucket: string[]) => bucket.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0)
          const baseScores: Record<string, number> = {
            skills: scoreFor(intents.skills),
            education: scoreFor(intents.education),
            projects: scoreFor(intents.projects),
            achievements: scoreFor(intents.achievements),
            contact: scoreFor(intents.contact),
            summary: scoreFor(intents.summary),
          }
          // Optional: first-pass Gemini classification to bias scores
          let classified: 'skills' | 'education' | 'projects' | 'achievements' | 'greeting' | 'summary' | 'other' | null = null
          try {
            classified = await classifyIntentGemini(raw)
            if (classified === 'greeting') {
              return "Hi, I’m Syed Abrar Husain’s AI assistant. You can ask me about my skills, projects, or experience."
            }
            if (classified && classified !== 'other') {
              if (classified in baseScores) baseScores[classified as keyof typeof baseScores] += 3
            }
          } catch {}
          // Boost projects if any project name appears
          try {
            const ps: any[] = Array.isArray(data.projects) ? data.projects : []
            for (const p of ps) {
              const nm = String(p?.name || '').toLowerCase()
              if (nm && t.includes(nm)) baseScores.projects += 2
            }
          } catch {}

          // Regex backup flags (for obvious matches)
          const rxSkills = /\b(skill|stack|tech|technology|technologies|framework|tools|library|libraries)\b/i.test(raw)
          const rxEdu = /\b(education|educational background|academic|academics|degree|university|college|school|schooling|cgpa|gpa|graduation|study|qualification)\b/i.test(raw)
          const rxProj = /\b(project|app|application|writify|moveit|journal|jama)\b/i.test(raw)
          const rxAch = /\b(achievement|award|prize|hackathon|leadership|extracurricular)\b/i.test(raw)
          const rxContact = /\b(email|e-mail|mail|phone|mobile|contact|location|city|live|based|linkedin|github|address)\b/i.test(raw)
          const rxSum = /\b(who are you|about yourself|background|summary|experience)\b/i.test(raw)

          if (rxSkills) baseScores.skills += 2
          if (rxEdu) baseScores.education += 2
          // Strong phrase handling to disambiguate from generic "background"
          if (/\beducational background\b/i.test(raw) || /\bacademics?\b/i.test(raw)) {
            baseScores.education += 2
            baseScores.summary -= 1
          }
          if (rxProj) baseScores.projects += 2
          if (rxAch) baseScores.achievements += 2
          if (rxSum) baseScores.summary += 1
          if (rxContact) baseScores.contact += 2

          // detect irrelevant topics (only then decline)
          const isIrrelevant = /\b(politics|election|religion|cricket|football|soccer|nba|meme|joke|weather|lottery|stock tip|relationship)\b/i.test(raw)

          const bestIntent = (Object.entries(baseScores).sort((a, b) => b[1] - a[1])[0] || ['summary', 0]) as [string, number]
          const [intent, score] = bestIntent

          // Helper formatters
          const formatSkills = () => {
            const s = data.skills || {}
            const parts: string[] = []
            const push = (label: string, arr?: string[]) => { 
              if (arr && arr.length) parts.push(`**${label}:**\n${arr.join(', ')}`) 
            }
            push('Languages', s.languages)
            push('Frameworks', s.frameworks)
            push('Developer Tools', s.developerTools)
            push('Technologies', s.technologies)
            push('Python Libraries', s.pythonLibraries)
            return parts.slice(0, 5).join('\n\n') || 'My skills are listed in my résumé.'
          }
          const formatEducation = () => {
            const e: any[] = Array.isArray(data.education) ? data.education : []
            if (!e.length) return 'You can find my education details in my résumé.'
            // Try to find Higher Secondary / 12th if the query asks for it
            const isClass12 = /(class\s*12|12th|xii|higher\s*secondary|hsc|intermediate)/i.test(raw) || /(class\s*12|12th|xii|higher\s*secondary|hsc|intermediate)/i.test(t)
            const hs = e.find(x => /higher\s*secondary|intermediate|xii|12(th)?/i.test(String(x.degree || '')) || x.school)
            const ug = e.find(x => /b\.?tech|bachelor|bachelor of technology|b\. ?e|be/i.test(String(x.degree || ''))) || e[0]

            const nice = (x: any): string => {
              const degree = x.degree || ''
              const place = x.university || x.school || ''
              const when = x.duration || x.graduation || ''
              const cg = x.cgpa ? x.cgpa : ''
              // Human, concise paraphrase
              if (x.school) {
                return cg
                  ? `I completed my ${degree} at ${place} in ${when} with a CGPA of ${cg}.`
                  : `I completed my ${degree} at ${place} in ${when}.`
              }
              // Assume university
              if (when && cg) return `I’m pursuing ${degree} at ${place} (${when}), with a current CGPA of ${cg}.`
              if (when) return `I’m pursuing ${degree} at ${place} (${when}).`
              return `I’m pursuing ${degree} at ${place}.`
            }

            if (isClass12 && hs) return nice(hs)

            // If asked generally, provide a compact, natural summary (UG first, then HS if present)
            const parts: string[] = []
            if (ug) parts.push(nice(ug))
            if (hs && hs !== ug) parts.push(nice(hs))
            return parts.join(' ')
          }
          const formatProject = () => {
            const ps: any[] = Array.isArray(data.projects) ? data.projects : []
            if (!ps.length) return 'My projects are listed in my résumé.'
            const askAll = /\b(all|list|show (all|me) projects|projects list)\b/i.test(raw)
            const askOther = /\b(other|another|else|more)\b/i.test(raw)
            const specific = ps.find(p => t.includes(String(p.name || '').toLowerCase()))

            if (askAll && ps.length) {
              const lines = ps.slice(0, 3).map(p => {
                const stack = Array.isArray(p.techStack) ? p.techStack.slice(0, 3).join(', ') : ''
                const desc = p.description ? ` – ${p.description}` : ''
                return `• ${p.name}${desc}${stack ? ` (Stack: ${stack})` : ''}`
              })
              return lines.join('\n')
            }

            let proj = specific || ps[0]
            if (askOther && ps.length > 1 && proj === ps[0]) {
              proj = ps[1]
            }

            const achievements: string[] = (proj.achievements || []).slice(0, 3)
            const stack = (proj.techStack || []).slice(0, 5).join(', ')
            const link = proj.liveLink ? `\n\n**Link:** ${proj.liveLink}` : ''
            const desc = proj.description ? `\n\n${proj.description}` : ''
            const achText = achievements.length ? `\n\n**Key Achievements:**\n${achievements.map(a => `• ${a}`).join('\n')}` : ''
            return `**${proj.name}**${desc}\n\n**Tech Stack:**\n${stack}${achText}${link}`.trim()
          }
          const formatAchievements = () => {
            const a: any[] = data.leadershipExtracurricular || []
            if (!a.length) return 'I participate in hackathons and university events.'
            const bullets = a.slice(0, 3).map(item => {
              const details = Array.isArray(item.details) ? `\n  ${item.details[0]}` : ''
              return `• **${item.role}** (${item.date})${details}`
            })
            return bullets.join('\n\n')
          }
          const formatSummary = () => {
            const s: string = data.professionalSummary || data.summary || ''
            const sentences = s.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean)
            return sentences.slice(0, 3).join(' ')
          }
          const formatContact = () => {
            const c = data?.basicInfo?.contact || {}
            const wantEmail = /\b(email|e-mail|mail)\b/i.test(raw)
            const wantPhone = /\b(phone|mobile)\b/i.test(raw)
            const wantLoc = /\b(where.*live|where do you live|where are you based|location|city|live|based|address)\b/i.test(raw)
            const wantLinkedIn = /\blinkedin\b/i.test(raw)
            const wantGitHub = /\bgithub\b/i.test(raw)

            if (wantEmail && c.email) return `You can reach me at ${c.email}.`
            if (wantPhone && c.phone) return `My contact number is ${c.phone}.`
            if (wantLoc && c.location) return `I’m based in ${c.location}.`
            if (wantLinkedIn && c.linkedin) return `Here is my LinkedIn: ${c.linkedin}`
            if (wantGitHub && c.github) return `Here is my GitHub: ${c.github}`

            const lines: string[] = []
            if (c.location) lines.push(`Location: ${c.location}`)
            if (c.email) lines.push(`Email: ${c.email}`)
            if (c.phone) lines.push(`Phone: ${c.phone}`)
            if (c.linkedin) lines.push(`LinkedIn: ${c.linkedin}`)
            if (c.github) lines.push(`GitHub: ${c.github}`)
            return lines.slice(0, 3).join('\n') || 'You can find my contact details in my résumé.'
          }

          // 3) Special-case: hiring intent -> human, concise pitch grounded in resume data
          const isHire = /\b(hire|hiring|work with you|why should i hire|offer you|join our team)\b/i.test(raw)
          if (!isIrrelevant && isHire) {
            const role = data?.basicInfo?.role || 'Full-Stack Developer'
            const summary = (data?.professionalSummary || '').split(/(?<=[.!?])\s+/).slice(0, 2).join(' ')
            const s = data?.skills || {}
            const langs = Array.isArray(s.languages) ? s.languages.slice(0, 3).join(', ') : ''
            const fws = Array.isArray(s.frameworks) ? s.frameworks.slice(0, 2).join(', ') : ''
            const proj = Array.isArray(data?.projects) && data.projects[0] ? data.projects[0] : null
            const projLine = proj ? `${proj.name} (${(proj.techStack||[]).slice(0,2).join(', ')})` : ''
            const pitchParts = [
              summary || `I’m a ${role} focused on building secure, scalable, and user-centric web apps.`,
              (langs || fws) ? `Core stack: ${[langs, fws].filter(Boolean).join(' • ')}.` : '',
              projLine ? `Recent work: ${projLine}.` : '',
            ].filter(Boolean)
            return pitchParts.join(' ')
          }

          // 4) Route to best intent; if score is weak, return closest useful section instead of declining
          if (isIrrelevant) return 'I prefer to keep this chatbot focused on my professional experience.'

          if (intent === 'skills' && score > 0) return formatSkills()
          if (intent === 'education' && score > 0) return formatEducation()
          if (intent === 'projects' && score > 0) return formatProject()
          if (intent === 'achievements' && score > 0) return formatAchievements()
          if (intent === 'contact' && score > 0) return formatContact()
          if (intent === 'summary' && score > 0) return formatSummary()

          // Closest fallback: pick non-empty section in priority order
          const candidates = [
            { k: 'education', v: formatEducation() },
            { k: 'skills', v: formatSkills() },
            { k: 'projects', v: formatProject() },
            { k: 'achievements', v: formatAchievements() },
            { k: 'summary', v: formatSummary() },
          ]
          const firstUseful = candidates.find(c => c.v && c.v.trim())
          return firstUseful?.v || formatSummary()
        }

        const structuredAnswer = await replyFromStructured(resumeData, userMessage)
        if (structuredAnswer) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ message: structuredAnswer }))
          return
        }

        // If Gemini key is present, attempt real completion (when no structured data)
        if (geminiApiKey) {
          try {
            const mod: any = await import('@google/genai')
            const GoogleGenerativeAI = mod.GoogleGenerativeAI || mod.default
            const genAI = new GoogleGenerativeAI(geminiApiKey)
            const model = genAI.getGenerativeModel({
              model: (geminiModel || 'gemini-2.0-flash'),
              systemInstruction:
                "You are Syed Abrar Husain (first-person). Use ONLY the provided RawResumeText as source. Do NOT echo section headers or raw blocks; synthesize concise answers (2–3 sentences, or 3–5 bullets if explicitly requested). If a question is irrelevant to the résumé, reply: I prefer to keep this chatbot focused on my professional experience.",
            })

            // Build context only from resume.txt
            const sanitized = (resumeText || '')
              .replace(/^\s*\[[^\]\n]+\]\s*$/gm, '') // remove lines like [BASICS]
              .replace(/^\s*(name|title|location|email|phone|website|linkedin|github)\s*:/gim, '') // remove template keys if present
              .replace(/[\u0080-\u00A0]/g, ' ') // normalize odd copied chars
              .replace(/\s+\n/g, '\n') // collapse trailing spaces before newlines
              .trim()
            const context = [
              'Guidelines: Use RawResumeText as the sole source of truth. Do not output headers or brackets. Provide concise, synthesized answers.',
              'RawResumeText:',
              sanitized,
            ].join('\n')

            const prompt = `${context}\n\nUser question: ${userMessage}`
            const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
            const text = result?.response?.text?.() || 'Sorry, I could not generate a response.'

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ message: text }))
            return
          } catch (err) {
            // Fall through to heuristic on any error
          }
        }

        // Heuristic fallback using resume.txt only
        const lower = (resumeText || '').toLowerCase()
        const sectionHeaders = [
          'Professional Summary',
          'Education',
          'Projects',
          'Technical Skills',
          'Leadership / Extracurricular',
          'Leadership',
          'Extracurricular',
        ]
        const extractSection = (label: string) => {
          if (!resumeText) return ''
          const lines = resumeText.split(/\r?\n/)
          const startIndex = lines.findIndex(l => l.trim().toLowerCase() === label.toLowerCase())
          if (startIndex === -1) return ''
          let endIndex = lines.length
          for (let i = startIndex + 1; i < lines.length; i++) {
            const t = lines[i].trim()
            if (sectionHeaders.some(h => t.toLowerCase() === h.toLowerCase())) { endIndex = i; break }
          }
          const chunk = lines.slice(startIndex + 1, endIndex).join('\n').trim()
          return chunk
        }
        const firstSentences = (text: string, maxSentences = 2) => {
          const s = (text || '').replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean)
          return s.slice(0, maxSentences).join(' ')
        }
        const bulletsFromLines = (text: string, limit = 5) => {
          const ls = (text || '').split(/\r?\n/).map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
          return ls.slice(0, limit).map(b => `• ${b}`).join('\n')
        }

        let answer = ''
        if (!userMessage) {
          answer = "Hi! Ask me about my background, skills, projects, or experience."
        } else if (q.includes('who are you') || q === 'who are you' || q === 'who are u' || q.startsWith('who am i')) {
          const summary = extractSection('Professional Summary')
          answer = firstSentences(summary || '', 2) || 'I am a software engineer. Ask about my background, skills, projects, or experience.'
        } else if (q.includes('qualification') || q.includes('education') || q.includes('degree')) {
          const edu = extractSection('Education')
          answer = edu || 'You can find my education details in the resume text provided.'
        } else if (q.includes('writify')) {
          const projects = extractSection('Projects')
          const writify = projects.split(/\r?\n\r?\n/).find(b => /writify/i.test(b || '')) || projects
          answer = bulletsFromLines(writify, 4) || 'Writify details are included in my projects section.'
        } else if (q.includes('backend')) {
          const skills = extractSection('Technical Skills')
          const backend = (skills.match(/^(?:Technologies|Backend|Languages).*$/gmi) || []).join('\n') || skills
          answer = backend || 'I have listed my backend experience and tools in the skills section.'
        } else if (q.includes('hackathon')) {
          const lead = extractSection('Leadership / Extracurricular')
          const hack = lead.split(/\r?\n\r?\n/).find(b => /hackathon/i.test(b || '')) || lead
          answer = bulletsFromLines(hack, 4) || 'I have participated in hackathons; see the relevant section in my résumé.'
        } else if (
          q.includes('project') ||
          lower.includes('projects')
        ) {
          const proj = extractSection('Projects')
          answer = bulletsFromLines(proj, 6) || 'My projects are listed in the Projects section of my résumé.'
        } else if (q.includes('skill') || q.includes('stack') || q.includes('tech')) {
          const skills = extractSection('Technical Skills')
          // Return four concise skill lines
          const lines = skills.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          answer = lines.slice(0, 4).join('\n') || 'My skills are listed in the Skills section of my résumé.'
        } else if (q.includes('experience') || q.includes('work') || q.includes('employment') || q.includes('career')) {
          const summary = extractSection('Professional Summary')
          answer = firstSentences(summary || '', 2) || 'You can find my work experience in the Experience section.'
        } else {
          answer = "I prefer to keep this chatbot focused on my professional experience."
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ message: answer }))
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ message: 'Mock API error' }))
      }
    }
    server.middlewares.use('/api/chat', handler as any)
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Avoid referencing process.* to keep TS happy without Node types
  const env = loadEnv(mode, '.', '')
  const key = env.GEMINI_API_KEY
  const model = env.GEMINI_MODEL
  return {
    plugins: [react(), devChatMock(key, model)],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }
})
