// src/pages/Access.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function Access() {
  const { entitlementId } = useParams()
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch(`/api/library/${entitlementId}/meta`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (active) setMeta(data)
      } catch (e) {
        if (active) setErr(e.message || 'Failed to load')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [entitlementId])

  async function handleDownload() {
    try {
      const res = await fetch(`/api/library/${entitlementId}/download`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      window.location.href = url
    } catch (e) {
      alert(e.message || 'Download failed')
    }
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-white/80">Loading…</div>
  if (err || !meta) return (
    <div className="p-6 text-white">
      <p className="text-red-400">Access not found or error: {err}</p>
      <Link to="/library" className="inline-block mt-4 px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20">← Back to Library</Link>
    </div>
  )

  return (
    <div className="min-h-[60vh] p-6 text-white">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <img src={meta.cover} alt="" className="w-16 h-16 object-cover rounded" />
          <div>
            <h1 className="text-2xl font-bold">{meta.title}</h1>
            <p className="text-white/70">{meta.description || 'Thanks for your purchase.'}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-lg font-bold text-black bg-gradient-to-r from-amber-300 to-rose-400 hover:from-amber-400 hover:to-rose-500"
          >
            Download PDF
          </button>
          <a
            href={meta.sampleUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Preview sample
          </a>
          <Link to="/library" className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20">
            ← Back to Library
          </Link>
        </div>

        {meta.fileSize && (
          <p className="mt-3 text-white/60 text-sm">File size: {Math.round(meta.fileSize / (1024 * 1024))} MB</p>
        )}
      </div>
    </div>
  )
}
