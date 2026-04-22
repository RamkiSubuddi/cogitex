'use client'

import { useState } from 'react'
import { FormState } from '@/lib/types'

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = ['smartphones', 'laptops', 'headphones', 'tablets', 'accessories', 'smart_home', 'cameras', 'wearables']
const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Sony', 'Bose', 'Nothing', 'Redmi', 'Realme', 'boAt', 'LG', 'ASUS', 'HP', 'Lenovo', 'Dell']
const LOYALTY_TIERS = ['none', 'bronze', 'silver', 'gold', 'platinum']
const CHANNELS = ['whatsapp', 'email', 'push']
const CART_STATES = ['empty', 'added_to_cart', 'has_other_items', 'abandoned_cart']
const TRIGGER_TYPES = [
  { value: 'pdp_visit', label: 'PDP Visit' },
  { value: 'session_exit', label: 'Session Exit' },
  { value: 'extended_dwell', label: 'Extended Dwell' },
  { value: 'repeat_view', label: 'Repeat View' },
  { value: 'wishlist_add', label: 'Wishlist Add' },
  { value: 'cart_abandon', label: 'Cart Abandon' },
  { value: 'search_without_pdp', label: 'Search (No PDP)' },
]
const ENTRY_TYPES = [
  { value: 'external_organic_search', label: 'Organic Search' },
  { value: 'external_paid_ad', label: 'Paid Ad' },
  { value: 'external_social', label: 'Social Media' },
  { value: 'external_email_campaign', label: 'Email Campaign' },
  { value: 'external_competitor_search', label: 'Competitor Search' },
  { value: 'internal_site_search', label: 'Site Search' },
  { value: 'internal_browse', label: 'Browse / Category' },
  { value: 'direct', label: 'Direct / App' },
]
const HEATMAP_OPTIONS = ['price_section', 'emi_section', 'specs', 'camera_specs', 'delivery_date', 'reviews', 'comparison_table', 'images', 'return_policy']
const SESSION_ACTIONS = ['viewed_3_images', 'checked_delivery', 'read_reviews', 'used_compare', 'zoomed_images', 'checked_return_policy', 'shared_product']
const CATEGORIES_EXPLORE = ['smartphones', 'laptops', 'headphones', 'tablets', 'accessories', 'cameras', 'wearables', 'smart_home']

// ── Base components ────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-cogitx-muted mb-1">{children}</label>
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-cogitx-dark border border-cogitx-border rounded-lg px-3 py-2 text-xs text-white placeholder-cogitx-muted/50 focus:outline-none focus:border-cogitx-purple/60 transition-colors" />
  )
}

function NumberInput({ value, onChange, min = 0, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))}
      className="w-full bg-cogitx-dark border border-cogitx-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cogitx-purple/60 transition-colors" />
  )
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-cogitx-dark border border-cogitx-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cogitx-purple/60 transition-colors">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SliderInput({ value, onChange, label, min = 0, max = 100, unit = '' }: {
  value: number; onChange: (v: number) => void; label: string; min?: number; max?: number; unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <Label>{label}</Label>
        <span className="text-[11px] font-semibold text-cogitx-purple">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-cogitx-purple h-1.5 cursor-pointer" />
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-white/80">{label}</span>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={e => e.key === 'Enter' && onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${checked ? 'bg-cogitx-purple' : 'bg-white/20'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  )
}

