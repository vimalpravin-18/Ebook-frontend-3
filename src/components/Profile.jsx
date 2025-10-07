import { useState, useEffect, useRef } from 'react'
import { auth } from '../firebase'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

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
        className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ========== MAIN COMPONENT ========== */

export default function Profile() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '')
  const [passwordMode, setPasswordMode] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  const user = auth.currentUser

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const hero = useReveal()
  const settings = useReveal()

  const tiltProfile = useTilt(12, true)

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(user, { displayName })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditMode(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwords.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwords.new)
      
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordMode(false)
      setPasswords({ current: '', new: '', confirm: '' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Check your current password.' })
    }
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
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
          <div 
            className="absolute w-[450px] h-[450px] rounded-full blur-[120px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: 'all 0.3s ease-out'
            }}
          />
        </div>

        {/* HERO PROFILE SECTION */}
        <section className="relative py-20 px-6">
          <div 
            ref={hero.ref}
            className={`mx-auto max-w-5xl transition-all duration-1000 ${
              hero.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Page Title */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-3 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm text-white/80">Profile Settings</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Your Profile
              </h1>
              <p className="mt-4 text-white/70 text-lg">
                Manage your account information and security
              </p>
            </div>

            {/* Profile Card */}
            <div
              ref={tiltProfile}
              className="relative p-10 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-2xl mx-auto"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Avatar */}
              <div className="relative mx-auto w-32 h-32 mb-8">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-6xl shadow-2xl">
                  👤
                </div>
                <button className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              {editMode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/5 border-2 border-white/10 text-white text-center font-bold focus:outline-none focus:border-purple-500/50 transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold shadow-lg transition-all duration-300"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setDisplayName(user?.displayName || '')
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-center mb-3">{user?.displayName || 'User'}</h2>
                  <p className="text-white/60 text-center text-lg mb-8">{user?.email}</p>
                  
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </>
              )}

              {/* Verification Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400 font-semibold">Verified Account</span>
              </div>

              {/* Glare effect */}
              <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            </div>
          </div>
        </section>

        {/* Message Banner */}
        {message.text && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
            <div className={`px-6 py-4 rounded-xl backdrop-blur-2xl border shadow-2xl ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : 'bg-red-500/20 border-red-500/30 text-red-300'
            }`}>
              <p className="font-semibold flex items-center gap-2">
                {message.type === 'success' ? '✅' : '⚠️'}
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS */}
        <section 
          ref={settings.ref}
          className={`relative py-20 px-6 transition-all duration-1000 ${
            settings.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="mx-auto max-w-4xl">
            
            {/* Account Settings Card */}
            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
              <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                Account Settings
              </h3>

              {passwordMode ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full p-4 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full p-4 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full p-4 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold shadow-lg transition-all"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setPasswordMode(false)
                        setPasswords({ current: '', new: '', confirm: '' })
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setPasswordMode(true)}
                    className="w-full p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-semibold transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        🔒
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Change Password</div>
                        <div className="text-sm text-white/60">Update your account password</div>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button className="w-full p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-semibold transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        🛡️
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Two-Factor Authentication</div>
                        <div className="text-sm text-white/60">Add an extra layer of security</div>
                      </div>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-bold">Disabled</span>
                  </button>

                  <button className="w-full p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left font-semibold transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        📱
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">Connected Devices</div>
                        <div className="text-sm text-white/60">Manage your logged-in devices</div>
                      </div>
                    </div>
                    <span className="text-white/80 text-lg font-bold">3 active</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* LOGOUT SECTION */}
<section className="relative py-20 px-6">
  <div className="mx-auto max-w-4xl">
    <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg">
            🚪
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Sign Out</h3>
            <p className="text-sm text-white/60">End your current session</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              auth.signOut()
            }
          }}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
</section>


        {/* FOOTER */}
        <footer className="relative py-16 px-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl text-center">
            <p className="text-white/50 text-sm">
              © 2025 NeonStore. Your profile, your security.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
