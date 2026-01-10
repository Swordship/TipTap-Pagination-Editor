'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>This is a paragraph. Try selecting this text and using the toolbar buttons above to format it.</p>
      <p>You can make text <strong>bold</strong> or <em>italic</em>.</p>
      <h2>Features to try:</h2>
      <ul>
        <li>Create headings (H1, H2, H3)</li>
        <li>Make bullet lists like this one</li>
        <li>Or numbered lists</li>
        <li>Add block quotes</li>
      </ul>
      <p>Start typing below to create your own content...</p>
    `,
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Toolbar editor={editor} />
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}