function MultiCheck({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} onClick={() => toggle(opt)}
          className={`text-[10px] px-2 py-1 rounded-md border transition-all ${selected.includes(opt)
            ? 'bg-cogitx-purple/20 border-cogitx-purple/50 text-cogitx-purple'
            : 'bg-cogitx-dark border-cogitx-border text-cogitx-muted hover:border-cogitx-purple/30'}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function ButtonGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all ${value === opt.value
            ? 'bg-cogitx-purple/20 border-cogitx-purple/50 text-cogitx-purple font-semibold'
            : 'bg-cogitx-dark border-cogitx-border text-cogitx-muted hover:border-cogitx-purple/30'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ChipInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim()
    if (t && !values.includes(t)) onChange([...values, t])
    setInput('')
  }
  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1.5">
          {values.map(v => (
            <span key={v} className="inline-flex items-center gap-1 text-[10px] bg-cogitx-purple/20 text-cogitx-purple border border-cogitx-purple/30 px-2 py-0.5 rounded-full">
              {v}
              <button onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-white ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1 bg-cogitx-dark border border-cogitx-border rounded-lg px-3 py-2 text-xs text-white placeholder-cogitx-muted/50 focus:outline-none focus:border-cogitx-purple/60 transition-colors" />
        <button onClick={add} className="px-3 py-2 text-xs bg-cogitx-purple/20 border border-cogitx-purple/30 text-cogitx-purple rounded-lg hover:bg-cogitx-purple/30 transition-colors">+</button>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-cogitx-border pt-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3 group">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-cogitx-muted group-hover:text-white/60 transition-colors">{title}</h3>
        <svg className={`w-3 h-3 text-cogitx-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  )
}

function formatHour(h: number) {
  if (h === 0) return '12 am'
  if (h === 12) return '12 pm'
  return h < 12 ? `${h} am` : `${h - 12} pm`
}

// ── Main component ─────────────────────────────────────────────────────────

interface Props { form: FormState; onChange: (form: FormState) => void }

