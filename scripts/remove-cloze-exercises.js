#!/usr/bin/env node

/**
 * Remove Fill-in-the-Blank/Cloze Exercise Sentences
 * Clean up textbook exercises while preserving critical examples
 */

const fs = require('fs');
const path = require('path');

function removeClozeExercises() {
  console.log('🧹 Removing fill-in-the-blank/cloze exercise sentences...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const removalReport = {
    total_removed: 0,
    by_tier: {},
    removed_sentences: [],
    preserved_critical: [],
    patterns_found: {}
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Cleaning ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    removalReport.by_tier[tier] = {
      removed: 0,
      preserved: 0,
      total_before: 0,
      total_after: 0
    };
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            const originalLength = corpus.verbs[verb][tense].length;
            removalReport.by_tier[tier].total_before += originalLength;
            
            // Filter out cloze exercises
            const filtered = corpus.verbs[verb][tense].filter(sentence => {
              const analysis = analyzeSentence(sentence, verb, tense, tier);
              
              if (analysis.is_cloze_exercise) {
                // Check if this is a critical missing example
                if (analysis.is_critical) {
                  console.log(`   ⚠️  Preserving critical example: ${sentence.spanish.substring(0, 50)}...`);
                  removalReport.preserved_critical.push({
                    tier, verb, tense,
                    spanish: sentence.spanish,
                    reason: analysis.critical_reason
                  });
                  removalReport.by_tier[tier].preserved++;
                  return true; // Keep it
                } else {
                  console.log(`   🗑️  Removing cloze: ${sentence.spanish.substring(0, 50)}...`);
                  removalReport.removed_sentences.push({
                    tier, verb, tense,
                    spanish: sentence.spanish,
                    pattern: analysis.cloze_pattern
                  });
                  removalReport.by_tier[tier].removed++;
                  removalReport.total_removed++;
                  
                  // Track patterns
                  if (!removalReport.patterns_found[analysis.cloze_pattern]) {
                    removalReport.patterns_found[analysis.cloze_pattern] = 0;
                  }
                  removalReport.patterns_found[analysis.cloze_pattern]++;
                  
                  return false; // Remove it
                }
              }
              
              return true; // Keep non-cloze sentences
            });
            
            corpus.verbs[verb][tense] = filtered;
            removalReport.by_tier[tier].total_after += filtered.length;
          }
        });
      });
    }
    
    // Save cleaned corpus
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
    console.log(`   ✅ Removed ${removalReport.by_tier[tier].removed} cloze exercises`);
    console.log(`   ⚠️  Preserved ${removalReport.by_tier[tier].preserved} critical examples`);
  });
  
  // Display results
  displayRemovalReport(removalReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/cloze-removal-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(removalReport, null, 2));
  console.log(`\n💾 Removal report saved to: ${outputPath}`);
  
  return removalReport;
}

function analyzeSentence(sentence, verb, tense, tier) {
  const spanish = sentence.spanish || '';
  const analysis = {
    is_cloze_exercise: false,
    cloze_pattern: null,
    is_critical: false,
    critical_reason: null
  };
  
  // Identify cloze/fill-in-the-blank patterns
  const clozePatterns = [
    { name: 'multiple_underscores', regex: /_{3,}/g },
    { name: 'multiple_blanks', regex: /_{3,}.*_{3,}/g },
    { name: 'long_underscore_sequence', regex: /_{5,}/g },
    { name: 'underscore_with_commas', regex: /_{3,}.*,.*_{3,}/g },
    { name: 'days_of_week_blanks', regex: /semanas de la semana son:.*_{3,}/i },
    { name: 'name_blanks', regex: /me llamo\s*_{3,}/i },
    { name: 'multiple_choice_blanks', regex: /_{3,}.*_{3,}.*_{3,}/g },
    { name: 'exercise_instruction', regex: /complete|completa|escribe|llena|rellena/i },
    { name: 'copyright_notice', regex: /©.*máximo nivel/i }
  ];
  
  // Check each pattern
  clozePatterns.forEach(pattern => {
    if (pattern.regex.test(spanish)) {
      analysis.is_cloze_exercise = true;
      analysis.cloze_pattern = pattern.name;
    }
  });
  
  // Additional checks for exercise-like content
  if (spanish.includes('Ejemplos:') || 
      spanish.includes('Ejemplo:') ||
      spanish.includes('Modelo:') ||
      spanish.startsWith('TÚ:') ||
      spanish.startsWith('ROSA:') ||
      spanish.includes('Presente a sus compañeros')) {
    analysis.is_cloze_exercise = true;
    analysis.cloze_pattern = 'textbook_exercise';
  }
  
  // Check if this would be a critical loss
  if (analysis.is_cloze_exercise) {
    analysis.is_critical = isCriticalExample(sentence, verb, tense, tier);
    if (analysis.is_critical) {
      analysis.critical_reason = getCriticalReason(sentence, verb, tense, tier);
    }
  }
  
  return analysis;
}

