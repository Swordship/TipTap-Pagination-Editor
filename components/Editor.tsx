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

import {
  PaginationPlus,
  PAGE_SIZES,
} from 'tiptap-pagination-plus'

/**
 * US Letter @ 96 DPI
 * 8.5 x 11 inches
 * 1-inch margins
 */
const LETTER_MARGINS = {
  top: 96,
  bottom: 96,
  left: 96,
  right: 96,
}

/**
 * Custom FontSize extension
 */
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element =>
          element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
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

      /**
       * ✅ Pagination (extension-level, scalable)
       */
      PaginationPlus.configure({
        ...PAGE_SIZES.LETTER,

        pageGap: 40,
        pageGapBorderSize: 1,
        pageGapBorderColor: '#e5e7eb',
        pageBreakBackground: '#f1f5f9',

        marginTop: LETTER_MARGINS.top,
        marginBottom: LETTER_MARGINS.bottom,
        marginLeft: LETTER_MARGINS.left,
        marginRight: LETTER_MARGINS.right,

        contentMarginTop: 0,
        contentMarginBottom: 0,

        headerRight: 'Page {page}',
        footerRight: 'Page {page} of {total}',
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
        This letter is submitted in support of the O-1 nonimmigrant visa petition
        on behalf of <strong>Mr. John</strong>. We respectfully request that USCIS
        grant O-1 classification based on Mr. John's extraordinary ability and
        sustained national or international acclaim.
      </p>

      <p>
        The O-1 visa category is reserved for individuals who possess extraordinary
        ability in the sciences, arts, education, business, or athletics.
      </p>

      <p>
        Thank you for your time and consideration of this petition.
      </p>

      <p>
        Respectfully submitted,
      </p>

      <p>
        [Attorney Name]<br/>
        [Law Firm Name]<br/>
        [Contact Information]
      </p>
    `,

    /**
     * 🔑 REQUIRED for Next.js (SSR safety)
     */
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <>
      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <div
          className="editor-container"
          style={{
            width: PAGE_SIZES.LETTER.pageWidth,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  )
}
