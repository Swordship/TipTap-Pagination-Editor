'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
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
      <p style="text-align: right;">
  January 13, 2026
</p>

<p>
  U.S. Citizenship and Immigration Services
</p>

<p>
  <strong>Re: O-1 Visa Petition for Mr. John</strong>
</p>

<p>
  Dear USCIS Adjudicating Officer:
</p>

<p>
  This letter is submitted in support of the O-1 nonimmigrant visa petition on behalf of
  <strong>Mr. John</strong>. We respectfully request that USCIS grant O-1 classification based
  on Mr. John's extraordinary ability and sustained national or international acclaim in his
  field of endeavor.
</p>

<p>
  The O-1 visa category is reserved for individuals who possess extraordinary ability in the
  sciences, arts, education, business, or athletics, demonstrated by sustained national or
  international acclaim. Mr. John has achieved the highest level of recognition in his field
  and continues to make significant contributions that distinguish him as one of the select
  few who have risen to the very top of their profession.
</p>

<p>
  This petition includes comprehensive documentation that clearly establishes Mr. John's
  eligibility for O-1 classification. The evidence demonstrates that he meets the requisite
  criteria for extraordinary ability and that his presence in the United States will
  substantially benefit his field prospectively.
</p>

<p>
  We have organized the supporting documentation in a clear and logical manner to facilitate
  your review. The evidence presented herein conclusively demonstrates that Mr. John satisfies
  the evidentiary requirements for O-1 classification and merits approval of this petition.
</p>

<p>
  Thank you for your time and consideration of this petition. Should you require any additional
  information or documentation, please do not hesitate to contact our office.
</p>

<p>
  Respectfully submitted,
</p>

<p>
  [Attorney Name]<br />
  [Law Firm Name]<br />
  [Contact Information]
</p>
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
                  top: lineY - 1,
                  left: 0,
                  right: 0,
                  height: 2,
                  zIndex: 15,
                  pointerEvents: 'none',
                }}
              >
                {/* Left side page tab */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                  }}
                >
                  {/* Page number badge */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '6px 10px',
                      borderRadius: '0 6px 6px 0',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Page {i + 2}
                  </div>
                  {/* Arrow pointer */}
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                      borderLeft: '8px solid #2563eb',
                    }}
                  />
                </div>
                
                {/* Dashed line across the page */}
                <div
                  style={{
                    position: 'absolute',
                    left: 100,
                    right: 0,
                    top: '50%',
                    height: 0,
                    borderTop: '2px dashed #cbd5e1',
                  }}
                />
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