'use client'

import { useState } from 'react'
import { ParsedAgents } from '@/lib/types'

function CircularScore({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, Math.max(0, score)) / 100) * circ
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#252532" strokeWidth="7" />
        <circle
          cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute text-xl font-bold text-white">{score}</span>
    </div>
  )
}

const SEGMENT_COLORS: Record<string, string> = {
  high_value: 'bg-cogitx-purple/20 text-cogitx-purple',
  deal_seeker: 'bg-agent-amber/20 text-agent-amber',
  researcher: 'bg-agent-teal/20 text-agent-teal',
  lapsed: 'bg-agent-coral/20 text-agent-coral',
  new_visitor: 'bg-white/10 text-white/60',
}

const INTENT_COLORS: Record<string, string> = {
  high: 'bg-green-500/20 text-green-400',
  medium: 'bg-agent-amber/20 text-agent-amber',
  low: 'bg-white/10 text-white/50',
}

const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-agent-coral/20 text-agent-coral',
  medium: 'bg-agent-amber/20 text-agent-amber',
  low: 'bg-white/10 text-white/50',
}

const INTERVENTION_COLORS: Record<string, string> = {
  price_alert: 'bg-agent-coral/20 text-agent-coral',
  stock_warning: 'bg-red-500/20 text-red-400',
  offer_unlock: 'bg-cogitx-purple/20 text-cogitx-purple',
  emi_nudge: 'bg-agent-teal/20 text-agent-teal',
  comparison_help: 'bg-blue-500/20 text-blue-400',
  reengagement: 'bg-agent-amber/20 text-agent-amber',
}

interface CardProps {
  title: string
  color: string
  letter: string
  children: React.ReactNode
}

