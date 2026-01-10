import Editor  from "../components/Editor"
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Document Pagination Editor
        </h1>
        <Editor/>
      </div>
    </main>
    
  )
}