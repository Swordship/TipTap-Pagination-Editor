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

  if (!editor) return null

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Toolbar editor={editor} />

      <div className="p-8">
        <EditorContent editor={editor} />
      </div>

      {/* <div className="border-t px-8 py-3 bg-gray-50 text-sm text-gray-600 flex justify-between">
        <span>Characters: {characters} / {LIMIT}</span>
        <span>Words: {words}</span>
      </div> */}
      <div className="border-t px-8 py-3 bg-gray-50">
        <div
            className={`character-count ${
            characters >= LIMIT ? 'character-count--warning' : ''
            }`}
        >
            <div className="character-count__left">
            <strong>{characters}</strong> / {LIMIT} characters
            </div>

            <div>
            {words} words
            </div>
        </div>
      </div>
    </div>
  )
}
