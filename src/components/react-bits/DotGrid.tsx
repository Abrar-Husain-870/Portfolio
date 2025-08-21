
interface DotGridProps {
  className?: string
}

// Placeholder component - will be replaced with actual React Bits component
export default function DotGrid({ className = '' }: DotGridProps) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
