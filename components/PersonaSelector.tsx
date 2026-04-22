'use client'

import { PERSONAS, randomiseForm } from '@/lib/personas'
import { FormState, Persona } from '@/lib/types'

const TAG_STYLES: Record<string, string> = {
  purple: 'bg-cogitx-purple/20 text-cogitx-purple border border-cogitx-purple/30',
  teal: 'bg-agent-teal/20 text-agent-teal border border-agent-teal/30',
  amber: 'bg-agent-amber/20 text-agent-amber border border-agent-amber/30',
  coral: 'bg-agent-coral/20 text-agent-coral border border-agent-coral/30',
  pink: 'bg-agent-pink/20 text-agent-pink border border-agent-pink/30',
  gray: 'bg-white/10 text-white/60 border border-white/20',
}

const CHANNEL_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  push: {
    bg: 'bg-agent-coral/15 border-agent-coral/40',
    text: 'text-agent-coral',
    dot: 'bg-agent-coral',
    label: 'Push',
  },
  email: {
    bg: 'bg-agent-teal/15 border-agent-teal/40',
    text: 'text-agent-teal',
    dot: 'bg-agent-teal',
    label: 'Email',
  },
  whatsapp: {
    bg: 'bg-cogitx-purple/15 border-cogitx-purple/40',
    text: 'text-cogitx-purple',
    dot: 'bg-cogitx-purple',
    label: 'WhatsApp',
  },
}

interface Props {
  selectedId: number | null
  onSelect: (persona: Persona) => void
  onRandomise: (form: FormState) => void
}

export default function PersonaSelector({ selectedId, onSelect, onRandomise }: Props) {
  return (
    <div className="p-5 border-b border-cogitx-border">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-cogitx-muted mb-3">
        Select Persona
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {PERSONAS.map((persona) => {
          const isSelected = selectedId === persona.id
          const ch = CHANNEL_STYLES[persona.channel]
          return (
            <button
              key={persona.id}
              onClick={() => onSelect(persona)}
              title={persona.channelReason}
              className={`text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-cogitx-purple bg-cogitx-purple/10'
                  : 'border-cogitx-border bg-cogitx-card hover:border-cogitx-purple/50 hover:bg-cogitx-card/80'
              }`}
            >
              {/* Channel badge */}
              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold mb-1.5 ${ch.bg} ${ch.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ch.dot}`} />
                {ch.label}
              </div>

              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-sm font-semibold text-white">{persona.name}</span>
              </div>
              <p className="text-[10px] text-cogitx-muted leading-tight mb-1">{persona.title}</p>
              <p className="text-[9px] text-white/30 leading-tight">{persona.description}</p>
            </button>
          )
        })}
      </div>

      {/* Channel legend */}
      <div className="mt-3 flex gap-3 px-1">
        {(['push', 'email', 'whatsapp'] as const).map(ch => {
          const s = CHANNEL_STYLES[ch]
          return (
            <div key={ch} className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              <span className="text-[9px] text-cogitx-muted">{s.label}</span>
            </div>
          )
        })}
        <span className="text-[9px] text-cogitx-muted ml-auto opacity-50">hover for reason</span>
      </div>

      <button
        onClick={() => onRandomise(randomiseForm())}
        className="mt-3 w-full py-2 px-4 text-xs font-medium text-cogitx-muted border border-cogitx-border rounded-lg hover:border-cogitx-purple/50 hover:text-white transition-all"
      >
        ⚡ Randomise
      </button>
    </div>
  )
}
