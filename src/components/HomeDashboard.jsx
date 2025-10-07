import React, { useEffect, useRef, useState } from 'react'

/* ========== ADVANCED ANIMATION HOOKS ========== */

/* Smooth reveal with intersection observer */
function useReveal(direction = 'up', duration = 900, delay = 0) {
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  const offsets = {
    up: 'translateY(80px)',
    down: 'translateY(-80px)',
    left: 'translateX(-80px)',
    right: 'translateX(80px)',
    scale: 'scale(0.85)'
  }
  
  return {
    ref,
    style: {
      opacity: inView ? 1 : 0,
      transform: inView ? 'none' : offsets[direction],
      transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
      willChange: 'opacity, transform',
    },
  }
}

/* Enhanced 3D tilt with light effect */
function useTilt(maxTilt = 15, glare = true) {
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
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15), transparent 50%)`
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

/* Staggered children animation */
function useStagger(childSelector = '.stagger-item', delay = 100) {
  const ref = useRef(null)
  const [animated, setAnimated] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          const children = ref.current?.querySelectorAll(childSelector)
          children?.forEach((child, i) => {
            setTimeout(() => {
              child.style.opacity = '1'
              child.style.transform = 'translateY(0) scale(1)'
            }, i * delay)
          })
          setAnimated(true)
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [childSelector, delay, animated])
  
  return ref
}

/* Magnetic button effect */
function useMagnetic(strength = 0.4) {
  const ref = useRef(null)
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * strength
      const deltaY = (e.clientY - centerY) * strength
      
      el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`
    }
    
    function onLeave() {
      el.style.transform = 'translate(0, 0) scale(1)'
    }
    
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])
  
  return ref
}

/* ========== ANIMATED COMPONENTS ========== */

/* Custom Cursor Follower */


