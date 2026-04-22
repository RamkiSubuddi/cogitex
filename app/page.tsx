'use client'

import { useState } from 'react'
import PersonaSelector from '@/components/PersonaSelector'
import CustomerForm from '@/components/CustomerForm'
import RightPanel from '@/components/RightPanel'
import { Persona, FormState, WebhookResponse } from '@/lib/types'
import { DEFAULT_FORM_STATE } from '@/lib/personas'

const LS_KEY = 'cogitx_webhook_url'

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE)
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<WebhookResponse | null>(null)
  const [rawResponse, setRawResponse] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrlState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LS_KEY) || process.env.NEXT_PUBLIC_WEBHOOK_URL || ''
    }
    return process.env.NEXT_PUBLIC_WEBHOOK_URL || ''
  })
  const [showUrlInput, setShowUrlInput] = useState(false)

  function handleWebhookChange(url: string) {
    setWebhookUrlState(url)
    if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, url)
  }

  function handlePersonaSelect(persona: Persona) {
    setSelectedPersonaId(persona.id)
    setForm({
      customer_profile: { ...persona.customer_profile },
      session_signals: { ...persona.session_signals },
    })
  }

  function handleRandomise(newForm: FormState) {
    setSelectedPersonaId(null)
    setForm(newForm)
  }

  async function handleAnalyse() {
    if (!webhookUrl || webhookUrl.trim() === '') {
      setError('Paste your n8n webhook URL in the field below and try again.')
      setShowUrlInput(true)
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)
    setRawResponse(null)

    const payload = {
      customer_profile: {
        user_id: 'usr_' + Math.floor(Math.random() * 900000 + 100000),
        ...form.customer_profile,
      },
      session_signals: {
        current_page: 'PDP',
        ...form.session_signals,
      },
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 35000)

      const res = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const text = await res.text()

      if (!text || text.trim() === '') {
        throw new Error('n8n returned an empty response. Make sure your workflow has a "Respond to Webhook" node and the workflow executes fully.')
      }

      if (!res.ok) {
        throw new Error(`Webhook returned ${res.status} ${res.statusText}: ${text.substring(0, 200)}`)
      }

      let data: WebhookResponse
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`n8n returned invalid JSON: ${text.substring(0, 300)}`)
      }

      setRawResponse(data)
      setResponse(data)
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          setError('n8n is thinking... Request timed out after 35s. The workflow may still be running — try again in a moment.')
        } else {
          setError(e.message)
        }
      } else {
        setError('Unknown error. Check your n8n webhook URL and workflow.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full bg-cogitx-dark overflow-hidden">
      {/* LEFT PANEL */}
      <div className="w-[45%] h-full flex flex-col border-r border-cogitx-border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-cogitx-border flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cogitx-purple/20 border border-cogitx-purple/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-cogitx-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">CogitX Retail Agent</h1>
            <p className="text-[10px] text-cogitx-muted">5-agent AI engagement engine</p>
          </div>
        </div>

        {/* Persona Selector */}
        <PersonaSelector
          selectedId={selectedPersonaId}
          onSelect={handlePersonaSelect}
          onRandomise={handleRandomise}
        />

        {/* Form */}
        <CustomerForm form={form} onChange={setForm} />

        {/* Action Buttons */}
        <div className="p-4 flex flex-col gap-2.5 flex-shrink-0 border-t border-cogitx-border bg-cogitx-panel sticky bottom-0">

          {/* Webhook URL row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUrlInput(v => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg border transition-all flex-shrink-0 ${
                webhookUrl
                  ? 'border-cogitx-purple/40 text-cogitx-purple bg-cogitx-purple/10'
                  : 'border-red-500/40 text-red-400 bg-red-500/10'
              }`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Webhook
            </button>
            {showUrlInput ? (
              <input
                value={webhookUrl}
                onChange={e => handleWebhookChange(e.target.value)}
                placeholder="https://yourinstance.app.n8n.cloud/webhook/..."
                className="flex-1 bg-cogitx-dark border border-cogitx-border rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-cogitx-muted/40 focus:outline-none focus:border-cogitx-purple/60 transition-colors"
              />
            ) : (
              <span className="flex-1 text-[10px] text-cogitx-muted truncate">
                {webhookUrl
                  ? webhookUrl.replace('https://', '').replace('http://', '')
                  : <span className="text-red-400">No URL set — click Webhook to add</span>
                }
              </span>
            )}
          </div>

          <button
            onClick={handleAnalyse}
            disabled={loading}
            className="w-full py-3 px-5 bg-cogitx-purple hover:bg-opacity-90 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cogitx-purple/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span>Analysing</span>
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-white"
                      style={{ animation: `pulse_dot 1.4s ${i * 0.16}s infinite ease-in-out` }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              'Analyse Customer'
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[55%] h-full overflow-y-auto bg-cogitx-panel">
        <RightPanel
          loading={loading}
          response={response}
          error={error}
          customerName={form.customer_profile.name}
          customerCity={form.customer_profile.city}
          rawResponse={rawResponse}
        />
      </div>
    </div>
  )
}
