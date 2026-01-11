'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import PageContainer from './PageContainer'
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export default function Editor() {
  /* -----------------------------
     1. Create editor
  ----------------------------- */
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing…</p>
    `,
    immediatelyRender: false,
  })

  /* -----------------------------
     2. Measurement state
  ----------------------------- */
  const [measurements, setMeasurements] = useState<{
    pageHeight: number
    totalHeight: number
    blockCount: number
    blocks: { type: string; height: number }[]
  } | null>(null)

  const [pageBreaks, setPageBreaks] = useState<number[]>([])
  const [pageCount, setPageCount] = useState<number>(1)

  /* -----------------------------
     3. Measure on editor updates
  ----------------------------- */
  useEffect(() => {
    if (!editor) return

    const handleUpdate = debounce(() => {
      import('../utils/measure').then(
        ({
          measurePageHeight,
          measureEditorBlocks,
          calculateTotalHeight,
          calculatePageBreaks,
          calculatePageCount,
        }) => {
          const pageHeight = measurePageHeight()
          const editorDOM = editor.view.dom
          const blocks = measureEditorBlocks(editorDOM)
          const totalHeight = calculateTotalHeight(blocks)
          const breaks = calculatePageBreaks(blocks, pageHeight)
          const pages = calculatePageCount(totalHeight, pageHeight)

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
          setPageCount(pages)
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
     4. Render UI (CORRECT)
  ----------------------------- */
  return (
    <>
      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor wrapper */}
      <div className="editor-wrapper">
        <div className="pages-stack relative">

          {/* ✅ CONTENT FIRST (normal flow) */}
          <div className="editor-content-overlay">
            <div className="editor-page-content">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* ✅ PAGE FRAMES BEHIND */}
          {Array.from({ length: pageCount }, (_, i) => (
            <PageContainer
              key={i}
              pageNumber={i + 1}
              height={measurements?.pageHeight || 1056}
            />
          ))}
        </div>
      </div>

      {/* Debug Panel */}
      {measurements && (
        <MeasurementDebug
          blocks={measurements.blocks}
          pageHeight={measurements.pageHeight}
          totalHeight={measurements.totalHeight}
          pageBreaks={pageBreaks}
        />
      )}
    </>
  )
}
