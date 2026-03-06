/**
 * FruitMD Offline Knowledge Base
 * Pre-set replies for common fruit questions when Gemini API is unavailable.
 * Uses keyword matching with weighted scoring to find the best response.
 */

const KNOWLEDGE_BASE = [
  // ─── Freshness ───────────────────────────────────────────
  {
    keywords: ['fresh', 'freshness', 'mango fresh', 'tell if fresh', 'know if fresh', 'mango ready', 'ripe', 'ripeness'],
    topic: 'mango',
    reply: `🥭 How to Tell if a Mango is Fresh:

Here are the key signs to look for:

1. Squeeze Test — Gently press the mango. A fresh one is firm but yields slightly, not mushy.
2. Smell the Stem — A sweet, fragrant aroma near the stem = fresh and ripe! No smell = not yet ready.
3. Color Cues — Depending on variety, look for golden-yellow, orange, or red blush tones.
4. No Black Spots — Dark spots may indicate fungal disease. Our model specifically detects this!
5. Weight — A fresh mango feels heavy for its size (more juice!).
6. Skin Integrity — No bruising, soft spots, or signs of decay.

💡 FruitMD detects: Fresh, Bruised, Black Spot, and Rotten conditions in mangoes.

— Dr. FruitMD 🩺`,
  },
  {
    keywords: ['fresh', 'freshness', 'apple fresh', 'tell if apple', 'apple ready', 'apple quality', 'ripe', 'ripeness'],
    topic: 'apple',
    reply: `🍎 How to Tell if an Apple is Fresh:

Here's your diagnostic checklist:

1. Color — Vibrant, uniform coloring for the variety. No dull or faded patches.
2. Firmness — Press gently — fresh apples are firm and crisp. Soft spots = deteriorating.
3. Skin Check — Smooth skin free from scab (rough, dark patches) or bruise marks.
4. Stem Area — No mold or decay around the stem.
5. Seed Color — Cut one open: brown/dark seeds = mature; white seeds = picked too early.
6. Aroma — Pleasant, slightly sweet smell. Fermented odor = rot.

💡 FruitMD detects: Fresh, Bruised, Rot, and Scab conditions in apples.

— Dr. FruitMD 🩺`,
  },
  {
    keywords: ['fresh', 'freshness', 'orange fresh', 'tell if orange', 'orange ready', 'orange quality', 'citrus'],
    topic: 'orange',
    reply: `🍊 How to Tell if an Orange is Fresh:

1. Weight — Pick it up; a fresh orange feels heavy for its size (more juice inside!).
2. Firmness — Firm skin with slight give. Too soft = overripe or internal decay.
3. Color — Bright, uniform orange. Dull or brown patches = aging.
4. Skin Texture — Slightly porous is normal. Wrinkled or excessively soft skin = old.
5. Smell — Fresh citrus aroma at the stem end = good sign!
6. No Mold — Green or white fuzzy spots = mold growth. Discard immediately.

💡 FruitMD detects: Fresh, Bruised, Mold, and Overripe conditions in oranges.

— Dr. FruitMD 🩺`,
  },
  {
    keywords: ['fresh', 'freshness', 'grape fresh', 'grapes fresh', 'tell if grape', 'grape quality'],
    topic: 'grape',
    reply: `🍇 How to Tell if Grapes are Fresh:

1. Stem Color — Green, flexible stems = fresh. Brown, dry stems = old.
2. Firmness — Plump, firm berries that resist a gentle squeeze.
3. Bloom — A whitish powdery coating (bloom) is natural and means they haven't been over-handled.
4. Color — Uniform, vibrant color. Green grapes should be yellowish-green when ripe.
5. No Mold — Check near the stem cluster for fuzzy grey or white mold.
6. Attachment — Grapes should stay firmly on the stem when shaken.

💡 FruitMD detects: Fresh, Bruised, Mold, and Rot conditions in grapes.

— Dr. FruitMD 🩺`,
  },
  {
    keywords: ['fresh', 'freshness', 'banana fresh', 'tell if banana', 'banana ready', 'banana quality', 'ripe banana', 'unripe banana'],
    topic: 'banana',
    reply: `🍌 How to Tell if a Banana is Fresh:

1. Color — Bright yellow = ripe and fresh. Green = unripe. Brown spots = overripe.
2. Firmness — Firm but not hard. Mushy = overripe.
3. Stem — Intact, greenish stem. A very dark or mushy stem = aging.
4. Aroma — Sweet, pleasant banana smell = perfect ripeness.
5. No Large Brown Patches — Small freckles are fine, large dark areas = overripe or bruised.
6. Peel Integrity — Splitting peel = too ripe for fresh eating (great for baking though!).

💡 FruitMD detects: Fresh, Bruised, Overripe, and Unripe conditions in bananas.

— Dr. FruitMD 🩺`,
  },
  // ─── Rot & Spoilage ─────────────────────────────────────
  {
    keywords: ['rot', 'rotten', 'spoil', 'decay', 'apple rot', 'cause rot', 'go bad', 'brown', 'mold'],
    reply: `🍎 What Causes Fruits to Rot Faster:

As your fruit doctor, here's the diagnosis:

1. Ethylene Gas — Fruits like apples produce ethylene, which accelerates ripening (and rotting) of nearby fruits.
2. Temperature — Warm environments speed up decay. Most fruits last 2-3× longer refrigerated.
3. Bruising — Physical damage creates entry points for bacteria and mold.
4. Moisture — Excess humidity encourages fungal growth. Don't wash fruits until ready to eat!
5. Contact Spread — One rotten fruit contaminates neighbors. The saying "one bad apple spoils the bunch" is literally true.
6. Oxygen Exposure — Cut fruits oxidize and brown quickly.

💊 Prescription: Store in a cool, dry place. Separate ethylene-producing fruits. Remove damaged ones immediately.

— Dr. FruitMD 🩺`,
  },
  // ─── Storage ─────────────────────────────────────────────
  {
    keywords: ['store', 'storage', 'keep fresh', 'preserve', 'last longer', 'shelf life', 'refrigerate', 'fridge'],
    reply: `🧊 Fruit Storage Tips — Dr. FruitMD's Prescription:

🍎 Apples:
- Refrigerate at 1–4°C (33–39°F) → lasts 4–6 weeks
- Keep away from strong-smelling foods (they absorb odors)
- Store in a plastic bag with holes for air circulation

🍊 Oranges:
- Room temp: up to 1 week. Refrigerated: up to 3 weeks
- Keep dry — moisture invites mold
- Don't stack them tightly; allow airflow

🥭 Mangoes:
- Unripe: Leave at room temperature until ripe (2–5 days)
- Ripe: Refrigerate for up to 5 days
- Cut mango: Airtight container in fridge, use within 3 days
- Freeze slices for up to 6 months!

🍇 Grapes:
- Refrigerate immediately — unwashed, in a ventilated bag
- Lasts 1–2 weeks when kept cold
- Wash only before eating (moisture speeds mold)

🍌 Bananas:
- Room temp until ripe, then refrigerate to slow further ripening
- Peel darkens in fridge but flesh stays good 3–5 more days
- Wrap stems in cling wrap to slow ethylene release
- Freeze ripe bananas (peeled) for smoothies/baking

General Rules:
✅ Don't wash until ready to eat
✅ Keep ethylene producers (apples, bananas) separate from others
✅ Check daily and remove any spoiling fruit
✅ Paper bags = slow ripening; plastic bags = traps moisture
✅ Crisper drawer with low humidity is ideal

— Dr. FruitMD 🩺`,
  },
  // ─── Grading ─────────────────────────────────────────────
  {
    keywords: ['grade', 'grading', 'grade a', 'grade b', 'grade c', 'quality', 'classification', 'reject'],
    reply: `🏆 Fruit Quality Grading System — Dr. FruitMD Explains:

Grade A (Premium):
- Perfect shape, uniform color
- No blemishes, bruises, or defects
- Optimal firmness and size
- Ideal for fresh consumption and premium markets

Grade B (Standard):
- Minor cosmetic imperfections (small spots, slight color variation)
- Good firmness and flavor
- Suitable for regular retail sale
- Still excellent for eating!

Grade C (Economy):
- Noticeable blemishes, irregular shape
- May have minor soft spots
- Better for cooking, juicing, or processing
- Often sold at discount

Reject:
- Significant damage, mold, or pest infestation
- Unsafe or unpleasant for consumption
- Should be composted, not sold

💡 Key Factors: Size, color uniformity, firmness, surface defects, pest damage, and disease presence.

— Dr. FruitMD 🩺`,
  },
  // ─── Nutrition — Mango ───────────────────────────────────
  {
    keywords: ['nutrition', 'nutritional', 'vitamin', 'health benefit', 'healthy', 'calorie', 'mango nutrition', 'mango benefit'],
    topic: 'mango',
    reply: `🥭 Mango Nutrition Profile — Dr. FruitMD's Report:

Per 1 cup (165g) of sliced mango:
| Nutrient | Amount |
|----------|--------|
| Calories | 99 kcal |
| Vitamin C | 67% of daily value |
| Vitamin A | 10% DV |
| Folate | 18% DV |
| Fiber | 2.6g |
| Sugar | 22.5g (natural) |

Key Health Benefits:
🛡️ Immune Boost — Packed with Vitamin C and antioxidants
👁️ Eye Health — Rich in beta-carotene (Vitamin A)
🫄 Digestion — Contains enzymes (amylases) that aid digestion
❤️ Heart Health — Potassium and magnesium support heart function
🧬 Skin Health — Vitamin C promotes collagen production

⚠️ Note: Mangoes are high in natural sugar. Moderate intake if diabetic.

— Dr. FruitMD 🩺`,
  },
  // ─── Nutrition — Apple ───────────────────────────────────
  {
    keywords: ['nutrition', 'nutritional', 'vitamin', 'health benefit', 'healthy', 'calorie', 'apple nutrition', 'apple benefit'],
    topic: 'apple',
    reply: `🍎 Apple Nutrition Profile — Dr. FruitMD's Report:

Per 1 medium apple (182g):
| Nutrient | Amount |
|----------|--------|
| Calories | 95 kcal |
| Vitamin C | 14% of daily value |
| Fiber | 4.4g (17% DV) |
| Potassium | 6% DV |
| Vitamin K | 5% DV |
| Sugar | 19g (natural) |

Key Health Benefits:
🫀 Heart Health — Soluble fiber lowers cholesterol
🧠 Brain Health — Quercetin antioxidant protects neurons
🦠 Gut Health — Pectin acts as a prebiotic for good bacteria
⚖️ Weight Management — High fiber + water = filling & low calorie
🩸 Blood Sugar — Polyphenols may improve insulin sensitivity

💡 Pro Tip: Eat the skin! That's where most of the fiber and antioxidants are.

— Dr. FruitMD 🩺`,
  },
  // ─── Overripe Detection ──────────────────────────────────
  {
    keywords: ['scab', 'black spot', 'disease', 'fungal', 'defect', 'bruise', 'bruised', 'damage', 'overripe', 'spot'],
    reply: `🔍 Fruit Defects — Dr. FruitMD's Diagnostic Guide:

🍎 Apple Conditions:
- Scab — Rough, dark olive-to-brown patches on skin caused by Venturia inaequalis fungus. Affects appearance but mildly-scabbed fruit is often safe to eat (peel first).
- Bruised — Soft, discolored areas from physical impact. Brown underneath the skin. Eat quickly or cut away damaged area.
- Rot — Soft, spreading brown/black decay, often with mold. Do NOT consume — compost it.
- Fresh — Firm, vibrant skin, no defects. Ready to enjoy! ✅

🥭 Mango Conditions:
- Black Spot — Dark spots caused by anthracnose fungus or bacterial black spot. Minor spots can be cut away; heavy spotting = discard.
- Bruised — Soft, darkened patches from handling damage. Use quickly — bruises accelerate spoilage.
- Rotten — Sour/fermented smell, oozing, slimy texture. Do NOT eat — compost immediately.
- Fresh — Firm flesh, sweet aroma, no discoloration. Perfect! ✅

Can You Still Eat Them?
✅ Light bruising/scab: Cut away affected area, rest is fine
⚠️ Moderate damage: Use for cooking, smoothies, or jams
❌ Rot/mold/fermented smell: Discard immediately

💡 Prevention: Handle fruit gently, store properly, and check daily.

— Dr. FruitMD 🩺`,
  },
  // ─── Cultivation / Growing ───────────────────────────────
  {
    keywords: ['grow', 'plant', 'cultivate', 'cultivation', 'farm', 'agriculture', 'tree', 'harvest', 'orchard'],
    reply: `🌱 Fruit Cultivation Tips — Dr. FruitMD's Advice:

🍎 Apple Growing Basics:
- Climate: Temperate, needs winter chill (800–1000 hours below 7°C)
- Soil: Well-drained loamy soil, pH 6.0–7.0
- Sunlight: Full sun (6+ hours daily)
- Spacing: 4–8m between trees
- Harvest: Usually August–November depending on variety
- Tip: Most apples need a pollinator variety nearby!

🥭 Mango Growing Basics:
- Climate: Tropical/subtropical, 24–30°C ideal
- Soil: Deep, well-drained, slightly acidic (pH 5.5–7.5)
- Sunlight: Full sun essential
- Water: Regular during growth, reduce before flowering
- Harvest: 3–6 months after flowering
- Tip: Grafted trees fruit in 3–4 years vs 5–8 for seedlings

General Best Practices:
🐛 Monitor for pests regularly
💧 Water deeply but infrequently
✂️ Prune annually for airflow and light
🧪 Test soil and fertilize appropriately

— Dr. FruitMD 🩺`,
  },
  // ─── FruitMD / About ────────────────────────────────────
  {
    keywords: ['who are you', 'what are you', 'about you', 'your name', 'fruitmD', 'what can you do', 'help', 'what do you do'],
    reply: `🩺 Hello! I'm Dr. FruitMD — The Fruit Doctor!

I'm an AI-powered fruit quality assistant specializing in:

🍎 Apple & Mango Quality Assessment
- Quality detection (Fresh, Bruised, Rot, Scab, Black Spot, Rotten)
- Quality grading (Grade A, B, C, Reject)

📋 What I Can Help With:
- 🔍 Identifying fruit quality and defects
- 🏆 Understanding fruit grading systems
- 🧊 Storage and preservation tips
- 💊 Nutritional information
- 🌱 Agricultural and cultivation advice
- 📊 Interpreting your detection results

Try asking me:
- "How to tell if a mango is ripe?"
- "What causes apples to rot?"
- "Tips for storing fruit longer"
- "What does Grade A mean?"

I'm currently running in offline mode with my built-in knowledge base, but I'm still happy to help! 🍎🥭

— Dr. FruitMD 🩺`,
  },
  // ─── Greetings ───────────────────────────────────────────
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'sup', 'yo', 'greetings'],
    reply: `👋 Hello there! Welcome to FruitMD! 🩺

I'm Dr. FruitMD, your AI fruit health specialist. I'm here to help you with anything related to fruit quality, ripeness, grading, and care.

Here are some things you can ask me:
- 🥭 "How do I tell if a mango is ripe?"
- 🍎 "What makes apples rot faster?"
- 🧊 "How should I store my fruits?"
- 🏆 "Explain fruit grading to me"
- 💊 "What are the health benefits of mangoes?"

What would you like to know today? 😊

— Dr. FruitMD 🩺`,
  },
  // ─── Thanks ──────────────────────────────────────────────
  {
    keywords: ['thank', 'thanks', 'thank you', 'thx', 'appreciate', 'helpful', 'great answer'],
    reply: `😊 You're very welcome! I'm always happy to help with fruit-related questions.

Remember, healthy fruits = healthy you! 🍎🥭

If you have any more questions about fruit quality, ripeness, storage, or nutrition — don't hesitate to ask. I'm here for you!

— Dr. FruitMD 🩺`,
  },
  // ─── Tell me more / Summary ──────────────────────────────
  {
    keywords: ['tell me more', 'more info', 'elaborate', 'explain more', 'details', 'more details'],
    reply: `📚 I'd be happy to dive deeper! Here are some popular topics I can elaborate on:

🥭 Mangoes: Ripeness stages, varieties (Alphonso, Carabao, Kent), storage methods, nutritional breakdown
🍎 Apples: Variety guide (Fuji, Gala, Granny Smith), browning prevention, cider-making basics
🏆 Quality Grading: Detailed criteria for each grade, commercial standards, inspection methods
🧊 Preservation: Freezing, dehydrating, canning, jam-making
🌱 Growing: Soil prep, pest management, organic methods, harvest timing

Just ask about any specific topic and I'll give you a thorough breakdown! 😊

— Dr. FruitMD 🩺`,
  },
  // ─── Tips / General advice ───────────────────────────────
  {
    keywords: ['tip', 'tips', 'advice', 'suggest', 'recommendation', 'best practice', 'what should i do'],
    reply: `💡 Dr. FruitMD's Top Fruit Tips:

1. The Sniff Test — Always smell near the stem. Sweet aroma = ripe, no smell = not ready, sour smell = overripe.

2. The 1-Bad-Apple Rule — Remove any damaged fruit immediately. Ethylene gas from one spoiling fruit accelerates decay in others.

3. Room Temp → Fridge — Let fruit ripen at room temperature, then refrigerate to slow aging. Best of both worlds!

4. Don't Pre-Wash — Washing adds moisture that promotes mold. Wash just before eating.

5. Paper Bag Trick — To ripen fruit faster, place it in a paper bag with a banana. The trapped ethylene works wonders!

6. Freeze the Surplus — Slice ripe fruit and freeze on a tray first (prevents clumping), then transfer to bags. Lasts 6+ months!

7. Eat the Rainbow — Different colored fruits = different nutrients. Variety is key! 🌈

— Dr. FruitMD 🩺`,
  },
  // ─── What should I do next ───────────────────────────────
  {
    keywords: ['what next', 'do next', 'next step', 'what now'],
    reply: `🗺️ What to Do Next — Dr. FruitMD Suggests:

Based on what FruitMD can help with, here are some next steps:

📸 Scan Your Fruits — Head to the Detect page to upload a fruit photo for quality analysis.

📊 Check Your Dashboard — View trends, statistics, and recent scan results.

📋 Review History — Look at past detections and track quality over time.

📈 Generate Reports — Export data and summaries for your records.

❓ Ask Me Anything — I can help with:
- Ripeness identification
- Storage recommendations
- Nutritional questions
- Grading explanations

What interests you most? 😊

— Dr. FruitMD 🩺`,
  },
  // ─── Give me a summary ───────────────────────────────────
  {
    keywords: ['summary', 'summarize', 'sum up', 'overview', 'recap'],
    reply: `📋 FruitMD Quick Summary:

🩺 What FruitMD Does:
An AI-powered fruit quality detection system that analyzes apples and mangoes for ripeness and quality.

📊 Detection Categories:
- Ripeness: Ripe, Unripe, Overripe, Rotten
- Quality: Grade A, Grade B, Grade C, Reject

🔑 Key Features:
- 📸 Single & batch photo detection
- 📊 Dashboard with real-time statistics
- 📋 History tracking & export
- 📈 Reports & analytics
- 🩺 AI chatbot (that's me!) for expert advice

💡 Quick Tips:
- Use good lighting for photo scans
- Capture the whole fruit clearly
- Check the dashboard regularly for trends
- Export reports for record-keeping

Need specifics on any of these? Just ask! 😊

— Dr. FruitMD 🩺`,
  },
];

