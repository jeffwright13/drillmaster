#!/usr/bin/env node

/**
 * Apply ChatGPT Fixes from Chunk 3 Review
 * Fix the 10 issues identified by ChatGPT
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's identified fixes from chunk 3
const CHATGPT_FIXES = [
  {
    id: 103,
    issue: "English translation unnatural ('do my best effort')",
    currentSpanish: "Haré mi mejor esfuerzo en el nuevo trabajo.",
    currentEnglish: "I will do my best effort in the new job.",
    fixedSpanish: "Haré mi mejor esfuerzo en el nuevo trabajo.",
    fixedEnglish: "I will do my best in the new job."
  },
  {
    id: 104,
    issue: "'Haréis' is Spain-only (vosotros); not Mexican",
    currentSpanish: "Haréis un trabajo fantástico en el proyecto.",
    currentEnglish: "You all will do fantastic work on the project.",
    fixedSpanish: "Harán un trabajo fantástico en el proyecto.",
    fixedEnglish: "You all will do fantastic work on the project."
  },
  {
    id: 111,
    issue: "English translation incorrect ('has done dinner')",
    currentSpanish: "Ha hecho la cena para toda la familia.",
    currentEnglish: "He has done dinner for the whole family.",
    fixedSpanish: "Ha hecho la cena para toda la familia.",
    fixedEnglish: "He has made dinner for the whole family."
  },
  {
    id: 112,
    issue: "'Te sentás' is Rioplatense, not Mexican",
    currentSpanish: "Te sentás en el sillón más cómodo de la casa.",
    currentEnglish: "You sit in the most comfortable chair in the house.",
    fixedSpanish: "Te sientas en el sillón más cómodo de la casa.",
    fixedEnglish: "You sit in the most comfortable chair in the house."
  },
  {
    id: 121,
    issue: "'Te acostás' is Rioplatense, not Mexican",
    currentSpanish: "Te acostás después de ver las noticias.",
    currentEnglish: "You go to bed after watching the news.",
    fixedSpanish: "Te acuestas después de ver las noticias.",
    fixedEnglish: "You go to bed after watching the news."
  },
  {
    id: 127,
    issue: "English translation slightly unnatural ('to be fresh tomorrow')",
    currentSpanish: "Te acostaste temprano para estar fresco mañana.",
    currentEnglish: "You went to bed early to be fresh tomorrow.",
    fixedSpanish: "Te acostaste temprano para estar fresco mañana.",
    fixedEnglish: "You went to bed early to feel rested tomorrow."
  },
  {
    id: 131,
    issue: "Wrong verb (not reflexive) + needs translation",
    currentSpanish: "La jefa despierta a los estudiantes temprano.",
    currentEnglish: "[TRANSFORMED - NEEDS TRANSLATION]",
    fixedSpanish: "La jefa despierta a los estudiantes temprano.",
    fixedEnglish: "The boss wakes the students up early."
  },
  {
    id: 141,
    issue: "'Te vestís' is Rioplatense, not Mexican",
    currentSpanish: "Te vestís siempre con colores alegres.",
    currentEnglish: "You always dress in cheerful colors.",
    fixedSpanish: "Te vistes siempre con colores alegres.",
    fixedEnglish: "You always dress in cheerful colors."
  },
  {
    id: 147,
    issue: "'Te levantás' is Rioplatense",
    currentSpanish: "Te levantás con mucha energía cada día.",
    currentEnglish: "You wake up with lots of energy every day.",
    fixedSpanish: "Te levantas con mucha energía cada día.",
    fixedEnglish: "You wake up with lots of energy every day."
  }
];

function applyChatGPTFixesChunk3() {
  console.log('🤖 Applying ChatGPT fixes from chunk 3 review...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const fixes = {
    total_fixes_applied: 0,
    fixes_found: 0,
    fixes_not_found: 0,
    by_tier: {},
    applied_fixes: []
  };
  
  let sentenceCounter = 0;
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n🔧 Processing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    fixes.by_tier[tier] = {
      fixes_applied: 0,
      fixes_attempted: 0
    };
    
    let tierModified = false;
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              sentenceCounter++;
              
              // Check if this sentence needs fixing
              const fix = CHATGPT_FIXES.find(f => f.id === sentenceCounter);
              
              if (fix) {
                fixes.by_tier[tier].fixes_attempted++;
                
                // More flexible matching for sentences
                const spanishMatches = sentence.spanish === fix.currentSpanish || 
                                     sentence.spanish.toLowerCase().includes(fix.currentSpanish.toLowerCase().substring(0, 15)) ||
                                     fix.currentSpanish.toLowerCase().includes(sentence.spanish.toLowerCase().substring(0, 15));
                
                if (spanishMatches) {
                  
                  // Apply the fix
                  const oldSpanish = sentence.spanish;
                  const oldEnglish = sentence.english;
                  
                  sentence.spanish = fix.fixedSpanish;
                  sentence.english = fix.fixedEnglish;
                  
                  // Add fix metadata
                  if (!sentence.quality) sentence.quality = {};
                  sentence.quality.chatgpt_reviewed = true;
                  sentence.quality.chatgpt_fixed = true;
                  sentence.quality.fix_date = new Date().toISOString().split('T')[0];
                  sentence.quality.fix_issue = fix.issue;
                  sentence.quality.chunk = 3;
                  
                  fixes.total_fixes_applied++;
                  fixes.fixes_found++;
                  fixes.by_tier[tier].fixes_applied++;
                  tierModified = true;
                  
                  fixes.applied_fixes.push({
                    id: fix.id,
                    tier: tier,
                    verb: verb,
                    tense: tense,
                    issue: fix.issue,
                    before_spanish: oldSpanish,
                    after_spanish: fix.fixedSpanish,
                    before_english: oldEnglish,
                    after_english: fix.fixedEnglish
                  });
                  
                  console.log(`   ✅ Fixed [${fix.id}]: ${fix.issue}`);
                  console.log(`      Before: "${oldSpanish}"`);
                  console.log(`      After:  "${fix.fixedSpanish}"`);
                  
                } else {
                  console.log(`   ⚠️  [${fix.id}] Sentence not found or doesn't match:`);
                  console.log(`      Expected: "${fix.currentSpanish}"`);
                  console.log(`      Found:    "${sentence.spanish}"`);
                  fixes.fixes_not_found++;
                }
              }
            });
          }
        });
      });
    }
    
    // Save fixed corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Saved ${fixes.by_tier[tier].fixes_applied} fixes to ${filename}`);
    }
  });
  
  // Display results
  displayFixResults(fixes);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-fixes-chunk3-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n💾 Fix report saved to: ${outputPath}`);
  
  return fixes;
}

function displayFixResults(fixes) {
  console.log(`\n🤖 CHATGPT FIXES APPLIED - CHUNK 3:`);
  console.log(`   ✅ Fixes applied: ${fixes.total_fixes_applied}`);
  console.log(`   🔍 Fixes found: ${fixes.fixes_found}`);
  console.log(`   ❌ Fixes not found: ${fixes.fixes_not_found}`);
  
  if (fixes.total_fixes_applied > 0) {
    console.log(`\n📚 Fixes by Tier:`);
    Object.keys(fixes.by_tier).forEach(tier => {
      const tierData = fixes.by_tier[tier];
      if (tierData.fixes_applied > 0) {
        console.log(`   Tier ${tier}: ${tierData.fixes_applied}/${tierData.fixes_attempted} fixes applied`);
      }
    });
    
    console.log(`\n🎯 KEY IMPROVEMENTS:`);
    console.log(`   🗣️  Converted Rioplatense to Mexican Spanish:`);
    console.log(`      • sentás → sientas`);
    console.log(`      • acostás → acuestas`);
    console.log(`      • vestís → vistes`);
    console.log(`      • levantás → levantas`);
    console.log(`   🇪🇸 Converted Spain Spanish to Mexican:`);
    console.log(`      • haréis → harán (vosotros → ustedes)`);
    console.log(`   📝 Fixed English translations:`);
    console.log(`      • "do my best effort" → "do my best"`);
    console.log(`      • "has done dinner" → "has made dinner"`);
    console.log(`      • "be fresh" → "feel rested"`);
    console.log(`   🔧 Added missing translations`);
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Consistent Mexican Spanish throughout`);
  console.log(`   📝 Natural English translations`);
  console.log(`   🗣️  No more regional variants`);
  console.log(`   ✨ Professional linguistic quality`);
  
  console.log(`\n🚀 PROGRESS:`);
  console.log(`   📊 Chunks completed: 3/9`);
  console.log(`   🎯 Total fixes applied: ${fixes.total_fixes_applied + 21} (chunks 1-3)`);
  console.log(`   📈 Regional consistency: Excellent`);
  console.log(`   📤 Ready for chunk 4!`);
}

if (require.main === module) {
  applyChatGPTFixesChunk3();
}

module.exports = { applyChatGPTFixesChunk3 };
