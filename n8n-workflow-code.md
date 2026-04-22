# CogitX n8n Workflow — Node Code Reference

Paste the code below into the corresponding n8n nodes.
All Groq HTTP nodes: POST to `https://api.groq.com/openai/v1/chat/completions`
Header: `Authorization: Bearer <your-groq-key>`

---

## Node 1 — Suppress Guard (Code Node)

```javascript
const data = $input.first().json;
const cp = data.customer_profile;

let suppress = false;
let suppression_reason = null;

// Rule: messaged less than 12h ago
if (typeof cp.last_messaged_hours_ago === 'number' && cp.last_messaged_hours_ago < 12) {
  suppress = true;
  suppression_reason = `Messaged only ${cp.last_messaged_hours_ago}h ago — minimum 12h gap required`;
}

return [{
  json: {
    ...data,
    _meta: { suppress, suppression_reason }
  }
}];
```

---

## Node 2 — product db (Airtable)
- Operation: **Search Records**
- Table: `products`
- Filter by formula: leave blank (fetch all — enrich payload will filter)
- Return All: ✅ ON

## Node 3 — collab signals (Airtable)
- Operation: **Search Records**
- Table: `collab_signals`
- Filter by formula: leave blank
- Return All: ✅ ON

## Node 4 — send intellignece (Airtable)
- Operation: **Search Records**
- Table: `send_intelligence`
- Filter by formula: leave blank
- Return All: ✅ ON

---

## Node 5 — enrich payload (Code Node)

```javascript
const base = $('Suppress Guard').first().json;
const skuViewed = (base.session_signals.sku_viewed || '').toLowerCase();

// Pull Airtable records
const productRows   = $('product db').all().map(i => i.json);
const collabRows    = $('collab signals').all().map(i => i.json);
const sendRows      = $('send intellignece').all().map(i => i.json);

// Find the currently viewed product
const currentProduct = productRows.find(r =>
  r.name && r.name.toLowerCase().includes(skuViewed)
) || productRows[0] || null;

// All products as slim catalogue for agents
const catalogue = productRows.map(r => ({
  sku_id:               r.sku_id,
  name:                 r.name,
  category:             r.category,
  price:                r.price,
  offer:                r.offer || null,
  offer_expiry:         r.offer_expiry || null,
  inventory:            r.inventory,
  stock_count:          r.stock_count,
  emi_available:        r.emi_available,
  emi_min_monthly:      r.emi_min_monthly || null,
  specs_summary:        r.specs_summary,
  competitor:           r.competitor_equivalent,
  competitor_price:     r.competitor_price,
  our_price_gap:        r.our_price_gap,
  bundle_sku:           r.bundle_sku || null,
  rating:               r.rating,
  review_count:         r.review_count,
  trending:             r.trending,
  clearance:            r.clearance,
}));

// Collab signals for the current SKU
const skuId = currentProduct ? currentProduct.sku_id : null;
const skuCollab = collabRows.filter(r => r.viewed_sku === skuId);

return [{
  json: {
    ...base,
    _db: {
      current_product: currentProduct,
      catalogue,
      collab_signals:    skuCollab.length ? skuCollab : collabRows.slice(0, 5),
      send_intelligence: sendRows,
    }
  }
}];
```

---

## Node 6 — customer score1 (HTTP Request → Groq)

