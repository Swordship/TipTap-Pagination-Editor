import Editor from '../components/Editor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            Document Pagination Editor
          </h1>
          <p className="text-gray-600">
            A rich text editor with real-time pagination
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm">
            Day 1: Basic Editor ✓
          </div>
        </div>

        {/* Editor */}
        <Editor />

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Next up: Adding page dimensions and pagination logic</p>
        </div>
      </div>
    </main>
  )
}