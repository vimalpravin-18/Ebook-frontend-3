import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './components/Auth'
import Payment from './components/Payment'
import Sidebar from './components/Sidebar'
import HomeDashboard from './components/HomeDashboard'
import Favorites from './components/Favorites'
import Contact from './components/Contact'
import Profile from './components/Profile'

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

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState('home')

  const favCount = useFavCount()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] flex overflow-hidden">
      {/* Sidebar with page setter */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-grow ml-0 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1
              onClick={() => setActivePage('home')}
              className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent select-none cursor-pointer hover:scale-105 transition-transform duration-300"
              title="Go to Home"
            >
              Book Haven
            </h1>

            <div className="flex items-center gap-6">
              <span className="text-white/80 font-medium hidden md:block">
                Welcome, <span className="text-purple-300 font-bold">{user.displayName || user.email}</span>
              </span>
              <button
                onClick={() => signOut(auth)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Pages */}
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
        </div>

      
      </div>
    </div>
  )
}

export default App
