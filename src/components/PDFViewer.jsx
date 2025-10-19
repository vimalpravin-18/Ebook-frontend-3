// components/PDFViewer.jsx
import React from 'react'

function PDFViewer({ pdfPath, title, onClose }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-purple-950/20 to-[#0a0a0f] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:scale-105 transition-transform duration-300"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={pdfPath}
          className="w-full h-[80vh]"
          title={title}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  )
}

export default PDFViewer
