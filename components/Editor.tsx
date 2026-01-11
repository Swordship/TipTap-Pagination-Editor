'use client'

import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CharacterCount } from '@tiptap/extensions'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

const LIMIT = 1000

export default function Editor() {
  /* -----------------------------
     1. Create editor
  ----------------------------- */
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

  /* -----------------------------
     2. Character & word count
  ----------------------------- */
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

  /* -----------------------------
     3. Measurement state
  ----------------------------- */
  const [measurements, setMeasurements] = useState<{
    pageHeight: number
    totalHeight: number
    blockCount: number
    blocks: { type: string; height: number }[]
  } | null>(null)

  const [pageBreaks, setPageBreaks] = useState<number[]>([])

  /* -----------------------------
     4. Measure ONCE on mount
  ----------------------------- */
  useEffect(() => {
    if (!editor) return

    import('../utils/measure').then(
      ({ measurePageHeight, measureEditorBlocks, calculateTotalHeight, calculatePageBreaks }) => {
        const pageHeight = measurePageHeight()
        const editorDOM = editor.view.dom
        const blocks = measureEditorBlocks(editorDOM)
        const totalHeight = calculateTotalHeight(blocks)
        const breaks = calculatePageBreaks(blocks, pageHeight)

        console.log('📊 Initial content measurements:')
        console.log(`  Total blocks: ${blocks.length}`)
        console.log(`  Total height: ${totalHeight.toFixed(2)}px`)
        console.log(`  Page height: ${pageHeight.toFixed(2)}px`)
        console.log(`  Initial page breaks: [${breaks.join(', ')}]`)

        setMeasurements({
          pageHeight,
          totalHeight,
          blockCount: blocks.length,
          blocks: blocks.map(b => ({
            type: b.type,
            height: b.height,
          })),
        })
        
        setPageBreaks(breaks)
      }
    )
  }, [editor])

  /* -----------------------------
     5. Measure on EVERY update (debounced)
  ----------------------------- */
  useEffect(() => {
    if (!editor) return

    const handleUpdate = debounce(() => {
      import('../utils/measure').then(
        ({ measurePageHeight, measureEditorBlocks, calculateTotalHeight, calculatePageBreaks }) => {
          const pageHeight = measurePageHeight()
          const editorDOM = editor.view.dom
          const blocks = measureEditorBlocks(editorDOM)
          const totalHeight = calculateTotalHeight(blocks)
          const breaks = calculatePageBreaks(blocks, pageHeight)

          console.log('🔄 Content updated (debounced):')
          console.log(`  Blocks: ${blocks.length}, Height: ${totalHeight.toFixed(2)}px`)
          console.log(`  Page breaks at: [${breaks.join(', ')}]`)

          setMeasurements({
            pageHeight,
            totalHeight,
            blockCount: blocks.length,
            blocks: blocks.map(b => ({
              type: b.type,
              height: b.height,
            })),
          })
          
          setPageBreaks(breaks)
        }
      )
    }, 200)

    editor.on('update', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      handleUpdate.cancel()
    }
  }, [editor])

  if (!editor) return null

  /* -----------------------------
     6. Render UI
  ----------------------------- */
  return (
    <>
      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor Page */}
      <div className="editor-wrapper">
        <div className="editor-page">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Footer */}
      <div className="editor-footer">
        <div
          className={`character-count flex items-center gap-4 ${
            characters >= LIMIT ? 'character-count--warning' : ''
          }`}
        >
          {/* Character progress */}
          <div className="character-count__left flex items-center gap-2">
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

          {/* Word count */}
          <div>{words} words</div>

          {/* Quick measurement summary */}
          {measurements && (
            <>
              <div className="w-px h-4 bg-gray-300" />

              <div className="flex gap-3 text-xs text-gray-500">
                <span>{measurements.blockCount} blocks</span>
                <span>{measurements.totalHeight.toFixed(0)}px tall</span>
                <span
                  className={
                    measurements.totalHeight > measurements.pageHeight
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-500'
                  }
                >
                  Page: {measurements.pageHeight.toFixed(0)}px
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 📊 Measurement Debug Panel */}
      {measurements && (
        <MeasurementDebug
          blocks={measurements.blocks}
          pageHeight={measurements.pageHeight}
          totalHeight={measurements.totalHeight}
        />
      )}
    </>
  )
}