'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
// import TextStyle from '@tiptap/extension-text-style'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
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
  position: number
  spacerHeight: number
}

// Custom FontSize extension
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
    }
  },
})

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: `
      <h1>Welcome to Your Document Editor</h1>
      <p>Start typing your legal document here...</p>
      <p>This editor shows real-time pagination matching US Letter size (8.5" × 11") with 1-inch margins.</p>
      <p>Features include:</p>
      <ul>
        <li><strong>Bold</strong>, <em>italic</em>, and <u>underline</u> formatting</li>
        <li>Text alignment (left, center, right, justify)</li>
        <li>Font family and size selection</li>
        <li><mark>Highlight colors</mark> for important text</li>
        <li>Headings (H1, H2, H3)</li>
        <li>Bullet and numbered lists</li>
      </ul>
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

    blocks.sort((a, b) => a.offsetTop - b.offsetTop)

    blocks.forEach(block => {
      block.element.classList.remove('page-break-before')
      block.element.style.paddingTop = ''
    })

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

    const breaks: PageBreakInfo[] = []
    let accumulatedSpacer = 0
    
    for (let i = 0; i < freshBlocks.length; i++) {
      const block = freshBlocks[i]
      const adjustedTop = block.offsetTop + accumulatedSpacer
      const adjustedBottom = adjustedTop + block.height
      const startPage = Math.floor(adjustedTop / (PAGE.PRINTABLE_HEIGHT + PAGE.GAP))
      const pageEndY = (startPage + 1) * PAGE.PRINTABLE_HEIGHT + startPage * PAGE.GAP
      
      if (adjustedBottom > pageEndY && adjustedTop < pageEndY) {
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

    const lastBlock = freshBlocks[freshBlocks.length - 1]
    const totalHeight = lastBlock ? lastBlock.bottom + accumulatedSpacer : 0
    const pages = Math.max(1, Math.ceil(totalHeight / (PAGE.PRINTABLE_HEIGHT + PAGE.GAP)))

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

  useEffect(() => {
    if (!editor) return

    const debouncedUpdate = debounce(updatePagination, 100)
    editor.on('update', debouncedUpdate)
    const timer = setTimeout(updatePagination, 100)

    return () => {
      editor.off('update', debouncedUpdate)
      debouncedUpdate.cancel()
      clearTimeout(timer)
    }
  }, [editor, updatePagination])

  if (!editor) return null

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