**Body (JSON — switch field to Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.2,
    "max_tokens": 500,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a customer intelligence AI for an Indian e-commerce platform. Analyse the customer profile and return ONLY a valid JSON object with these exact fields:\n- customer_score: integer 0-100\n- segment: one of [high_value, deal_seeker, researcher, lapsed, new_visitor]\n- ltv_estimate: string in format '₹X,XX,000'\n- price_sensitivity: one of [low, medium, high]\n- reasoning: string, 1-2 sentences explaining the score\n\nScoring logic: high past_orders + high avg_order_value = high score. Recent activity boosts score. Lapsed (>60 days) reduces score. New visitors start low."
      },
      {
        "role": "user",
        "content": "=Score this customer:\n\n" + JSON.stringify($input.first().json.customer_profile, null, 2) + "\n\nSession context:\n- SKU viewed: " + $input.first().json.session_signals.sku_viewed + "\n- Traffic source: " + $input.first().json.session_signals.traffic_source + "\n- Cart state: " + $input.first().json.session_signals.cart_state + "\n- Scroll depth: " + $input.first().json.session_signals.scroll_depth_percent + "%\n- Times viewed this SKU: " + $input.first().json.session_signals.times_viewed_this_sku_in_7_days
      }
    ]
  }
}
```

---

## Node 7 — Behavior intel (HTTP Request → Groq)

**Body (JSON — Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.2,
    "max_tokens": 500,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a behavioural intelligence AI. Analyse session signals from an e-commerce product page and return ONLY a valid JSON object with these exact fields:\n- intent_level: one of [high, medium, low]\n- primary_signal: string, the strongest behavioural indicator\n- concern: string, what might stop this customer from buying (price/specs/trust/timing/none)\n- journey_state: one of [awareness, consideration, decision_stage, ready_to_buy]\n- visit_pattern: string describing the browsing pattern (e.g. 'deep_research', 'price_check', 'impulse_browse')\n- reasoning: string, 1 sentence"
      },
      {
        "role": "user",
        "content": "=Analyse these session signals:\n\n" + JSON.stringify($input.first().json.session_signals, null, 2)
      }
    ]
  }
}
```

---

## Node 8 — Product Rec (HTTP Request → Groq)

**Body (JSON — Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.3,
    "max_tokens": 600,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a product recommendation AI for an Indian e-commerce platform. Given the customer context and product catalogue, return ONLY a valid JSON object with these exact fields:\n- primary_sku: string, name of the best product match (from catalogue)\n- price: number, the price in INR\n- offer_text: string, the active offer on this product (or null)\n- competitor_gap: string, 1-sentence comparison vs competitor\n- bundle_suggestion: string, name of a complementary product to bundle (or null)\n- upsell: string, name of a premium alternative (or null)\n- reasoning: string, why this product was chosen"
      },
      {
        "role": "user",
        "content": "=Customer profile:\n" + JSON.stringify($input.first().json.customer_profile) + "\n\nCurrently viewing: " + $input.first().json.session_signals.sku_viewed + "\n\nCurrent product details:\n" + JSON.stringify($input.first().json._db.current_product, null, 2) + "\n\nFull catalogue (25 SKUs):\n" + JSON.stringify($input.first().json._db.catalogue, null, 2)
      }
    ]
  }
}
```

---

## Node 9 — Signal clasifier (HTTP Request → Groq)

**Body (JSON — Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.2,
    "max_tokens": 400,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a signal classification AI. Decide what type of engagement intervention to trigger for this customer. Return ONLY a valid JSON object with these exact fields:\n- intervention_type: one of [price_alert, stock_warning, offer_unlock, emi_nudge, comparison_help, reengagement]\n- urgency: one of [critical, high, medium, low]\n- message_angle: string, the core psychological angle to use (e.g. 'scarcity', 'social_proof', 'price_advantage', 'loyalty_reward')\n- closing_tactic: string, what to lead with at the end of the message (e.g. 'limited_time_offer', 'free_delivery', 'emi_highlight', 'cashback')\n- send_channel: one of [whatsapp, push, email]\n- reasoning: string, 1 sentence justifying the classification\n\nRules:\n- lapsed customers → reengagement\n- new_visitors → comparison_help or price_alert\n- low stock (<30 units) → stock_warning\n- emi_section heatmap → emi_nudge\n- competitor search traffic → comparison_help or price_alert\n- high_value + cart = offer_unlock"
      },
      {
        "role": "user",
        "content": "=Customer profile:\n" + JSON.stringify($input.first().json.customer_profile) + "\n\nSession signals:\n" + JSON.stringify($input.first().json.session_signals) + "\n\nProduct in view:\n" + JSON.stringify($input.first().json._db.current_product) + "\n\nSuppression meta:\n" + JSON.stringify($input.first().json._meta)
      }
    ]
  }
}
```

---

## Node 10 — Social Proof (HTTP Request → Groq)