/* Scroll Progress Indicator */
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
    <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
      <div 
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* Floating Particles */
function FloatingParticles() {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
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
        
        // Connect nearby particles
        particles.forEach(p2 => {
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 120)})`
            ctx.stroke()
          }
        })
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
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

/* Animated Counter */
function AnimatedCounter({ target, duration = 1000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          
          const increment = target / (duration / 16)
          let current = 0
          
          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, 16)
          
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  
  return <span ref={ref}>{count}{suffix}</span>
}

/* ========== MAIN COMPONENT ========== */

export default function HomeDashboard({ onExploreLibrary }) {
  const hero = useReveal('scale', 1200, 0)
  const aboutImg = useReveal('left', 1000, 200)
  const aboutTxt = useReveal('right', 1000, 400)
  const stats = useReveal('up', 900, 0)
  const categories = useStagger('.category-card', 150)
  const releases = useReveal('up', 1000, 0)
  const spotlight = useReveal('scale', 1000, 0)
  const quotes = useReveal('up', 1000, 0)
  const finalCta = useReveal('scale', 1000, 0)
  
  const tiltAbout = useTilt(12, true)
  const tiltCards = [useTilt(10, true), useTilt(10, true), useTilt(10, true)]
  const tiltReleases = [useTilt(8, true), useTilt(8, true), useTilt(8, true)]
  const tiltSpotlight = useTilt(12, true)
  
  const magneticBtns = [useMagnetic(0.3), useMagnetic(0.3), useMagnetic(0.3)]
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <>
     
      <ScrollProgress />
      
      <main className="min-h-screen w-380 text-white bg-[#0a0a0f] relative overflow-hidden">
        
        {/* Animated gradient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-30"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              left: `${20 + mousePos.x * 0.02}%`,
              top: `${10 + mousePos.y * 0.02}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              right: `${15 + mousePos.x * 0.015}%`,
              bottom: `${20 + mousePos.y * 0.015}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-[550px] h-[550px] rounded-full blur-[130px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
              left: `${50 + mousePos.x * 0.01}%`,
              top: `${50 + mousePos.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
        </div>

        {/* HERO SECTION */}
        <section className="relative min-h-screen w-385 flex items-center justify-center overflow-hidden">
          <FloatingParticles />
          
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0f_100%)]" />
          
          <div {...hero} className="relative z-10 px-6 max-w-7xl text-center">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl group hover:bg-white/10 transition-all duration-900">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Premium Digital Experience
              </span>
            </div>
            
            {/* Main heading with text reveal effect */}
            <h1 className="text-7xl md:text-9xl font-black leading-[0.95] tracking-tighter mb-8">
              <span className="block bg-gradient-to-br from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-2xl">
                Read To Lead.
              </span>
              <span className="block bg-gradient-to-br from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                Build Your Edge.
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="mt-8 text-xl md:text-2xl font-light text-white/70 max-w-3xl mx-auto leading-relaxed">
              Curated ebooks on discipline, focus, and execution—
              <br className="hidden md:block" />
              <span className="text-purple-300">crafted for ambitious creators and coders.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                ref={magneticBtns[0]}
                onClick={onExploreLibrary}
                className="group relative px-12 py-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 font-bold text-lg shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:shadow-[0_0_80px_rgba(168,85,247,0.8)] transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  Explore Library
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </button>
              
              <a
                ref={magneticBtns[1]}
                href="#about"
                className="group px-12 py-6 rounded-full border-2 border-white/20 backdrop-blur-2xl bg-white/5 hover:bg-white/10 hover:border-white/40 font-semibold text-lg transition-all duration-500 shadow-2xl"
              >
                <span className="flex items-center gap-2">
                  Learn More
                  <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </a>
            </div>
            
            {/* Stats row */}
            <div {...stats} className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { label: 'Books', value: 10, suffix: '+' },
                { label: 'Readers', value: 20, suffix: '+' },
                { label: 'Rating', value: 3.2, suffix: '/5' },
              ].map((stat) => (
                <div key={stat.label} className="text-center group cursor-default">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-purple-300 bg-clip-text text-transparent transition-transform group-hover:scale-110 duration-300">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-2 text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/50 animate-bounce">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <svg className="w-6 h-10" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="1" y="1" width="22" height="36" rx="11" />
              <circle cx="12" cy="10" r="3" fill="currentColor" className="animate-pulse" />
            </svg>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              {/* Image side */}
              <div {...aboutImg} className="relative">
                <div
                  ref={tiltAbout}
                  className="group relative h-[600px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.5)] transition-all duration-700 border border-white/10"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-cover bg-center transform scale-105 group-hover:scale-110 transition-transform duration-700" 
                       style={{ backgroundImage: "url('/covers/designed-to-read.png')" }} />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-transparent to-pink-900/60 group-hover:from-purple-900/40 group-hover:to-pink-900/40 transition-all duration-700" />
                  
                  {/* Glare effect */}
                  <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Floating info card */}
                  <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-purple-300 font-medium mb-1">Premium Content</div>
                        <div className="text-2xl font-bold">Designed for Mastery</div>
                      </div>
                      <div className="text-4xl">✨</div>
                    </div>
                  </div>
                  
                  {/* Corner accent */}
                  <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-purple-400/50 rounded-tr-2xl" />
                  <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-pink-400/50 rounded-bl-2xl" />
                </div>
                
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
              </div>
              
              {/* Text side */}
              <div {...aboutTxt}>
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  Why Choose Us
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black leading-[1.05] mb-8 tracking-tight">
                  <span className="block bg-gradient-to-br from-white to-white/90 bg-clip-text text-transparent">
                    Designed to
                  </span>
                  <span className="block bg-gradient-to-br from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent">
                    Be Read.
                  </span>
                  <span className="block text-white/90">Built to Be Used.</span>
                </h2>
                
                <p className="text-white/70 text-xl leading-relaxed mb-10">
                  Every title distills signal from noise—tactics, mental models, and systems that turn <span className="text-purple-300 font-semibold">intent into habit</span> and output.
                </p>
                
                {/* Feature list */}
                <ul className="space-y-5 mb-10">
                  {[
                    { icon: '🎯', title: 'Practical Frameworks', desc: 'For discipline and deep focus' },
                    { icon: '⚡', title: 'High-Density Insights', desc: 'Tight chapters, maximum value' },
                    { icon: '✨', title: 'Beautiful Typography', desc: 'For calm, immersive reading' },
                  ].map((item, i) => (
                    <li key={i} className="group flex items-start gap-5 p-5 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-default">
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
                      <div>
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">{item.title}</div>
                        <div className="text-white/60 text-sm mt-1">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={onExploreLibrary}
                  className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-500/50 backdrop-blur-xl font-semibold transition-all duration-300 inline-flex items-center gap-3"
                >
                  Discover More
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
                Featured Collections
              </div>
              <h3 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Explore Categories
              </h3>
              <p className="text-white/60 text-xl max-w-2xl mx-auto">
                Dive into curated collections designed for accelerated growth
              </p>
            </div>
            
            {/* Category cards */}
            <div ref={categories} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  img: '/covers/exp-1.png', 
                  title: 'Focus & Flow', 
                  desc: 'Systems to protect attention and do deep work.', 
                  color: 'from-blue-600/90 to-cyan-600/90',
                  books: 18
                },
                { 
                  img: '/covers/exp-2.png', 
                  title: 'Discipline', 
                  desc: 'Habit loops, friction design, and consistency.', 
                  color: 'from-purple-600/90 to-pink-600/90',
                  books: 24
                },
                { 
                  img: '/covers/exp-3.png', 
                  title: 'Entrepreneurship', 
                  desc: 'Leverage, offers, and compounding skills.', 
                  color: 'from-orange-600/90 to-red-600/90',
                  books: 16
                },
              ].map((card, idx) => (
                <div key={card.title} className="category-card opacity-0 translate-y-8">
                  <div
                    ref={tiltCards[idx]}
                    className="group relative h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 border border-white/10 cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Image */}
                    <img
                      src={card.img}
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-70 group-hover:opacity-85 transition-opacity duration-500`} />
                    
                    {/* Glare effect */}
                    <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      {/* Top badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-sm font-semibold">
                          {card.books} Books
                        </span>
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Bottom content */}
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h4 className="text-4xl font-black mb-3 text-white">{card.title}</h4>
                        <p className="text-white/90 text-base leading-relaxed mb-6">{card.desc}</p>
                        
                        <button className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-sm font-semibold transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 inline-flex items-center gap-2">
                          Explore
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 skew-x-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LATEST RELEASES */}
        <section {...releases} className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            
            {/* Section header */}
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
                New Arrivals
              </div>
              <h3 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Latest Releases
              </h3>
              <p className="text-white/60 text-xl max-w-2xl mx-auto">
                Fresh insights to fuel your journey toward mastery
              </p>
            </div>
            
            {/* Release cards */}
            {[
              {
                img: '/covers/discp-img.png',
                title: 'Psychology of Discipline',
                subtitle: 'Master the Art of Consistency',
                desc: 'Build systems that remove willpower from the loop. Learn the frameworks that turn fleeting motivation into lasting habits.',
                author: 'Vimal Pravin',
                pages: 240,
                rating: 4.9,
                badge: 'Bestseller',
                badgeColor: 'from-purple-600 to-pink-600'
              },
              {
                img: '/covers/focus-img.png',
                title: 'Psychology of Focus',
                subtitle: 'Deep Work in a Distracted World',
                desc: 'A playbook for protecting your attention and achieving flow state. Reclaim your mind from the chaos of modern life.',
                author: 'Vimal Pravin',
                pages: 220,
                rating: 4.8,
                badge: 'New Release',
                badgeColor: 'from-blue-600 to-cyan-600'
              },
              {
                img: '/covers/minut-img.png',
                title: 'Master Your Minutes',
                subtitle: 'Time Tactics for Peak Output',
                desc: 'Time tactics that translate to output and clarity. Make every moment count with proven systems for productivity.',
                author: 'Vimal Pravin',
                pages: 200,
                rating: 4.7,
                badge: 'Top Rated',
                badgeColor: 'from-orange-600 to-red-600'
              }
            ].map((book, i) => (
              <div key={book.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32 last:mb-0 ${i % 2 ? 'lg:grid-flow-dense' : ''}`}>
                
                {/* Image side */}
                <div className={`relative ${i % 2 ? 'lg:col-start-2' : ''}`}>
                  <div
                    ref={tiltReleases[i]}
                    className="group relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 border border-white/10"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img
                      src={book.img}
                      alt={book.title}
                      className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-75 transition-opacity duration-500" />
                    
                    {/* Glare */}
                    <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Badge */}
                    <div className={`absolute top-6 right-6 px-4 py-2 rounded-full bg-gradient-to-r ${book.badgeColor} text-sm font-bold shadow-lg`}>
                      {book.badge}
                    </div>
                    
                    {/* Quick stats */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {book.rating}
                        </span>
                        <span>•</span>
                        <span>{book.pages} pages</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glow */}
                  <div className={`absolute -inset-6 bg-gradient-to-r ${book.badgeColor} opacity-0 group-hover:opacity-30 blur-3xl transition-opacity duration-700 -z-10`} />
                </div>
                
                {/* Content side */}
                <div className={`${i % 2 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="inline-block px-4 py-2 mb-4 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70">
                    By {book.author}
                  </div>
                  
                  <h4 className="text-5xl md:text-6xl font-black tracking-tight mb-3 leading-tight">
                    {book.title}
                  </h4>
                  
                  <div className="text-2xl text-purple-300 font-semibold mb-6">
                    {book.subtitle}
                  </div>
                  
                  <p className="text-white/70 text-lg leading-relaxed mb-8">
                    {book.desc}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <button
                      ref={magneticBtns[2]}
                      onClick={onExploreLibrary}
                      className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] transition-all duration-300 inline-flex items-center gap-2"
                    >
                      Read Sample
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    
                    <button className="px-8 py-4 rounded-full border-2 border-white/20 backdrop-blur-xl hover:bg-white/5 hover:border-white/40 font-semibold transition-all duration-300">
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AUTHOR SPOTLIGHT */}
        <section {...spotlight} className="relative py-32 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden">
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl" />
              
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Image */}
                <div className="relative">
                  <div
                    ref={tiltSpotlight}
                    className="group relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 transition-all duration-700"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <img 
                      src="/covers/auth-spo.png" 
                      alt="Author" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy" 
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Glare */}
                    <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Badge */}
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 text-sm font-bold flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Featured
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <div className="inline-block px-4 py-2 mb-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-300">
                    Author Spotlight
                  </div>
                  
                  <h3 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                    <span className="bg-gradient-to-br from-white to-purple-200 bg-clip-text text-transparent">
                      Vimal Pravin
                    </span>
                  </h3>
                  
                  <p className="text-white/75 text-xl leading-relaxed mb-8">
                    A creator who weaves code, craft, and creativity into readable playbooks for makers. Believer in <span className="text-purple-300 font-semibold">small steps daily, compounding forever</span>.
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mb-10">
                    {['Psychology', 'Productivity', 'Focus', 'Habits'].map(tag => (
                      <span key={tag} className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-300 hover:bg-purple-500/20 transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 mb-10">
                    {[
                      { label: 'Books', value: 12 },
                      { label: 'Readers', value: 10, suffix: 'K+' },
                      { label: 'Reviews', value: 500, suffix: '+' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-3xl font-black text-purple-300">
                          <AnimatedCounter target={stat.value} suffix={stat.suffix || ''} />
                        </div>
                        <div className="text-sm text-white/60 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={onExploreLibrary}
                    className="group px-10 py-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] transition-all duration-300 inline-flex items-center gap-3"
                  >
                    View All Works
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUOTE BANNER */}
        <section {...quotes} className="relative py-40 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/covers/wakk.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90" />
          
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <div className="mb-8">
              <svg className="w-20 h-20 mx-auto text-purple-400/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            
            <blockquote className="text-4xl md:text-5xl font-bold leading-tight text-white/95 mb-8">
              Knowledge compounds. Choose pages that bend the arc of your life toward mastery.
            </blockquote>
            
            <div className="text-purple-300 font-semibold text-xl">— Vimal Pravin</div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section {...finalCta} className="relative py-32 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="relative p-16 rounded-3xl bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 backdrop-blur-3xl border border-white/10 shadow-2xl text-center overflow-hidden">
              
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-5xl md:text-7xl font-black mb-6 leading-tight bg-gradient-to-br from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Start Reading
                  <br />
                  With Intent
                </h3>
                
                <p className="text-white/80 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
                  Pick a category, set a pace, and compound daily.<br />
                  <span className="text-purple-300 font-semibold">The best time was yesterday; the next best is now.</span>
                </p>
                
                <button 
                  onClick={onExploreLibrary}
                  className="group px-14 py-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 font-bold text-xl shadow-[0_0_60px_rgba(168,85,247,0.5)] hover:shadow-[0_0_100px_rgba(168,85,247,0.8)] hover:scale-105 transition-all duration-500 inline-flex items-center gap-4"
                >
                  <span className="text-3xl">🚀</span>
                  Go to Library
                  <svg className="w-6 h-6 transition-transform group-hover:translate-x-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
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
      </main>
    </>
  )
}
