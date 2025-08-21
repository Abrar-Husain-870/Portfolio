import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User2 } from 'lucide-react'
import Orb from '../react-bits/Orb'
import Aurora from '../react-bits/Aurora'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi, I'm Syed Abrar Husain's virtual avatar — a conversational mirror of me. Ask about my work, skills, projects, or experience as if we were talking in person.",
    }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  // Minimal, safe formatter: escape HTML, support **bold**, bullets, and line breaks
  const formatMessageHtml = (text: string) => {
    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    let t = escape(text || '')
    // Bold: **text**
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Turn leading bullets "• " into HTML bullets (keep simple line-based rendering)
    t = t.split('\n').map((line: string) => {
      if (/^\s*•\s+/.test(line)) return line.replace(/^\s*•\s+/, '&#8226; ')
      return line
    }).join('\n')
    // Convert newlines to <br/>
    t = t.replace(/\n/g, '<br/>')
    return t
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  const collabReply = "I’d be glad to collaborate on meaningful projects. You can reach me at husainabrar870@gmail.com, connect with me on LinkedIn, or explore my work on GitHub. Feel free to share your idea, and we can see how to build something impactful together."

  const isCollabQuery = (t: string) => {
    const x = t.toLowerCase()
    return (
      x.includes('collaborate') ||
      x.includes('collaboration') ||
      x.includes('work together') ||
      x.includes('partner') ||
      x.includes('team up')
    )
  }

  const sendMessage = async (raw: string) => {
    const text = raw.trim()
    if (!text || sending) return
    setSending(true)

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Special-case collaboration queries
    if (isCollabQuery(text)) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: collabReply },
      ])
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                "You are Syed Abrar Husain (first-person). Answer only from the résumé data. Be concise (2–3 sentences or 3–5 bullets). If irrelevant, reply: I prefer to keep this chatbot focused on my professional experience.",
            },
            { role: 'user', content: text },
          ],
        }),
      })
      const data = await res.json()
      const content = data?.message ?? 'Sorry, I could not generate a response right now.'
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content }])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const onSend = async () => {
    await sendMessage(input)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <section id="chatbot" className="relative section-padding">
      {/* Aurora background */}
      <Aurora
        colorStops={["#7CFF67", "#B19EEF", "#5227FF"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      {/* Background sheen */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      </div>

      <div className="relative z-10 container-max">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-white to-[#7FA4FF] bg-clip-text text-transparent">Virtual Avatar</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Talk to my virtual copy. Ask about my experience, projects, and skills — you’ll get answers just like you’re chatting with me.
          </p>
        </div>

        {/* Chat panel */}
        <div className="relative max-w-5xl mx-auto rounded-2xl p-6 md:p-8 bg-slate-900/30 backdrop-blur-xl border border-white/10 ring-1 ring-white/15 shadow-[0_30px_80px_-30px_rgba(2,6,23,0.60),_0_12px_32px_-12px_rgba(255,255,255,0.12)]">
          {/* Orb visual as background (kept square to avoid vertical stretch) */}
          <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
            <div className="w-[82%] max-w-[600px] md:max-w-[640px] aspect-square opacity-80">
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
              />
            </div>
          </div>
          {/* Message list */}
          <div
            ref={listRef}
            className="relative z-10 h-[420px] overflow-y-auto pr-1 space-y-4 no-scrollbar"
          >
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[85%]`}>                  
                  <div className={`shrink-0 mt-0.5 ${m.role === 'assistant' ? '' : 'order-2'}`}>
                    {m.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/90 flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/90 flex items-center justify-center">
                        <User2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-xl text-sm leading-relaxed border ${
                      m.role === 'assistant'
                        ? 'bg-white/5 border-white/15 text-white font-semibold shadow-[0_8px_24px_-8px_rgba(2,6,23,0.55)]'
                        : 'bg-white/10 border-white/20 text-white font-semibold shadow-[0_10px_26px_-12px_rgba(2,6,23,0.55),_0_1px_0_rgba(255,255,255,0.06)]'
                    } ${m.role === 'assistant' ? '' : 'order-1'}`}
                  >
                    {m.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: formatMessageHtml(m.content) }} />
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts */}
          <div className="relative z-10 mt-4 mb-2 flex flex-wrap gap-3">
            {[
              'What are your top skills?',
              'Tell me about Writify',
              "What's your experience?",
              'How can we collaborate?'
            ].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); sendMessage(q) }}
                className="px-3 py-1.5 rounded-full text-xs md:text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent"
            />
            <button
              onClick={onSend}
              disabled={sending || !input.trim()}
              className="btn-primary-navy disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              aria-label="Send message"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Divider into Contact: soft fade + white accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.7)] to-transparent" />
      </div>
    </section>
  )
}
