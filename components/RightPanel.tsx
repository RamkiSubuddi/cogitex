'use client'

import { useState } from 'react'
import { WebhookResponse, ParsedAgents } from '@/lib/types'
import AgentCards from './AgentCards'
import SocialProofBar from './SocialProofBar'
import DecisionCard from './DecisionCard'

function safeParseAgent(raw: string | undefined): Record<string, unknown> | null {
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return typeof parsed === 'object' && parsed !== null ? parsed : null
  } catch {
    return null
  }
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-cogitx-muted text-sm">n8n is thinking</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-cogitx-purple"
              style={{ animation: `pulse_dot 1.4s ${i * 0.16}s infinite ease-in-out` }}
            />
          ))}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['#7F77DD', '#2DD4BF', '#FF6B6B', '#F59E0B'].map((color) => (
          <div key={color} className="h-24 rounded-xl border border-cogitx-border bg-cogitx-card" style={{ borderColor: color + '30' }} />
        ))}
      </div>
      <div className="h-12 rounded-xl bg-cogitx-card" />
      <div className="h-48 rounded-2xl bg-cogitx-card" />
    </div>
  )
}

function DefaultState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-cogitx-purple/10 border border-cogitx-purple/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-cogitx-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">CogitX Retail Agent</h2>
        <p className="text-cogitx-muted text-sm leading-relaxed max-w-xs">
          Select a persona and click <span className="text-cogitx-purple font-medium">Analyse Customer</span> to see the 5-agent AI decision engine in action.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[10px] text-cogitx-muted">
        {[
          { icon: '🎯', label: 'Customer Score' },
          { icon: '🧠', label: 'Behaviour Intel' },
          { icon: '🛍️', label: 'Product Rec' },
          { icon: '📡', label: 'Signal Classifier' },
          { icon: '👥', label: 'Social Proof' },
          { icon: '✉️', label: 'Engagement Decision' },
        ].map(({ icon, label }) => (
          <div key={label} className="bg-cogitx-card border border-cogitx-border rounded-lg p-2.5 text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Props {
  loading: boolean
  response: WebhookResponse | null
  error: string | null
  customerName: string
  customerCity: string
  rawResponse: unknown
}

export default function RightPanel({ loading, response, error, customerName, customerCity, rawResponse }: Props) {
  const [showFullRaw, setShowFullRaw] = useState(false)

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400 text-sm font-semibold">Webhook Error</span>
          </div>
          <p className="text-red-300/80 text-xs">{error}</p>
        </div>
      </div>
    )
  }

  if (!response) return <DefaultState />

  const agents: ParsedAgents = {
    agent1: safeParseAgent(response.agent1),
    agent2: safeParseAgent(response.agent2),
    agent3: safeParseAgent(response.agent3),
    agent4: safeParseAgent(response.agent4),
    agent5: safeParseAgent(response.agent5),
  }

  const a5 = agents.agent5 ?? {}

  return (
    <div className="p-5 space-y-4">
      {/* Agent Cards */}
      <AgentCards agents={agents} />

      {/* Social Proof Bar — always show */}
      <SocialProofBar data={a5} city={customerCity} />

      {/* Decision Card */}
      <DecisionCard decision={response.decision} customerName={customerName} />

      {/* Full raw toggle */}
      <div className="border-t border-cogitx-border pt-3">
        <button
          onClick={() => setShowFullRaw(!showFullRaw)}
          className="text-[11px] text-cogitx-muted hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg className={`w-3 h-3 transition-transform ${showFullRaw ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Raw Agent Outputs
        </button>
        {showFullRaw && (
          <pre className="mt-2 bg-black/40 border border-cogitx-border rounded-lg p-3 text-[10px] text-green-400 overflow-x-auto max-h-96">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-2 pb-1">
        <span className="text-[10px] text-cogitx-muted/60">
          Built with n8n + Groq + Airtable
        </span>
      </div>
    </div>
  )
}
