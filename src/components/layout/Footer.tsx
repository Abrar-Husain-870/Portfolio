import { ArrowUp, Heart, Github, Linkedin } from 'lucide-react'
import { contact } from '../../content/site'

export default function Footer() {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navItems = [
    { href: '#hero', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#chatbot', label: 'Chatbot' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <footer className="relative">
      {/* Top white accent divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      <div className="relative bg-slate-950/40 backdrop-blur-xl border-t border-white/10 ring-1 ring-white/10">
        <div className="container-max px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
            {/* Left: copyright */}
            <div className="flex items-center gap-2 text-slate-300/80">
              <span>© {new Date().getFullYear()} Syed Abrar Husain. Built with</span>
              <Heart className="h-4 w-4 text-white/80" />
              <span>and React</span>
            </div>

            {/* Center: nav */}
            <nav className="justify-center hidden md:flex">
              <ul className="flex items-center gap-4 text-sm">
                {navItems.map(item => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="relative px-2 py-1 text-slate-300 hover:text-white transition-colors"
                    >
                      {item.label}
                      <span className="pointer-events-none absolute left-2 right-2 -bottom-[2px] h-px bg-white/0 group-hover:bg-white/40" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right: socials + back to top */}
            <div className="flex items-center justify-start md:justify-end gap-3">
              <a
                href={contact.social.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href={contact.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <button
                onClick={handleBackToTop}
                className="ml-2 inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-2 py-1"
                aria-label="Back to top"
              >
                <span className="text-sm">Top</span>
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
