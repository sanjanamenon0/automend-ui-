'use client'
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow'

interface NodeData {
  label: string
  type: string
  color: string
  description?: string
  config?: Record<string, string>
}

export function WorkflowNode({ id, data, selected }: NodeProps<NodeData>) {
  const { deleteElements } = useReactFlow()

  const icons: Record<string, string> = {
    trigger:   '⚡',
    scale:     '⬆',
    rollback:  '↩',
    retrain:   '🔄',
    alert:     '🔔',
    wait:      '⏱',
    condition: '◇',
    approval:  '👤',
  }

  return (
    <div
      className="relative min-w-[160px]"
      style={{ filter: selected ? `drop-shadow(0 0 8px ${data.color}60)` : 'none' }}
    >
      {/* Delete button — shows when selected */}
      {selected && (
        <button
          onClick={() => deleteElements({ nodes: [{ id }] })}
          className="absolute -top-2 -right-2 w-5 h-5 bg-[#E85A6B] rounded-full flex items-center justify-center text-white text-xs z-10 hover:bg-red-500 transition-colors shadow-lg"
          title="Delete node"
        >
          ×
        </button>
      )}

      {data.type !== 'trigger' && (
        <Handle type="target" position={Position.Left} />
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#0D0F1A',
          border: `1.5px solid ${selected ? data.color : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <div className="h-1" style={{ background: data.color }} />
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base leading-none">{icons[data.type] || '●'}</span>
            <span className="text-sm font-semibold text-[#F4F5F8]">{data.label}</span>
          </div>
          {data.description && (
            <p className="text-xs text-[#6B7588] leading-relaxed">{data.description}</p>
          )}
        </div>
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="px-4 pb-3 space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span className="text-[#2A3248] font-mono">{k}:</span>
                <span className="text-[#E8935A] font-mono truncate max-w-[80px]">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}