'use client'

interface BlockMeasurement {
  type: string
  height: number
  offsetTop?: number
}

interface MeasurementDebugProps {
  blocks: BlockMeasurement[]
  pageHeight: number
  totalHeight: number
  pageBreaks: number[]
  pageCount: number
}

export default function MeasurementDebug({ 
  blocks, 
  pageHeight, 
  totalHeight,
  pageBreaks,
  pageCount,
}: MeasurementDebugProps) {
  // Calculate percentage of single page used
  const singlePagePercentage = Math.min(100, (totalHeight / pageHeight) * 100)

  return (
    <div className="measurement-debug max-w-4xl mx-auto px-4 mt-8 mb-8 no-print">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          📊 Pagination Debug Panel
        </h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {pageCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {pageCount === 1 ? 'Page' : 'Pages'}
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {blocks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Blocks</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {totalHeight.toFixed(0)}px
            </div>
            <div className="text-sm text-gray-600 mt-1">Content Height</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {pageHeight.toFixed(0)}px
            </div>
            <div className="text-sm text-gray-600 mt-1">Page Height</div>
          </div>
        </div>

        {/* Page Capacity Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Content vs Single Page Capacity</span>
            <span>{totalHeight.toFixed(0)}px / {pageHeight.toFixed(0)}px ({singlePagePercentage.toFixed(1)}%)</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                totalHeight > pageHeight ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, singlePagePercentage)}%` }}
            />
          </div>

          {totalHeight > pageHeight && (
            <div className="text-xs text-orange-600 mt-1 font-semibold">
              ℹ️ Content spans {pageCount} pages
            </div>
          )}
        </div>

        {/* Page Break Info */}
        {pageBreaks.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              ✂️ Page Breaks ({pageBreaks.length})
            </h4>

            <div className="space-y-1 text-sm text-blue-800">
              {pageBreaks.map((breakIndex, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">
                    Page {idx + 2}
                  </span>
                  <span>starts before block [{breakIndex + 1}]</span>
                  <span className="text-blue-600 font-medium">
                    ({blocks[breakIndex]?.type?.toUpperCase() || 'unknown'})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Details (collapsible) */}
        <details className="border-t pt-4">
          <summary className="cursor-pointer font-semibold mb-3 text-gray-800 hover:text-gray-600">
            Block Details ({blocks.length} total)
          </summary>

          <div className="space-y-1 max-h-64 overflow-y-auto bg-gray-50 rounded p-3 mt-2">
            {blocks.map((block, index) => {
              const isBreakPoint = pageBreaks.includes(index)
              
              return (
                <div
                  key={index}
                  className={`flex justify-between items-center text-sm py-2 px-3 rounded ${
                    isBreakPoint ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-xs w-8">
                      [{index + 1}]
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      isBreakPoint ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {block.type.toUpperCase()}
                    </span>
                    {isBreakPoint && (
                      <span className="text-xs text-blue-600">← Page break</span>
                    )}
                  </div>
                  <span className="font-mono text-gray-800 font-semibold">
                    {block.height.toFixed(1)}px
                  </span>
                </div>
              )
            })}
          </div>
        </details>

        {/* Page Dimensions Reference */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">
            <strong>US Letter:</strong> 8.5 × 11 | 
            <strong> Margins:</strong> 1 each side | 
            <strong> Printable area:</strong> 6.5 × 9 ({pageHeight.toFixed(0)}px @ 96 DPI)
          </div>
        </div>
      </div>
    </div>
  )
}