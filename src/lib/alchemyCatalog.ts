/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlchemyEntry,
  AlkaliType,
  RecipeDraft,
} from "../types";

// ── Recipe starter drafts ──────────────────────────────────────────────────

const SHAMPOO_BAR_DRAFT: RecipeDraft = {
  name: "Gentle Shampoo Bar",
  status: "draft",
  favorite: false,
  notes: "A conditioning bar built for hair: high fatty-oil load, moderate superfat, no harsh cleansing spike.",
  lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 8, lyeConcentrationPercent: 33 },
  oils: [
    { ingredientId: "olive_oil", weightGrams: 150 },
    { ingredientId: "coconut_oil", weightGrams: 100 },
    { ingredientId: "castor_oil", weightGrams: 60 },
    { ingredientId: "avocado_oil", weightGrams: 90 },
    { ingredientId: "shea_butter", weightGrams: 100 },
  ],
  liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
  additives: [],
};

const LIQUID_SOAP_DRAFT: RecipeDraft = {
  name: "Liquid Soap (KOH)",
  status: "draft",
  favorite: false,
  notes: "A castile-leaning liquid soap paste base made with potassium hydroxide; dilute the cooked paste before use.",
  lyeSettings: { alkaliType: AlkaliType.KOH, superfatPercent: 3, kohPurityPercent: 90, waterToLyeRatio: 3 },
  oils: [
    { ingredientId: "coconut_oil", weightGrams: 200 },
    { ingredientId: "olive_oil", weightGrams: 150 },
    { ingredientId: "castor_oil", weightGrams: 75 },
    { ingredientId: "sweet_almond_oil", weightGrams: 75 },
  ],
  liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
  additives: [],
};

const SALT_BAR_DRAFT: RecipeDraft = {
  name: "Salt (Soleseife) Bar",
  status: "draft",
  favorite: false,
  notes: "A very high-coconut, high-superfat bar loaded with fine sea salt for a hard, dense, mineral-rich bar.",
  lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 18, lyeConcentrationPercent: 33 },
  oils: [
    { ingredientId: "coconut_oil", weightGrams: 400 },
    { ingredientId: "olive_oil", weightGrams: 50 },
    { ingredientId: "castor_oil", weightGrams: 25 },
    { ingredientId: "shea_butter", weightGrams: 25 },
  ],
  liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
  additives: [
    {
      ingredientId: "sea_salt",
      weightGrams: 250,
      supplierUsageVerified: true,
      cosmeticGradeVerified: true,
    },
  ],
};

const HOT_PROCESS_DRAFT: RecipeDraft = {
  name: "Hot Process Bar",
  status: "draft",
  favorite: false,
  notes: "A balanced everyday bar cooked through gel/saponification on the stove so it is ready to use sooner.",
  lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 5, lyeConcentrationPercent: 33 },
  oils: [
    { ingredientId: "olive_oil", weightGrams: 175 },
    { ingredientId: "coconut_oil", weightGrams: 125 },
    { ingredientId: "shea_butter", weightGrams: 100 },
    { ingredientId: "avocado_oil", weightGrams: 60 },
    { ingredientId: "castor_oil", weightGrams: 40 },
  ],
  liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
  additives: [],
};

// ── Shared source refs ─────────────────────────────────────────────────────

const NAOH_SDS_REF = { label: "NIOSH Pocket Guide: Sodium Hydroxide", url: "https://www.cdc.gov/niosh/npg/npgd0565.html" };
const KOH_SDS_REF = { label: "PubChem: Potassium Hydroxide", url: "https://pubchem.ncbi.nlm.nih.gov/compound/Potassium-hydroxide" };

// ── Catalog ─────────────────────────────────────────────────────────────────

export const ALCHEMY_CATALOG_VERSION = "1.0.0";

