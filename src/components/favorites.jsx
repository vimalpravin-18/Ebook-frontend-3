import { useEffect, useMemo, useState } from 'react'

/* Read/write favorites from localStorage */
function useFavorites(key = 'fav_books') {
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')) }
    catch { return new Set() }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify([...favs]))
  }, [favs, key])

  const remove = (id) =>
    setFavs(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })

  const has = (id) => favs.has(id)

  return { favs, has, remove }
}

/* Optional: share this data from a single module in your app later */
const catalogData = [
  {
    id: 'disc1',
    title: 'Psychology of Discipline',
    cover: '/covers/generated-image (1).png',
    desc: 'Master your mindset and build lasting habits with practical frameworks, habit loops, and friction design.',
    price: 299,
    isFree: false,
    sampleUrl: '/samples/discipline-sample.pdf',
  },
  {
    id: 'focus1',
    title: 'Psychology of Focus',
    cover: '/covers/generated-image (2).png',
    desc: 'Eliminate distractions and achieve deep work with attention-guarding tactics and sprint protocols.',
    price: 0,
    isFree: false,
    sampleUrl: '/samples/focus-sample.pdf',
  },
  {
    id: 'life1',
    title: "The Life You're Meant To Live",
    cover: "/covers/The Life You’re Meant to Live book cover.jpg",
    desc: 'Discover purpose with guided prompts, values mapping, and a 12-week clarity plan.',
    price: 329,
    isFree: false,
    sampleUrl: '/samples/life-sample.pdf',
  },
  {
    id: 'side1',
    title: 'The Side Hustle Millionaire',
    cover: '/covers/side hustle cover image.jpg',
    desc: 'Build scalable side projects with offer design, distribution playbooks, and compounding skills.',
    price: 499,
    isFree: false,
    sampleUrl: '/samples/side-sample.pdf',
  },
  {
    id: 'min1',
    title: 'Master Your Minutes',
    cover: '/covers/Master Your Minutes.jpg',
    desc: 'Optimize your time with calendar guardrails, batching, and task runway planning.',
    price: 299,
    isFree: false,
    sampleUrl: '/samples/minutes-sample.pdf',
  },
]

export default function Favorites({ onBackToLibrary }) {
  const { favs, has, remove } = useFavorites()

  const favBooks = useMemo(
    () => catalogData.filter(b => has(b.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [favs]
  )

  return (
    <div className="min-h-[70vh] w-348">
      {/* Header row for page-local actions (optional) */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Favorites</h2>
        <div className="flex items-center gap-2">
          {typeof onBackToLibrary === 'function' && (
            <button
              onClick={onBackToLibrary}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
            >
              ← Back to Library
            </button>
          )}
        </div>
      </div>

      {favBooks.length === 0 ? (
        <div className="mt-10 text-center text-white/70">
          <p className="mb-4">No favorites yet.</p>
          {typeof onBackToLibrary === 'function' && (
            <button
              onClick={onBackToLibrary}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/40"
            >
              Browse Library
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favBooks.map((b) => (
            <article
              key={b.id}
              className="rounded-2xl bg-black overflow-hidden border-white/10 backdrop-blur-md"
            >
              <div className="h-48 text-white bg-gray-900 flex items-center justify-center">
                <img src={b.cover} alt={b.title} className="object-contain max-h-full max-w-full" />
              </div>

              <div className="p-5 bg-black">
                <div className="flex items-start  justify-between gap-3">
                  <h3 className="text-xl font-bold">{b.title}</h3>
                  <button
                    onClick={() => remove(b.id)}
                    className="px-3 py-1 rounded-lg border border-white/10 hover:bg-green-900"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    ❤️
                  </button>
                </div>

                <p className="mt-2 text-white/80 line-clamp-3">{b.desc}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-emerald-400">
                      {b.isFree ? 'Free' : `₹${(b.price )}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${b.isFree
                        ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30'}`}>
                      {b.isFree ? 'Free' : 'Paid'}
                    </span>
                  </div>

                  <a
                    href="ebook-frontend/src/components/Psychology of Discipline pdf format.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border-1 bg-grey-200 text-xl text-lg text-white border-grey/30 font-extrabold hover:bg-gradient-to-r from-blue-00 to-white hover:text-red-100 duration-700"
                  >
                    Preview
                  </a>
                
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
