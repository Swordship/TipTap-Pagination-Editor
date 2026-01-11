'use client'

interface PageContainerProps {
  pageNumber: number
  height: number // Page height in pixels
}

export default function PageContainer({ pageNumber, height }: PageContainerProps) {
  return (
    <div
      className="page-container"
      style={{
        height: `${height}px`,
        position: 'relative',
      }}
    >
      {/* Page frame */}
      <div className="absolute inset-0 bg-white rounded-sm shadow-lg border border-gray-200 pointer-events-none" />

      {/* Page number badge */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium border border-gray-300">
          Page {pageNumber}
        </span>
      </div>

      {/* Bottom separator line (visual cue) */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300 pointer-events-none" />
    </div>
  )
}