export const ALCHEMY_CATALOG: AlchemyEntry[] = [
  // ── Recipes ────────────────────────────────────────────────────────────
  {
    id: "shampoo-bar",
    kind: "recipe",
    title: "Gentle Shampoo Bar",
    summary: "A conditioning cold-process bar built to be kind to hair and scalp.",
    difficulty: "intermediate",
    overview:
      "Shampoo bars swap a bottle of liquid detergent for a solid bar of soap, but hair doesn't want the same aggressive cleansing skin does. This formula leans on soft, conditioning oils (olive, avocado, shea) with just enough coconut oil and castor oil for lather and slip, and a higher-than-usual superfat so the bar doesn't strip natural oils from hair.",
    steps: [
      {
        title: "Weigh your oils and lye",
        detail: "Measure the olive, coconut, castor, avocado oil, and shea butter by weight, and separately measure your lye and water.",
        proNote: "Weigh to at least 1g precision — this formula's lye discount is tuned to 8% superfat, and small errors compound at this batch size.",
        caution: "Always add lye to water, never water to lye — adding water to lye can cause a violent, boiling reaction.",
      },
      {
        title: "Melt the hard fats",
        detail: "Gently melt the shea butter and coconut oil together in your pot until fully liquid.",
        proNote: "Keep melting heat under 55°C (130°F) so you don't degrade the shea butter's unsaponifiables.",
      },
      {
        title: "Mix in the soft oils",
        detail: "Stir in the olive, castor, and avocado oil once the hard fats are melted. This cools the mixture toward working temperature.",
      },
      {
        title: "Combine lye solution and oils",
        detail: "Once both the lye solution and oils are around 38–46°C (100–115°F), pour the lye solution into the oils.",
        caution: "Wear gloves and eye protection whenever you handle the lye solution — it is caustic and will burn skin on contact.",
      },
      {
        title: "Blend to trace",
        detail: "Use a stick blender in short bursts until the mixture thickens to a light pudding-like 'trace'.",
        proNote: "Stop at a light trace — this recipe has enough soft oil that overmixing will accelerate trace faster than you expect.",
      },
      {
        title: "Pour and insulate",
        detail: "Pour into your mold, tap out air bubbles, cover, and insulate lightly with a towel for the first 24 hours.",
      },
      {
        title: "Unmold and cure",
        detail: "Unmold after 24–48 hours, cut into bars, and cure on a rack for 4–6 weeks before use.",
        proNote: "Because this bar carries an 8% superfat, give it the full 6 weeks — extra free oil needs more time to let water evaporate for a harder, longer-lasting bar.",
      },
    ],
    chemistry:
      "Hair fiber has a different lipid and protein surface chemistry than skin, so the goal here is a lower cleansing/higher conditioning fatty acid ratio than a typical body bar — achieved by keeping coconut oil (lauric/myristic, the main cleansing acids) modest relative to oleic-rich oils. The 8% superfat leaves a slightly higher fraction of unreacted triglycerides than a standard 5% bar, which helps counteract the alkalinity of even a well-cured bar (finished pH is typically 9–10) so hair cuticles aren't left excessively raised. Castor oil's ricinoleic acid contributes disproportionately to lather stability and bubble size despite its small weight fraction.",
    proTips: [
      "Follow with a diluted apple cider vinegar rinse (roughly 1 tbsp per cup of water) to help reseal the hair cuticle after the bar's mild alkalinity.",
      "If hair feels waxy after switching from liquid shampoo, that's usually residue from prior silicone products reacting with mineral-rich water, not the bar itself — a chelator like sodium citrate in a later batch can help.",
      "Test cure at 4 weeks with a small piece; if it lathers thin, give it another 2 weeks — later cure noticeably improves lather density in high-conditioning-oil bars like this one.",
    ],
    glossary: [
      { term: "trace", definition: "The point where the soap batter has thickened enough to leave a faint trail when drizzled across the surface." },
      { term: "superfat", definition: "The percentage of oil left deliberately unreacted with lye, so the finished soap doesn't feel drying." },
      { term: "cure", definition: "The 4–6 week resting period after unmolding where water evaporates and the bar hardens and mellows." },
      { term: "lye discount", definition: "Another name for superfat — using less lye than a 1:1 chemical match to leave some oil unreacted." },
      { term: "unsaponifiables", definition: "The portion of an oil or butter that doesn't react with lye (e.g. vitamins and sterols in shea butter), which can be degraded by excessive heat." },
    ],
    safety: [
      "Sodium hydroxide (lye) solution is caustic and can cause serious chemical burns; always wear gloves and eye protection.",
      "Mix lye into water, never the reverse, and work in a ventilated area — the reaction releases irritating fumes briefly.",
      "Keep the raw batter away from children and pets until it has fully saponified and cured.",
    ],
    sources: [NAOH_SDS_REF],
    starterDraft: SHAMPOO_BAR_DRAFT,
  },
  {
    id: "liquid-soap",
    kind: "recipe",
    title: "Liquid Soap (KOH)",
    summary: "A potassium-hydroxide soap paste that dilutes into pourable liquid soap.",
    difficulty: "advanced",
    overview:
      "Liquid soap uses potassium hydroxide (KOH) instead of sodium hydroxide (NaOH) because potassium soaps are naturally softer and more water-soluble — sodium soaps stay solid bars, potassium soaps become a paste you dilute into liquid. This recipe cooks a low-superfat paste, then you dissolve it in hot water afterward to your preferred thickness.",
    steps: [
      {
        title: "Weigh oils and KOH solution",
        detail: "Measure the coconut, olive, castor, and sweet almond oil, and separately prepare your KOH lye solution.",
        proNote: "KOH is typically sold at ~90% purity — this formula's KOH amount is already calculated against that purity, so don't re-adjust unless your flakes state a different purity on the label.",
        caution: "KOH solution runs hotter and is at least as caustic as NaOH solution — treat it with the same respect.",
      },
      {
        title: "Melt and combine",
        detail: "Melt the coconut oil, then combine with the other oils and bring everything to roughly 65–75°C (150–170°F).",
        proNote: "Liquid soap is cooked hotter than typical cold-process bar soap to keep the paste fluid enough to work and to drive saponification to completion.",
      },
      {
        title: "Add lye solution and blend to trace",
        detail: "Pour in the KOH solution and stick-blend. It will trace faster and thicker than bar soap — expect a translucent, taffy-like paste.",
      },
      {
        title: "Cook the paste",
        detail: "Cook the paste in a slow cooker or double boiler, stirring occasionally, until it turns from cloudy to a uniform, glassy, translucent gel — typically 1–4 hours.",
        proNote: "Test for completion with the zap test or by dissolving a small spoonful in hot water and checking it stays clear rather than cloudy or oily.",
        caution: "The paste stays hot and caustic throughout the cook — use heat-resistant, splash-proof containers.",
      },
      {
        title: "Neutralize excess lye if needed",
        detail: "If a diluted test sample still zaps or feels sharp, a small citric acid solution can neutralize the last trace of excess alkali — this is an advanced, optional step and not required if your paste passes clean. (Borax is sometimes added at this stage too, but as a thickener/sequestrant, not a lye neutralizer — it is mildly alkaline itself.)",
      },
      {
        title: "Dilute to liquid soap",
        detail: "Dissolve the cooked paste in hot distilled water, typically 1 part paste to 1–1.5 parts water by weight, stirring until fully dissolved.",
      },
      {
        title: "Rest and filter",
        detail: "Let the diluted soap rest for 24–48 hours, then strain out any undissolved bits before bottling.",
      },
    ],
    chemistry:
      "Potassium ions produce a soap with a much lower melting point and higher water solubility than sodium soaps, because the larger, more polarizable potassium cation packs less efficiently into the crystalline soap lattice that gives sodium bars their solid structure. KOH's higher molecular weight per equivalent of hydroxide (56.1 g/mol vs NaOH's 40.0 g/mol) means more grams of lye are needed for the same neutralization, which is why KOH recipes always specify a purity percentage — commercial flakes run ~90% KOH with the remainder mostly water and carbonate. The paste-then-dilute process happens in two independent, controllable stages: full saponification is verified while the mixture is still concentrated and easy to test, and dilution afterward only changes concentration, not chemistry.",
    proTips: [
      "Run the zap test (touch a tiny bit of diluted paste to your tongue) — a strong electric tingle means unreacted lye remains and the batch needs more cook time.",
      "Dilute low first (e.g. 1:1) and thin further later; it's easy to add more water, impossible to remove it.",
      "Expect liquid soap to look cloudy for the first week — this is normal as trace amounts of unsaponifiables and glycerin settle; it usually clears or can be filtered.",
      "Keep separate stick blenders and pots for KOH batches if you also make NaOH bar soap, to avoid cross-contamination assumptions about alkali type.",
    ],
    glossary: [
      { term: "zap test", definition: "Touching a small diluted sample to the tongue; a sharp electric tingle indicates unreacted lye is still present." },
      { term: "paste", definition: "The thick, translucent, concentrated soap produced by cooking before it is diluted into liquid soap." },
      { term: "dilution ratio", definition: "The ratio of water to soap paste used to thin the paste into pourable liquid soap." },
      { term: "KOH purity", definition: "The percentage of actual potassium hydroxide in commercial flakes, the rest being water/carbonate impurities." },
      { term: "trace", definition: "The point where the soap batter has thickened enough to leave a faint trail when drizzled across the surface." },
    ],
    safety: [
      "KOH solution is highly caustic and generates significant heat when mixed with water — always add lye to water, never the reverse.",
      "The cooking paste stays hot for hours; use containers and utensils rated for prolonged high heat.",
      "Never taste-test (zap test) a batch you suspect is only partially saponified in large amounts — a small touch to the tongue is sufficient and safer than swallowing any amount.",
    ],
    sources: [KOH_SDS_REF],
    starterDraft: LIQUID_SOAP_DRAFT,
  },
  {
    id: "salt-bar",
    kind: "recipe",
    title: "Salt (Soleseife) Bar",
    summary: "An extremely hard, mineral-dense bar made mostly of coconut oil and packed with sea salt.",
    difficulty: "intermediate",
    overview:
      "Salt bars (German: Soleseife, 'brine soap') push coconut oil to its limit and then add fine sea salt directly into the batter. The high superfat keeps the very cleansing, high-coconut-oil base from feeling harsh, and the salt crystallizes throughout the bar, producing a rock-hard, dense bar with a distinctive slick-then-squeaky lather.",
    steps: [
      {
        title: "Weigh oils, lye, and salt",
        detail: "Measure the coconut, olive, castor oil, and shea butter, your lye and water, and the fine sea salt separately.",
        proNote: "Use fine or table-ground sea salt, not coarse crystals — coarse salt won't distribute evenly and creates gritty pockets.",
      },
      {
        title: "Melt and combine oils",
        detail: "Melt the coconut oil and shea butter together, then stir in the olive and castor oil.",
      },
      {
        title: "Mix lye solution into oils",
        detail: "Combine the lye solution with the oils at around 43–49°C (110–120°F).",
        caution: "Wear gloves and eye protection — high-coconut recipes like this one use the same caustic lye as any other bar.",
      },
      {
        title: "Blend to a very light trace",
        detail: "Stick-blend briefly — high coconut oil content means this batter traces fast, sometimes within seconds.",
        proNote: "Stop the moment you see the faintest trace; salt bars seize almost immediately once trace begins, so overblending here is the most common mistake.",
      },
      {
        title: "Fold in the salt immediately",
        detail: "Stir the sea salt in by hand right after reaching light trace, working quickly and evenly.",
      },
      {
        title: "Pour immediately",
        detail: "Pour into individual cavity molds or a lined mold right away — salt bars thicken very fast once salt is added and won't pour cleanly if you wait.",
      },
      {
        title: "Unmold early and cure long",
        detail: "Unmold within 12–24 hours (salt bars harden fast), then cure on a rack for 4–6 weeks, turning occasionally.",
        proNote: "Salt is hygroscopic, so cure salt bars somewhere with good airflow and moderate humidity — they can sweat visible brine droplets in humid conditions.",
      },
    ],
    chemistry:
      "At roughly 80% coconut oil, this formula would be unwearably stripping at a normal 5% superfat, so the superfat is raised to 18% to leave a much larger reserve of free fatty oil that buffers the bar's cleansing action on skin. Sodium chloride at high concentration works by ionic strength: it disrupts the diffuse electric double layer around soap micelles (a 'salting-out' effect, distinct from but related to the salting-out used to purify soap industrially), causing the soap to pack into a denser, harder crystalline structure rather than a softer gel network. This is also why salt bars produce a different lather — smaller, tighter bubbles with a slicker, mineral feel rather than the fluffy lather of a low-coconut bar.",
    proTips: [
      "Pre-warm your salt slightly (or ensure it's bone dry) — damp salt can cause localized overheating pockets in the curing bar.",
      "Individual cavity molds are strongly preferred over loaf molds for salt bars, since cutting a fully hardened salt loaf can crack or crumble it.",
      "A visible white bloom of salt crystals on the surface (not to be confused with soda ash) is cosmetic and can be steamed or wiped off after cure.",
      "Because this is a hard-working coconut-heavy bar, expect a mild but expected 'harshness' flag in any safety analysis — that's inherent to the style, not a formulation error, when balanced by 18% superfat.",
      "The analyzer will also raise an 'abrasive load' note — that is by design: the salt is what gives a salt bar its gentle exfoliating scrub. Dissolve the salt fully into the lye water for a smoother bar, or add it at trace for more texture.",
    ],
    glossary: [
      { term: "salting-out", definition: "Using dissolved salt's ionic strength to compact soap into a denser, harder structure." },
      { term: "seize", definition: "When batter thickens suddenly and dramatically, often too fast to pour cleanly." },
      { term: "hygroscopic", definition: "Tending to absorb moisture from the air — a property of salt that affects how salt bars cure and store." },
      { term: "cavity mold", definition: "A mold with individual bar-shaped compartments, used instead of a single loaf mold." },
      { term: "trace", definition: "The point where the soap batter has thickened enough to leave a faint trail when drizzled across the surface." },
    ],
    safety: [
      "This bar's lye handling carries the same caustic hazards as any cold-process soap — gloves and eye protection are required.",
      "High coconut oil content means this recipe would be harsh on skin without its correspondingly high superfat; do not reduce the superfat below what is specified.",
      "Work quickly once salt is added — the batter can seize and become difficult to pour safely if left too long.",
    ],
    starterDraft: SALT_BAR_DRAFT,
  },
  {
    id: "hot-process",
    kind: "recipe",
    title: "Hot Process Bar",
    summary: "A balanced everyday bar cooked to full saponification on the stove, ready to use in days, not weeks.",
    difficulty: "intermediate",
    overview:
      "Hot process (HP) soap uses the same oils and lye as cold process, but instead of letting saponification finish slowly over weeks of cure, you actively cook the batter through gel phase right after mixing. The result is a rustic-textured bar that's technically safe to use almost immediately, since the lye-oil reaction is driven to completion in the pot rather than over time.",
    steps: [
      {
        title: "Weigh oils and lye",
        detail: "Measure the olive, coconut, shea butter, avocado, and castor oil, and separately measure your lye and water.",
        caution: "Add lye to water, not water to lye, and wear gloves and eye protection.",
      },
      {
        title: "Melt and combine oils",
        detail: "Melt the shea butter and coconut oil, then stir in the olive, avocado, and castor oil.",
      },
      {
        title: "Mix and blend to trace",
        detail: "Combine the lye solution with the oils and stick-blend to a medium trace, like thin pudding.",
      },
      {
        title: "Cook through gel phase",
        detail: "Transfer to a slow cooker on low, or keep in your pot over gentle heat, and cook for 45–75 minutes, stirring occasionally, until the batter turns from opaque and separated-looking to a uniform, translucent, glossy 'mashed potato' texture.",
        proNote: "Watch for the mixture ballooning up in the middle of the cook — that's gel phase actively saponifying; fold it back down rather than removing heat.",
        caution: "The cooked batter is hot (well above boiling water's danger threshold in feel) and still caustic mid-cook — handle with the same care as raw lye.",
      },
      {
        title: "Test for doneness",
        detail: "Do a small zap test on a cooled bit of batter; if it doesn't tingle on the tongue, saponification is complete.",
      },
      {
        title: "Add any final touches",
        detail: "Once cooked, you can stir in fragrance or other heat-stable additions, since gel-phase temperatures have already passed.",
      },
      {
        title: "Pack into the mold",
        detail: "Spoon the thick, cooked soap into your mold and pack it down firmly to reduce air pockets, then smooth the top.",
      },
    ],
    chemistry:
      "Saponification is exothermic and, once given enough heat, becomes self-sustaining as it passes through 'gel phase' — a translucent, near-molten physical state where the soap's fatty acid soaps and residual water form a single homogeneous phase at higher temperature, letting the reaction go to completion much faster than at room temperature. Cold process soap eventually reaches full saponification too, but relies on residual reaction heat and ambient insulation, which is slower and less certain to fully clear; hot process forces the batter through gel with active heat, so the finished bar has a verifiably lower residual free-alkali level sooner. The visual transformation from opaque/separated to glossy/translucent is the direct sensory signature of the fatty acid chains becoming fully deprotonated soap molecules.",
    proTips: [
      "A thin layer of clear liquid ('oil slick') on top mid-cook is normal excess oil working its way through — stir it back in rather than pouring it off.",
      "Hot process bars are naturally more rustic-looking (rougher texture) than cold process; for smoother bars, pack tightly and tap the mold firmly before it sets.",
      "Because saponification is chemically complete after cooking, cure time for HP is mostly about water evaporation for hardness — 1–2 weeks is often enough, though longer never hurts.",
      "Add heat-sensitive fragrance or delicate additives after the cook, once temperatures have dropped from the gel-phase peak, to avoid flashing off scent or discoloring pigments.",
    ],
    glossary: [
      { term: "gel phase", definition: "A hot, translucent physical state soap batter passes through where saponification proceeds rapidly to completion." },
      { term: "zap test", definition: "Touching a small cooled sample to the tongue; a tingle means unreacted lye remains." },
      { term: "trace", definition: "The point where the batter has thickened enough to leave a faint trail when drizzled." },
      { term: "oil slick", definition: "A thin surface layer of excess oil that can appear mid-cook and should be stirred back in." },
    ],
    safety: [
      "The cooking batter remains caustic and very hot throughout the process — use heat-resistant containers and avoid skin contact.",
      "Steam released during the cook can carry trace amounts of lye — cook in a ventilated area and avoid leaning directly over the pot.",
      "Even after gel phase, confirm doneness with a zap test before handling the soap bare-handed.",
    ],
    starterDraft: HOT_PROCESS_DRAFT,
  },

  // ── Techniques ─────────────────────────────────────────────────────────
  {
    id: "gel-phase",
    kind: "technique",
    title: "Gel Phase",
    summary: "The hot, translucent stage soap passes through that speeds up saponification and deepens color.",
    difficulty: "intermediate",
    overview:
      "Gel phase is what happens when a curing batch of soap heats itself up enough (from its own saponification reaction) to become a hot, translucent gel before cooling back into a solid bar. You can encourage it (insulating cold-process soap, or forcing it deliberately in hot process) or avoid it (refrigerating a mold) — both are valid choices depending on the look and cure speed you want.",
    steps: [
      {
        title: "Understand what you're choosing between",
        detail: "Gelled soap looks more translucent, has more vivid colors, and saponifies a bit faster. Ungelled soap looks more opaque and pastel, and some soapers prefer it for milk soaps to avoid scorching sugars.",
      },
      {
        title: "To encourage gel",
        detail: "Pour your cold-process batter into the mold, cover it, and insulate it with towels or place it in a warm oven (off, pilot light only) for the first 12–24 hours.",
        proNote: "Watch the center of the loaf — it should rise slightly and turn glassy/translucent as gel phase passes through it, starting from the middle and moving outward.",
      },
      {
        title: "To prevent gel",
        detail: "Place the mold in the refrigerator or freezer for the first 12–24 hours, or use a water discount to reduce available heat.",
        caution: "Milk soaps and honey/sugar-containing soaps are prone to overheating and scorching if allowed to gel uncontrolled — refrigeration is the standard technique for these.",
      },
      {
        title: "Check for partial gel",
        detail: "A ring or blotchy pattern in the cut bar (translucent center, opaque edges) means the batch partially gelled — this is cosmetic, not a safety issue.",
      },
      {
        title: "Adjust for hot process",
        detail: "In hot process soap, gel phase is intentionally forced with active heat rather than left to happen (or not) passively, since the whole method relies on driving the reaction to completion during the cook.",
      },
    ],
    chemistry:
      "Saponification releases heat, and if that heat is retained (via insulation, thick loaf mass, or added external heat) faster than it escapes, the batch's internal temperature can rise well above ambient, causing the soap to enter a translucent, near-molten physical state — the fatty acid soap and water form a more homogeneous phase at these elevated temperatures, which is also why gelled soap looks more transparent and colors appear more saturated (less light scattering from a less crystalline, more uniform structure). Milk sugars and proteins are heat-sensitive and can scorch (Maillard-type browning) at gel-phase temperatures, which is the chemical reason milk soaps are commonly kept from gelling.",
    proTips: [
      "A partial gel ring is purely cosmetic; it does not indicate a safety or lye-excess problem and does not need to be corrected.",
      "For consistently gelled soap, a slight water discount plus insulation gives more reliable full-loaf gel than insulation alone.",
      "For milk soaps you want to keep pastel, freeze the milk (or milk-containing liquid) before use and refrigerate the mold — both slow the temperature rise that triggers gel.",
      "Silicone molds insulate more than wood or metal, making unintentional gel more likely — factor mold material into your gel/no-gel decision.",
    ],
    glossary: [
      { term: "gel phase", definition: "A hot, translucent state soap batter can pass through during saponification, driven by its own reaction heat." },
      { term: "water discount", definition: "Using less water than the default ratio in a recipe, which affects trace speed, cure time, and heat retention." },
      { term: "partial gel", definition: "A soap where only part of the loaf reached gel-phase temperature, visible as an uneven translucent/opaque pattern when cut." },
    ],
    safety: [
      "An overheating mold (visible cracking, volcanic overflow, or scorched smell) should be moved away from insulation and allowed to cool — this is an overheat risk, not a lye-related hazard by itself.",
      "Do not open a hot, actively gelling mold and touch the batter directly — it is at or above the boiling point of water in the hottest zones.",
    ],
    appliesTo: ["hot-process", "shampoo-bar"],
  },
  {
    id: "mica-swirl",
    kind: "technique",
    title: "Mica Swirl",
    summary: "Coloring and swirling soap batter with cosmetic-grade mica for marbled designs.",
    difficulty: "beginner",
    overview:
      "Mica is a finely ground mineral pigment used to color soap batter without changing its chemistry. Because it doesn't dissolve, swirling small amounts of differently colored batter together (rather than mixing to a single flat color) produces marbled, layered patterns — one of the most approachable ways to make a handmade bar look distinctive.",
    steps: [
      {
        title: "Choose cosmetic-grade mica",
        detail: "Buy mica labeled explicitly for cosmetic/soap use, not craft or nail-art mica, which may contain fillers or dyes not meant for skin contact.",
        caution: "Only use mica from a supplier who provides usage guidance and confirms cosmetic grade — unverified mica is a real safety gap, not a formality.",
      },
      {
        title: "Disperse the mica before adding",
        detail: "Mix each mica powder into a small amount of light oil (like sweet almond or olive oil) until smooth and lump-free before adding it to soap batter.",
        proNote: "A 1:1 mica-to-oil ratio by weight, blended with a mini mixer or fork, avoids the specked, uneven color that comes from adding dry powder directly to batter.",
      },
      {
        title: "Split your batter at trace",
        detail: "Divide your traced batter into separate containers, one per color, leaving one portion uncolored if you want a base color.",
      },
      {
        title: "Color each portion",
        detail: "Stir the dispersed mica into each portion until evenly colored, working quickly since batter is already at trace.",
      },
      {
        title: "Layer and swirl",
        detail: "Pour the colors into the mold in alternating layers or dollops, then drag a skewer or spatula through the batter in a single pass (figure-eight, in-and-out, or spiral pattern) to create the swirl.",
        proNote: "One clean pass through the batter gives a crisper swirl than repeated back-and-forth motion, which tends to muddy colors together.",
      },
      {
        title: "Leave the top alone",
        detail: "Resist smoothing or reworking the top after swirling — the pattern is set once you've dragged your tool through.",
      },
    ],
    chemistry:
      "Mica is a naturally occurring layered silicate mineral, typically coated with iron oxide or titanium dioxide to produce color and shimmer; because it's an insoluble inert pigment rather than a dye, it does not react with or get consumed by the lye, so it has no measurable chemical effect on saponification, unlike acidic or alkaline additives. Dispersing mica in oil first works because the fine particles wet out and separate in a liquid carrier rather than clumping via static or surface tension the way dry powder does when it hits an already-thick batter.",
    proTips: [
      "Some micas (particularly certain reds, oranges, and some blues) can morph or fade under high pH or gel-phase heat — test a small batch first if color accuracy matters.",
      "Titanium dioxide dispersed separately and added to your 'white' portion gives cleaner contrast against colored swirls than relying on undyed batter, which often looks cream or yellow.",
      "For crisper swirl lines, pour colors thicker (closer to medium trace) rather than thin — thin batter blends into muddy colors faster during swirling.",
      "Log your mica usage rate (commonly 0.5–1 teaspoon per pound of oils) per batch — usage rates vary by supplier concentration, so a rate that works for one brand may over- or under-color another.",
    ],
    glossary: [
      { term: "mica", definition: "A finely ground, coated mineral pigment used to add color and shimmer to soap without reacting chemically." },
      { term: "dispersal", definition: "Pre-mixing a powder pigment into a small amount of liquid oil so it blends smoothly into batter." },
      { term: "color morphing", definition: "When a pigment's color shifts or fades due to the soap's pH or heat exposure during cure." },
      { term: "trace", definition: "The point where the soap batter has thickened enough to leave a faint trail when drizzled; colors are usually added at trace." },
    ],
    safety: [
      "Use only cosmetic-grade mica from a supplier who confirms it is meant for skin-contact use, with usage-rate guidance.",
      "Wear a dust mask when measuring dry mica powder — inhaling fine pigment dust is an unnecessary respiratory irritant.",
    ],
    appliesTo: ["shampoo-bar", "hot-process"],
  },
  {
    id: "salting-out",
    kind: "technique",
    title: "Salting Out",
    summary: "Using concentrated salt brine to separate finished liquid soap from glycerin and excess water.",
    difficulty: "advanced",
    overview:
      "Salting out is a purification step used in liquid soap making (and traditional bar soap making) where a strong salt solution is stirred into finished soap to force the soap itself to separate from the water, glycerin, and other dissolved impurities it was cooked in. It's an advanced, optional technique used to produce a cleaner, more concentrated soap base rather than a step every liquid soap maker needs.",
    steps: [
      {
        title: "Start from a fully cooked, zap-negative paste",
        detail: "Salting out only works cleanly on soap that is already fully saponified — verify with a zap test before proceeding.",
      },
      {
        title: "Prepare a saturated brine",
        detail: "Dissolve salt into hot water until no more will dissolve (a saturated brine, roughly 25–26% salt by weight at room temperature).",
      },
      {
        title: "Stir brine into the hot soap",
        detail: "Slowly stir the hot brine into the hot, diluted soap paste while it's still fluid.",
        caution: "Work with both liquids still hot — the soap can seize or separate unevenly if the brine is added cold to hot soap or vice versa.",
      },
      {
        title: "Watch it separate",
        detail: "The mixture will separate into a curdled soap layer floating on top and a cloudy, glycerin-and-salt-rich liquid ('spent lye') below.",
        proNote: "The floating soap curd should look like small, dense, cottage-cheese-like clumps rather than a smooth emulsion — that separation is the whole point of the technique.",
      },
      {
        title: "Skim and rinse the soap curd",
        detail: "Skim the curdled soap off the top, and optionally rinse it briefly with cold water to remove residual salt and glycerin.",
      },
      {
        title: "Remelt the purified soap",
        detail: "Remelt the collected curd gently with fresh water to redissolve it into a cleaner liquid soap or press it into bars.",
      },
    ],
    chemistry:
      "Soap molecules in solution exist as charged, self-assembled micelles kept dispersed partly by their interaction with surrounding water; adding a high concentration of salt ions increases the ionic strength of the solution dramatically, which compresses the electric double layer around each micelle and lowers the solubility of the soap anions (a classic 'salting-out' effect also used in protein purification). Above a threshold salt concentration, the soap's solubility drops below the amount present, so it phase-separates into a distinct, denser soap-rich curd, leaving behind a saltier aqueous phase carrying most of the free glycerin, excess lye, and other water-soluble byproducts of the cook.",
    proTips: [
      "Salting out is how traditional kettle-boiled bar soap (and industrial soap) is purified — it's the same principle scaled down for a home batch.",
      "Reserve the 'spent lye' liquid if you want the glycerin — with further processing it's the same glycerin recovery route industrial soapmakers use, though it's not practical to purify at home.",
      "Salting out removes free glycerin, which is a natural humectant — a salted-out soap will feel less moisturizing on skin than an unsalted, glycerin-rich soap of the same recipe.",
      "Only attempt this on a batch you're comfortable potentially not fully recovering — some soap yield is inevitably lost in the spent-lye phase.",
    ],
    glossary: [
      { term: "salting-out", definition: "Using high salt concentration to force dissolved soap to separate from water and glycerin." },
      { term: "brine", definition: "A concentrated salt-and-water solution, saturated when no more salt will dissolve into it." },
      { term: "soap curd", definition: "The dense, separated clumps of purified soap that float to the top during salting out." },
      { term: "spent lye", definition: "The leftover glycerin- and salt-rich liquid left behind after soap curd is skimmed off." },
      { term: "zap test", definition: "Touching a small diluted sample to the tongue; a sharp electric tingle indicates unreacted lye is still present." },
    ],
    safety: [
      "Work with hot brine and hot soap carefully — both are scalding-hot liquids handled in the same pot during this step.",
      "The soap being salted out may still carry residual alkalinity from the original cook; treat it with the same caution as any freshly made soap until verified.",
    ],
    appliesTo: ["liquid-soap"],
  },
];
