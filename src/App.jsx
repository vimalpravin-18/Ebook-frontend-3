import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './components/Auth.jsx'
import Payment from './components/Payment.jsx'
import Sidebar from './components/Sidebar.jsx'
import HomeDashboard from './components/HomeDashboard.jsx'
import Favorites from './components/favorites.jsx'
import Contact from './components/Contact.jsx'
import Profile from './components/Profile.jsx'
import PolicyViewer from './components/PolicyViewer.jsx'

// Optional: tiny hook to read favorites count from localStorage
function useFavCount(key = 'fav_books') {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(key) || '[]'
        const arr = JSON.parse(raw)
        setCount(Array.isArray(arr) ? arr.length : 0)
      } catch {
        setCount(0)
      }
    }
    read()
    const onStorage = (e) => { if (e.key === key) read() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])
  return count
}

// Loading Screen Component with optional custom message
function LoadingScreen({ message = "LOADING" }) {
  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-[#0a0a0f] via-purple-950/20 to-[#0a0a0f] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {message.split('').map((letter, index) => (
            <span
              key={index}
              className="text-5xl md:text-7xl font-black bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent animate-fade-scale"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-scale {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.3);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .animate-fade-scale {
          animation: fade-scale 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')
  const [minLoadingComplete, setMinLoadingComplete] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [welcomeName, setWelcomeName] = useState('')

  const favCount = useFavCount()

  // Initial loading on app start
  useEffect(() => {
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true)
    }, 3000)

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && !user) {
        setIsLoggingIn(true)
        const userName = u.displayName || u.email?.split('@')[0] || 'User'
        setWelcomeName(userName)
        
        setTimeout(() => {
          setUser(u)
          setIsLoggingIn(false)
        }, 100)
      } else {
        setUser(u)
      }
    })

    return () => {
      clearTimeout(minLoadingTimer)
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (minLoadingComplete && user !== undefined) {
      setLoading(false)
    }
  }, [minLoadingComplete, user])

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [activePage])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    setTimeout(async () => {
      await signOut(auth)
      setIsLoggingOut(false)
    }, 3000)
  }

  if (loading) {
    return <LoadingScreen message="LOADING ..." />
  }

  if (isLoggingOut) {
    return <LoadingScreen message="GOODBYE !" />
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-grow ml-0 overflow-auto">
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1
              onClick={() => setActivePage('home')}
              className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent select-none cursor-pointer hover:scale-105 transition-transform duration-300"
              title="Go to Home"
            >
              Bookly
            </h1>

            <div className="flex items-center gap-6">
              <span className="text-white/80 font-medium hidden md:block">
                Welcome, <span className="text-purple-300 font-bold">{user.displayName}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="relative">
          {activePage === 'home' && (
            <HomeDashboard onExploreLibrary={() => setActivePage('library')} />
          )}

          {activePage === 'library' && (
            <Payment user={user} />
          )}

          {activePage === 'favorites' && (
            <Favorites onBackToLibrary={() => setActivePage('library')} />
          )}

          {activePage === 'contact' && (
            <Contact />
          )}

          {activePage === 'profile' && (
            <Profile />
          )}

          {activePage === 'policies' && (
            <PolicyViewer onBack={() => setActivePage('home')} />
          )}
        </div>

        <footer className="relative py-16 px-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">
  <div className="mx-auto max-w-7xl ml-50">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-12">
      <div>
        <div className="text-2xl font-black mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Your Library
        </div>
        <p className="text-white/60 text-sm leading-relaxed">
          Premium digital ebooks for ambitious creators and coders. Built with passion for readers who lead.
        </p>
      </div>
      
      <div>
        <div className="text-sm font-bold text-white/80 mb-4 ml-40 uppercase tracking-wider">Quick Links</div>
        <ul className="space-y-2 text-sm text-white/60 ml-40">
          <li>
            <a 
              href="#"
              onClick={() => setActivePage('policies')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </a>
          </li>
          <li>
            <a 
              href="#"
              onClick={() => setActivePage('policies')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a 
              href="#"
              onClick={() => setActivePage('policies')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Shipping Policy
            </a>
          </li>
          <li>
            <a 
              href="#"
              onClick={() => setActivePage('policies')}
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Refund Policy
            </a>
          </li>
        </ul>
      </div>

      <div>
        <div className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider">Contact</div>
        <ul className="space-y-2 text-sm text-white/60">
          <li>
            <a 
              href="https://www.instagram.com/_____op__vimal_____/" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Instagram
            </a>
          </li>
          <li>
            <a 
              href="https://www.linkedin.com/in/vimal-pravin-v" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a 
              href="https://github.com/vimalpravin-18" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Github
            </a>
          </li>
          <li>
            <a 
              href="mailto:vimalpravin071@gmail.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 transition-colors cursor-pointer"
            >
              Email
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <div className="pt-8 border-t border-white/10 text-center -ml-50 text-white/50 text-sm">
      © 2025 Bookly. Built with passion for readers who lead.
    </div>
  </div>
</footer>

      </div>
    </div>
  )
}

export default App
