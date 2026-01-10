'use client'

import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CharacterCount } from '@tiptap/extensions'
import Toolbar from './Toolbar'

const LIMIT = 1000

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: LIMIT,
      }),
    ],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing…</p>
    `,
    immediatelyRender: false,
  })

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return { characters: 0, words: 0 }
      }

      return {
        characters: editor.storage.characterCount.characters(),
        words: editor.storage.characterCount.words(),
      }
    },
  })

  const characters = editorState?.characters ?? 0
  const words = editorState?.words ?? 0

  const percentage = Math.min(
    100,
    Math.round((characters / LIMIT) * 100)
  )

  if (!editor) return null

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Toolbar editor={editor} />

      <div className="p-8">
        <EditorContent editor={editor} />
      </div>

      {/* Character Counter Footer */}
      <div className="border-t px-8 py-3 bg-gray-50">
        <div
          className={`character-count ${
            characters >= LIMIT ? 'character-count--warning' : ''
          }`}
        >
          <div className="character-count__left">
            {/* Circular Progress */}
            <svg viewBox="0 0 20 20">
              {/* Background ring */}
              <circle r="10" cx="10" cy="10" fill="#e5e7eb" />

              {/* Progress ring */}
              <circle
                r="5"
                cx="10"
                cy="10"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${(percentage * 31.4) / 100} 31.4`}
                transform="rotate(-90) translate(-20)"
              />

              {/* Inner white circle */}
              <circle r="6" cx="10" cy="10" fill="white" />
            </svg>

            <span>
              <strong>{characters}</strong> / {LIMIT} characters
            </span>
          </div>

          <div>{words} words</div>
        </div>
      </div>
    </div>
  )
}
