// Toolbar.tsx
'use client'

import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-300 p-2 flex flex-wrap gap-2 bg-gray-50 rounded-t-lg">
      {/* Bold Button */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('bold')
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Bold
      </button>

      {/* Italic Button */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('italic')
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Italic
      </button>

      {/* Divider */}
      <div className="w-px bg-gray-300 mx-1"></div>

      {/* Heading 1 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        H1
      </button>

      {/* Heading 2 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        H2
      </button>

      {/* Heading 3 */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        H3
      </button>

      {/* Divider */}
      <div className="w-px bg-gray-300 mx-1"></div>

      {/* Bullet List */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        • List
      </button>

      {/* Numbered List */}
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        1. List
      </button>

      {/* Divider */}
      <div className="w-px bg-gray-300 mx-1"></div>

      {/* Blockquote */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Quote
      </button>
    </div>
  )
}