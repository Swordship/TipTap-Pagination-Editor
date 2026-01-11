'use client'

interface PageBreakMarkerProps {
  pageNumber: number
  yPosition: number
}

export default function PageBreakMarker({ pageNumber, yPosition }: PageBreakMarkerProps) {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: `${yPosition}px` }}
    >
      {/* Dashed line */}
      <div className="h-px bg-gray-400 border-t-2 border-dashed border-gray-400"></div>
      
      {/* Page number badge */}
      <div className="flex justify-center -mt-3">
        <span className="bg-gray-400 text-white text-xs px-3 py-1 rounded-full font-medium">
          Page {pageNumber}
        </span>
      </div>
    </div>
  )
}
