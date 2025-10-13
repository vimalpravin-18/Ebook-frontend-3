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
      
      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateZ(10px)`
      
      if (glareEl) {
        glareEl.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.15), transparent 60%)`
        glareEl.style.opacity = '1'
      }
    }
    
    function onLeave() {
      el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)'
      if (glareEl) glareEl.style.opacity = '0'
    }
    
    el.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
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
    
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.5 + 0.5,
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
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
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
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-20" />
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

/* ========== LOGOUT CONFIRMATION MODAL ========== */

function LogoutModal({ isOpen, onConfirm, onCancel }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] text-white flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 text-white bg-black/80 backdrop-blur-md"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-300">
        <div className="relative p-8 rounded-3xl text-white bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl border border-white/20 shadow-2xl">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-3xl font-black text-center text-white mb-3">
            Confirm Logout
          </h3>

          {/* Description */}
          <p className="text-center text-white/70 text-lg mb-8">
            Are you sure you want to logout? You'll need to sign in again to access your account.
          </p>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-4 text-white rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-lg transition-all duration-300 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-4 text-white rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Yes, Logout
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:rotate-90"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ========== GOODBYE SCREEN ========== */

function GoodbyeScreen({ isVisible }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] animate-in fade-in duration-500">
      
      {/* Animated particles */}
      

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 animate-in zoom-in-95 duration-700">
        
        {/* Animated icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
             
           
          </div>
        </div>

        {/* Goodbye text */}
        <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-900 delay-900">
         GOODBYE !
        </h2> 

        {/* Loading spinner */}
        <div className="mt-10 flex justify-center animate-in fade-in duration-700 delay-500">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl">
            <svg className="animate-spin h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-bold text-white/70">Signing out...</span>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float-away {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          75% {
            transform: rotate(-20deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-float-away {
          animation: float-away linear forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

/* ========== MAIN PROFILE COMPONENT ========== */

export default function Profile() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '')
  const [passwordMode, setPasswordMode] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showGoodbye, setShowGoodbye] = useState(false) // 🎯 NEW: Goodbye screen state
  const user = auth.currentUser

  useEffect(() => {
    const saved = localStorage.getItem('profile_image')
    if (saved) setProfileImage(saved)
  }, [])

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const hero = useReveal()
  const infoSection = useReveal()
  const settingsSection = useReveal()
  const securitySection = useReveal()
  const tiltProfile = useTilt(10, true)
  const tiltSettings = useTilt(8, true)

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 4000)
  }

  const handleProfileImageChange = e => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = evt => {
        setProfileImage(evt.target.result)
        localStorage.setItem('profile_image', evt.target.result)
        showMessage('success', 'Profile picture updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      showMessage('error', 'Name cannot be empty!')
      return
    }
    
    setLoading(true)
    try {
      await updateProfile(user, { displayName: displayName.trim() })
      showMessage('success', 'Profile updated successfully!')
      setEditMode(false)
    } catch (error) {
      showMessage('error', 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showMessage('error', 'Please fill in all password fields!')
      return
    }
    
    if (passwords.new.length < 6) {
      showMessage('error', 'New password must be at least 6 characters!')
      return
    }
    
    if (passwords.new !== passwords.confirm) {
      showMessage('error', 'New passwords do not match!')
      return
    }
    
    setLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, passwords.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passwords.new)
      showMessage('success', 'Password changed successfully!')
      setPasswordMode(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect!')
      } else {
        showMessage('error', 'Failed to change password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 UPDATED: Logout handlers with goodbye screen
  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)  // Close modal
    setShowGoodbye(true)        // Show goodbye screen
    
    // Wait 2 seconds to show goodbye animation, then sign out
    setTimeout(() => {
      auth.signOut()
    }, 2000)
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
      <ScrollProgress />
      
      {/* Logout Confirmation Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
      
      {/* 🎯 NEW: Goodbye Screen */}
      <GoodbyeScreen isVisible={showGoodbye} />
      
      <div className="relative min-h-screen w-full text-white bg-[#0a0a0f] overflow-hidden">
        
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingParticles />
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              left: `${15 + mousePos.x * 0.015}%`,
              top: `${10 + mousePos.y * 0.015}%`,
              transition: 'all 0.5s ease-out'
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-15"
            style={{
              background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
              right: `${20 + mousePos.x * 0.01}%`,
              bottom: `${15 + mousePos.y * 0.01}%`,
              transition: 'all 0.5s ease-out'
            }}
          />
        </div>

        {/* Message Toast */}
        {message.text && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-8 py-4 rounded-2xl backdrop-blur-3xl border-2 shadow-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' 
                : 'bg-red-500/20 border-red-400/40 text-red-200'
            }`}>
              <span className="text-2xl">{message.type === 'success' ? '✓' : '⚠'}</span>
              <p className="font-bold text-lg">{message.text}</p>
            </div>
          </div>
        )}

        {/* PROFILE CARD SECTION */}
        <section className="relative py-8 px-6">
          <div
            ref={infoSection.ref}
            className={`mx-auto max-w-5xl transition-all duration-1000 delay-150 ${
              infoSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div
              ref={tiltProfile}
              className="relative p-12 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-3xl border border-white/10 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  
                  <div className="relative w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Upload Button */}
                  <label
                    className="absolute bottom-2 right-2 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 border-4 border-[#0a0a0f] flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform duration-300 group"
                    title="Change profile picture"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                </div>

                {/* Verified Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-emerald-400">Verified Account</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10"></div>

              {/* Profile Information */}
              {editMode ? (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white text-lg font-semibold focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false)
                        setDisplayName(user?.displayName || '')
                      }}
                      disabled={loading}
                      className="flex-1 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {user?.displayName || 'User'}
                  </h2>
                  <p className="text-white/50 text-lg mb-3">{user?.email}</p>
                  
                  {/* Member Since */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-8">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Member since {new Date(user?.metadata?.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>

                  <button
                    onClick={() => setEditMode(true)}
                    className="group px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Glare Effect */}
              <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            </div>
          </div>
        </section>

        {/* SECURITY SETTINGS SECTION */}
        <section
          ref={securitySection.ref}
          className={`relative py-16 px-6 transition-all duration-1000 delay-300 ${
            securitySection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="mx-auto max-w-5xl">
            <div
              ref={tiltSettings}
              className="p-10 rounded-3xl bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-3xl border border-white/10 shadow-2xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">Security Settings</h3>
                  <p className="text-white/60 text-sm">Manage your password and account security</p>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

              {passwordMode ? (
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white text-lg placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your new password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white text-lg placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white text-lg placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all duration-300"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Password
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setPasswordMode(false)
                        setPasswords({ current: '', new: '', confirm: '' })
                      }}
                      disabled={loading}
                      className="flex-1 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 font-bold text-lg transition-all duration-300 hover:scale-105"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPasswordMode(true)}
                  className="group w-full p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 text-left font-semibold transition-all duration-300 flex items-center justify-between hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-black text-white text-xl mb-1">Change Password</div>
                      <div className="text-sm text-white/60">Update your account security credentials</div>
                    </div>
                  </div>
                  <svg className="w-7 h-7 text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Glare Effect */}
              <div className="glare-effect absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none rounded-3xl" />
            </div>
          </div>
        </section>

        {/* LOGOUT SECTION - 🎯 UPDATED: Opens modal instead of window.confirm */}
        <section
          ref={settingsSection.ref}
          className={`relative py-16 px-6 pb-32 transition-all duration-1000 delay-400 ${
            settingsSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="mx-auto max-w-5xl">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-green-500/10 via-red-500/5 to-transparent backdrop-blur-3xl border border-red-500/20 shadow-2xl hover:white transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">Sign Out</h3>
                    <p className="text-sm text-white/60">End your current session securely</p>
                  </div>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="group px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
                >
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

        
      


       