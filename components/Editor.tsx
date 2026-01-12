'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Toolbar from './Toolbar'
import MeasurementDebug from './MeasurementDebug'
import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'

// US Letter at 96 DPI - TRUE dimensions
const PAGE = {
  WIDTH: 816,            // 8.5 inches
  HEIGHT: 1056,          // 11 inches  
  MARGIN: 96,            // 1 inch
  PRINTABLE_HEIGHT: 864, // 9 inches (exact US Letter with 1" margins)
  GAP: 40,               // Visual gap between pages
}

interface PageBreakInfo {
  blockIndex: number
  position: number      // Y position where break occurs
  spacerHeight: number  // How much space to add to push content to next page
}

export default function Editor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing your legal document here...</p>
      <p>This editor shows real-time pagination matching US Letter size (8.5" × 11") with 1-inch margins.</p>
    `,
    immediatelyRender: false,
  })

  const [pageCount, setPageCount] = useState(1)
  const [pageBreaks, setPageBreaks] = useState<PageBreakInfo[]>([])
  const [measurements, setMeasurements] = useState<{
    totalHeight: number
    blockCount: number
    blocks: { type: string; height: number; offsetTop: number }[]
  } | null>(null)

  // Calculate pagination
  const updatePagination = useCallback(() => {
    if (!editor) return

    const editorDOM = editor.view.dom as HTMLElement
    const editorRect = editorDOM.getBoundingClientRect()
    
    // Get all block elements
    const blockElements = editorDOM.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, pre, blockquote')
    
    const blocks: Array<{
      element: HTMLElement
      type: string
      height: number
      offsetTop: number
      bottom: number
    }> = []

    blockElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect()
        if (rect.height > 0) {
          // Position relative to editor top
          const offsetTop = rect.top - editorRect.top
          blocks.push({
            element: el,
            type: el.tagName.toLowerCase(),
            height: rect.height,
            offsetTop,
            bottom: offsetTop + rect.height,
          })
        }
      }
    })

    // Sort by position
    blocks.sort((a, b) => a.offsetTop - b.offsetTop)

    // First: clear all existing page-break styles
    blocks.forEach(block => {
      block.element.classList.remove('page-break-before')
      block.element.style.paddingTop = ''
    })

    // Re-measure after clearing styles
    const freshBlocks: typeof blocks = []
    blockElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const rect = el.getBoundingClientRect()
        if (rect.height > 0) {
          const offsetTop = rect.top - editorRect.top
          freshBlocks.push({
            element: el,
            type: el.tagName.toLowerCase(),
            height: rect.height,
            offsetTop,
            bottom: offsetTop + rect.height,
          })
        }
      }
    })
    freshBlocks.sort((a, b) => a.offsetTop - b.offsetTop)

    // Calculate page breaks
    const breaks: PageBreakInfo[] = []
    let accumulatedSpacer = 0
    
    for (let i = 0; i < freshBlocks.length; i++) {
      const block = freshBlocks[i]
      
      // Adjusted position including any spacers we've added
      const adjustedTop = block.offsetTop + accumulatedSpacer
      const adjustedBottom = adjustedTop + block.height
      
      // Which page would this block START on?
      const startPage = Math.floor(adjustedTop / (PAGE.PRINTABLE_HEIGHT + PAGE.GAP))
      // Where does that page end?
      const pageEndY = (startPage + 1) * PAGE.PRINTABLE_HEIGHT + startPage * PAGE.GAP
      
      // Does block cross this page boundary?
      if (adjustedBottom > pageEndY && adjustedTop < pageEndY) {
        // Push this block to next page
        const spacerNeeded = pageEndY - adjustedTop + PAGE.GAP
        
        breaks.push({
          blockIndex: i,
          position: pageEndY,
          spacerHeight: spacerNeeded,
        })
        
        block.element.classList.add('page-break-before')
        block.element.style.paddingTop = `${spacerNeeded}px`
        
        accumulatedSpacer += spacerNeeded
      }
    }

    // Calculate final metrics
    const lastBlock = freshBlocks[freshBlocks.length - 1]
    const totalHeight = lastBlock 
      ? lastBlock.bottom + accumulatedSpacer
      : 0
    
    const pages = Math.max(1, Math.ceil(totalHeight / (PAGE.PRINTABLE_HEIGHT + PAGE.GAP)))

    console.log('📄 Pagination:', { 
      pages, 
      breaks: breaks.length,
      totalHeight,
      blockCount: freshBlocks.length,
    })

    setPageCount(pages)
    setPageBreaks(breaks)
    setMeasurements({
      totalHeight,
      blockCount: freshBlocks.length,
      blocks: freshBlocks.map(b => ({
        type: b.type,
        height: b.height,
        offsetTop: b.offsetTop,
      })),
    })
  }, [editor])

  // Set up editor listeners
  useEffect(() => {
    if (!editor) return

    const debouncedUpdate = debounce(updatePagination, 100)

    editor.on('update', debouncedUpdate)
    
    // Initial calculation after DOM settles
    const timer = setTimeout(updatePagination, 100)

    return () => {
      editor.off('update', debouncedUpdate)
      debouncedUpdate.cancel()
      clearTimeout(timer)
    }
  }, [editor, updatePagination])

  if (!editor) return null

  // Total visual height needed for all pages
  const totalPagesHeight = pageCount * PAGE.HEIGHT + (pageCount - 1) * PAGE.GAP

  return (
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <div 
          className="pages-container"
          style={{
            position: 'relative',
            width: `${PAGE.WIDTH}px`,
            minHeight: `${totalPagesHeight}px`,
          }}
        >
          {/* Page backgrounds - hidden in print */}
          {Array.from({ length: pageCount }).map((_, i) => (
            <div
              key={`page-bg-${i}`}
              className="page-background no-print"
              style={{
                position: 'absolute',
                top: i * (PAGE.HEIGHT + PAGE.GAP),
                left: 0,
                width: PAGE.WIDTH,
                height: PAGE.HEIGHT,
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                borderRadius: 2,
              }}
            >
              {/* Page number */}
              <div
                className="no-print"
                style={{
                  position: 'absolute',
                  bottom: PAGE.MARGIN * 0.4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10pt',
                  color: '#888',
                  fontFamily: '"Times New Roman", serif',
                }}
              >
                {i + 1}
              </div>
            </div>
          ))}

          {/* Editor content area */}
          <div
            className="editor-content-area"
            style={{
              position: 'relative',
              zIndex: 10,
              padding: PAGE.MARGIN,
              width: PAGE.WIDTH,
              boxSizing: 'border-box',
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Page break indicators - hidden in print */}
          {Array.from({ length: pageCount - 1 }).map((_, i) => {
            const lineY = (i + 1) * PAGE.HEIGHT + i * PAGE.GAP + PAGE.GAP / 2
            return (
              <div
                key={`break-line-${i}`}
                className="page-break-indicator no-print"
                style={{
                  position: 'absolute',
                  top: lineY - 12,
                  left: PAGE.MARGIN,
                  right: PAGE.MARGIN,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 15,
                  pointerEvents: 'none',
                }}
              >
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span
                  style={{
                    padding: '3px 12px',
                    fontSize: '11px',
                    color: '#64748b',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    margin: '0 8px',
                  }}
                >
                  Page {i + 2}
                </span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Debug panel - hidden in print */}
      {measurements && (
        <MeasurementDebug
          blocks={measurements.blocks}
          pageHeight={PAGE.PRINTABLE_HEIGHT}
          totalHeight={measurements.totalHeight}
          pageBreaks={pageBreaks.map(b => b.blockIndex)}
          pageCount={pageCount}
        />
      )}
    </>
  )
}