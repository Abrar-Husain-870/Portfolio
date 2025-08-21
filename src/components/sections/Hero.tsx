import { ArrowDown, Github, Linkedin, Mail, Download } from 'lucide-react'
import { hero, contact } from '@/content/site'
import { DarkVeil, GlareHover, RotatingText } from '@/components/react-bits'

export default function Hero() {
  const handleCTAClick = (href: string) => {
    const element = document.getElementById(href.substring(1))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <DarkVeil
        hueShift={-330}
        noiseIntensity={0.02}
        scanlineIntensity={0.06}
        scanlineFrequency={36}
        warpAmount={0.22}
        speed={0.6}
        className="absolute inset-0 z-10 pointer-events-none w-full h-full"
      />
      
      {/* Content */}
      <div className="relative z-30 container-max text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Name */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in">
            <span className="text-white">{hero.name}</span>
          </h1>
          
          {/* Rotating role: only the second word rotates */}
          <div className="text-xl md:text-2xl text-slate-300 mb-4 flex items-center justify-center gap-2">
            <span className="font-medium">Creative</span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary-950 to-primary-800 text-white border border-primary-700/40 ring-1 ring-inset ring-primary-300/10 shadow-[0_10px_30px_-10px_rgba(30,58,138,0.7)] overflow-hidden relative">
              <RotatingText
                texts={["Engineer", "Developer", "Problem-Solver", "Visionary"]}
                rotationInterval={1800}
                splitBy="characters"
                staggerDuration={0.03}
                staggerFrom="first"
                animatePresenceMode="wait"
                animatePresenceInitial={false}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                mainClassName="font-semibold text-white"
                elementLevelClassName="text-white"
                aria-label="Rotating roles"
              />
            </span>
          </div>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto animate-slide-up">
            {hero.tagline}
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <GlareHover
              glareColor="#ffffff"
              glareOpacity={0.25}
              glareAngle={-30}
              glareSize={220}
              transitionDuration={700}
              playOnce={false}
              width="auto"
              height="auto"
              background="transparent"
              borderColor="transparent"
              borderRadius="0.75rem" /* ~rounded-xl */
              className="inline-block"
            >
              <button
                onClick={() => handleCTAClick(hero.ctas.primary)}
                className="btn-primary-navy group"
              >
                Explore My Projects
              </button>
            </GlareHover>
            <GlareHover
              glareColor="#ffffff"
              glareOpacity={0.25}
              glareAngle={-30}
              glareSize={220}
              transitionDuration={700}
              playOnce={false}
              width="auto"
              height="auto"
              background="transparent"
              borderColor="transparent"
              borderRadius="0.75rem"
              className="inline-block"
            >
              <a
                href="/Resume%20PDF/Resum%C3%A9-Syed%20Abrar%20Husain.pdf"
                download="Syed-Abrar-Husain-Resume.pdf"
                className="btn-primary-navy inline-flex items-center gap-2 group"
                aria-label="Download Resume"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </a>
            </GlareHover>
            <button
              onClick={() => handleCTAClick(hero.ctas.secondary)}
              className="btn-secondary"
            >
              Let's Work Together
            </button>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <a
              href={contact.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded p-2"
              aria-label="GitHub Profile"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href={contact.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded p-2"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="text-slate-400 hover:text-accent-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded p-2"
              aria-label="Email Contact"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-slate-500" />
      </div>

      {/* Seamless divider into About: soft fade + white accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-20">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.7)] to-transparent" />
      </div>
    </section>
  )
}
