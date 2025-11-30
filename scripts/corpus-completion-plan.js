#!/usr/bin/env node

/**
 * Analyze what corpus data is missing and create a completion plan
 */

const fs = require('fs');
const path = require('path');

// Load clean corpus and verbs list
function analyzeCorpusGaps() {
  const cleanCorpusPath = path.join(__dirname, '../data/corpus/clean-corpus.json');
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  
  // Load clean corpus
  const cleanCorpus = JSON.parse(fs.readFileSync(cleanCorpusPath, 'utf-8'));
  
  // Load all verbs
  const verbsContent = fs.readFileSync(verbsPath, 'utf-8');
  const lines = verbsContent.trim().split('\n');
  const allVerbs = lines.slice(1).map(line => {
    const [verb, english, tags] = line.split('\t');
    const tier = tags.match(/tier:(\d+)/)?.[1] || 'unknown';
    return { verb, english, tier };
  });
  
  const tenses = ['present', 'preterite', 'future'];
  const subjects = ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
  
  console.log('📋 CORPUS COMPLETION ANALYSIS\n');
  
  // Group verbs by completion status
  const completed = [];
  const partial = [];
  const missing = [];
  
  allVerbs.forEach(verbInfo => {
    const verb = verbInfo.verb;
    const corpusData = cleanCorpus[verb];
    
    if (!corpusData) {
      missing.push(verbInfo);
      return;
    }
    
    let totalExpected = tenses.length * subjects.length; // 21 combinations
    let totalFound = 0;
    
    tenses.forEach(tense => {
      if (corpusData[tense]) {
        totalFound += corpusData[tense].length;
      }
    });
    
    if (totalFound >= totalExpected) {
      completed.push({...verbInfo, sentences: totalFound});
    } else {
      partial.push({...verbInfo, sentences: totalFound, missing: totalExpected - totalFound});
    }
  });
  
  // Report by tier
  console.log('🎯 COMPLETION STATUS BY TIER:\n');
  
  [1, 2, 3, 4].forEach(tier => {
    const tierCompleted = completed.filter(v => v.tier == tier);
    const tierPartial = partial.filter(v => v.tier == tier);
    const tierMissing = missing.filter(v => v.tier == tier);
    const tierTotal = allVerbs.filter(v => v.tier == tier).length;
    
    console.log(`📚 TIER ${tier} (${tierTotal} verbs):`);
    console.log(`   ✅ Complete: ${tierCompleted.length} verbs`);
    if (tierCompleted.length > 0) {
      tierCompleted.forEach(v => console.log(`      ${v.verb}`));
    }
    
    console.log(`   🔶 Partial: ${tierPartial.length} verbs`);
    if (tierPartial.length > 0) {
      tierPartial.forEach(v => console.log(`      ${v.verb} (${v.sentences}/21 sentences, need ${v.missing} more)`));
    }
    
    console.log(`   ❌ Missing: ${tierMissing.length} verbs`);
    if (tierMissing.length > 0) {
      tierMissing.forEach(v => console.log(`      ${v.verb} (${v.english}) - need 21 sentences`));
    }
    console.log('');
  });
  
  // Summary
  const totalSentencesNeeded = (missing.length * 21) + partial.reduce((sum, v) => sum + v.missing, 0);
  
  console.log('📊 SUMMARY:');
  console.log(`   ✅ Completed: ${completed.length}/42 verbs`);
  console.log(`   🔶 Partial: ${partial.length} verbs`);
  console.log(`   ❌ Missing: ${missing.length} verbs`);
  console.log(`   📝 Total sentences needed: ${totalSentencesNeeded}`);
  console.log(`   📚 Current sentences: ${completed.reduce((sum, v) => sum + v.sentences, 0) + partial.reduce((sum, v) => sum + v.sentences, 0)}`);
  
  // Create work plan
  console.log('\n🎯 RECOMMENDED COMPLETION ORDER:');
  console.log('\n1. Complete Tier 1 verbs first (most important)');
  console.log('2. Fill missing tenses for partial verbs');
  console.log('3. Add completely missing verbs');
  console.log('\nNext steps: Focus on these high-priority verbs:');
  
  // Show next 5 verbs to work on
  const nextVerbs = [
    ...missing.filter(v => v.tier == 1),
    ...partial.filter(v => v.tier == 1),
    ...missing.filter(v => v.tier == 2),
    ...partial.filter(v => v.tier == 2)
  ].slice(0, 5);
  
  nextVerbs.forEach((v, i) => {
    const status = missing.includes(v) ? 'completely missing' : `${v.sentences}/21 sentences`;
    console.log(`   ${i + 1}. ${v.verb} (${v.english}) - Tier ${v.tier} - ${status}`);
  });
}

if (require.main === module) {
  analyzeCorpusGaps();
}