**Body (JSON — Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.5,
    "max_tokens": 400,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "You are a social proof generation AI for an Indian e-commerce platform. Generate realistic, believable crowd signals for the product page. Return ONLY a valid JSON object with these exact fields:\n- viewers_now: integer 8-120 (people currently viewing the product)\n- buyers_today: integer 3-80 (people who bought this product today in the city)\n- city: string (use the customer's city)\n- review_snippet: string, a short realistic review snippet (max 12 words, present tense)\n- proof_strength: one of [strong, moderate, weak] (based on product popularity and stock)\n\nBase viewers_now and buyers_today on the product's rating, review_count, and trending status. Popular/trending products should have higher numbers."
      },
      {
        "role": "user",
        "content": "=Customer city: " + $input.first().json.customer_profile.city + "\n\nProduct: " + JSON.stringify($input.first().json._db.current_product) + "\n\nCollab signals:\n" + JSON.stringify($input.first().json._db.collab_signals)
      }
    ]
  }
}
```

---

## Node 11 — Merge (Merge Node)
- Mode: **Append**
- Inputs: all 5 agent HTTP nodes (customer score, behavior intel, product rec, signal classifier, social proof)

---

## Node 12 — Assemble Context (Code Node)

```javascript
// Each item in $input is one agent's HTTP response
const items = $input.all();

function extractContent(item) {
  try {
    const body = item.json;
    // Groq response format: body.choices[0].message.content
    const content = body?.choices?.[0]?.message?.content;
    if (!content) return null;
    return typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    return null;
  }
}

// The 5 agents come in the order they were connected to Merge
// agent1=customer score, agent2=behavior intel, agent3=product rec, agent4=signal classifier, agent5=social proof
const [a1raw, a2raw, a3raw, a4raw, a5raw] = items;

const agent1 = extractContent(a1raw);
const agent2 = extractContent(a2raw);
const agent3 = extractContent(a3raw);
const agent4 = extractContent(a4raw);
const agent5 = extractContent(a5raw);

// Get the enriched base data from enrich payload
const base = $('enrich payload').first().json;

return [{
  json: {
    customer_profile:  base.customer_profile,
    session_signals:   base.session_signals,
    _meta:             base._meta,
    _db:               base._db,
    agents: {
      customer_score:     agent1,
      behavior_intel:     agent2,
      product_rec:        agent3,
      signal_classifier:  agent4,
      social_proof:       agent5,
    },
    // Pass raw strings for frontend
    agent1: a1raw?.json?.choices?.[0]?.message?.content || '{}',
    agent2: a2raw?.json?.choices?.[0]?.message?.content || '{}',
    agent3: a3raw?.json?.choices?.[0]?.message?.content || '{}',
    agent4: a4raw?.json?.choices?.[0]?.message?.content || '{}',
    agent5: a5raw?.json?.choices?.[0]?.message?.content || '{}',
  }
}];
```

---

## Node 13 — Prompt for parent AI (Code Node)

```javascript
const data = $input.first().json;
const { customer_profile: cp, session_signals: ss, agents, _meta, _db } = data;

const suppress = _meta?.suppress;
const suppression_reason = _meta?.suppression_reason;

const systemPrompt = `You are the Parent AI Orchestrator for CogitX, an Indian e-commerce engagement engine.
You receive outputs from 5 specialist AI agents and must make the final engagement decision.

Your job: decide WHETHER to send a message, WHEN, through which CHANNEL, and WRITE the actual message copy.

OUTPUT FORMAT — return only this JSON:
{
  "decision": "<send_now | send_in_2hr | send_tomorrow_morning | suppress>",
  "channel": "<whatsapp | push | email | null>",
  "message_type": "<price_alert | stock_warning | offer_unlock | emi_nudge | comparison_help | reengagement | null>",
  "message": "<the actual message text to send — personalised, natural, concise>",
  "reasoning": "<1-2 sentence explanation of your decision>",
  "suppression_reason": "<only if suppressed, otherwise null>"
}

RULES:
- If suppress=true in meta, return decision=suppress with the suppression_reason
- WhatsApp: warm, conversational, use ₹ symbol, max 3 sentences, can use 1-2 emojis
- Push: very short, max 10 words, high urgency feel
- Email: slightly longer, professional but friendly, include subject line context
- Never sound robotic or generic — use the customer's name, specific product, specific price
- If stock_count < 20 → mention scarcity
- If offer_expiry is soon (within 3 days) → create urgency
- high_value segments → exclusive/VIP tone
- new_visitor → welcoming/helpful tone
- lapsed → re-engagement/we-miss-you tone`;

