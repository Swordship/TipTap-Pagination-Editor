import Editor from '../components/Editor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Document Pagination Editor
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time pagination for legal documents • US Letter (8.5&quot; × 11&quot;) • 1&quot; margins
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              ✓ Day 1-3: Setup Complete
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              → Day 4: Page Break Logic
            </span>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="py-8">
        <Editor />
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t py-4 print:hidden">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            <strong>Print:</strong> Ctrl+P / Cmd+P to print with matching page breaks
          </p>
        </div>
      </div>
    </main>
  )
}