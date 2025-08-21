import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#chatbot', label: 'Chatbot' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.href.substring(1))
      const scrollPosition = window.scrollY + 100
      setScrolled(window.scrollY > 8)

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsOpen(false)
    const element = document.getElementById(href.substring(1))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Clean white-accent glass bar */}
      <div className="container-max">
        <div
          className={clsx(
            'flex items-center justify-between h-16 rounded-2xl border backdrop-blur-xl px-3 md:px-4 transition-all duration-300',
            scrolled
              ? 'border-white/15 ring-1 ring-white/20 bg-slate-950/60 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.35)]'
              : 'border-white/10 ring-1 ring-white/10 bg-slate-950/30 shadow-[0_8px_24px_-12px_rgba(255,255,255,0.25)]'
          )}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => handleNavClick('#hero')}
              className="text-xl font-extrabold tracking-wide text-white hover:scale-[1.02] transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950 rounded"
            >
              SAH
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={clsx(
                    'group relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-950 border',
                    activeSection === item.href.substring(1)
                      ? 'text-white bg-white/10 border-white/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
                  )}
                >
                  <span>{item.label}</span>
                  {/* underline */}
                  <span
                    className={clsx(
                      'pointer-events-none absolute left-3.5 right-3.5 -bottom-[3px] h-[2px] rounded-full transition-all duration-200',
                      activeSection === item.href.substring(1)
                        ? 'bg-white/70'
                        : 'bg-white/0 group-hover:bg-white/30'
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-3 pt-2 pb-4 space-y-1 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={clsx(
                  'block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950',
                  activeSection === item.href.substring(1)
                    ? 'text-white bg-white/10 border border-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
