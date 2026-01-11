'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing…</p>
    `,
    immediatelyRender: false,
  })

  const [measurements, setMeasurements] = useState<{
    pageHeight: number
    totalHeight: number
    blockCount: number
    blocks: { type: string; height: number }[]
  } | null>(null)

  const [pageBreaks, setPageBreaks] = useState<number[]>([])
  const [pageCount, setPageCount] = useState<number>(1)

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

          // Apply CSS classes for page breaks (for printing)
          blocks.forEach((block, index) => {
            const element = block.element as HTMLElement
            element.classList.remove('page-break-before')
            
            if (breaks.includes(index)) {
              element.classList.add('page-break-before')
            }
          })

          console.log('📊 Pages:', pages, 'Breaks at:', breaks)

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
          setPageCount(Math.max(1, pages)) // Always at least 1 page
        }
      )
    }, 200)

    editor.on('update', handleUpdate)
    handleUpdate() // Initial measurement

    return () => {
      editor.off('update', handleUpdate)
      handleUpdate.cancel()
    }
  }, [editor])

  if (!editor) return null

  const PAGE_HEIGHT_PX = 1056 // 11in - 2in margins = 9in content @ 96dpi = 864px + padding
  const PAGE_GAP = 24 // 1.5rem

  return (
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <div className="pages-stack" style={{ width: '8.5in', position: 'relative' }}>
          {/* VISUAL PAGE FRAMES (for screen display) */}
          {Array.from({ length: pageCount }).map((_, pageIndex) => (
            <div
              key={`page-frame-${pageIndex}`}
              className="page-frame"
              style={{
                position: 'absolute',
                top: pageIndex * (PAGE_HEIGHT_PX + PAGE_GAP),
                left: 0,
                width: '8.5in',
                height: `${PAGE_HEIGHT_PX}px`,
                background: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '2px',
                border: '1px solid #e5e7eb',
                zIndex: 0,
              }}
            >
              {/* Page number badge */}
              <div
                className="page-number"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  zIndex: 10,
                }}
              >
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium border border-gray-300">
                  Page {pageIndex + 1}
                </span>
              </div>
            </div>
          ))}

          {/* EDITOR CONTENT (flows through visual pages) */}
          <div
            className="editor-content"
            style={{
              position: 'relative',
              zIndex: 5,
              width: '8.5in',
              padding: '1in',
              boxSizing: 'border-box',
              minHeight: `${pageCount * (PAGE_HEIGHT_PX + PAGE_GAP) - PAGE_GAP}px`,
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

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
