import { useState, useEffect, useRef } from 'react'

const navItems = [
  { label: 'Home', icon: '🏠' },
  { label: 'Library', icon: '📚' },
  { label: 'Favorites', icon: '⭐' },
  { label: 'About', icon: '👤' },
]

export default function NeonGlassSidebar({ activePage, setActivePage }) {
  const [expanded, setExpanded] = useState(false)
  const navRefs = useRef([])

  const [indicatorStyle, setIndicatorStyle] = useState({})

  useEffect(() => {
    if (navRefs.current && navRefs.current.length > 0 && activePage) {
      const activeIndex = navItems.findIndex(
        (item) => item.label.toLowerCase() === activePage
      )
      if (activeIndex !== -1 && navRefs.current[activeIndex]) {
        const el = navRefs.current[activeIndex]
        setIndicatorStyle({
          top: el.offsetTop,
          height: el.clientHeight,
        })
      }
    }
  }, [activePage])

  return (
    <aside
      className={`fixed top-0 left-0 h-screen overflow-hidden bg-white/10 backdrop-blur-xl border-r border-purple-400/30 shadow-lg flex flex-col transition-[width] duration-500 ease-in-out overflow-hidden z-50
        ${expanded ? 'w-26' : 'w-20'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-center text-white text-3xl font-extrabold tracking-widest select-none glow-neon-purple">
        {expanded ? '💡' : ''}
      </div>

      {/* Sliding Neon Indicator */}
      <span
        style={indicatorStyle}
        className="absolute left-0 w-1 bg-gradient-to-b from-purple-400 via-pink-500 to-indigo-500 rounded-r-full shadow-neon transition-all duration-500"
      />

      {/* Navigation */}
      <nav className="relative flex flex-col flex-grow mt-8 space-y-6 px-2">
        {navItems.map((item, idx) => {
          const isActive = activePage === item.label.toLowerCase()
          return (
            <button
              key={idx}
              ref={(el) => (navRefs.current[idx] = el)}
              onClick={() => setActivePage(item.label.toLowerCase())}
              className={`group flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all duration-300
                ${
                  isActive
                    ? 'bg-purple-600 shadow-md shadow-purple-500'
                    : 'bg-gray-800 hover:bg-purple-700'
                }`}
              title={item.label}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </span>
              <span
                className={`mt-1 text-xs text-white truncate select-none transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <footer className="p-4 text-white text-center text-xs opacity-50 select-none">
        &copy; 2025 NeonStore
      </footer>
    </aside>
  )
}