export default function CustomerForm({ form, onChange }: Props) {
  const cp = form.customer_profile
  const ss = form.session_signals

  function setCP<K extends keyof typeof cp>(key: K, val: typeof cp[K]) {
    onChange({ ...form, customer_profile: { ...cp, [key]: val } })
  }
  function setSS<K extends keyof typeof ss>(key: K, val: typeof ss[K]) {
    onChange({ ...form, session_signals: { ...ss, [key]: val } })
  }

  return (
    <div className="p-5 space-y-4 border-b border-cogitx-border">

      {/* ── CUSTOMER PROFILE ── */}
      <h3 className="text-[10px] font-semibold uppercase tracking-widest text-cogitx-muted">Customer Profile</h3>

      <div className="grid grid-cols-2 gap-3">
        <div><Label>Name</Label><TextInput value={cp.name} onChange={v => setCP('name', v)} placeholder="Customer name" /></div>
        <div><Label>Age</Label><NumberInput value={cp.age} onChange={v => setCP('age', v)} min={18} max={65} /></div>
        <div><Label>Occupation</Label><TextInput value={cp.occupation} onChange={v => setCP('occupation', v)} placeholder="e.g. Engineer" /></div>
        <div><Label>City</Label><TextInput value={cp.city} onChange={v => setCP('city', v)} placeholder="e.g. Bangalore" /></div>
      </div>

      <CollapsibleSection title="Purchase History">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Past Orders</Label><NumberInput value={cp.past_orders} onChange={v => setCP('past_orders', v)} /></div>
          <div><Label>Avg Order Value (₹)</Label><NumberInput value={cp.avg_order_value} onChange={v => setCP('avg_order_value', v)} step={500} /></div>
          <div><Label>Lifetime Value (₹)</Label><NumberInput value={cp.lifetime_value_inr} onChange={v => setCP('lifetime_value_inr', v)} step={1000} /></div>
          <div><Label>Last Purchase (days ago)</Label><NumberInput value={cp.last_purchase_days_ago} onChange={v => setCP('last_purchase_days_ago', v)} /></div>
          <div><Label>Account Age (days)</Label><NumberInput value={cp.account_age_days} onChange={v => setCP('account_age_days', v)} /></div>
          <div><Label>Return Rate (%)</Label><NumberInput value={cp.return_rate_percent} onChange={v => setCP('return_rate_percent', v)} min={0} max={100} /></div>
        </div>
        <div>
          <Label>Last Messaged (hrs ago)</Label>
          <div className="flex gap-2 items-center">
            <input type="number" min={0} value={cp.last_messaged_hours_ago ?? ''} placeholder="null"
              onChange={e => setCP('last_messaged_hours_ago', e.target.value === '' ? null : Number(e.target.value))}
              className="flex-1 bg-cogitx-dark border border-cogitx-border rounded-lg px-3 py-2 text-xs text-white placeholder-cogitx-muted/50 focus:outline-none focus:border-cogitx-purple/60 transition-colors" />
            <button onClick={() => setCP('last_messaged_hours_ago', cp.last_messaged_hours_ago === null ? 24 : null)}
              className={`text-[10px] px-2 py-2 rounded-lg border transition-all whitespace-nowrap ${cp.last_messaged_hours_ago === null ? 'bg-cogitx-purple/20 border-cogitx-purple/50 text-cogitx-purple' : 'border-cogitx-border text-cogitx-muted'}`}>
              Never
            </button>
          </div>
        </div>
        <SliderInput value={cp.rfm_score} onChange={v => setCP('rfm_score', v)} label="RFM Score" />
      </CollapsibleSection>

      <CollapsibleSection title="Profile & Preferences">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Loyalty Tier</Label>
            <SelectInput value={cp.loyalty_tier} onChange={v => setCP('loyalty_tier', v as typeof cp.loyalty_tier)} options={LOYALTY_TIERS} />
          </div>
          <div>
            <Label>Preferred Category</Label>
            <SelectInput value={cp.preferred_category} onChange={v => setCP('preferred_category', v)} options={CATEGORIES} />
          </div>
        </div>
        <div>
          <Label>Preferred Brands</Label>
          <MultiCheck options={BRANDS} selected={cp.preferred_brands} onChange={v => setCP('preferred_brands', v)} />
        </div>
        <div>
          <Label>Opted-in Channels</Label>
          <MultiCheck options={CHANNELS} selected={cp.opted_in_channels} onChange={v => setCP('opted_in_channels', v)} />
        </div>
        <Toggle checked={cp.is_opted_out} onChange={v => setCP('is_opted_out', v)} label="Opted Out (suppress all messaging)" />
      </CollapsibleSection>

      {/* ── SESSION TRIGGER ── */}
      <CollapsibleSection title="Session Trigger">
        <div>
          <Label>Trigger Type</Label>
          <ButtonGroup options={TRIGGER_TYPES} value={ss.trigger_type} onChange={v => setSS('trigger_type', v as typeof ss.trigger_type)} />
        </div>
        <div>
          <Label>Device</Label>
          <ButtonGroup
            options={[{ value: 'mobile', label: '📱 Mobile' }, { value: 'desktop', label: '🖥 Desktop' }, { value: 'tablet', label: '📟 Tablet' }]}
            value={ss.device}
            onChange={v => setSS('device', v as typeof ss.device)}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <Label>Time of Day</Label>
            <span className="text-[11px] font-semibold text-cogitx-purple">{formatHour(ss.time_of_day)}</span>
          </div>
          <input type="range" min={0} max={23} value={ss.time_of_day} onChange={e => setSS('time_of_day', Number(e.target.value))}
            className="w-full accent-cogitx-purple h-1.5 cursor-pointer" />
          <div className="flex justify-between mt-0.5">
            {['12am', '6am', '12pm', '6pm', '11pm'].map(t => (
              <span key={t} className="text-[9px] text-cogitx-muted/50">{t}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Session Duration (min)</Label><NumberInput value={ss.session_duration_minutes} onChange={v => setSS('session_duration_minutes', v)} min={1} /></div>
          <div><Label>PDPs Visited Before</Label><NumberInput value={ss.pdp_visits_before} onChange={v => setSS('pdp_visits_before', v)} /></div>
        </div>
      </CollapsibleSection>

      {/* ── SESSION JOURNEY ── */}
      <CollapsibleSection title="Session Journey (How They Arrived)" defaultOpen={false}>
        <div>
          <Label>Entry Type</Label>
          <ButtonGroup options={ENTRY_TYPES} value={ss.entry_type} onChange={v => setSS('entry_type', v as typeof ss.entry_type)} />
        </div>
        {(ss.entry_type.startsWith('external')) && (
          <div>
            <Label>External Search Query (Google / Ad)</Label>
            <TextInput value={ss.external_search_query} onChange={v => setSS('external_search_query', v)} placeholder="e.g. best phone under 30000 india" />
          </div>
        )}
        <div>
          <Label>Internal Site Searches</Label>
          <ChipInput values={ss.internal_search_queries} onChange={v => setSS('internal_search_queries', v)} placeholder="Type a search query + Enter" />
        </div>
        <div>
          <Label>Categories Explored</Label>
          <MultiCheck options={CATEGORIES_EXPLORE} selected={ss.categories_explored} onChange={v => setSS('categories_explored', v)} />
        </div>
      </CollapsibleSection>

      {/* ── PRODUCT & PAGE BEHAVIOUR ── */}
      <CollapsibleSection title="Product & Page Behaviour">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>SKU Viewed</Label><TextInput value={ss.sku_viewed} onChange={v => setSS('sku_viewed', v)} placeholder="Product name" /></div>
          <div><Label>Times Viewed (7 days)</Label><NumberInput value={ss.times_viewed_this_sku_in_7_days} onChange={v => setSS('times_viewed_this_sku_in_7_days', v)} min={0} /></div>
          <div><Label>Time on Page (sec)</Label><NumberInput value={ss.time_on_page_seconds} onChange={v => setSS('time_on_page_seconds', v)} /></div>
          <div>
            <Label>Cart State</Label>
            <SelectInput value={ss.cart_state} onChange={v => setSS('cart_state', v)} options={CART_STATES} />
          </div>
        </div>
        <div><Label>Current Search Query</Label><TextInput value={ss.search_query} onChange={v => setSS('search_query', v)} placeholder="e.g. best phone under 30000" /></div>
        <SliderInput value={ss.scroll_depth_percent} onChange={v => setSS('scroll_depth_percent', v)} label="Scroll Depth" unit="%" />
        <div><Label>Heatmap Hotspots</Label><MultiCheck options={HEATMAP_OPTIONS} selected={ss.heatmap_hotspots} onChange={v => setSS('heatmap_hotspots', v)} /></div>
        <div><Label>Session Actions</Label><MultiCheck options={SESSION_ACTIONS} selected={ss.session_actions} onChange={v => setSS('session_actions', v)} /></div>
        <Toggle checked={ss.wishlist_contains_this_sku} onChange={v => setSS('wishlist_contains_this_sku', v)} label="Wishlist contains this SKU" />
      </CollapsibleSection>

      {/* ── MICRO-SIGNALS ── */}
      <CollapsibleSection title="Micro-signals & Intent" defaultOpen={false}>
        <div className="space-y-2.5">
          <Toggle checked={ss.emi_calculator_used} onChange={v => setSS('emi_calculator_used', v)} label="Used EMI Calculator" />
          <Toggle checked={ss.coupon_searched} onChange={v => setSS('coupon_searched', v)} label="Searched for Coupon" />
          <Toggle checked={ss.price_comparison_done} onChange={v => setSS('price_comparison_done', v)} label="Did Price Comparison" />
          <Toggle checked={ss.video_watched} onChange={v => setSS('video_watched', v)} label="Watched Product Video" />
          <Toggle checked={ss.reviews_read} onChange={v => setSS('reviews_read', v)} label="Read Reviews" />
        </div>
        <div>
          <Label>Competitor Products Viewed</Label>
          <ChipInput values={ss.competitor_products_viewed} onChange={v => setSS('competitor_products_viewed', v)} placeholder="e.g. OnePlus 12 (Amazon)" />
        </div>
        <div>
          <Label>Upcoming Sale (optional)</Label>
          <TextInput value={ss.upcoming_sale} onChange={v => setSS('upcoming_sale', v)} placeholder="e.g. Big Billion Day in 2 days" />
        </div>
      </CollapsibleSection>

    </div>
  )
}
