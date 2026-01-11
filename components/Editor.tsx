'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'
import { PAGE_CONFIG } from '../utils/measure'

interface PageBreakInfo {
  blockIndex: number
  pageNumber: number
  breakPosition: number
}

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null)
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing your legal document here...</p>
      <p>This editor shows real-time pagination matching US Letter size (8.5" × 11") with 1-inch margins.</p>
    `,
    immediatelyRender: false,
  })

  // Use static values initially - these are correct for 96 DPI
  const [pageDimensions, setPageDimensions] = useState({
    pageWidth: PAGE_CONFIG.WIDTH_PX,
    pageHeight: PAGE_CONFIG.HEIGHT_PX,
    margin: PAGE_CONFIG.MARGIN_PX,
    printableHeight: PAGE_CONFIG.PRINTABLE_HEIGHT_PX,
    oneInch: PAGE_CONFIG.DPI,
  })
  
  const [measurements, setMeasurements] = useState<{
    totalHeight: number
    blockCount: number
    blocks: { type: string; height: number; offsetTop: number }[]
  } | null>(null)

  const [pageBreaks, setPageBreaks] = useState<PageBreakInfo[]>([])
  const [pageCount, setPageCount] = useState<number>(1)

  // Get actual page dimensions on mount (client-side only)
  useEffect(() => {
    import('../utils/measure').then(({ getPageDimensions }) => {
      const dims = getPageDimensions()
      setPageDimensions(dims)
      console.log('📐 Page dimensions:', dims)
    })
  }, [])

  // Measure and calculate pagination
  const updatePagination = useCallback(() => {
    if (!editor) return

    // Dynamic import to avoid SSR issues
    import('../utils/measure').then(({
      measureEditorBlocks,
      calculateTotalHeight,
      calculatePageBreaks,
      calculatePageCount,
    }) => {
      const editorDOM = editor.view.dom as HTMLElement
      const blocks = measureEditorBlocks(editorDOM)
      const totalHeight = calculateTotalHeight(editorDOM)
      const breaks = calculatePageBreaks(blocks, pageDimensions.printableHeight)
      const pages = calculatePageCount(totalHeight, pageDimensions.printableHeight)

      // Apply page-break-before class to blocks that start new pages
      const breakIndices = breaks.map(b => b.blockIndex)
      blocks.forEach((block, index) => {
        const element = block.element as HTMLElement
        element.classList.remove('page-break-before')
        
        if (breakIndices.includes(index)) {
          element.classList.add('page-break-before')
        }
      })

      console.log('📄 Pagination update:', { pages, breaks: breaks.length, totalHeight })

      setMeasurements({
        totalHeight,
        blockCount: blocks.length,
        blocks: blocks.map(b => ({
          type: b.type,
          height: b.height,
          offsetTop: b.offsetTop,
        })),
      })

      setPageBreaks(breaks)
      setPageCount(Math.max(1, pages))
    })
  }, [editor, pageDimensions.printableHeight])

  // Set up editor update listener
  useEffect(() => {
    if (!editor) return

    const debouncedUpdate = debounce(updatePagination, 150)

    editor.on('update', debouncedUpdate)
    
    // Initial measurement after a short delay for DOM to settle
    setTimeout(updatePagination, 100)

    return () => {
      editor.off('update', debouncedUpdate)
      debouncedUpdate.cancel()
    }
  }, [editor, updatePagination])

  if (!editor) return null

  const { pageWidth, pageHeight, margin, printableHeight } = pageDimensions
  const pageGap = PAGE_CONFIG.PAGE_GAP_PX

  // Total height of all pages including gaps
  const totalPagesHeight = pageCount * pageHeight + (pageCount - 1) * pageGap

  return (
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        {/* Pages container */}
        <div 
          className="pages-container"
          style={{
            position: 'relative',
            width: `${pageWidth}px`,
            minHeight: `${totalPagesHeight}px`,
          }}
        >
          {/* Render each page frame */}
          {Array.from({ length: pageCount }).map((_, pageIndex) => {
            const pageTop = pageIndex * (pageHeight + pageGap)
            
            return (
              <div
                key={`page-${pageIndex}`}
                className="page-frame"
                style={{
                  position: 'absolute',
                  top: `${pageTop}px`,
                  left: 0,
                  width: `${pageWidth}px`,
                  height: `${pageHeight}px`,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                  borderRadius: '2px',
                  border: '1px solid #e0e0e0',
                  boxSizing: 'border-box',
                }}
              >
                {/* Page number footer */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: `${margin * 0.4}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: '"Times New Roman", Times, serif',
                    fontSize: '11pt',
                    color: '#666',
                  }}
                >
                  {pageIndex + 1}
                </div>
              </div>
            )
          })}

          {/* Editor content overlay - positioned within first page's content area */}
          <div
            ref={editorRef}
            className="editor-content-wrapper"
            style={{
              position: 'absolute',
              top: `${margin}px`,
              left: `${margin}px`,
              width: `${pageWidth - 2 * margin}px`,
              minHeight: `${printableHeight}px`,
              zIndex: 10,
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Visual page break indicators */}
          {pageBreaks.map((breakInfo, idx) => {
            const breakY = margin + breakInfo.breakPosition
            
            return (
              <div
                key={`break-indicator-${idx}`}
                className="page-break-indicator"
                style={{
                  position: 'absolute',
                  top: `${breakY}px`,
                  left: 0,
                  right: 0,
                  height: `${pageGap}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '4px',
                    border: '1px dashed rgba(59, 130, 246, 0.4)',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#3b82f6' }}>
                    ✂️ Page {breakInfo.pageNumber} starts here
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Debug panel */}
      {measurements && (
        <MeasurementDebug
          blocks={measurements.blocks}
          pageHeight={printableHeight}
          totalHeight={measurements.totalHeight}
          pageBreaks={pageBreaks.map(b => b.blockIndex)}
          pageCount={pageCount}
        />
      )}
    </>
  )
}