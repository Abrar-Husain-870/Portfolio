import { about, contact } from '@/content/site'
import { CountUp, ProfileCard, LightRays } from '@/components/react-bits'

export default function About() {
  return (
    <section id="about" className="relative section-padding">
      {/* Light Rays background */}
      <div className="absolute inset-0 z-10" aria-hidden="true">
        <LightRays
          raysOrigin="top-center"
          raysColor="#274CFF" /* Deeper Royal Blue */
          raysSpeed={1.6}
          lightSpread={0.65}
          rayLength={1.8}
          pulsating={true}
          fadeDistance={1.4}
          followMouse={true}
          mouseInfluence={0.22}
          noiseAmount={0.05}
          distortion={0.06}
          className="opacity-90"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/70 to-slate-900/70" />
      
      <div className="relative z-20 container-max">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Profile Card */}
          <div className="flex justify-center lg:justify-start">
            <ProfileCard
              handle={(contact.social.github?.split('/').pop()) || 'contact'}
              status="Online"
              contactText="Contact Me"
              avatarUrl="/avatar.jpg"
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              onContactClick={() => {
                const email = contact.email
                window.location.href = `mailto:${email}`
              }}
            />
          </div>
          
          {/* Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-white">About Me</span>
              </h2>
              
              <div className="space-y-4">
                {about.story.map((paragraph, index) => (
                  <p key={index} className="text-lg text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Stats with CountUp */}
            <div className="grid grid-cols-3 gap-6">
              {about.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400 mb-2">
                    <CountUp to={stat.value} from={0} separator="," duration={1.2} className="" />+
                  </div>
                  <div className="text-sm text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Skills */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-200">
                Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-3">
                {about.skills.map((skill: any) => {
                  const label = typeof skill === 'string' ? skill : skill.label;
                  const icon = typeof skill === 'string' ? undefined : skill.icon;
                  return (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full text-sm font-medium text-slate-300 hover:text-accent-400 hover:border-accent-400/50 transition-all duration-200"
                      aria-label={`${label} technology`}
                    >
                      {icon && (
                        <img
                          src={icon}
                          alt=""
                          loading="lazy"
                          width={16}
                          height={16}
                          className="h-4 w-4 object-contain opacity-90"
                        />
                      )}
                      <span>{label}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seamless divider into Projects: soft fade + white accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-20">
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-black/80" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.7)] to-transparent" />
      </div>
    </section>
  )
}
