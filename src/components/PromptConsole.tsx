import React, { useState } from 'react';
import { Copy, Terminal, Check, HelpCircle, Sparkles, Code, Play } from 'lucide-react';

export default function PromptConsole() {
  const [copied, setCopied] = useState(false);
  const [sandboxTopic, setSandboxTopic] = useState('Detox Scrub Product');
  const [simulatedOutput, setSimulatedOutput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const MASTER_PROMPT = `=== MASTER SYSTEM INSTRUCTION PROMPT: BEAUTY SALON ENTERPRISE BUILDER ===

[ROLE OBJECTIVE]
You are a Staff Principal Software Engineer and Architect. Your task is to build a highly modular, enterprise-grade, lightweight web application for a premium beauty therapist named "NICE LOOK BEAUTY THERAPIST". 

---
[SYSTEM ARHITECTURAL PRINCIPLES]
- Single Page Application or Modular Component Architecture
- Mobile-First design for administrators and end-users
- Local or synchronized persistence state
- Encrypted patient records structures (mock cryptographic hash wrappers)

---
[FEW-SHOT TRAINING LEARNING CASES]

### CASE 1: Service Record Parsing
Input: { name: "Rica Waxing", price: 1099, duration: 70 }
Chain-of-Thought Logical Steps:
1. Identify Wax type: Rica (Colophony-free vegetable oil base)
2. Map to Allergy Profile: High compatibility, safe for sensitive skins
3. Calculate GST & GDP levy: Base 1099 * 0.18 = 197.82 Rupees
Output payload: {
  id: "rica_70",
  hasColophony: false,
  basePriceINR: 1099,
  gdpTaxContribution: 198,
  benefitStatement: "Exfoliates dead skin cells, prevents dermal rashes"
}

### CASE 2: Single Customer Booking Rules
Input: BookingRequest { date: "2026-05-26", slot: "10:00 AM" }
Chain-of-Thought Logical Steps:
1. Retrieve database log index for "2026-05-26"
2. Map current bookings aligned at "10:00 AM"
3. If list count > 0, throw ConstraintViolation("Seat Full - Therapist occupies other customer")
Output payload: {
  status: "Rejected",
  errorCode: "SINGLE_SEAT_CONSTRAIN_FAIL",
  reason: "Therapists operate strictly one-on-one. Duplicate booking prevented."
}

---
[CHAIN-OF-THOUGHT INSTRUCTION STEPS]
When responding to any client task, apply this mental pipeline explicitly in your logs:
1. Deconstruct request into core data entities: Services, Products, Bookings, Holidays.
2. Validate timing constraint: Working hours are strictly limited to morning 7 AM to 9 PM local Bangalore India time.
3. Validate holiday checklist: If date is labeled a holiday, render all slots disabled.
4. Calculate pricing: Base price -> Apply 10% new customer filter -> Apply 5% combo discount if > ₹2000 -> Sum 18% GST/GDP.

---
[ITERATIVE LOOP REFINE]
- Standard output verification: Ensure image tags include referrerPolicy="no-referrer" to prevent visual breakage.
- Ensure Bangalore map coordinates are calculated using Euclidean distance and visual map lines between MG Road HQ and customer landmarks.
- Deliver code in clean TypeScript/ES6 standards with zero mock libraries.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MASTER_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateAI = () => {
    setIsSimulating(true);
    setSimulatedOutput('Thinking (Chain-of-Thought Pipeline Activating)...');
    
    setTimeout(() => {
      setSimulatedOutput(`[LOG] Role: Principal Architect
[CoT Step 1] Deconstructed topic: "${sandboxTopic}"
[CoT Step 2] Verified ingredients compatibility: Shea Butter, volcanic clay extracts.
[CoT Step 3] Analyzed Rupees pricing model: Recommended INR ₹349.
[CoT Step 4] Calculated 18% GDP/GST levy contribution: INR ₹62.

[Mock Executed Output Product Instance]:
{
  "id": "sim-prod-990",
  "name": "Nice Look Premium ${sandboxTopic}",
  "price": 349,
  "volume": "100 ml",
  "category": "Organic Glow",
  "keyIngredients": ["Shea Butter", "Volcanic Ash", "Purified Water"],
  "benefit": "Refines pore aesthetics, hydrates deep epidermal cells safely.",
  "rating": 5.0
}`);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="prompt-developer-console">
      
      {/* Overview */}
      <div className="bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex gap-2 items-center">
          <Terminal className="h-5 w-5 text-sage" />
          <h2 className="text-lg font-serif font-medium text-stone-900 dark:text-stone-100">
            PRO Master Setup Console (AI Developer Tools)
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
          The following is a meticulously framed, high-advanced Prompt Engineering template designed using 
          <strong> Role Assignment</strong>, <strong>few-shot training</strong>, and <strong>Chain-of-Thought (CoT)</strong> pipelines. 
          Use this prompt to generate similar scalable extensions of our current beauty therapist codebase in external setups.
        </p>

        {/* Console view */}
        <div className="relative rounded-2xl bg-stone-950 text-stone-200 text-xs p-5 font-mono overflow-x-auto border border-stone-850 max-h-80 shadow-inner">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCopy}
              className="bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-300 p-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              id="copy-prompt-btn"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-sage" />
                  <span className="text-[10px]">Copy Master Prompt</span>
                </>
              )}
            </button>
          </div>

          <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed select-all">
            {MASTER_PROMPT}
          </pre>
        </div>
      </div>

      {/* Simulator Sandbox */}
      <div className="bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex gap-2 items-center">
          <Sparkles className="h-5 w-5 text-[#C17F59]" />
          <h2 className="text-md font-serif font-medium text-stone-900 dark:text-stone-100">
            Interactive Prompt Engine Sandbox
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Simulate how the master prompt executes a Few-Shot &amp; CoT run to design new products/services live. Type any concept below and trigger the local engine emulation.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={sandboxTopic}
            onChange={(e) => setSandboxTopic(e.target.value)}
            placeholder="e.g. Lavender Face Mist"
            className="flex-1 p-2.5 text-xs bg-stone-50 dark:bg-stone-950 border border-[#EAE2D5] dark:border-stone-800 rounded-xl focus:outline-none text-stone-805"
            id="sandbox-topic-input"
          />
          <button
            onClick={handleSimulateAI}
            disabled={isSimulating}
            className="bg-sage hover:bg-sage-600 text-white font-semibold font-mono text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Play className="h-3.5 w-3.5" />
            {isSimulating ? 'Processing...' : 'Emulate Prompt'}
          </button>
        </div>

        {simulatedOutput && (
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-850 font-mono text-[11px] text-stone-300 whitespace-pre overflow-x-auto transition-all animate-fadeIn">
            {simulatedOutput}
          </div>
        )}
      </div>

    </div>
  );
}
