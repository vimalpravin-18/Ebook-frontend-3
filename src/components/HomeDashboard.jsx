import React, { useEffect, useRef, useState } from 'react'

/* Reveal-on-scroll with stagger and optional skew */
function useReveal(direction = 'up', duration = 700, delay = 0, skew = 0) {
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
      { threshold: 0.12 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const offset = { up: 'translateY(76px)', down: 'translateY(-26px)', left: 'translateX(-26px)', right: 'translateX(26px)' }
  return {
    ref,
    style: {
      opacity: inView ? 1 : 0,
      transform: inView
        ? 'none'
        : `${offset[direction] || offset.up} ${skew ? `skewY(${skew}deg)` : ''}`.trim(),
      transition: `opacity ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      willChange: 'opacity, transform',
    },
  }
}



/* Pointer-based 3D tilt for cards/images (no external libs) */
function useTilt(maxTilt = 10, scale = 1.02) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = () => el.getBoundingClientRect()
    function onMove(e) {
      const r = rect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const rx = (py - 0.5) * -2 * maxTilt
      const ry = (px - 0.5) * 2 * maxTilt
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    }
    function reset() {
      el.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)'
    }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', reset)
    el.addEventListener('touchmove', e => {
      const t = e.touches[0]
      if (!t) return
      const r = rect()
      const px = (t.clientX - r.left) / r.width
      const py = (t.clientY - r.top) / r.height
      const rx = (py - 0.5) * -2 * maxTilt
      const ry = (px - 0.5) * 2 * maxTilt
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    })
    el.addEventListener('touchend', reset)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', reset)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', reset)
    }
  }, [maxTilt, scale])
  return ref
}

export default function HomeDashboard({ onExploreLibrary }) {
  // Reveals
  const hero = useReveal('up', 900, 0, 0)
  const aboutImg = useReveal('left', 900, 100, 0)
  const aboutTxt = useReveal('right', 900, 250, 1.5)
  const categories = useReveal('up', 900, 0, 0)
  const releases = useReveal('up', 900, 0, 0)
  const spotlightImg = useReveal('left', 900, 100, 0)
  const spotlightTxt = useReveal('right', 900, 250, -1)
  const quotes = useReveal('up', 900, 0, 0)
  const finalCta = useReveal('up', 900, 0, 0)

  // Tilt refs
  const tiltAbout = useTilt(10, 1.03)
  const tiltCards = [useTilt(8, 1.02), useTilt(8, 1.02), useTilt(8, 1.02)]
  const tiltReleases = [useTilt(6, 1.01), useTilt(6, 1.01), useTilt(6, 1.01)]
  const tiltSpotlight = useTilt(10, 1.03)

  return (
    <main className="min-h-screen w-348  text-white bg-gradient-to-r from-gray-900 to-black">
      {/* HERO */}
      <section {...hero} className="relative w-full min-h-[82vh] flex items-center justify-center text-center overflow-hidden">
        {/* Use /covers/... for public assets */}
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('public/covers/new background-image.png')" }} aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-black/45" />

        {/* Soft glow rings */}
        <div className="pointer-events-none absolute -z-10 inset-0">
          <div className="absolute left-10 top-16 w-64 h-64 rounded-full bg-pink-500/20 blur-3xl" />
          <div className="absolute right-10 bottom-16 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="px-6 max-w-6xl group">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow transition-transform duration-100 group-hover:-translate-y-1 absolute top-30 left-1/2 -translate-x-1/2 text-white/100 text-3xl animate-bounce">
            Read To Lead. Build Your Edge.
          </h1>
          <p className="mt-4 text-xl md:text-xl font-light text-white/90 transition-transform duration-500 group-hover:-translate-y-0.5">
            Curated ebooks on discipline, focus, and execution crafted for ambitious creators and coders.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-16">
            <button
              onClick={onExploreLibrary}
              className="px-18 py-46 rounded-full scale-130 text-white-900 font-semibold hover:scale-126 hover:shadow-1xl transition-all duration-300"
            >
              📚 Explore Library
            </button>
            <a
              href="#about"
              className="px-14 py-5 md:text-xl rounded-full scale-101 border text-black-900 border-white/100 hover:bg-white/100 hover:backdrop-blur transition-all duration-150"
            >
              Learn more
            </a>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm animate-bounce">
          Scroll to discover
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative mx-auto max-w-6xl px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div {...aboutImg} className="relative perspective-[250px]">
          <div
            ref={tiltAbout}
            className="relative w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden shadow-xl transition-transform duration-100 will-change-transform"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('public/covers/designed-to-read.png')" }} aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/35 to-black/10" />
            <img
              src="/covers/about-img.png"
              alt="Accent"
              className="absolute bottom-6 right-6 w-24 md:w-60 rounded-lg shadow-2xl opacity-0"
              loading="lazy"
            />
          </div>
        </div>

        <div {...aboutTxt} >
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight [text-shadow:_0_2px_18px_rgba(0,0,0,0.25)]">
            Designed to Be Read. Built to Be Used.
          </h2>
          <p className="mt-4 text-white/85 text-lg leading-relaxed">
            Every title distills signal from noise tactics, mental models, and systems that turn intent into habit and output.
          </p>
          <ul className="mt-6 space-y-3 text-white/85">
            <li className="transition-all duration-300 hover:translate-x-1">• Practical frameworks for discipline and focus</li>
            <li className="transition-all duration-300 hover:translate-x-1">• Tight chapters, high-density insights</li>
            <li className="transition-all duration-300 hover:translate-x-1">• Beautiful typography for deep, calm reading</li>
          </ul>
        </div>
      </section>

      {/* CATEGORIES */}
      <section {...categories} className="w-full px-16 py-16 bg-neutral-900/10">
        <div className="mx-auto max-w-6xl">
          <h3 className="text-3xl md:text-4xl font-bold mb-8">Explore Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { img: '/covers/exp-1.png', title: 'Focus & Flow', blurb: 'Systems to protect attention and do deep work.' },
              { img: '/covers/exp-2.png', title: 'Discipline', blurb: 'Habit loops, friction design, and consistency.' },
              { img: '/covers/exp-3.png', title: 'Entrepreneurship', blurb: 'Leverage, offers, and compounding skills.' },
            ].map((card, idx) => (
              <div key={card.title} className="perspective-[180px]">
                <div
                  ref={tiltCards[idx]}
                  className="group relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-100 will-change-transform"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-130"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                  <div className="absolute bottom-4 left-4">
                    <div className="text-2xl font-bold transition-transform duration-300 group-hover:-translate-y-3.5">{card.title}</div>
                    <p className="text-white/85 transition-opacity duration-300 group-hover:opacity-95">{card.blurb}</p>
                  </div>
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute -inset-2 rounded-3xl from-pink-500/20 via-indigo-500/20 to-purple-500/20 blur-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST RELEASES — redesigned */}
      <section {...releases} className="mx-auto max-w-6xl px-6 py-20 space-y-30">
        <h3 className="text-3xl md:text-4xl font-bold mb-16">Latest Releases</h3>

        {/* 1) Alternating split rows */}
        {[
          {
            img: '/covers/discp-img.png',
            title: 'Psychology of Discipline',
            text: 'Build systems that remove willpower from the loop.',
            cta: 'Read sample',
          },
          {
            img: '/covers/focus-img.png',
            title: 'Psychology of Focus',
            text: 'A playbook for deep work in a distracted world.',
            cta: 'Preview chapter',
          },
          {
            img: '/covers/minut-img.png',
            title: 'Master Your Minutes',
            text: 'Time tactics that translate to output and clarity.',
            cta: 'Read sample',
          }
        ].map((r, i) => (
          <div key={r.title} className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className={`relative ${i % 2 ? 'md:order-2' : ''}`}>
              <div ref={tiltReleases[i]} className="rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300">
                <img
                  src={r.img}
                  alt={r.title}
                  className="w-full h-80 object-cover transition-transform duration-500 hover:scale-115"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
              <div className="hidden md:block absolute -right-6 -bottom-6 w-24 h-24 rounded-xl bg-gradient-to-br from-gray-500/30 to-blue-500/30 blur-xl" />
            </div>

            <div className={`${i % 2 ? 'md:order-1' : ''}`}>
              <h4 className="text-2xl md:text-4xl font-extrabold tracking-tight">{r.title}</h4>
              <p className="mt-7 text-white/85 leading-relaxed">{r.text}</p>
              <button
                onClick={onExploreLibrary}
                className="mt-5 px-5 py-2 rounded-full border border-white/50 hover:bg-white/10 transition-colors duration-100"
              >
                {r.cta}
              </button>
            </div>
          </div>
        ))}


        {/* 3) Overlay cards row for variety */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              img: '/covers/discp-img.png',
              title: 'Psychology of Discipline',
              blurb: 'Systems over willpower.',
            },
            {
              img: '/covers/focus-img.png',
              title: 'Psychology of Focus',
              blurb: 'Guard attention, gain flow.',
            },
            {
              img: '/covers/minut-img.png',
              title: 'Master Your Minutes',
              blurb: 'Make time work for you.',
            },
          ].map((c) => (
            <article key={c.title} className="group relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={c.img}
                alt={c.title}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h5 className="text-xl md:text-2xl font-extrabold tracking-tight">{c.title}</h5>
                <p className="text-white/85 mt-1">{c.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* AUTHOR SPOTLIGHT */}
      <section className="relative mx-auto max-w-6xl px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div {...spotlightImg}>
          <div ref={tiltSpotlight} className="relative scale-100 w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 will-change-transform">
            <img src="public/covers/auth-spo.png" alt="Author" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        </div>
        <div {...spotlightTxt}>``
          <h3 className="text-3xl md:text-4xl font-bold">Author Spotlight</h3>
          <p className="mt-3 text-white/85 text-lg">Vimal Pravin weaves code, craft, and creativity into readable playbooks for makers. Small steps daily, compounding forever.</p>
          <button onClick={onExploreLibrary} className="mt-6 px-6 py-3 rounded-full bg-white text-black-900 font-semibold hover:scale-105 transition-transform duration-300">
            View Works
          </button>
        </div>
      </section>

      {/* QUOTE BANNER */}
      <section {...quotes} className="relative w-full py-24 text-center overflow-hidden group">
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('/covers/wakk.png')" }} aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-black/45" />
        <blockquote className="mx-auto max-w-4xl text-2xl md:text-3xl italic transition-transform duration-700 group-hover:-translate-y-2">
          “Knowledge compounds. Choose pages that bend the arc of your life toward mastery.”
        </blockquote>
      </section>

      {/* FINAL CTA */}
      <section {...finalCta} className="w-full py-20 px-6 bg-neutral-900/60 backdrop-blur">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold">Start Reading With Intent</h3>
          <p className="mt-3 text-white/85">Pick a category, set a pace, and compound daily. The best time was yesterday; the next best is now.</p>
          <button onClick={onExploreLibrary} className="mt-6 px-8 py-4 rounded-full bg-white text-white-900 font-semibold hover:scale-105 transition-transform duration-300">
            Go to Library
          </button>
        </div>
      </section>
    </main>
  )
}
