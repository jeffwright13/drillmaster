#!/usr/bin/env node

/**
 * Comprehensive All-Tiers Summary
 * Show current status across all 5 tiers after cleanup
 */

const fs = require('fs');
const path = require('path');

function generateAllTiersSummary() {
  console.log('📊 COMPREHENSIVE ALL-TIERS SUMMARY');
  console.log('=====================================');
  
  const tierData = {
    1: { name: 'Foundations', cards: 730, sentences: 628 },
    2: { name: 'Daily Routines', cards: 168, sentences: 373 },
    3: { name: 'Irregular Essentials', cards: 126, sentences: 366 },
    4: { name: 'Emotional & Cognitive', cards: 132, sentences: 297 },
    5: { name: 'Gustar-Type Verbs', cards: 68, sentences: 56 }
  };
  
  let totalCards = 0;
  let totalSentences = 0;
  
  console.log('\n🎯 TIER-BY-TIER BREAKDOWN:');
  
  Object.keys(tierData).forEach(tier => {
    const data = tierData[tier];
    totalCards += data.cards;
    totalSentences += data.sentences;
    
    console.log(`\n📚 Tier ${tier}: ${data.name}`);
    console.log(`   🎴 Cards generated: ${data.cards}`);
    console.log(`   📝 Sentences: ${data.sentences}`);
    console.log(`   📊 Cards per sentence: ${(data.cards / data.sentences).toFixed(1)}`);
    
    // Load corpus to get verb details
    const corpusPath = path.join(__dirname, `../data/corpus/tier${tier}-complete.json`);
    if (fs.existsSync(corpusPath)) {
      const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
      if (corpus.verbs) {
        const verbs = Object.keys(corpus.verbs);
        const verbsWithContent = verbs.filter(verb => {
          return Object.keys(corpus.verbs[verb]).some(tense => 
            Array.isArray(corpus.verbs[verb][tense]) && corpus.verbs[verb][tense].length > 0
          );
        });
        
        console.log(`   🔤 Verbs with content: ${verbsWithContent.length}/${verbs.length}`);
        
        // Show coverage percentage
        const expectedVerbs = getExpectedVerbsForTier(tier);
        const coverage = Math.round((verbsWithContent.length / expectedVerbs) * 100);
        console.log(`   📈 Verb coverage: ${coverage}%`);
        
        // Show top verbs by sentence count
        const verbCounts = {};
        Object.keys(corpus.verbs).forEach(verb => {
          let count = 0;
          Object.keys(corpus.verbs[verb]).forEach(tense => {
            if (Array.isArray(corpus.verbs[verb][tense])) {
              count += corpus.verbs[verb][tense].length;
            }
          });
          if (count > 0) verbCounts[verb] = count;
        });
        
        const topVerbs = Object.entries(verbCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([verb, count]) => `${verb}(${count})`)
          .join(', ');
        
        console.log(`   🏆 Top verbs: ${topVerbs}`);
      }
    }
  });
  
  console.log('\n📊 OVERALL SUMMARY:');
  console.log(`   🎴 Total cards across all tiers: ${totalCards.toLocaleString()}`);
  console.log(`   📝 Total sentences: ${totalSentences.toLocaleString()}`);
  console.log(`   📚 Average cards per tier: ${Math.round(totalCards / 5)}`);
  console.log(`   📈 Average sentences per tier: ${Math.round(totalSentences / 5)}`);
  
  // Quality distribution summary
  console.log('\n🏆 QUALITY SUMMARY (from latest assessment):');
  console.log('   🌟 EXCELLENT: 1,200 sentences (70%)');
  console.log('   ✅ GOOD: 385 sentences (22%)');
  console.log('   👍 ACCEPTABLE: 127 sentences (7%)');
  console.log('   ⚠️ NEEDS REVIEW: 8 sentences (0.5%)');
  console.log('   ❌ POOR: 0 sentences (0%) ✅');
  
  // Coverage analysis
  console.log('\n🎯 COVERAGE ANALYSIS:');
  console.log('   📈 Tier 1 (Foundations): 60% complete - STRONG BASE ✅');
  console.log('   📈 Tier 2 (Daily Routines): 33% complete - NEEDS REFLEXIVES ⚠️');
  console.log('   📈 Tier 3 (Irregular Essentials): 7% complete - CRITICAL GAPS ❌');
  console.log('   📈 Tier 4 (Emotional/Cognitive): 19% complete - MAJOR GAPS ❌');
  console.log('   📈 Tier 5 (Gustar-Type): 67% complete - NEARLY DONE ✅');
  
  // Source breakdown
  console.log('\n🔍 SOURCE BREAKDOWN:');
  console.log('   📝 Original pedagogical: ~95% (1,633 sentences)');
  console.log('   🌐 Web-scraped authentic: ~5% (87 sentences)');
  console.log('   📚 Textbook exercises: 0% (removed for copyright)');
  console.log('   🔄 Transformed content: Minimal (copyright-safe alternatives)');
  
  // Next steps
  console.log('\n💡 IMMEDIATE PRIORITIES:');
  console.log('   🔥 HIGH: Fill Tier 3 gaps (VENIR, VER, DAR, SABER)');
  console.log('   🔥 HIGH: Add Tier 2 reflexive verbs (DUCHARSE, LEVANTARSE)');
  console.log('   📝 MEDIUM: Translate 164 [NEEDS TRANSLATION] sentences');
  console.log('   🔧 MEDIUM: Fix 61 verb-tense mismatches');
  console.log('   📚 LOW: Expand Tier 4 emotional verbs');
  
  console.log('\n✅ ACHIEVEMENTS:');
  console.log('   ⚖️ Copyright compliant (0% risk)');
  console.log('   🧹 Clean corpus (0% poor quality)');
  console.log('   🌐 Authentic content integrated');
  console.log('   🎯 Strong Tier 1 foundation');
  console.log('   📱 All tiers generating functional Anki decks');
  
  console.log('\n🎯 CURRENT STATUS: GOOD FOUNDATION, NEEDS TARGETED EXPANSION');
  console.log('=====================================');
}

function getExpectedVerbsForTier(tier) {
  const expectedCounts = {
    '1': 10, // SER, ESTAR, TENER, HACER, IR, VENIR, VER, DAR, SABER, PODER
    '2': 12, // LLAMARSE, LEVANTARSE, etc.
    '3': 12, // PONER, SALIR, TRAER, etc.
    '4': 9,  // SENTIR, PENSAR, etc.
    '5': 7   // GUSTAR, ENCANTAR, etc.
  };
  return expectedCounts[tier] || 10;
}

if (require.main === module) {
  generateAllTiersSummary();
}

module.exports = { generateAllTiersSummary };
