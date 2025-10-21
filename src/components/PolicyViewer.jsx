import { useState } from 'react'

function PolicyViewer({ onBack }) {
  const [selectedPolicy, setSelectedPolicy] = useState('terms')

  const policies = {
    terms: {
      title: 'Terms & Conditions',
      pdfPath: '/terms-and-conditions.pdf'
    },
    privacy: {
      title: 'Privacy Policy',
      pdfPath: '/Privacy-policy.pdf'
    },
    shipping: {
      title: 'Shipping Policy',
      pdfPath: '/Shipping-policy.pdf'
    },
    refund: {
      title: 'Refund Policy',
      pdfPath: '/Refund-Policy.pdf'
    },
    contact: {
      title: 'Contact Us',
      pdfPath: '/Contact-Us.pdf'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-950/20 to-[#0a0a0f]">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/30 rounded-lg text-white font-semibold transition-all duration-300"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {policies[selectedPolicy].title}
            </h1>
          </div>

          {/* Policy Navigation Tabs */}
          <div className="hidden md:flex gap-2">
            {Object.entries(policies).map(([key, policy]) => (
              <button
                key={key}
                onClick={() => setSelectedPolicy(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedPolicy === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {policy.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <select
            value={selectedPolicy}
            onChange={(e) => setSelectedPolicy(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Object.entries(policies).map(([key, policy]) => (
              <option key={key} value={key} className="bg-gray-900">
                {policy.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PDF Viewer - Full Height */}
      <div className="w-full" style={{ height: 'calc(100vh - 140px)' }}>
        <iframe
          src={policies[selectedPolicy].pdfPath}
          className="w-full h-full border-0"
          title={policies[selectedPolicy].title}
        />
      </div>
    </div>
  )
}

export default PolicyViewer
