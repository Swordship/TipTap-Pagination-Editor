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
      </div>
    )
}
