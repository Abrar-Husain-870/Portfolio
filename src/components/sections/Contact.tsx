import { useForm } from 'react-hook-form'
import { Send, Github, Linkedin, User, Mail, MessageSquare } from 'lucide-react'
import { contact } from '@/content/site'
import { Threads } from '@/components/react-bits'

interface ContactForm {
  name: string
  email: string
  message: string
}

export default function Contact() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactForm>()

  const onSubmit = async (data: ContactForm) => {
    // For now, just console log and mailto fallback
    console.log('Contact form submission:', data)
    
    // Create mailto link
    const subject = encodeURIComponent(`Portfolio Contact from ${data.name}`)
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`)
    const mailtoLink = `mailto:${contact.email}?subject=${subject}&body=${body}`
    
    window.open(mailtoLink, '_blank')
    reset()
  }

  return (
    <section id="contact" className="relative section-padding">
      {/* Background: Threads shader + black veil */}
      <div className="absolute inset-0">
        <Threads
          className="absolute inset-0"
          color={[1, 1, 1]}
          amplitude={1.5}
          distance={0.15}
          enableMouseInteraction={true}
        />
      </div>
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      <div className="relative z-10 container-max">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Let's Work Together</span>
          </h2>
          
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Have a project in mind? I'd love to hear about it. Let's create something amazing together.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <div className="relative rounded-2xl p-8 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-xl border border-white/10 ring-1 ring-white/10 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.15)]">
              <div className="mb-6 text-left">
                <h3 className="text-xl font-semibold text-white">Send a Message</h3>
                <p className="text-sm text-slate-400 mt-1">I’ll get back to you within 24 hours.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      id="name"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      id="email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-200 mb-2">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      {...register('message', { required: 'Message is required' })}
                      id="message"
                      rows={5}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400" role="alert">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed group inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="rounded-2xl p-8 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-xl border border-white/10 ring-1 ring-white/10">
                <h3 className="text-xl font-semibold mb-6 text-white">
                  Get In Touch
                </h3>
                
                <div className="space-y-4">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950 rounded p-2"
                  >
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                      <Send className="h-5 w-5" />
                    </div>
                    <span>{contact.email}</span>
                  </a>
                </div>
              </div>
              
              <div className="rounded-2xl p-8 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-xl border border-white/10 ring-1 ring-white/10">
                <h3 className="text-xl font-semibold mb-6 text-white">
                  Follow Me
                </h3>
                
                <div className="flex gap-4">
                  <a
                    href={contact.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label="GitHub Profile"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={contact.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-950"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  {/* Twitter removed per user request */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
