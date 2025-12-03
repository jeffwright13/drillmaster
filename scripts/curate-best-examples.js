#!/usr/bin/env node

/**
 * Curate Best Examples for Learning
 * Keep 2-3 high-quality examples per verb/tense/subject combination
 * Preserve full corpus, create curated versions for optimal learning
 */

const fs = require('fs');
const path = require('path');

// Target examples per combination for optimal learning
const CURATION_TARGETS = {
  1: { examples_per_combination: 2, max_per_verb: 12 }, // Foundations - keep it focused
  2: { examples_per_combination: 2, max_per_verb: 8 },  // Daily routines - practical focus
  3: { examples_per_combination: 2, max_per_verb: 10 }, // Irregulars - need variety
  4: { examples_per_combination: 2, max_per_verb: 8 },  // Emotional - focused practice
  5: { examples_per_combination: 3, max_per_verb: 9 }   // Gustar-type - more examples needed
};

function curateCorpusForLearning() {
  console.log('✂️  Curating corpus for optimal learning experience...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const curationReport = {
    total_before: 0,
    total_after: 0,
    by_tier: {},
    curation_strategy: {},
    preserved_sentences: []
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n✂️  Curating ${filename}...`);
    
    // Create backup of full corpus
    const backupPath = filePath.replace('.json', '-full-backup.json');
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Full corpus backed up to: ${path.basename(backupPath)}`);
    
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const curatedCorpus = JSON.parse(JSON.stringify(corpus)); // Deep copy
    
    const tierResults = curateTier(curatedCorpus, tier);
    curationReport.by_tier[tier] = tierResults;
    curationReport.total_before += tierResults.before;
    curationReport.total_after += tierResults.after;
    
    // Save curated version
    fs.writeFileSync(filePath, JSON.stringify(curatedCorpus, null, 2));
    console.log(`   ✅ Curated: ${tierResults.before} → ${tierResults.after} sentences`);
    console.log(`   📉 Reduction: ${Math.round((1 - tierResults.after/tierResults.before) * 100)}%`);
  });
  
  // Display results
  displayCurationReport(curationReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/curation-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(curationReport, null, 2));
  console.log(`\n💾 Curation report saved to: ${outputPath}`);
  
  return curationReport;
}

function curateTier(corpus, tier) {
  const targets = CURATION_TARGETS[tier];
  const results = {
    tier: tier,
    before: 0,
    after: 0,
    verbs_processed: 0,
    combinations_curated: 0,
    curation_details: {}
  };
  
  if (!corpus.verbs) return results;
  
  Object.keys(corpus.verbs).forEach(verb => {
    results.verbs_processed++;
    results.curation_details[verb] = {
      before: 0,
      after: 0,
      tenses: {}
    };
    
    let verbTotalBefore = 0;
    let verbTotalAfter = 0;
    
    Object.keys(corpus.verbs[verb]).forEach(tense => {
      if (Array.isArray(corpus.verbs[verb][tense])) {
        const originalSentences = corpus.verbs[verb][tense];
        const originalCount = originalSentences.length;
        
        verbTotalBefore += originalCount;
        results.before += originalCount;
        
        // Curate this tense
        const curatedSentences = curateVerbTenseCombination(
          originalSentences, 
          verb, 
          tense, 
          targets.examples_per_combination
        );
        
        corpus.verbs[verb][tense] = curatedSentences;
        
        verbTotalAfter += curatedSentences.length;
        results.after += curatedSentences.length;
        results.combinations_curated++;
        
        results.curation_details[verb].tenses[tense] = {
          before: originalCount,
          after: curatedSentences.length,
          kept_best: curatedSentences.length > 0
        };
      }
    });
    
    results.curation_details[verb].before = verbTotalBefore;
    results.curation_details[verb].after = verbTotalAfter;
    
    // If verb still has too many examples overall, do secondary curation
    if (verbTotalAfter > targets.max_per_verb) {
      const secondaryCuration = curateVerbOverall(corpus.verbs[verb], targets.max_per_verb);
      results.curation_details[verb].secondary_curation = secondaryCuration;
      
      // Update totals
      const reduction = verbTotalAfter - secondaryCuration.total_after;
      results.after -= reduction;
      verbTotalAfter = secondaryCuration.total_after;
      results.curation_details[verb].after = verbTotalAfter;
    }
  });
  
  return results;
}

function curateVerbTenseCombination(sentences, verb, tense, targetCount) {
  if (sentences.length <= targetCount) {
    return sentences; // Already at or below target
  }
  
  // Score each sentence for curation
  const scoredSentences = sentences.map(sentence => ({
    sentence: sentence,
    score: calculateCurationScore(sentence, verb, tense)
  }));
  
  // Sort by score (highest first) and take the best
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Ensure diversity in subjects if possible
  const curated = [];
  const usedSubjects = new Set();
  
  // First pass: take best examples with different subjects
  for (const scored of scoredSentences) {
    if (curated.length >= targetCount) break;
    
    const subject = scored.sentence.subject;
    if (!usedSubjects.has(subject) || usedSubjects.size >= targetCount) {
      curated.push(scored.sentence);
      usedSubjects.add(subject);
    }
  }
  
  // Second pass: fill remaining slots with highest scores
  if (curated.length < targetCount) {
    for (const scored of scoredSentences) {
      if (curated.length >= targetCount) break;
      
      if (!curated.includes(scored.sentence)) {
        curated.push(scored.sentence);
      }
    }
  }
  
  return curated;
}

