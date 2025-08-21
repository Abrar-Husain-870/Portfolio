import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react'
import { Project } from '@/content/site'
import GlareHover from './GlareHover'

interface CardSwapProps {
  projects: Project[]
  className?: string
}

// Placeholder component - will be replaced with actual React Bits component
export default function CardSwap({ projects, className = '' }: CardSwapProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const currentProject = projects[currentIndex]

  const cardRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState<{x:number;y:number}>({x:0,y:0})
  const [mousePos, setMousePos] = useState<{x:number;y:number}>({x:50,y:50})
  const [ripples, setRipples] = useState<Array<{id:number;x:number;y:number}>>([])
  const rippleId = useRef(0)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const leftBtnRef = useRef<HTMLButtonElement | null>(null)
  const rightBtnRef = useRef<HTMLButtonElement | null>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    const max = 6
    setTilt({ x: -(py * max), y: px * max })
    setMousePos({ x: (px + 0.5) * 100, y: (py + 0.5) * 100 })
    // Parallax image
    if (imgRef.current) {
      imgRef.current.style.transform = `translate3d(${px * 12}px, ${py * 12}px, 0) scale(1.03)`
    }
  }

  const handleLeave = () => setTilt({x:0,y:0})

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = ++rippleId.current
    setRipples((prev) => [...prev, { id, x, y }])
    // auto-remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 700)
  }

  // Magnetic buttons
  const magnet = (btn: HTMLButtonElement | null, e: React.MouseEvent) => {
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const strength = 0.25 // smaller = subtler
    btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
  }
  const demagnet = (btn: HTMLButtonElement | null) => {
    if (!btn) return
    btn.style.transform = 'translate(0,0)'
  }

  return (
    <div className={`relative ${className}`}>
      <GlareHover
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 180ms ease-out' }}
        className="group rounded-2xl"
        width="auto"
        height="auto"
        background="transparent"
        borderRadius="1rem"
        borderColor="transparent"
        glareColor="#ffffff"
        glareOpacity={0.3}
        glareAngle={-30}
        glareSize={300}
        transitionDuration={1600}
        playOnce={false}
        onClick={handleClick}
      >
        <div
          className="relative grid md:grid-cols-2 gap-8 items-center rounded-2xl backdrop-blur-xl border p-8 min-h-[420px] overflow-hidden transition-all duration-300 card--border-glow"
          style={{
            background: 'var(--background-dark)',
            borderColor: 'var(--border-color)',
            ['--glow-x' as any]: `${mousePos.x}%`,
            ['--glow-y' as any]: `${mousePos.y}%`,
            ['--glow-intensity' as any]: 1,
            ['--glow-radius' as any]: '220px',
          }}
        >
          {/* Cursor spotlight */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(220px circle at ${mousePos.x}% ${mousePos.y}%, rgba(80,140,255,0.15), transparent 60%)`,
              mixBlendMode: 'soft-light',
            }}
          />
          <div>
            <h4 className="text-2xl font-bold mb-4 text-white">
              {currentProject.title}
            </h4>
            <p className="text-slate-300 mb-6">{currentProject.blurb}</p>
            <div className="flex flex-wrap gap-2">
              {currentProject.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-slate-800/50 text-accent-400 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            {(currentProject.demo || currentProject.repo) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {currentProject.demo && (
                  <a
                    href={currentProject.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20 transition"
                    aria-label="Live demo"
                    title="Live demo"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {currentProject.repo && (
                  <a
                    href={currentProject.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/20 transition"
                    aria-label="GitHub repository"
                    title="GitHub repository"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 ring-1 ring-[rgba(80,140,255,0.25)]">
            {currentProject?.image && (
              <img
                ref={imgRef}
                src={currentProject.image}
                alt={`${currentProject.title} preview`}
                loading="lazy"
                className="w-full h-full object-cover object-center will-change-transform"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Click Ripples */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {ripples.map((r) => (
              <span
                key={r.id}
                className="absolute block rounded-full bg-white/20"
                style={{
                  left: r.x - 8,
                  top: r.y - 8,
                  width: 16,
                  height: 16,
                  transform: 'translate(-50%, -50%)',
                  animation: 'ripple 700ms ease-out forwards',
                  mixBlendMode: 'overlay',
                }}
              />
            ))}
          </div>
        </div>
      </GlareHover>
      
      <div className="flex justify-center gap-4 mt-6">
        <button
          ref={leftBtnRef}
          onClick={prevProject}
          onMouseMove={(e) => magnet(leftBtnRef.current, e)}
          onMouseLeave={() => demagnet(leftBtnRef.current)}
          className="p-2 glass-effect rounded-lg text-slate-400 hover:text-white transition-colors will-change-transform"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          ref={rightBtnRef}
          onClick={nextProject}
          onMouseMove={(e) => magnet(rightBtnRef.current, e)}
          onMouseLeave={() => demagnet(rightBtnRef.current)}
          className="p-2 glass-effect rounded-lg text-slate-400 hover:text-white transition-colors will-change-transform"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
