'use client'

interface PageBreakMarkerProps {
  pageNumber: number
  yPosition: number
}

export default function PageBreakMarker({
  pageNumber,
  yPosition,
}: PageBreakMarkerProps) {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{ top: `${yPosition}px` }}
    >
      {/* ✨ Page break line */}
      <div className="relative">
        {/* Soft gradient background */}
        <div className="h-0.5 bg-linear-to-r from-transparent via-gray-400 to-transparent" />

        {/* Dashed overlay */}
        <div className="absolute inset-0 h-px border-t border-dashed border-gray-500" />
      </div>

      {/* 🔵 Page number badge */}
      <div className="flex justify-center -mt-4">
        <span className="bg-blue-500 text-white text-xs px-4 py-1 rounded-full font-semibold shadow-md">
          Page {pageNumber}
        </span>
      </div>

      {/* ✂️ Optional scissors icon */}
      <div className="absolute -left-8 top-0 text-gray-400 text-sm">
        ✂️
      </div>
    </div>
  )
}