/**
 * Attempt to match user input to a pre-set reply from the knowledge base.
 * Uses keyword overlap scoring with topic boosting.
 * Returns { reply, confidence } or null if no good match found.
 */
export function getOfflineReply(userMessage) {
  const input = userMessage.toLowerCase().trim();
  const inputWords = input.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      // Exact phrase match (highest value)
      if (input.includes(kw)) {
        score += kw.split(/\s+/).length * 3; // multi-word phrases score higher
      }
      // Individual word match
      for (const word of inputWords) {
        if (kw === word) score += 1;
      }
    }

    // Boost if input mentions the topic
    if (entry.topic) {
      if (input.includes(entry.topic)) score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Require a minimum confidence score to return a match
  const confidence = Math.min(bestScore / 8, 1); // normalize to 0-1
  if (bestScore >= 2 && bestMatch) {
    return { reply: bestMatch.reply, confidence, offline: true };
  }

  return null;
}

/**
 * Generic fallback when no pattern matches at all.
 */
export function getGenericFallback() {
  const fallbacks = [
    `🩺 I'm currently in offline mode due to high demand on the AI service, but I can still help with common fruit questions!

Try asking me about:
- 🍎🍊🥭🍇🍌 Fruit ripeness & freshness
- 🏆 Fruit quality grading (A, B, C)
- 🧊 Storage and preservation tips
- 💊 Nutritional information
- 🌱 Growing and cultivation
- 🔍 Spotting overripe fruit

Just rephrase your question around these topics and I'll do my best! 😊

— Dr. FruitMD 🩺`,
    `🩺 The AI service is experiencing high demand right now, so I'm running on my built-in knowledge!

I can answer questions about:
• How to tell if fruits are ripe
• What causes rot and spoilage
• Fruit storage tips
• Nutritional facts for all 5 supported fruits
• Fruit quality grades explained
• Growing and harvest advice

Try one of these topics — I've got great pre-loaded answers! 🍎🍊🥭🍇🍌

— Dr. FruitMD 🩺`,
  ];

  return {
    reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    confidence: 0,
    offline: true,
  };
}
