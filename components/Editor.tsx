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
      CharacterCount.configure({ limit: LIMIT }),
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
      if (!editor) return { characters: 0, words: 0 }

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
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <div className="editor-page">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="editor-footer">
        <div
          className={`character-count ${
            characters >= LIMIT ? 'character-count--warning' : ''
          }`}
        >
          <div className="character-count__left">
            <svg viewBox="0 0 20 20">
              <circle r="10" cx="10" cy="10" fill="#e5e7eb" />
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
              <circle r="6" cx="10" cy="10" fill="white" />
            </svg>

            <span>
              <strong>{characters}</strong> / {LIMIT} characters
            </span>
          </div>

          <div>{words} words</div>
        </div>
      </div>
    </>
  )
}
