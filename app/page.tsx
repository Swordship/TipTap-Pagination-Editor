import Editor from '../components/Editor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header - hidden in print */}
      <div className="bg-white border-b shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                Document Editor
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Legal document drafting with real-time pagination
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200">
                US Letter • 8.5 × 11
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-200">
                1 Margins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="py-8">
        <Editor />
      </div>

      {/* Footer Info - hidden in print */}
      <div className="bg-white border-t py-4 no-print">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p className="mb-1">
            <strong>To Print:</strong> Press Ctrl+P → More settings → <strong>Uncheck Headers and footers</strong>
          </p>
          <p className="text-xs text-gray-400">
            This ensures the printed output matches exactly what you see on screen (US Letter, 1 margins)
          </p>
        </div>
      </div>
    </main>
  )
}