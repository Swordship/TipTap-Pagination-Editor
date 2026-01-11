/**
 * Measurement utilities for pagination
 * US Letter: 8.5" × 11" with 1" margins = 6.5" × 9" printable area
 */

// Standard DPI for CSS pixels
const DPI = 96

// Constants for US Letter at 96 DPI
export const PAGE_CONFIG = {
  // Full page dimensions
  WIDTH_INCHES: 8.5,
  HEIGHT_INCHES: 11,
  
  // Margins
  MARGIN_INCHES: 1,
  
  // Printable area (page minus margins)
  PRINTABLE_WIDTH_INCHES: 6.5,  // 8.5 - 2
  PRINTABLE_HEIGHT_INCHES: 9,   // 11 - 2
  
  // DPI
  DPI: DPI,
  
  // Pre-calculated pixel values at 96 DPI
  WIDTH_PX: 8.5 * DPI,           // 816px
  HEIGHT_PX: 11 * DPI,           // 1056px
  MARGIN_PX: 1 * DPI,            // 96px
  PRINTABLE_HEIGHT_PX: 9 * DPI,  // 864px
  PRINTABLE_WIDTH_PX: 6.5 * DPI, // 624px
  
  // Gap between pages (visual only)
  PAGE_GAP_PX: 40,
}

/**
 * Gets the pixel value of 1 inch in current browser context
 * This accounts for browser zoom and display scaling
 */
export function getOneInchInPixels(): number {
  const temp = document.createElement('div')
  temp.style.cssText = `
    width: 1in;
    height: 1in;
    position: absolute;
    visibility: hidden;
    pointer-events: none;
  `
  
  document.body.appendChild(temp)
  const width = temp.getBoundingClientRect().width
  document.body.removeChild(temp)
  
  return width
}

/**
 * Gets actual page dimensions based on browser rendering
 * Returns consistent values for page layout
 */
export function getPageDimensions() {
  const oneInch = getOneInchInPixels()
  
  return {
    pageWidth: oneInch * PAGE_CONFIG.WIDTH_INCHES,
    pageHeight: oneInch * PAGE_CONFIG.HEIGHT_INCHES,
    margin: oneInch * PAGE_CONFIG.MARGIN_INCHES,
    printableHeight: oneInch * PAGE_CONFIG.PRINTABLE_HEIGHT_INCHES,
    printableWidth: oneInch * PAGE_CONFIG.PRINTABLE_WIDTH_INCHES,
    oneInch,
  }
}

/**
 * Measures all block-level elements in the editor
 * Returns array of measurements with cumulative positions
 */
export function measureEditorBlocks(editorElement: HTMLElement) {
  const editorRect = editorElement.getBoundingClientRect()
  
  // Query all block-level content
  const blocks = editorElement.querySelectorAll(`
    p,
    h1, h2, h3, h4, h5, h6,
    li,
    pre,
    blockquote
  `)
  
  const measurements: Array<{
    element: Element
    type: string
    height: number
    offsetTop: number  // Position relative to editor start
    bottom: number     // Where this block ends
  }> = []
  
  blocks.forEach((block) => {
    if (block instanceof HTMLElement) {
      const rect = block.getBoundingClientRect()
      
      // Only measure visible blocks with content
      if (rect.height > 0) {
        const offsetTop = rect.top - editorRect.top
        measurements.push({
          element: block,
          type: block.tagName.toLowerCase(),
          height: rect.height,
          offsetTop,
          bottom: offsetTop + rect.height,
        })
      }
    }
  })
  
  return measurements
}

/**
 * Calculate total content height
 */
export function calculateTotalHeight(editorElement: HTMLElement): number {
  const rect = editorElement.getBoundingClientRect()
  // Get the actual scrollable height of content
  return editorElement.scrollHeight || rect.height
}

/**
 * Calculates where page breaks should occur based on block positions
 * Returns array of break info with pixel positions
 */
export function calculatePageBreaks(
  measurements: Array<{ 
    height: number
    offsetTop: number
    bottom: number
    type: string
  }>,
  printableHeight: number
): Array<{
  blockIndex: number
  pageNumber: number
  breakPosition: number  // Pixel position where break occurs
}> {
  const pageBreaks: Array<{
    blockIndex: number
    pageNumber: number
    breakPosition: number
  }> = []
  
  let currentPage = 1
  let pageStartY = 0
  
  console.log('📊 Calculating page breaks:')
  console.log(`  Printable height per page: ${printableHeight}px`)
  console.log(`  Total blocks: ${measurements.length}`)
  
  measurements.forEach((block, index) => {
    const pageEndY = pageStartY + printableHeight
    
    // Check if this block extends beyond current page
    if (block.bottom > pageEndY && block.offsetTop < pageEndY) {
      // Block spans page boundary - break before it
      currentPage++
      pageBreaks.push({
        blockIndex: index,
        pageNumber: currentPage,
        breakPosition: pageEndY,
      })
      pageStartY = pageEndY
      
      console.log(`  ✂️ Page ${currentPage} starts at block [${index}] (${block.type}) - position: ${pageEndY}px`)
    } else if (block.offsetTop >= pageEndY) {
      // Block is entirely on next page
      currentPage++
      pageBreaks.push({
        blockIndex: index,
        pageNumber: currentPage,
        breakPosition: pageEndY,
      })
      pageStartY = pageEndY
      
      console.log(`  ✂️ Page ${currentPage} starts at block [${index}] (${block.type}) - position: ${pageEndY}px`)
    }
  })
  
  console.log(`  ✅ Total: ${pageBreaks.length + 1} pages`)
  
  return pageBreaks
}

/**
 * Calculate number of pages needed for given content height
 */
export function calculatePageCount(
  totalContentHeight: number,
  printableHeight: number
): number {
  if (totalContentHeight <= 0) return 1
  return Math.max(1, Math.ceil(totalContentHeight / printableHeight))
}

/**
 * Get the page number for a given Y position
 */
export function getPageForPosition(
  yPosition: number,
  printableHeight: number
): number {
  return Math.floor(yPosition / printableHeight) + 1
}