/**
 * Measurement utilities for pagination
 * These functions measure actual rendered DOM content
 */

/**
 * Measures the height of the page container
 * Returns the printable content height (total height minus margins)
 */
export function measurePageHeight(): number {
  // Create temporary element with page dimensions
  const temp = document.createElement('div')
  temp.style.cssText = `
    width: 8.5in;
    height: 11in;
    padding: 1in;
    box-sizing: border-box;
    position: absolute;
    visibility: hidden;
    top: -9999px;
  `
  
  document.body.appendChild(temp)
  
  // Get actual rendered height
  const rect = temp.getBoundingClientRect()
  
  // Calculate printable height (total - top margin - bottom margin)
  // Since box-sizing: border-box, padding is inside
  const totalHeight = rect.height
  
  // Get one inch in pixels for margin calculation
  const oneInch = getOneInchInPixels()
  const printableHeight = totalHeight - (2 * oneInch)
  
  document.body.removeChild(temp)
  
  console.log('📏 Page dimensions:', {
    total: `${totalHeight.toFixed(2)}px`,
    printable: `${printableHeight.toFixed(2)}px`,
    margins: `${oneInch.toFixed(2)}px each side`,
  })
  
  return printableHeight
}

/**
 * Gets the pixel value of 1 inch in current browser context
 */
export function getOneInchInPixels(): number {
  const temp = document.createElement('div')
  temp.style.cssText = `
    width: 1in;
    height: 1in;
    position: absolute;
    visibility: hidden;
  `
  
  document.body.appendChild(temp)
  const width = temp.getBoundingClientRect().width
  document.body.removeChild(temp)
  
  return width
}

/**
 * Measures all block-level elements in the editor
 * Returns array of measurements with element references
 */
export function measureEditorBlocks(editorElement: HTMLElement) {
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
    top: number
  }> = []
  
  blocks.forEach((block) => {
    if (block instanceof HTMLElement) {
      const rect = block.getBoundingClientRect()
      
      // Only measure visible blocks
      if (rect.height > 0) {
        measurements.push({
          element: block,
          type: block.tagName.toLowerCase(),
          height: rect.height,
          top: rect.top,
        })
      }
    }
  })
  
  return measurements
}

/**
 * Calculates total height of all content
 */
export function calculateTotalHeight(
  measurements: Array<{ height: number }>
): number {
  return measurements.reduce((sum, block) => sum + block.height, 0)
}

/**
 * Calculates where page breaks should occur
 * Returns array of block indices that start new pages
 */
export function calculatePageBreaks(
  measurements: Array<{ height: number }>,
  pageHeight: number
): number[] {
  const pageBreaks: number[] = []
  let currentPageHeight = 0
  
  console.log('📊 Calculating page breaks:')
  console.log(`  Page capacity: ${pageHeight}px`)
  console.log(`  Total blocks to process: ${measurements.length}`)
  
  measurements.forEach((block, index) => {
    const willExceed = currentPageHeight + block.height > pageHeight
    
    if (willExceed) {
      // This block starts a new page
      console.log(`  ✂️ BREAK at block [${index}]: page was ${currentPageHeight.toFixed(2)}px, adding ${block.height.toFixed(2)}px would exceed ${pageHeight}px`)
      pageBreaks.push(index)
      currentPageHeight = block.height // Reset for new page
    } else {
      // Block fits on current page
      currentPageHeight += block.height
    }
  })
  
  console.log(`  ✅ Result: ${pageBreaks.length} page break(s) at indices [${pageBreaks.join(', ')}]`)
  
  return pageBreaks
}