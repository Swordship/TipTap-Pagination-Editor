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
    <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b bg-white px-4 py-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${buttonBase} ${
          editor.isActive('bold')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${buttonBase} ${
          editor.isActive('italic')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Italic
      </button>

      <div className="w-px bg-gray-300 mx-1" />

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
        >
          H{level}
        </button>
      ))}

      <div className="w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonBase} ${
          editor.isActive('bulletList')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
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
      >
        1. List
      </button>

      <div className="w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`${buttonBase} ${
          editor.isActive('blockquote')
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        Quote
      </button>
    </div>
  )
}
