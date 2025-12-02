#!/usr/bin/env node

/**
 * Apply ChatGPT Fixes from Chunk 1 Review
 * Fix the 10 issues identified by ChatGPT
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's identified fixes from chunk 1
const CHATGPT_FIXES = [
  {
    id: 15,
    issue: "Argentina phrase → use 'casa de tu tío' for MX",
    currentSpanish: "Comiste un asado muy bueno en lo de tu tío.",
    currentEnglish: "You ate an very good barbecue at your uncle's place.",
    fixedSpanish: "Comiste un asado muy bueno en casa de tu tío.",
    fixedEnglish: "You ate a very good barbecue at your uncle's place."
  },
  {
    id: 25,
    issue: "'una tiempo' typo; awkward English",
    currentSpanish: "Viviste una tiempo muy bueno en Japón.",
    currentEnglish: "You lived an very good time in Japan.",
    fixedSpanish: "Viviste un tiempo muy bueno en Japón.",
    fixedEnglish: "You had a very good time in Japan."
  },
  {
    id: 26,
    issue: "English fix - 'estudios universitarios' mistranslated",
    currentSpanish: "Viví en París durante mis estudios universitarios.",
    currentEnglish: "I lived in Paris during my school studies.",
    fixedSpanish: "Viví en París durante mis estudios universitarios.",
    fixedEnglish: "I lived in Paris during my university studies."
  },
  {
    id: 27,
    issue: "Gender mismatch + unnatural phrasing",
    currentSpanish: "Vivirás tiempos únicas en tu nuevo trabajo.",
    currentEnglish: "You will live unique times in your new job.",
    fixedSpanish: "Vivirás experiencias únicas en tu nuevo trabajo.",
    fixedEnglish: "You will have unique experiences in your new job."
  },
  {
    id: 30,
    issue: "English translation unnatural",
    currentSpanish: "Estoy viviendo en el centro de la ciudad desde hace años.",
    currentEnglish: "I am living in the city center for years now.",
    fixedSpanish: "Estoy viviendo en el centro de la ciudad desde hace años.",
    fixedEnglish: "I have been living in the city center for years."
  },
  {
    id: 32,
    issue: "Spanish construction impossible ('desde hace años' + future)",
    currentSpanish: "Voy a vivir en el centro de la ciudad desde hace años.",
    currentEnglish: "I'm going to live in the city center for years now.",
    fixedSpanish: "Voy a vivir en el centro de la ciudad.",
    fixedEnglish: "I'm going to live in the city center."
  },
  {
    id: 34,
    issue: "English minor improvement",
    currentSpanish: "He vivido en el centro de la ciudad desde hace años.",
    currentEnglish: "I have lived in the city center for years now.",
    fixedSpanish: "He vivido en el centro de la ciudad desde hace años.",
    fixedEnglish: "I've lived in the city center for years."
  },
  {
    id: 46,
    issue: "Missing English translation",
    currentSpanish: "En la mañana la temperatura puede llegar a los cero grados centígrados.",
    currentEnglish: "[TRANSFORMED - NEEDS TRANSLATION]",
    fixedSpanish: "En la mañana la temperatura puede llegar a los cero grados centígrados.",
    fixedEnglish: "In the morning the temperature can reach zero degrees Celsius."
  },
  {
    id: 47,
    issue: "'Podés' is Rioplatense, not Mexican",
    currentSpanish: "Podés venir a casa cuando quieras.",
    currentEnglish: "You can come home whenever you want.",
    fixedSpanish: "Puedes venir a casa cuando quieras.",
    fixedEnglish: "You can come home whenever you want."
  }
];

function applyChatGPTFixes() {
  console.log('🤖 Applying ChatGPT fixes from chunk 1 review...');
  
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
                
                // Verify the sentence matches what ChatGPT reviewed
                if (sentence.spanish === fix.currentSpanish || 
                    sentence.spanish.includes(fix.currentSpanish.substring(0, 20))) {
                  
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
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-fixes-chunk1-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n💾 Fix report saved to: ${outputPath}`);
  
  return fixes;
}

function displayFixResults(fixes) {
  console.log(`\n🤖 CHATGPT FIXES APPLIED - CHUNK 1:`);
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
    
    console.log(`\n📋 APPLIED FIXES SUMMARY:`);
    fixes.applied_fixes.forEach((fix, i) => {
      console.log(`   ${i+1}. [${fix.id}] ${fix.issue}`);
      console.log(`      Spanish: "${fix.before_spanish}" → "${fix.after_spanish}"`);
      console.log(`      English: "${fix.before_english}" → "${fix.after_english}"`);
    });
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Fixed gender agreement errors`);
  console.log(`   🗣️  Converted Argentina Spanish to Mexican Spanish`);
  console.log(`   📝 Corrected English translations`);
  console.log(`   🔧 Fixed impossible Spanish constructions`);
  console.log(`   ✨ Higher quality, more natural corpus`);
  
  console.log(`\n🚀 NEXT STEPS:`);
  console.log(`   📤 Continue with chunk 2 review`);
  console.log(`   🤖 Apply fixes from remaining chunks`);
  console.log(`   🎯 Professional-quality corpus emerging!`);
}

if (require.main === module) {
  applyChatGPTFixes();
}

module.exports = { applyChatGPTFixes };
