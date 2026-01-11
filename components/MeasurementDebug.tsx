'use client'

interface BlockMeasurement {
  type: string
  height: number
}

interface MeasurementDebugProps {
  blocks: BlockMeasurement[]
  pageHeight: number
  totalHeight: number
}

export default function MeasurementDebug({ 
  blocks, 
  pageHeight, 
  totalHeight 
}: MeasurementDebugProps) {
  // Calculate how many pages needed
  const pagesNeeded = Math.ceil(totalHeight / pageHeight)
  
  // Calculate percentage of page used
  const pagePercentage = Math.min(100, (totalHeight / pageHeight) * 100)
  
  return (
    <div className="max-w-4xl mx-auto px-4 mt-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          📊 Measurement Debug Panel
        </h3>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Total Blocks */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {blocks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Blocks</div>
          </div>
          
          {/* Content Height */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {totalHeight.toFixed(0)}px
            </div>
            <div className="text-sm text-gray-600 mt-1">Content Height</div>
            <div className="text-xs text-gray-500 mt-1">
              {pagePercentage.toFixed(1)}% of page
            </div>
          </div>
          
          {/* Pages Needed */}
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {pagesNeeded}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {pagesNeeded === 1 ? 'Page Needed' : 'Pages Needed'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Page Capacity</span>
            <span>{totalHeight.toFixed(0)}px / {pageHeight.toFixed(0)}px</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                totalHeight > pageHeight 
                  ? 'bg-red-500' 
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, pagePercentage)}%` }}
            ></div>
          </div>
          {totalHeight > pageHeight && (
            <div className="text-xs text-red-600 mt-1 font-semibold">
              ⚠️ Content exceeds one page! Pagination needed.
            </div>
          )}
        </div>
        
        {/* Block Details */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 text-gray-800">
            Block Details ({blocks.length} total):
          </h4>
          <div className="space-y-1 max-h-80 overflow-y-auto bg-gray-50 rounded p-3">
            {blocks.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No content blocks yet. Start typing!
              </div>
            ) : (
              blocks.map((block, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center text-sm py-2 px-3 hover:bg-white rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-xs w-8">
                      [{index + 1}]
                    </span>
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${block.type === 'h1' ? 'bg-red-100 text-red-700' : ''}
                      ${block.type === 'h2' ? 'bg-orange-100 text-orange-700' : ''}
                      ${block.type === 'h3' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${block.type === 'p' ? 'bg-blue-100 text-blue-700' : ''}
                      ${block.type === 'li' ? 'bg-green-100 text-green-700' : ''}
                      ${block.type === 'blockquote' ? 'bg-purple-100 text-purple-700' : ''}
                      ${!['h1', 'h2', 'h3', 'p', 'li', 'blockquote'].includes(block.type) 
                        ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {block.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="font-mono text-gray-800 font-semibold">
                    {block.height.toFixed(2)}px
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-gray-500">
            <strong>Legend:</strong> Each blocks height includes margins and padding. 
            Headings are typically taller than paragraphs due to font size and spacing.
          </div>
        </div>
      </div>
    </div>
  )
}