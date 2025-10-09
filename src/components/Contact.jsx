import { useState, useEffect, useRef } from 'react'

/* ========== ANIMATION HOOKS ========== */

function useReveal(threshold = 0.12) {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.unobserve(entry.target)
        }
      },
      { threshold }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useTilt(maxTilt = 12, glare = true) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const glareEl = glare ? el.querySelector('.glare-effect') : null
    
    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      const rotateX = (y - 0.5) * -maxTilt * 2
      const rotateY = (x - 0.5) * maxTilt * 2
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
      
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2), transparent 60%)`
        glareEl.style.opacity = '1'
      }
    }
    
    function onLeave() {
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
      if (glareEl) glareEl.style.opacity = '0'
    }
    
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [maxTilt, glare])
  return ref
}

/* ========== ANIMATED COMPONENTS ========== */

function FloatingParticles() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" />
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = (window.scrollY / scrollHeight) * 100
      setProgress(scrolled)
    }
    
    window.addEventListener('scroll', updateProgress)
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ========== MAIN COMPONENT ========== */

export default function Contact() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const hero = useReveal()
  const form = useReveal()
  const info = useReveal()
  const social = useReveal()

  const tiltCards = [useTilt(10, true), useTilt(10, true), useTilt(10, true)]
  const tiltForm = useTilt(8, true)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus({ type: '', message: '' })

    // Simulate form submission
    setTimeout(() => {
      setFormStatus({
        type: 'success',
        message: 'Message sent successfully! We\'ll get back to you soon.'
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
    }, 2000)
  }

  return (
    <>
      <ScrollProgress />
      
      <div className="relative min-h-screen w-380 text-white bg-[#0a0a0f] overflow-hidden">
        
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingParticles />
          
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-25"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[70vh] flex items-center justify-center px-6 py-20">
          <div 
            ref={hero.ref}
            className={`text-center max-w-5xl transition-all duration-1000 ${
              hero.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-white/90">Get In Touch</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              <span className="block bg-gradient-to-br from-white to-white/90 bg-clip-text text-transparent">
                Let's Start a
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Conversation
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-8 text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Have questions, feedback, or partnership ideas?
              <br className="hidden md:block" />
              <span className="text-blue-300 font-semibold">We'd love to hear from you.</span>
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="relative py-20 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* CONTACT FORM */}
              <div 
                ref={form.ref}
                className={`transition-all duration-1000 ${
                  form.inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
              >
                <div
                  ref={tiltForm}
                  className="relative p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <h2 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Send Us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2" htmlFor="name">
                        <span className="text-xl">👤</span>
                        Your Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2" htmlFor="email">
                        <span className="text-xl">📧</span>
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2" htmlFor="subject">
                        <span className="text-xl">💬</span>
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        required
                        className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-white/90 text-sm font-bold mb-3 flex items-center gap-2" htmlFor="message">
                        <span className="text-xl">✉️</span>
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what's on your mind..."
                        rows="6"
                        required
                        className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Status Message */}
                    {formStatus.message && (
                      <div className={`p-4 rounded-xl backdrop-blur-xl border ${
                        formStatus.type === 'success' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      } animate-in fade-in duration-300`}>
                        <p className={`text-sm font-semibold ${
                          formStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formStatus.message}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group w-full py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <span className="text-2xl">🚀</span>
                          Send Message
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}

                      {/* Shine effect */}
                      {!isSubmitting && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                      )}
                    </button>
                  </form>

                  {/* Glare effect */}
                  <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                </div>
              </div>

              {/* CONTACT INFO */}
              <div 
                ref={info.ref}
                className={`space-y-6 transition-all duration-1000 ${
                  info.inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
              >
                <h2 className="text-3xl md:text-4xl font-black mb-8 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                  Contact Information
                </h2>

                {/* Contact Cards */}
                {[
                  {
                    icon: '📍',
                    title: 'Location',
                    info: 'Worldwide Digital',
                    desc: 'Serving readers globally',
                    gradient: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '📧',
                    title: 'Email',
                    info: 'support@neonstore.com',
                    desc: 'We reply within 24 hours',
                    gradient: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '⏰',
                    title: 'Working Hours',
                    info: 'Mon - Fri: 9AM - 6PM IST',
                    desc: 'Weekend support available',
                    gradient: 'from-indigo-500 to-blue-500'
                  },
                ].map((contact, idx) => (
                  <div key={idx} className="perspective-[1000px]">
                    <div
                      ref={tiltCards[idx]}
                      className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {contact.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{contact.title}</h3>
                          <p className="text-white/90 font-semibold mb-1">{contact.info}</p>
                          <p className="text-white/60 text-sm">{contact.desc}</p>
                        </div>
                      </div>

                      {/* Glare effect */}
                      <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-2xl" />

                      {/* Hover glow */}
                      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${contact.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
                    </div>
                  </div>
                ))}

                {/* FAQ Quick Links */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Quick Help
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'How to purchase ebooks?',
                      'Payment & refund policy',
                      'Download & access issues',
                      'Account management',
                    ].map((item, idx) => (
                      <li key={idx}>
                        <a href="#" className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                          <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA SECTION */}
        <section 
          ref={social.ref}
          className={`relative py-32 px-6 transition-all duration-1000 ${
            social.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Connect With Us
            </h3>
            <p className="text-white/70 text-lg mb-12">
              Follow us on social media for updates, tips, and exclusive content
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { name: 'Twitter', icon: '🐦', gradient: 'from-blue-400 to-blue-600', link: 'https://x.com/VimalPravi51925' },
                { name: 'Instagram', icon: '📸', gradient: 'from-pink-500 to-purple-600', link: 'https://www.instagram.com/_____op__vimal_____/' },
                { name: 'LinkedIn', icon: '💼', gradient: 'from-blue-600 to-blue-800', link: 'www.linkedin.com/in/vimal-pravin-v' },
                { name: 'Github', icon: '📺', gradient: 'from-red-500 to-red-700', link: 'https://github.com/vimalpravin-18' },
                { name: 'Discord', icon: '💬', gradient: 'from-indigo-500 to-purple-600', link: '#' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.link}
                  className={`group relative w-16 h-16 rounded-xl bg-gradient-to-br ${social.gradient} flex items-center justify-center text-3xl shadow-lg hover:scale-110 hover:shadow-2xl transition-all duration-300`}
                  title={social.name}
                >
                  {social.icon}
                  
                  {/* Tooltip */}
                  <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-semibold text-white whitespace-nowrap">
                    {social.name}
                  </span>

                  {/* Hover glow */}
                  <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`} />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative py-16 px-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div>
                <div className="text-2xl font-black mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Your Library
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  Premium digital ebooks for ambitious creators and coders. Built with passion for readers who lead.
                </p>
              </div>
              
              <div>
                <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">Quick Links</div>
                <ul className="space-y-2 text-sm text-white/60">
                  <li><a href="#" className="hover:text-purple-300 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">All Books</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">Authors</a></li>
                  <li><a href="#" className="hover:text-purple-300 transition-colors">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">Connect</div>
                <div className="flex gap-4">
                  {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                    <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center text-sm">
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
              © 2025 Your Ebook Library. Built with passion for readers who lead.
            </div>
          </div>
        </footer>
      </div>

    </>
  )
}
