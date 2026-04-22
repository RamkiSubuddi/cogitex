'use client'

import { useState } from 'react'
import { Decision } from '@/lib/types'

const TIMING_LABEL: Record<string, { label: string; color: string }> = {
  send_now: { label: 'Sending now', color: 'bg-green-500/20 text-green-400' },
  send_in_2hr: { label: 'Sending in 2 hours', color: 'bg-agent-amber/20 text-agent-amber' },
  send_tomorrow_morning: { label: 'Tomorrow morning', color: 'bg-blue-500/20 text-blue-400' },
  suppress: { label: 'Suppressed', color: 'bg-white/10 text-white/40' },
}

function generateSubjectLine(message: string, messageType: string): string {
  const type = messageType.toLowerCase()
  if (type.includes('offer') || type.includes('price')) return `Exclusive offer for you — don't miss out`
  if (type.includes('stock') || type.includes('warn')) return `Heads up: limited stock alert`
  if (type.includes('emi')) return `Flexible payment options just for you`
  if (type.includes('compare') || type.includes('help')) return `Still comparing? We can help`
  if (type.includes('reengage') || type.includes('re-engage')) return `We've missed you — come back`
  const first = message.split('.')[0]
  return first.length > 60 ? first.substring(0, 57) + '...' : first
}

function WhatsAppCard({ decision, customerName }: { decision: Decision; customerName: string }) {
  const timing = TIMING_LABEL[decision.decision] ?? TIMING_LABEL.send_now
  return (
    <div className="rounded-2xl overflow-hidden border border-wa-green/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-wa-green/10 border-b border-wa-green/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-wa-green flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.113.548 4.098 1.512 5.823L0 24l6.335-1.495A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.67-.513-5.195-1.408L2 22l1.438-4.697A9.947 9.947 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">WhatsApp Message</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${timing.color}`}>
          {timing.label}
        </span>
      </div>

      {/* Phone mockup */}
      <div className="bg-[#0D1117] p-4">
        <div className="max-w-sm mx-auto">
          {/* Chat header bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1F2C34] rounded-t-xl">
            <div className="w-8 h-8 rounded-full bg-wa-green/30 flex items-center justify-center text-xs font-bold text-wa-green">M</div>
            <div>
              <p className="text-xs font-semibold text-white">Marketplace</p>
              <p className="text-[10px] text-green-400">Online</p>
            </div>
          </div>
          {/* Chat area */}
          <div className="bg-[#0B141A] px-3 py-4 rounded-b-xl space-y-2">
            <div className="flex justify-start">
              <div className="bg-[#1F2C34] rounded-xl rounded-tl-none px-3 py-2.5 max-w-[85%]">
                <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{decision.message}</p>
                <p className="text-[9px] text-white/40 mt-1 text-right">now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-wa-green/5 border-t border-wa-green/10 space-y-2">
        {decision.message_type && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-wa-green/20 text-wa-green">
            {decision.message_type.replace(/_/g, ' ')}
          </span>
        )}
        {decision.reasoning && (
          <p className="text-[11px] text-cogitx-muted leading-relaxed">{decision.reasoning}</p>
        )}
      </div>
    </div>
  )
}

function EmailCard({ decision, customerName }: { decision: Decision; customerName: string }) {
  const timing = TIMING_LABEL[decision.decision] ?? TIMING_LABEL.send_now
  const subject = generateSubjectLine(decision.message, decision.message_type)
  return (
    <div className="rounded-2xl overflow-hidden border border-cogitx-border">
      <div className="flex items-center justify-between px-4 py-3 bg-cogitx-card border-b border-cogitx-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Email</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${timing.color}`}>
          {timing.label}
        </span>
      </div>
      {/* Email body */}
      <div className="bg-white p-4">
        <div className="border-b border-gray-200 pb-3 mb-3 space-y-1 text-xs text-gray-500">
          <div><span className="font-semibold">From:</span> support@marketplace.com</div>
          <div><span className="font-semibold">To:</span> {customerName || 'Customer'}</div>
          <div><span className="font-semibold">Subject:</span> {subject}</div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{decision.message}</p>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Marketplace · Unsubscribe · Privacy Policy</p>
        </div>
      </div>
      <div className="px-4 py-3 bg-cogitx-card border-t border-cogitx-border space-y-2">
        {decision.message_type && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
            {decision.message_type.replace(/_/g, ' ')}
          </span>
        )}
        {decision.reasoning && (
          <p className="text-[11px] text-cogitx-muted leading-relaxed">{decision.reasoning}</p>
        )}
      </div>
    </div>
  )
}

