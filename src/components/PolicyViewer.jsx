import { useState } from 'react'

function PolicyViewer({ onBack }) {
  const [selectedPolicy, setSelectedPolicy] = useState('terms')

  const policies = {
    terms: {
      title: 'Terms & Conditions',
      pdfPath: 'terms-and-conditions.pdf'
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-purple-950/20 to-[#0a0a0f] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-400/30 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Policies & Information
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-3">
            {Object.entries(policies).map(([key, policy]) => (
              <button
                key={key}
                onClick={() => setSelectedPolicy(key)}
                className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  selectedPolicy === key
                    ? 'bg-purple-600/40 border-2 border-purple-400 text-white scale-105'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {policy.title}
              </button>
            ))}
          </div>

          {/* PDF Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 bg-purple-600/10">
                <h2 className="text-2xl font-bold text-white">
                  {policies[selectedPolicy].title}
                </h2>
              </div>
              <div className="relative" style={{ height: '75vh' }}>
                <iframe
                  src={policies[selectedPolicy].pdfPath}
                  className="w-full h-full"
                  title={policies[selectedPolicy].title}
                  frameBorder="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolicyViewer
