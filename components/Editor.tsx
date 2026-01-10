"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h1>My Document</h1>
      <p>Start typing here...</p>
    `,
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded p-4">
      <EditorContent editor={editor} />
    </div>
  )
}