function PushCard({ decision, customerName }: { decision: Decision; customerName: string }) {
  const timing = TIMING_LABEL[decision.decision] ?? TIMING_LABEL.send_now
  const preview = decision.message.length > 80 ? decision.message.substring(0, 77) + '...' : decision.message
  return (
    <div className="rounded-2xl overflow-hidden border border-cogitx-border">
      <div className="flex items-center justify-between px-4 py-3 bg-cogitx-card border-b border-cogitx-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-cogitx-purple/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-cogitx-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Push Notification</span>
        </div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${timing.color}`}>
          {timing.label}
        </span>
      </div>
      {/* Notification preview */}
      <div className="bg-[#1A1A2E] p-4">
        <div className="bg-[#16213E] rounded-xl p-3 flex gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-cogitx-purple/30 flex items-center justify-center flex-shrink-0 text-lg">🛒</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-white">Marketplace</span>
              <span className="text-[10px] text-white/40">now</span>
            </div>
            <p className="text-xs text-white/60 truncate">{preview}</p>
          </div>
        </div>
        {decision.message.length > 80 && (
          <div className="mt-3 bg-[#16213E]/50 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{decision.message}</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 bg-cogitx-card border-t border-cogitx-border space-y-2">
        {decision.message_type && (
          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cogitx-purple/20 text-cogitx-purple">
            {decision.message_type.replace(/_/g, ' ')}
          </span>
        )}
        {decision.reasoning && (
          <p className="text-[11px] text-cogitx-muted leading-relaxed">{decision.reasoning}</p>
        )}
      </div>
    </div>
  )
}

function SuppressedCard({ decision }: { decision: Decision }) {
  return (
    <div className="rounded-2xl border border-cogitx-border bg-cogitx-card p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-2xl">🚫</div>
      <h3 className="text-sm font-semibold text-white/60 mb-1">Message Suppressed</h3>
      {decision.suppression_reason && (
        <p className="text-xs text-cogitx-muted mb-3">{decision.suppression_reason}</p>
      )}
      {decision.reasoning && (
        <p className="text-[11px] text-cogitx-muted/70 leading-relaxed">{decision.reasoning}</p>
      )}
    </div>
  )
}

interface Props {
  decision: Decision
  customerName: string
}

export default function DecisionCard({ decision, customerName }: Props) {
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-cogitx-muted">
          Engagement Decision
        </h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          TIMING_LABEL[decision.decision]?.color ?? 'bg-white/10 text-white/40'
        }`}>
          {TIMING_LABEL[decision.decision]?.label ?? decision.decision}
        </span>
      </div>

      {decision.channel === 'whatsapp' && (
        <WhatsAppCard decision={decision} customerName={customerName} />
      )}
      {decision.channel === 'email' && (
        <EmailCard decision={decision} customerName={customerName} />
      )}
      {decision.channel === 'push' && (
        <PushCard decision={decision} customerName={customerName} />
      )}
      {(!decision.channel || decision.decision === 'suppress') && (
        <SuppressedCard decision={decision} />
      )}

      <button
        onClick={() => setShowRaw(!showRaw)}
        className="mt-3 w-full text-left text-[11px] text-cogitx-muted hover:text-white transition-colors py-2 flex items-center gap-1.5"
      >
        <svg className={`w-3 h-3 transition-transform ${showRaw ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Raw decision JSON
      </button>
      {showRaw && (
        <pre className="bg-black/40 border border-cogitx-border rounded-lg p-3 text-[10px] text-green-400 overflow-x-auto">
          {JSON.stringify(decision, null, 2)}
        </pre>
      )}
    </div>
  )
}
