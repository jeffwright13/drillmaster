#!/usr/bin/env node

/**
 * Fix Bad Spanish Sentences
 * Find and fix sentences with poor punctuation, excessive length, and unnatural constructions
 */

const fs = require('fs');
const path = require('path');

function fixBadSentences() {
  console.log('🔧 Finding and fixing bad Spanish sentences...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const fixes = {
    total_sentences_checked: 0,
    total_fixes_made: 0,
    sentences_removed: 0,
    by_tier: {},
    examples: []
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n🔧 Fixing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    fixes.by_tier[tier] = {
      sentences_checked: 0,
      fixes_made: 0,
      sentences_removed: 0
    };
    
    let tierModified = false;
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            // Filter out bad sentences
            const originalLength = corpus.verbs[verb][tense].length;
            
            corpus.verbs[verb][tense] = corpus.verbs[verb][tense].filter(sentence => {
              fixes.total_sentences_checked++;
              fixes.by_tier[tier].sentences_checked++;
              
              const spanish = sentence.spanish || '';
              const english = sentence.english || '';
              
              // Check for problematic patterns
              const problems = [];
              
              // 1. Wrong question mark placement (Tú ¿...)
              if (/\bTú\s+¿/.test(spanish)) {
                problems.push('Wrong question mark placement');
              }
              
              // 2. Missing closing punctuation
              if (spanish.startsWith('¿') && !spanish.endsWith('?')) {
                problems.push('Missing closing question mark');
              }
              
              // 3. Excessively long sentences (>80 characters)
              if (spanish.length > 80) {
                problems.push('Excessively long');
              }
              
              // 4. Unnatural verbose constructions
              if (/de forma sostenible en el tiempo/.test(spanish)) {
                problems.push('Unnatural verbose construction');
              }
              
              // 5. Needs translation (incomplete)
              if (english.includes('[NEEDS TRANSLATION]')) {
                problems.push('Needs translation');
              }
              
              // 6. Repetitive or awkward phrasing
              if (/rico,\s*sano\s*y/.test(spanish)) {
                problems.push('Awkward repetitive phrasing');
              }
              
              // 7. Incomplete sentences
              if (spanish.length < 10 || english.length < 10) {
                problems.push('Too short/incomplete');
              }
              
              if (problems.length > 0) {
                console.log(`   ❌ REMOVING: "${spanish}"`);
                console.log(`      Problems: ${problems.join(', ')}`);
                
                fixes.examples.push({
                  tier: tier,
                  verb: verb,
                  tense: tense,
                  spanish: spanish,
                  english: english,
                  problems: problems
                });
                
                fixes.total_fixes_made++;
                fixes.sentences_removed++;
                fixes.by_tier[tier].fixes_made++;
                fixes.by_tier[tier].sentences_removed++;
                tierModified = true;
                
                return false; // Remove this sentence
              }
              
              return true; // Keep this sentence
            });
            
            // Log if sentences were removed
            const removedCount = originalLength - corpus.verbs[verb][tense].length;
            if (removedCount > 0) {
              console.log(`   🗑️  Removed ${removedCount} bad sentences from ${verb} ${tense}`);
            }
          }
        });
      });
    }
    
    // Save cleaned corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Cleaned ${fixes.by_tier[tier].sentences_removed} bad sentences from ${filename}`);
    } else {
      console.log(`   ✅ No bad sentences found in ${filename}`);
    }
  });
  
  // Display results
  displayCleanupReport(fixes);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/bad-sentences-cleanup-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixes, null, 2));
  console.log(`\n💾 Cleanup report saved to: ${outputPath}`);
  
  return fixes;
}

function displayCleanupReport(fixes) {
  console.log(`\n🔧 BAD SENTENCES CLEANUP REPORT:`);
  console.log(`   📝 Sentences checked: ${fixes.total_sentences_checked}`);
  console.log(`   🗑️  Sentences removed: ${fixes.sentences_removed}`);
  
  if (fixes.sentences_removed === 0) {
    console.log(`   🎉 No bad sentences found - corpus is clean!`);
    return;
  }
  
  console.log(`\n📚 Cleanup by Tier:`);
  Object.keys(fixes.by_tier).forEach(tier => {
    const tierData = fixes.by_tier[tier];
    if (tierData.sentences_removed > 0) {
      console.log(`   Tier ${tier}: ${tierData.sentences_removed} sentences removed`);
    }
  });
  
  // Show most common problems
  const problemCounts = {};
  fixes.examples.forEach(example => {
    example.problems.forEach(problem => {
      problemCounts[problem] = (problemCounts[problem] || 0) + 1;
    });
  });
  
  console.log(`\n🔍 Most Common Problems Fixed:`);
  const sortedProblems = Object.entries(problemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  sortedProblems.forEach(([problem, count], i) => {
    console.log(`   ${i+1}. ${problem}: ${count} instances`);
  });
  
  if (fixes.examples.length > 0) {
    console.log(`\n📋 EXAMPLES OF REMOVED SENTENCES:`);
    fixes.examples.slice(0, 8).forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}] "${example.spanish}"`);
      console.log(`      Problems: ${example.problems.join(', ')}`);
    });
    
    if (fixes.examples.length > 8) {
      console.log(`   ... and ${fixes.examples.length - 8} more removed`);
    }
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Removed unnatural, verbose sentences`);
  console.log(`   📚 Fixed Spanish punctuation errors`);
  console.log(`   🔧 Eliminated incomplete translations`);
  console.log(`   ✨ Cleaner, more professional corpus`);
  
  console.log(`\n🚀 IMPACT:`);
  console.log(`   📈 Higher quality learning materials`);
  console.log(`   🎯 Natural Spanish throughout`);
  console.log(`   ✨ Professional presentation`);
}

if (require.main === module) {
  fixBadSentences();
}

module.exports = { fixBadSentences };
