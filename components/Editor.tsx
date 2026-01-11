'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import PageBreakMarker from './PageBreakMarker'
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
  const [pageBreakPositions, setPageBreakPositions] = useState<
    { blockIndex: number; yPosition: number; pageNumber: number }[]
  >([])
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


          const breakPositions = breaks.map((blockIndex, idx) => {
            const element = blocks[blockIndex].element as HTMLElement
            const editorRect = editorDOM.getBoundingClientRect()
            const elementRect = element.getBoundingClientRect()

          console.log('🔄 Content updated (debounced):')
          console.log(`  Blocks: ${blocks.length}, Height: ${totalHeight.toFixed(2)}px`)
          console.log(`  Total pages needed: ${pages}`)

            return {
              blockIndex,
              yPosition: elementRect.top - editorRect.top,
              pageNumber: idx + 2,
            }
          })

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
          setPageBreakPositions(breakPositions)
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
     4. Render UI
  ----------------------------- */
  return (
    <>
      {/* Toolbar */}
      <Toolbar editor={editor} />

      {/* Editor Page */}
      <div className="editor-wrapper">
        <div className="editor-page relative">
          <EditorContent editor={editor} />

          {/* Page break markers */}
          {pageBreakPositions.map((b, i) => (
            <PageBreakMarker
              key={i}
              pageNumber={b.pageNumber}
              yPosition={b.yPosition}
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
