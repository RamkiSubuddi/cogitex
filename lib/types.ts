export interface CustomerProfile {
  // Identity
  name: string
  age: number
  occupation: string
  city: string

  // Purchase history
  past_orders: number
  avg_order_value: number
  last_purchase_days_ago: number
  lifetime_value_inr: number
  return_rate_percent: number
  account_age_days: number

  // Engagement
  last_messaged_hours_ago: number | null
  rfm_score: number
  loyalty_tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum'

  // Preferences & channels
  preferred_category: string
  preferred_brands: string[]
  opted_in_channels: string[]
  is_opted_out: boolean
}

export interface SessionSignals {
  // Trigger event
  trigger_type: 'pdp_visit' | 'session_exit' | 'extended_dwell' | 'repeat_view' | 'wishlist_add' | 'cart_abandon' | 'search_without_pdp'

  // Device & timing
  device: 'mobile' | 'desktop' | 'tablet'
  time_of_day: number
  session_duration_minutes: number

  // Journey — how they arrived
  traffic_source: string // kept for n8n backward compat
  entry_type: 'external_organic_search' | 'external_paid_ad' | 'external_social' | 'external_email_campaign' | 'external_competitor_search' | 'internal_site_search' | 'internal_browse' | 'direct'
  external_search_query: string
  internal_search_queries: string[]
  categories_explored: string[]
  pdp_visits_before: number

  // Product
  sku_viewed: string
  times_viewed_this_sku_in_7_days: number

  // Page behaviour
  search_query: string
  scroll_depth_percent: number
  time_on_page_seconds: number
  heatmap_hotspots: string[]
  cart_state: string
  wishlist_contains_this_sku: boolean
  session_actions: string[]

  // Micro-signals
  emi_calculator_used: boolean
  coupon_searched: boolean
  competitor_products_viewed: string[]
  video_watched: boolean
  price_comparison_done: boolean
  reviews_read: boolean

  upcoming_sale: string
}

export interface FormState {
  customer_profile: CustomerProfile
  session_signals: SessionSignals
}

export interface Agent1Data {
  customer_score?: number
  score?: number
  segment?: string
  ltv_estimate?: string | number
  ltv?: string | number
  price_sensitivity?: string
  reasoning?: string
  [key: string]: unknown
}

export interface Agent2Data {
  intent_level?: string
  intent?: string
  primary_signal?: string
  concern?: string
  journey_state?: string
  visit_pattern?: string
  reasoning?: string
  [key: string]: unknown
}

export interface Agent3Data {
  primary_sku?: string
  recommended_sku?: string
  sku_name?: string
  sku?: string
  price?: string | number
  offer_text?: string
  offer?: string
  competitor_gap?: string
  bundle_suggestion?: string
  bundle?: string
  upsell?: string
  upsell_opportunity?: string
  confidence?: number
  recommendation_reason?: string
  reasoning?: string
  [key: string]: unknown
}

export interface Agent4Data {
  intervention_type?: string
  signal_type?: string
  urgency?: string
  message_angle?: string
  closing_tactic?: string
  send_channel?: string
  reasoning?: string
  [key: string]: unknown
}

export interface Agent5Data {
  viewers_now?: number
  viewing_now?: number
  buyers_today?: number
  recent_buyers?: number
  city?: string
  review_snippet?: string
  review?: string
  proof_strength?: string
  strength?: string
  [key: string]: unknown
}

export interface Decision {
  decision: 'send_now' | 'send_in_2hr' | 'send_tomorrow_morning' | 'suppress'
  channel: 'whatsapp' | 'push' | 'email' | null
  message_type: string
  message: string
  reasoning: string
  suppression_reason: string | null
}

export interface WebhookResponse {
  agent1: string
  agent2: string
  agent3: string
  agent4: string
  agent5: string
  decision: Decision
}

export interface ParsedAgents {
  agent1: Agent1Data | null
  agent2: Agent2Data | null
  agent3: Agent3Data | null
  agent4: Agent4Data | null
  agent5: Agent5Data | null
}

export interface Persona {
  id: number
  name: string
  title: string
  description: string
  channel: 'whatsapp' | 'email' | 'push'
  channelReason: string
  tags: string[]
  tagColors: ('purple' | 'teal' | 'amber' | 'coral' | 'pink' | 'gray')[]
  customer_profile: CustomerProfile
  session_signals: SessionSignals
}
