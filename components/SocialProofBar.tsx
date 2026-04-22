import { Agent5Data } from '@/lib/types'

const STRENGTH_DOT: Record<string, string> = {
  strong: 'bg-green-500',
  medium: 'bg-agent-amber',
  moderate: 'bg-agent-amber',
  weak: 'bg-red-500',
}

interface Props {
  data: Agent5Data
  city: string
}

export default function SocialProofBar({ data, city }: Props) {
  const viewers = data.viewers_now ?? data.viewing_now ?? 0
  const buyers = data.buyers_today ?? data.recent_buyers ?? 0
  const review = data.review_snippet ?? data.review ?? ''
  const strength = (data.proof_strength ?? data.strength ?? 'moderate').toLowerCase()
  const location = data.city ?? city

  return (
    <div className="bg-cogitx-card border border-cogitx-border rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-agent-pink">
          Social Proof
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${STRENGTH_DOT[strength] ?? 'bg-amber-500'}`}
          />
          <span className="text-[10px] text-cogitx-muted capitalize">{strength}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        <span className="text-white/80">
          <span className="text-agent-teal">👥</span>{' '}
          {viewers > 0 ? <>{viewers} viewing right now</> : <span className="text-cogitx-muted">— viewing data unavailable</span>}
        </span>
        <span className="text-white/80">
          <span className="text-agent-amber">🛍️</span>{' '}
          {buyers > 0 ? <>{buyers} bought in {location} today</> : <span className="text-cogitx-muted">— sales data unavailable</span>}
        </span>
        {review && (
          <span className="text-white/60 italic w-full text-[11px]">"{review}"</span>
        )}
      </div>
    </div>
  )
}
