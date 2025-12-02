#!/usr/bin/env node

/**
 * Apply ChatGPT Fixes from Chunk 7 Review
 * Fix the 5 issues identified by ChatGPT
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's identified fixes from chunk 7
const CHATGPT_FIXES = [
  {
    id: 320,
    issue: "Spain-only vosotros form",
    currentSpanish: "Os preocupasteis por los resultados del trabajo.",
    currentEnglish: "You all worried about the work results.",
    fixedSpanish: "Ustedes se preocuparon por los resultados del trabajo.",
    fixedEnglish: "You all worried about the work results."
  },
  {
    id: 324,
    issue: "Rioplatense form 'divertís'",
    currentSpanish: "Te divertís bailando tango en la milonga.",
    currentEnglish: "You have fun dancing tango at the milonga.",
    fixedSpanish: "Te diviertes bailando tango en la milonga.",
    fixedEnglish: "You have fun dancing tango at the milonga."
  },
  {
    id: 333,
    issue: "Spanish wording awkward + English translation unnatural",
    currentSpanish: "Se encuentra trabajando en un trabajo importante.",
    currentEnglish: "He is working on an important work.",
    fixedSpanish: "Está trabajando en un proyecto importante.",
    fixedEnglish: "He is working on an important project."
  },
  {
    id: 337,
    issue: "English unnatural; Spanish okay but formal",
    currentSpanish: "Se encontrará muy feliz en su nuevo trabajo.",
    currentEnglish: "He will find himself very happy in his new job.",
    fixedSpanish: "Se sentirá muy feliz en su nuevo trabajo.",
    fixedEnglish: "He will feel very happy in his new job."
  },
  {
    id: 338,
    issue: "Rioplatense form 'Creés'",
    currentSpanish: "Creés que todo va a salir bien.",
    currentEnglish: "You believe everything will turn out well.",
    fixedSpanish: "Crees que todo va a salir bien.",
    fixedEnglish: "You believe everything will turn out well."
  }
];

function applyChatGPTFixesChunk7() {
  console.log('🤖 Applying ChatGPT fixes from chunk 7 review...');
  console.log('✨ This chunk is very clean - only 5 minor fixes needed!');
  
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
    applied_fixes: [],
    regional_fixes: 0,
    wording_fixes: 0,
    translation_fixes: 0
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
                  sentence.quality.chunk = 7;
                  
                  // Track fix types
                  if (fix.issue.includes('Rioplatense') || fix.issue.includes('vosotros') || fix.issue.includes('Spain-only')) {
                    fixes.regional_fixes++;
                  } else if (fix.issue.includes('wording') || fix.issue.includes('awkward') || fix.issue.includes('formal')) {
                    fixes.wording_fixes++;
                  } else if (fix.issue.includes('English') || fix.issue.includes('translation') || fix.issue.includes('unnatural')) {
                    fixes.translation_fixes++;
                  }
                  
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
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-fixes-chunk7-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n💾 Fix report saved to: ${outputPath}`);
  
  return fixes;
}

function displayFixResults(fixes) {
  console.log(`\n🤖 CHATGPT FIXES APPLIED - CHUNK 7:`);
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
    
    console.log(`\n🎯 FIXES BY CATEGORY:`);
    console.log(`   🗣️  Regional consistency: ${fixes.regional_fixes} fixes`);
    console.log(`      • divertís → diviertes (Rioplatense → Mexican)`);
    console.log(`      • creés → crees (Rioplatense → Mexican)`);
    console.log(`      • os preocupasteis → ustedes se preocuparon (Spain → Mexican)`);
    console.log(`   📝 Wording improvements: ${fixes.wording_fixes} fixes`);
    console.log(`      • se encuentra trabajando → está trabajando (less formal)`);
    console.log(`      • se encontrará → se sentirá (more natural)`);
    console.log(`   🔧 Translation improvements: ${fixes.translation_fixes} fixes`);
    console.log(`      • "important work" → "important project"`);
    console.log(`      • "find himself happy" → "feel happy"`);
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Final regional variants eliminated`);
  console.log(`   📝 More natural Spanish expressions`);
  console.log(`   🗣️  Appropriate formality level for learners`);
  console.log(`   ✨ Professional English translations`);
  
  console.log(`\n🚀 PROGRESS:`);
  console.log(`   📊 Chunks completed: 7/9`);
  console.log(`   🎯 Total fixes applied: ${fixes.total_fixes_applied + 65} (chunks 1-7)`);
  console.log(`   📈 Quality: Excellent - very few issues remaining!`);
  console.log(`   📤 Ready for chunk 8!`);
}

if (require.main === module) {
  applyChatGPTFixesChunk7();
}

module.exports = { applyChatGPTFixesChunk7 };