function curateVerbOverall(verbData, maxTotal) {
  // Collect all sentences with scores
  const allSentences = [];
  
  Object.keys(verbData).forEach(tense => {
    if (Array.isArray(verbData[tense])) {
      verbData[tense].forEach(sentence => {
        allSentences.push({
          sentence: sentence,
          tense: tense,
          score: calculateCurationScore(sentence, 'unknown', tense)
        });
      });
    }
  });
  
  // Sort by score and take the best
  allSentences.sort((a, b) => b.score - a.score);
  const bestSentences = allSentences.slice(0, maxTotal);
  
  // Redistribute back to tenses
  const newVerbData = {};
  Object.keys(verbData).forEach(tense => {
    newVerbData[tense] = [];
  });
  
  bestSentences.forEach(item => {
    newVerbData[item.tense].push(item.sentence);
  });
  
  // Update the original verb data
  Object.keys(newVerbData).forEach(tense => {
    verbData[tense] = newVerbData[tense];
  });
  
  return {
    total_before: allSentences.length,
    total_after: bestSentences.length,
    tenses_affected: Object.keys(newVerbData).filter(t => newVerbData[t].length > 0).length
  };
}

function calculateCurationScore(sentence, verb, tense) {
  let score = 0;
  const spanish = sentence.spanish || '';
  const english = sentence.english || '';
  
  // Base quality indicators
  if (spanish.length >= 15 && spanish.length <= 80) score += 15; // Good length
  if (/[ñáéíóúü]/i.test(spanish)) score += 5; // Spanish characters
  if (english && !english.includes('[NEEDS TRANSLATION]')) score += 10; // Has translation
  
  // Source reliability bonus
  if (sentence.source) {
    if (typeof sentence.source === 'object') {
      if (sentence.source.type === 'web_scraping') score += 15; // Authentic
      if (sentence.source.type === 'transformed') score += 8; // Pedagogical
    } else if (sentence.source.includes('scraping')) {
      score += 15;
    }
  }
  
  // Quality metadata bonus
  if (sentence.quality && sentence.quality.score) {
    score += Math.min(sentence.quality.score / 2, 20); // Up to 20 bonus points
  }
  
  // Pedagogical value
  const wordCount = spanish.split(' ').length;
  if (wordCount >= 5 && wordCount <= 12) score += 10; // Ideal complexity
  
  // Cultural context bonus
  if (/\b(familia|trabajo|escuela|casa|comida|amigos|tiempo)\b/i.test(spanish)) {
    score += 8;
  }
  
  // Question format bonus (good for learning)
  if (spanish.startsWith('¿')) score += 5;
  
  // Penalty for problems
  if (spanish.includes('_____')) score -= 20; // Fill-in-the-blank
  if (spanish.includes('©')) score -= 15; // Copyright notice
  if (spanish.length > 120) score -= 10; // Too long
  if (wordCount < 4) score -= 10; // Too short
  
  // Bonus for common, useful verbs in Tier 1
  if (verb && ['SER', 'ESTAR', 'TENER', 'HACER'].includes(verb.toUpperCase())) {
    score += 5;
  }
  
  return Math.max(0, score);
}

function displayCurationReport(report) {
  console.log(`\n✂️  CORPUS CURATION REPORT:`);
  console.log(`   📝 Total sentences: ${report.total_before} → ${report.total_after}`);
  console.log(`   📉 Overall reduction: ${Math.round((1 - report.total_after/report.total_before) * 100)}%`);
  
  console.log(`\n📚 Curation by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    const reduction = Math.round((1 - tierData.after/tierData.before) * 100);
    
    console.log(`   Tier ${tier}:`);
    console.log(`     Before: ${tierData.before} sentences`);
    console.log(`     After: ${tierData.after} sentences`);
    console.log(`     Reduction: ${reduction}%`);
    console.log(`     Verbs processed: ${tierData.verbs_processed}`);
    console.log(`     Combinations curated: ${tierData.combinations_curated}`);
  });
  
  console.log(`\n🎯 CURATION STRATEGY:`);
  Object.keys(CURATION_TARGETS).forEach(tier => {
    const target = CURATION_TARGETS[tier];
    console.log(`   Tier ${tier}: ${target.examples_per_combination} examples per combination, max ${target.max_per_verb} per verb`);
  });
  
  console.log(`\n💾 BACKUP STRATEGY:`);
  console.log(`   📁 Full corpus preserved in *-full-backup.json files`);
  console.log(`   🔄 Can restore anytime: cp tier1-complete-full-backup.json tier1-complete.json`);
  console.log(`   ✂️  Active corpus optimized for learning efficiency`);
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Focused learning - quality over quantity`);
  console.log(`   ⚡ Faster deck completion - less overwhelming`);
  console.log(`   🏆 Best examples preserved - high pedagogical value`);
  console.log(`   📚 Subject diversity maintained where possible`);
  console.log(`   💾 Full data preserved - nothing permanently lost`);
}

if (require.main === module) {
  curateCorpusForLearning();
}

module.exports = { curateCorpusForLearning };
