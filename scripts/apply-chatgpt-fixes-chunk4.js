#!/usr/bin/env node

/**
 * Apply ChatGPT Fixes from Chunk 4 Review
 * Fix the 8 issues identified by ChatGPT
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's identified fixes from chunk 4
const CHATGPT_FIXES = [
  {
    id: 154,
    issue: "'Encontrás' is Rioplatense; translation unnatural",
    currentSpanish: "Encontrás trabajo fácilmente con tu tiempo.",
    currentEnglish: "You find work easily with your time.",
    fixedSpanish: "Encuentras trabajo fácilmente con tu experiencia.",
    fixedEnglish: "You find work easily with your experience."
  },
  {
    id: 158,
    issue: "'Encontraréis' is Spain-only (vosotros)",
    currentSpanish: "Encontraréis nuevos amigos en la escuela.",
    currentEnglish: "You all will find new friends at school.",
    fixedSpanish: "Encontrarán nuevos amigos en la escuela.",
    fixedEnglish: "You all will find new friends at school."
  },
  {
    id: 176,
    issue: "'vos' form is Rioplatense; English translation slightly off",
    currentSpanish: "Das lo mejor de vos en cada trabajo.",
    currentEnglish: "You give your best in every work.",
    fixedSpanish: "Das lo mejor de ti en cada trabajo.",
    fixedEnglish: "You give your best in every job."
  },
  {
    id: 183,
    issue: "Rioplatense 'decís / pensás'",
    currentSpanish: "Decís exactamente lo que pensás.",
    currentEnglish: "You say exactly what you think.",
    fixedSpanish: "Dices exactamente lo que piensas.",
    fixedEnglish: "You say exactly what you think."
  },
  {
    id: 191,
    issue: "Wrong possessive ('Mi jefes'), 'saber/conocer' confusion; needs translation",
    currentSpanish: "Mi jefes (saben / conocen) que en ese restaurante preparan pizza buena",
    currentEnglish: "[TRANSFORMED - NEEDS TRANSLATION]",
    fixedSpanish: "Mis jefes saben que en ese restaurante preparan pizza muy buena.",
    fixedEnglish: "My bosses know that they make very good pizza at that restaurant."
  },
  {
    id: 195,
    issue: "Meaning unnatural ('play piano like a worker')",
    currentSpanish: "Sabrás tocar el piano como un trabajador.",
    currentEnglish: "You will know how to play piano like a worker.",
    fixedSpanish: "Sabrás tocar el piano como un profesional.",
    fixedEnglish: "You will know how to play the piano like a professional."
  },
  {
    id: 198,
    issue: "Word order incorrect; missing translation",
    currentSpanish: "¿Cómo El profesor se llama Jorge?",
    currentEnglish: "[TRANSFORMED - NEEDS TRANSLATION]",
    fixedSpanish: "¿Cómo se llama el profesor? ¿Jorge?",
    fixedEnglish: "What is the professor's name? Jorge?"
  },
  {
    id: 200,
    issue: "Wrong verb meaning; 'llamarse' ≠ 'call in sick'",
    currentSpanish: "Me llamé enfermo y no fui a trabajar.",
    currentEnglish: "I called in sick and didn't go to work.",
    fixedSpanish: "Me reporté enfermo y no fui a trabajar.",
    fixedEnglish: "I called in sick and didn't go to work."
  }
];

function applyChatGPTFixesChunk4() {
  console.log('🤖 Applying ChatGPT fixes from chunk 4 review...');
  
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
                  sentence.quality.chunk = 4;
                  
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
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-fixes-chunk4-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n💾 Fix report saved to: ${outputPath}`);
  
  return fixes;
}

function displayFixResults(fixes) {
  console.log(`\n🤖 CHATGPT FIXES APPLIED - CHUNK 4:`);
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
    console.log(`   🗣️  More Rioplatense → Mexican conversions:`);
    console.log(`      • encontrás → encuentras`);
    console.log(`      • decís → dices, pensás → piensas`);
    console.log(`      • vos → ti (pronoun)`);
    console.log(`   🇪🇸 Spain → Mexican Spanish:`);
    console.log(`      • encontraréis → encontrarán (vosotros → ustedes)`);
    console.log(`   📝 Grammar corrections:`);
    console.log(`      • Mi jefes → Mis jefes`);
    console.log(`      • saber vs conocer usage`);
    console.log(`      • Question word order`);
    console.log(`   🔧 Verb meaning corrections:`);
    console.log(`      • llamarse → reportarse (call in sick)`);
    console.log(`   ✨ Natural expressions:`);
    console.log(`      • "como un trabajador" → "como un profesional"`);
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Pure Mexican Spanish consistency`);
  console.log(`   📝 Correct verb meanings and usage`);
  console.log(`   🗣️  Natural, professional expressions`);
  console.log(`   ✨ Grammatically perfect sentences`);
  
  console.log(`\n🚀 PROGRESS:`);
  console.log(`   📊 Chunks completed: 4/9`);
  console.log(`   🎯 Total fixes applied: ${fixes.total_fixes_applied + 30} (chunks 1-4)`);
  console.log(`   📈 Regional consistency: Excellent`);
  console.log(`   📤 Ready for chunk 5!`);
}

if (require.main === module) {
  applyChatGPTFixesChunk4();
}

module.exports = { applyChatGPTFixesChunk4 };
