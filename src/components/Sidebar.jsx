import { useState, useEffect } from "react";

const navItems = [
  { label: "Home", icon: "🏠", gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/50" },
  { label: "Library", icon: "📚", gradient: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/50" },
  { label: "Favorites", icon: "⭐", gradient: "from-orange-500 to-red-500", shadow: "shadow-orange-500/50" },
  { label: "Contact", icon: "📧", gradient: "from-indigo-500 to-purple-500", shadow: "shadow-indigo-500/50" },
  { label: "Profile", icon: "👤", gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/50" },
];

// ✅ Custom Menu and X icons (replacing lucide-react)
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Sidebar({ activePage, setActivePage }) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ zIndex: 200 }}>
      {/* 🌐 Mobile top bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-lg flex items-center justify-between px-4 z-50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="text-white font-bold text-lg">Bookly</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="text-white focus:outline-none"
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      )}

      {/* 🌈 Desktop hover trigger */}
      {!isMobile && (
        <div
          className={`fixed top-0 left-0 w-2 h-full z-50 transition-all duration-300 ${
            open ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          onMouseEnter={() => setOpen(true)}
        >
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-20 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-orange-500/50 rounded-r-full animate-pulse" />
        </div>
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-0 left-0 ${
          isMobile ? "h-screen w-3/4" : "h-screen w-24"
        } flex flex-col py-6 items-center bg-gradient-to-b from-black/80 via-black/70 to-black/80 backdrop-blur-2xl border-r border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : isMobile ? "-translate-x-full" : "-translate-x-full"
        }`}
        onMouseLeave={() => {
          if (!isMobile) {
            setOpen(false);
            setHoveredItem(null);
          }
        }}
      >
        {/* ✨ Animated bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/60 via-purple-500/60 to-orange-500/60 animate-pulse" />

        {/* 📖 Logo */}
        <div className="mb-8 mt-2 flex flex-col items-center">
          <div className="w-16 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
            <span className="text-2xl">📖</span>
          </div>
          {!isMobile && (
            <p className="text-[10px] text-white/60 mt-1 font-semibold">Bookly</p>
          )}
        </div>

        {/* 🧭 Navigation buttons */}
        <nav className="flex-1 flex flex-col justify-center gap-6 w-full px-3">
          {navItems.map((item) => {
            const isActive = activePage === item.label.toLowerCase();
            const isHovered = hoveredItem === item.label;

            return (
              <button
                key={item.label}
                onClick={() => {
                  setActivePage(item.label.toLowerCase());
                  if (isMobile) setOpen(false);
                }}
                onMouseEnter={() => !isMobile && setHoveredItem(item.label)}
                onMouseLeave={() => !isMobile && setHoveredItem(null)}
                className={`relative flex items-center ${
                  isMobile ? "gap-3 px-4 py-3" : "flex-col justify-center px-2 py-3"
                } rounded-xl transition-all duration-300 group ${
                  isActive
                    ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-105`
                    : "bg-white/5 hover:bg-white/10 hover:scale-105"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white animate-pulse" />
                )}

                <div
                  className={`text-2xl ${
                    isActive || isHovered
                      ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      : "scale-100"
                  } transition-transform duration-300`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-[12px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-white drop-shadow-lg"
                      : "text-white/70 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 📘 Footer */}
        <div className="mt-4 mb-4 flex flex-col items-center gap-2">
          <div className="w-8 h-0.5 rounded-full bg-white/20" />
          <p className="text-[10px] text-white/40 font-semibold">Bookly</p>
        </div>
      </aside>

      {/* 🕶️ Overlay for mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
