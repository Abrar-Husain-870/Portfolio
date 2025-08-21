import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send } from 'lucide-react'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_INSTRUCTION =
  "You are Syed Abrar Husain, answering in first person as a professional assistant/clone. Only answer questions relevant to your résumé, skills, projects, and experience. Keep replies professional, conversational, and 2–3 short paragraphs. If irrelevant, reply: ‘I prefer to keep this chatbot focused on my professional experience.’"

export default function ChatDock() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'hello',
      role: 'assistant',
      content: "Hi, I'm Syed Abrar Husain. Ask me about my background, skills, or projects!",
    },
  ])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [open, messages.length])

  const containerVariants = useMemo(
    () => ({
      closed: { opacity: 0, y: 16, pointerEvents: 'none' as const },
      open: { opacity: 1, y: 0, pointerEvents: 'auto' as const },
    }),
    []
  )

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: text },
          ],
        }),
      })
      const data = await res.json()
      const content = data?.message ??
        "Thanks! (dev mock) I’ll answer based on my résumé once the Gemini API is connected."
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content }
      ])
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="h-12 w-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(255,255,255,0.25)] backdrop-blur hover:bg-white/20 transition"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatdock"
            initial="closed"
            animate="open"
            exit="closed"
            variants={containerVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="absolute bottom-16 right-0 w-[min(92vw,360px)] rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 ring-1 ring-white/15 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(255,255,255,0.25)]"
          >
            <div className="p-4 border-b border-white/10">
              <div className="text-sm text-slate-200 font-semibold">Chat with Syed</div>
              <div className="text-xs text-slate-400">Ask about my background, skills, and projects.</div>
            </div>

            <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-xl text-sm leading-relaxed border max-w-[85%] ${
                      m.role === 'assistant'
                        ? 'bg-white/5 border-white/10 text-slate-200'
                        : 'bg-white/20 border-white/20 text-white'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
              <button
                onClick={send}
                disabled={sending || !input.trim()}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 border border-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
