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

          console.log('📊 Pages:', pages)

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

  const pageHeightWithPadding = 1056
  const gap = 24

  return (
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <div style={{ width: '8.5in', position: 'relative' }}>
          {/* PAGE BACKGROUNDS */}
          {Array.from({ length: pageCount }).map((_, i) => (
            <div key={`page-${i}`}>
              {/* Page frame */}
              <div
                className="page-frame"
                style={{
                  position: 'absolute',
                  top: i * (pageHeightWithPadding + gap),
                  left: 0,
                  width: '8.5in',
                  height: `${pageHeightWithPadding}px`,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderRadius: '2px',
                  border: '1px solid #e5e7eb',
                  zIndex: 0,
                }}
              >
                {/* Page number badge */}
                <div
                  className="page-number-badge"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10,
                  }}
                >
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium border border-gray-300">
                    Page {i + 1}
                  </span>
                </div>
              </div>

              {/* Visual page break separator */}
              {i < pageCount - 1 && (
                <div
                  className="page-break-separator"
                  style={{
                    position: 'absolute',
                    top: (i + 1) * pageHeightWithPadding + i * gap + gap / 2,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #9ca3af 10%, #9ca3af 90%, transparent)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          ))}

          {/* CONTENT */}
          <div
            className="editor-content"
            style={{
              position: 'relative',
              zIndex: 5,
              width: '8.5in',
              padding: '1in',
              boxSizing: 'border-box',
              minHeight: `${pageCount * (pageHeightWithPadding + gap)}px`,
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
