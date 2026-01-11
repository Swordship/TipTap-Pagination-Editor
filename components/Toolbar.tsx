'use client'

import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

const buttonBase =
  'px-3 py-1.5 rounded text-sm font-medium border transition-colors'

const headingLevels: (1 | 2 | 3)[] = [1, 2, 3]

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="sticky top-0 z-50 flex flex-wrap gap-2 border-b bg-white px-4 py-3 shadow-sm print:hidden">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${buttonBase} ${
          editor.isActive('bold')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${buttonBase} ${
          editor.isActive('italic')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>

      <div className="w-px bg-gray-300 mx-1" />

      {/* Headings */}
      {headingLevels.map(level => (
        <button
          key={level}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level }).run()
          }
          className={`${buttonBase} ${
            editor.isActive('heading', { level })
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
          title={`Heading ${level}`}
        >
          H{level}
        </button>
      ))}

      <div className="w-px bg-gray-300 mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonBase} ${
          editor.isActive('bulletList')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Bullet List"
      >
        • List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonBase} ${
          editor.isActive('orderedList')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Numbered List"
      >
        1. List
      </button>

      <div className="w-px bg-gray-300 mx-1" />

      {/* Block elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonBase} ${
          editor.isActive('blockquote')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
        title="Quote"
      >
        ❝ Quote
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Print button */}
      <button
        onClick={() => window.print()}
        className={`${buttonBase} bg-green-50 text-green-700 border-green-300 hover:bg-green-100`}
        title="Print document (Ctrl+P)"
      >
        🖨️ Print
      </button>
    </div>
  )
}