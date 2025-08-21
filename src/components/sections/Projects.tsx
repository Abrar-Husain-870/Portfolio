import { projects } from '@/content/site'
import { CardSwap, MagicBento, Particles } from '@/components/react-bits'

export default function Projects() {
  const featuredProjects = projects.filter(project => project.featured)
  const baseItems = projects.map(p => ({
    title: p.title,
    description: p.blurb,
    label: p.tags?.[0] ?? 'Project',
    color: '#060010',
    image: p.image,
    large: p.id === 'writify' || p.id === 'jamaah-journal',
    repo: p.repo,
    demo: p.demo,
  }))

  // Arrange to match reference layout: Writify (3rd) and Jamā’ah Journal (4th)
  const writify = baseItems.find(i => i.title === 'Writify')
  const jamaah = baseItems.find(i => i.title === 'Jamā’ah Journal')
  const others = baseItems.filter(i => i.title !== 'Writify' && i.title !== 'Jamā’ah Journal')
  const bentoItems = [
    ...(others[0] ? [others[0]] : []),
    ...(others[1] ? [others[1]] : []),
    ...(writify ? [writify] : []),
    ...(jamaah ? [jamaah] : []),
    ...others.slice(2),
  ]

  return (
    <section id="projects" className="relative isolate section-padding">
      {/* Background */}
      {/* Particles background layer (scoped to section bounds) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particles
          className="w-full h-full"
          particleColors={["#ffffff"]}
          particleCount={600}
          particleSpread={10}
          speed={0.12}
          particleBaseSize={160}
          moveParticlesOnHover={true}
          particleHoverFactor={1.2}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      {/* Black veil above particles for contrast */}
      <div className="absolute inset-0 bg-black/70" />
      
      <div className="relative z-10 container-max">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Featured Work</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A showcase of projects I've built with passion and precision
          </p>
        </div>

        {/* Spotlight Section - Ready for CardSwap */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-center text-slate-200">
            Spotlight Projects
          </h3>
          <div className="relative max-w-4xl mx-auto">
            <CardSwap projects={featuredProjects} />
          </div>
        </div>

        {/* Gallery Section - MagicBento from ReactBits */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center text-slate-200">
            All Projects
          </h3>
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="80, 140, 255"
            items={bentoItems}
          />
        </div>
      </div>
      {/* Divider into Chatbot: soft fade + white accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.9)] to-transparent" />
      </div>
    </section>
  )
}
