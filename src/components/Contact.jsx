import { useState, useEffect, useRef } from 'react'
import { FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa'

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

function useTilt(maxTilt = 8, glare = true) {
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
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
      
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15), transparent 60%)`
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
    
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.1,
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
      const scrolled = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0
      setProgress(scrolled)
    }
    
    window.addEventListener('scroll', updateProgress)
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [])
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-150 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
  const [focusedField, setFocusedField] = useState('')

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const hero = useReveal()
  const form = useReveal()
  const info = useReveal()
  const social = useReveal()

  const tiltCards = [useTilt(6, true), useTilt(6, true), useTilt(6, true)]
  const tiltForm = useTilt(5, true)

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
        message: '✅ Message sent successfully! We\'ll get back to you within 24 hours.'
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
      setIsSubmitting(false)
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setFormStatus({ type: '', message: '' })
      }, 5000)
    }, 2000)
  }

  return (
    <>
      <ScrollProgress />
      
      <div className="relative min-h-screen w-full text-white bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
        
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingParticles />
          
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.012}%`,
              top: `${10 + mousePos.y * 0.012}%`,
              transition: 'all 0.5s ease-out'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-15 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.008}%`,
              bottom: `${15 + mousePos.y * 0.008}%`,
              transition: 'all 0.5s ease-out',
              animationDelay: '1s'
            }}
          />
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
          <div 
            ref={hero.ref}
            className={`text-center max-w-5xl transition-all duration-1000 ${
              hero.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-blue-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/90">Available 24/7</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1] px-4">
              <span className="block bg-gradient-to-br from-white via-white/95 to-white/90 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                Let's Start a
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                Conversation
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-6 sm:mt-8 text-base sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed px-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              Have questions, feedback, or partnership ideas?
              <br className="hidden sm:block" />
              <span className="text-blue-300 font-semibold">We'd love to hear from you.</span>
            </p>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="relative py-12 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* CONTACT FORM */}
              <div 
                ref={form.ref}
                className={`transition-all duration-1000 ${
                  form.inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
              >
                <div
                  ref={tiltForm}
                  className="relative p-6 sm:p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-shadow duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                      ✉️
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Send Message
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-white/90 text-xs sm:text-sm font-bold mb-2 flex items-center gap-2" htmlFor="name">
                        <span className="text-base sm:text-lg">👤</span>
                        <span>Your Name</span>
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          placeholder="John Doe"
                          required
                          className="w-full p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                        />
                        {focusedField === 'name' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md -z-10 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/90 text-xs sm:text-sm font-bold mb-2 flex items-center gap-2" htmlFor="email">
                        <span className="text-base sm:text-lg">📧</span>
                        <span>Email Address</span>
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          placeholder="john@example.com"
                          required
                          className="w-full p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                        />
                        {focusedField === 'email' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md -z-10 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-white/90 text-xs sm:text-sm font-bold mb-2 flex items-center gap-2" htmlFor="subject">
                        <span className="text-base sm:text-lg">💬</span>
                        <span>Subject</span>
                      </label>
                      <div className="relative">
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('subject')}
                          onBlur={() => setFocusedField('')}
                          placeholder="How can we help?"
                          required
                          className="w-full p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                        />
                        {focusedField === 'subject' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md -z-10 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-white/90 text-xs sm:text-sm font-bold mb-2 flex items-center gap-2" htmlFor="message">
                        <span className="text-base sm:text-lg">📝</span>
                        <span>Message</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('message')}
                          onBlur={() => setFocusedField('')}
                          placeholder="Tell us what's on your mind..."
                          rows="5"
                          required
                          className="w-full p-3 sm:p-4 rounded-xl bg-white/5 backdrop-blur-xl border-2 border-white/10 text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 resize-none"
                        />
                        {focusedField === 'message' && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md -z-10 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Status Message */}
                    {formStatus.message && (
                      <div className={`p-4 rounded-xl backdrop-blur-xl border-2 animate-in fade-in slide-in-from-top duration-500 ${
                        formStatus.type === 'success' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <p className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${
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
                      className="group w-full py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-[0_10px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_60px_rgba(59,130,246,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 relative overflow-hidden"
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
                          <span className="text-xl sm:text-2xl">🚀</span>
                          <span>Send Message</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}

                      {/* Shine effect */}
                      {!isSubmitting && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
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
                className={`space-y-6 transition-all mt-40  duration-1000 ${
                  info.inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                }`}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                    📍
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    Get In Touch
                  </h2>
                </div>

                {/* Contact Cards */}
                {[
                  {
                    icon: '🌍',
                    title: 'Location',
                    info: 'Salem , India',
                    desc: 'Serving readers globally',
                    gradient: 'from-blue-500 to-cyan-500'
                  },
                  {
                    icon: '📧',
                    title: 'Email',
                    info: 'vimalpravin071@gmail.com',
                    desc: 'Reply within 24 hours',
                    gradient: 'from-purple-500 to-pink-500'
                  },
                  {
                    icon: '⏰',
                    title: 'Working Hours',
                    info: 'Mon - Sun: 24/7',
                    desc: 'Always available for you',
                    gradient: 'from-indigo-500 to-blue-500'
                  },
                ].map((contact, idx) => (
                  <div key={idx} className="perspective-[1000px]" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div
                      ref={tiltCards[idx]}
                      className="group relative p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          {contact.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{contact.title}</h3>
                          <p className="text-white/90 font-semibold mb-1 text-sm sm:text-base truncate">{contact.info}</p>
                          <p className="text-white/60 text-xs sm:text-sm">{contact.desc}</p>
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
                
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA SECTION */}
        <section 
          ref={social.ref}
          className={`relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 transition-all duration-1000 ${
            social.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Connect With Us
            </h3>
            <p className="text-white/70 text-sm sm:text-base md:text-lg mb-10 sm:mb-12 px-4">
              Follow us on social media for updates, tips, and exclusive content
            </p>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {[
                { name: 'Twitter', icon: <FaTwitter />, gradient: 'from-blue-400 to-blue-600', link: 'https://x.com/VimalPravi51925' },
                { name: 'Instagram', icon: <FaInstagram />, gradient: 'from-pink-500 to-purple-600', link: 'https://www.instagram.com/_____op__vimal_____/' },
                { name: 'LinkedIn', icon: <FaLinkedin />, gradient: 'from-blue-600 to-blue-800', link: 'https://www.linkedin.com/in/vimal-pravin-v' },
                { name: 'Github', icon: <FaGithub />, gradient: 'from-gray-700 to-gray-900', link: 'https://github.com/vimalpravin-18' },
                
              ].map((social, idx) => (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${social.gradient} flex items-center justify-center text-2xl sm:text-3xl shadow-lg hover:scale-110 hover:shadow-2xl hover:rotate-6 transition-all duration-300`}
                  title={social.name}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {social.icon}
                  
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 sm:-bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm font-semibold text-white whitespace-nowrap bg-black/80 px-3 py-1 rounded-lg">
                    {social.name}
                  </span>

                  {/* Hover glow */}
                  <div className={`absolute -inset-1 rounded-xl bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`} />
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  )
}