function isCriticalExample(sentence, verb, tense, tier) {
  // Define critical verbs that are hard to find examples for
  const criticalVerbs = {
    '2': ['LLAMARSE', 'LEVANTARSE', 'DUCHARSE', 'SENTARSE', 'ACOSTARSE', 'DESPERTARSE'],
    '3': ['VENIR', 'VER', 'DAR', 'SABER', 'OÍR', 'TRAER'],
    '4': ['SENTIRSE', 'PREOCUPARSE', 'DIVERTIRSE'],
    '5': ['GUSTAR', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'PARECER']
  };
  
  const tierCriticalVerbs = criticalVerbs[tier] || [];
  
  // If this is a critical verb we're missing examples for, consider preserving
  if (tierCriticalVerbs.includes(verb)) {
    // But only if the sentence has some actual content (not just blanks)
    const spanish = sentence.spanish || '';
    const contentWords = spanish.replace(/_{3,}/g, '').trim().split(/\s+/).length;
    
    // If there are at least 4 content words, it might be worth preserving
    return contentWords >= 4;
  }
  
  return false;
}

function getCriticalReason(sentence, verb, tense, tier) {
  return `Critical ${verb} example for Tier ${tier} - has content beyond blanks`;
}

function displayRemovalReport(report) {
  console.log(`\n🧹 CLOZE EXERCISE REMOVAL REPORT:`);
  console.log(`   🗑️  Total removed: ${report.total_removed} sentences`);
  console.log(`   ⚠️  Critical preserved: ${report.preserved_critical.length} sentences`);
  
  console.log(`\n📚 Removal by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    console.log(`   Tier ${tier}:`);
    console.log(`     Before: ${tierData.total_before} sentences`);
    console.log(`     After: ${tierData.total_after} sentences`);
    console.log(`     Removed: ${tierData.removed} cloze exercises`);
    console.log(`     Preserved: ${tierData.preserved} critical examples`);
  });
  
  console.log(`\n🔍 Patterns Found:`);
  Object.keys(report.patterns_found).forEach(pattern => {
    const count = report.patterns_found[pattern];
    console.log(`   ${pattern}: ${count} instances`);
  });
  
  if (report.preserved_critical.length > 0) {
    console.log(`\n⚠️  PRESERVED CRITICAL EXAMPLES:`);
    report.preserved_critical.slice(0, 5).forEach((item, i) => {
      console.log(`   ${i+1}. [${item.verb}] ${item.spanish.substring(0, 60)}...`);
      console.log(`      Reason: ${item.reason}`);
    });
    
    if (report.preserved_critical.length > 5) {
      console.log(`   ... and ${report.preserved_critical.length - 5} more`);
    }
  }
  
  console.log(`\n🗑️  REMOVED EXAMPLES (sample):`);
  report.removed_sentences.slice(0, 5).forEach((item, i) => {
    console.log(`   ${i+1}. [${item.pattern}] ${item.spanish.substring(0, 60)}...`);
  });
  
  if (report.removed_sentences.length > 5) {
    console.log(`   ... and ${report.removed_sentences.length - 5} more`);
  }
  
  console.log(`\n✅ Corpus cleaned of textbook exercises!`);
  console.log(`   📝 Ready for quality re-assessment`);
}

if (require.main === module) {
  removeClozeExercises();
}

module.exports = { removeClozeExercises };