const userMessage = `SUPPRESSION CHECK: ${suppress ? `SUPPRESS — reason: ${suppression_reason}` : 'Not suppressed — proceed with engagement'}

CUSTOMER PROFILE:
${JSON.stringify(cp, null, 2)}

SESSION SIGNALS:
- SKU Viewed: ${ss.sku_viewed} (viewed ${ss.times_viewed_this_sku_in_7_days}x this week)
- Traffic Source: ${ss.traffic_source}
- Search Query: "${ss.search_query || 'none'}"
- Scroll Depth: ${ss.scroll_depth_percent}%
- Cart State: ${ss.cart_state}
- Wishlist: ${ss.wishlist_contains_this_sku}
- Heatmap Hotspots: ${(ss.heatmap_hotspots || []).join(', ')}
- Session Actions: ${(ss.session_actions || []).join(', ')}
${ss.upcoming_sale ? `- Upcoming Sale: ${ss.upcoming_sale}` : ''}

AGENT INTELLIGENCE:
Agent 1 (Customer Score): ${JSON.stringify(agents.customer_score)}
Agent 2 (Behaviour Intel): ${JSON.stringify(agents.behavior_intel)}
Agent 3 (Product Rec): ${JSON.stringify(agents.product_rec)}
Agent 4 (Signal Classifier): ${JSON.stringify(agents.signal_classifier)}
Agent 5 (Social Proof): ${JSON.stringify(agents.social_proof)}

PRODUCT CONTEXT:
${JSON.stringify(_db.current_product, null, 2)}

Make the final engagement decision. Return JSON only.`;

return [{
  json: {
    ...data,
    _prompt: {
      system: systemPrompt,
      user: userMessage
    }
  }
}];
```

---

## Node 14 — Parent AI (HTTP Request → Groq)

**Body (JSON — Expression mode):**
```json
={
  {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.4,
    "max_tokens": 800,
    "response_format": { "type": "json_object" },
    "messages": [
      {
        "role": "system",
        "content": "={{ $input.first().json._prompt.system }}"
      },
      {
        "role": "user",
        "content": "={{ $input.first().json._prompt.user }}"
      }
    ]
  }
}
```

---

## Node 15 — Format response (Code Node)

```javascript
const groqResponse = $input.first().json;
const base = $('Prompt for parent AI').first().json;

// Parse the Parent AI decision
let decision;
try {
  const content = groqResponse?.choices?.[0]?.message?.content;
  decision = typeof content === 'string' ? JSON.parse(content) : content;
} catch {
  decision = {
    decision: 'suppress',
    channel: null,
    message_type: null,
    message: 'Unable to generate decision — AI parse error.',
    reasoning: 'Parent AI returned unparseable response.',
    suppression_reason: 'system_error'
  };
}

// Final response shape — exactly what the frontend expects
return [{
  json: {
    agent1: base.agent1,
    agent2: base.agent2,
    agent3: base.agent3,
    agent4: base.agent4,
    agent5: base.agent5,
    decision: {
      decision:          decision.decision          || 'suppress',
      channel:           decision.channel           || null,
      message_type:      decision.message_type      || null,
      message:           decision.message           || '',
      reasoning:         decision.reasoning         || '',
      suppression_reason: decision.suppression_reason || null,
    }
  }
}];
```

---

## Node 16 — Respond to Webhook
- Respond With: **First Incoming Item**
- Response Code: 200

---

## Airtable Setup Notes

Your Airtable base should have 3 tables matching the Excel sheets:
- `products` — 25 SKUs with all product fields
- `collab_signals` — collaborative filtering signals per SKU
- `send_intelligence` — optimal send times per segment

The Airtable node credentials: create an Airtable Personal Access Token at airtable.com/create/tokens with `data.records:read` scope on your base.