function AgentCard({ title, color, letter, children }: CardProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`rounded-xl border transition-all ${open ? 'border-opacity-60' : 'border-cogitx-border'}`}
      style={{ borderColor: open ? color + '60' : undefined }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 p-3 text-left"
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: color + '25', color }}
        >
          {letter}
        </div>
        <span className="text-xs font-semibold text-white/90 flex-1">{title}</span>
        <svg
          className={`w-3.5 h-3.5 text-cogitx-muted transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-cogitx-border pt-2.5">
          {children}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex gap-2 text-xs mb-1.5">
      <span className="text-cogitx-muted min-w-[110px] flex-shrink-0">{label}</span>
      <span className="text-white/80">{String(value)}</span>
    </div>
  )
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  )
}

interface Props {
  agents: ParsedAgents
}

export default function AgentCards({ agents }: Props) {
  const a1 = agents.agent1
  const a2 = agents.agent2
  const a3 = agents.agent3
  const a4 = agents.agent4

  const score = a1 ? Number(a1.customer_score ?? a1.score ?? 0) : 0
  const segment = a1?.segment ?? ''
  const intent = (a2?.intent_level ?? a2?.intent ?? '').toLowerCase()
  const intervention = (a4?.intervention_type ?? a4?.signal_type ?? '').toLowerCase().replace(/ /g, '_')
  const urgency = (a4?.urgency ?? '').toLowerCase()

  // A3: handle both 'primary_sku' and 'recommended_sku' field names
  const skuName = a3?.primary_sku ?? a3?.recommended_sku ?? a3?.sku_name ?? a3?.sku
  const skuReason = a3?.recommendation_reason ?? a3?.reasoning
  const confidence = a3?.confidence

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-cogitx-muted mb-2">
        Agent Intelligence
      </h3>
      <div className="grid grid-cols-2 gap-2">

        {/* A1 Customer Score */}
        <AgentCard title="Customer Score" color="#7F77DD" letter="A1">
          <div className="flex items-center gap-3 mb-2.5">
            <CircularScore score={score} />
            <div className="flex flex-col gap-1">
              {segment && (
                <Badge
                  label={segment.replace(/_/g, ' ')}
                  colorClass={SEGMENT_COLORS[segment] ?? 'bg-white/10 text-white/60'}
                />
              )}
              {a1?.price_sensitivity && (
                <Badge
                  label={`${a1.price_sensitivity} sensitivity`}
                  colorClass="bg-white/10 text-white/50"
                />
              )}
            </div>
          </div>
          <Row label="LTV Estimate" value={a1?.ltv_estimate ?? a1?.ltv} />
          <Row label="Price Sensitivity" value={a1?.price_sensitivity} />
          {a1?.reasoning && (
            <p className="text-[10px] text-cogitx-muted mt-1.5 leading-relaxed italic">{String(a1.reasoning)}</p>
          )}
        </AgentCard>

        {/* A2 Behaviour Intel */}
        <AgentCard title="Behaviour Intel" color="#2DD4BF" letter="A2">
          {intent && (
            <div className="mb-2">
              <Badge
                label={`${intent} intent`}
                colorClass={INTENT_COLORS[intent] ?? 'bg-white/10 text-white/60'}
              />
            </div>
          )}
          <Row label="Primary Signal" value={a2?.primary_signal} />
          <Row label="Concern" value={a2?.concern} />
          <Row label="Journey State" value={a2?.journey_state} />
          <Row label="Visit Pattern" value={a2?.visit_pattern} />
          {a2?.reasoning && (
            <p className="text-[10px] text-cogitx-muted mt-1.5 leading-relaxed italic">{String(a2.reasoning)}</p>
          )}
        </AgentCard>

        {/* A3 Product Rec */}
        <AgentCard title="Product Rec" color="#FF6B6B" letter="A3">
          {skuName && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-white leading-tight">{String(skuName)}</p>
              {a3?.price && (
                <p className="text-sm font-bold text-agent-coral mt-0.5">
                  {typeof a3.price === 'number' ? `₹${a3.price.toLocaleString('en-IN')}` : String(a3.price)}
                </p>
              )}
              {confidence !== undefined && confidence !== null && (
                <p className="text-[10px] text-cogitx-muted mt-0.5">Confidence: {String(confidence)}%</p>
              )}
            </div>
          )}
          <Row label="Offer" value={a3?.offer_text ?? a3?.offer} />
          <Row label="vs Competitor" value={a3?.competitor_gap} />
          <Row label="Bundle" value={a3?.bundle_suggestion ?? a3?.bundle} />
          <Row label="Upsell" value={a3?.upsell ?? a3?.upsell_opportunity} />
          {skuReason && (
            <p className="text-[10px] text-cogitx-muted mt-1.5 leading-relaxed italic">{String(skuReason)}</p>
          )}
        </AgentCard>

        {/* A4 Signal Classifier */}
        <AgentCard title="Signal Classifier" color="#F59E0B" letter="A4">
          {!a4 || (!intervention && !urgency && !a4.message_angle) ? (
            <p className="text-[10px] text-cogitx-muted italic leading-relaxed">
              No signal data returned. Check that the <span className="text-white/50">Signal classifier</span> node ran and Assemble Context node names match exactly.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1 mb-2">
                {intervention && (
                  <Badge
                    label={intervention.replace(/_/g, ' ')}
                    colorClass={INTERVENTION_COLORS[intervention] ?? 'bg-agent-amber/20 text-agent-amber'}
                  />
                )}
                {urgency && (
                  <Badge
                    label={`${urgency} urgency`}
                    colorClass={URGENCY_COLORS[urgency] ?? 'bg-white/10 text-white/50'}
                  />
                )}
              </div>
              <Row label="Urgency" value={a4?.urgency} />
              <Row label="Message Angle" value={a4?.message_angle} />
              <Row label="Closing Tactic" value={a4?.closing_tactic} />
              <Row label="Send Channel" value={a4?.send_channel} />
              {a4?.reasoning && (
                <p className="text-[10px] text-cogitx-muted mt-1.5 leading-relaxed italic">{String(a4.reasoning)}</p>
              )}
            </>
          )}
        </AgentCard>

      </div>
    </div>
  )
}
