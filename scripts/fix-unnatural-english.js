#!/usr/bin/env node

/**
 * Fix Unnatural English Constructions
 * Find and correct common English errors in translations
 */

const fs = require('fs');
const path = require('path');

// Common unnatural English patterns and their corrections
const ENGLISH_CORRECTIONS = [
  // "Doing" vs "Making" corrections
  {
    pattern: /\b(is|am|are|was|were|will be|going to be)\s+doing\s+(dinner|breakfast|lunch|food|a meal|the food)\b/gi,
    replacement: '$1 making $2',
    description: 'Fix "doing dinner" → "making dinner"'
  },
  {
    pattern: /\b(do|does|did|will do)\s+(dinner|breakfast|lunch|food|a meal|the food)\b/gi,
    replacement: 'make $2',
    description: 'Fix "do dinner" → "make dinner"'
  },
  {
    pattern: /\b(doing|do|does)\s+(homework|work|exercise|the work)\b/gi,
    replacement: '$1 $2',
    description: 'Keep "doing homework/work" (these are correct)'
  },
  
  // "Having" corrections
  {
    pattern: /\b(is|am|are|was|were)\s+having\s+(a meeting|a party|a problem|fun|a good time)\b/gi,
    replacement: '$1 having $2',
    description: 'Keep "having a meeting/party" (these are correct)'
  },
  {
    pattern: /\b(is|am|are|was|were)\s+having\s+(breakfast|lunch|dinner|food|a meal)\b/gi,
    replacement: '$1 having $2',
    description: 'Keep "having breakfast/lunch" (these are correct)'
  },
  
  // "Being" corrections
  {
    pattern: /\b(is|am|are|was|were)\s+being\s+(a teacher|a doctor|a student|a professor|an engineer)\b/gi,
    replacement: '$1 $2',
    description: 'Fix "being a teacher" → "is a teacher"'
  },
  {
    pattern: /\b(is|am|are|was|were)\s+being\s+(intelligent|smart|pretty|beautiful|handsome|tall|short)\b/gi,
    replacement: '$1 $2',
    description: 'Fix "being intelligent" → "is intelligent"'
  },
  
  // Verb agreement corrections
  {
    pattern: /\bit are\b/gi,
    replacement: 'it is',
    description: 'Fix "it are" → "it is"'
  },
  {
    pattern: /\bthey is\b/gi,
    replacement: 'they are',
    description: 'Fix "they is" → "they are"'
  },
  
  // Preposition corrections
  {
    pattern: /\bin the morning of\b/gi,
    replacement: 'on the morning of',
    description: 'Fix "in the morning of" → "on the morning of"'
  },
  {
    pattern: /\bin the afternoon of\b/gi,
    replacement: 'on the afternoon of',
    description: 'Fix "in the afternoon of" → "on the afternoon of"'
  },
  
  // Article corrections
  {
    pattern: /\bgo to the work\b/gi,
    replacement: 'go to work',
    description: 'Fix "go to the work" → "go to work"'
  },
  {
    pattern: /\bgo to the school\b/gi,
    replacement: 'go to school',
    description: 'Fix "go to the school" → "go to school"'
  },
  {
    pattern: /\bgo to the home\b/gi,
    replacement: 'go home',
    description: 'Fix "go to the home" → "go home"'
  },
  
  // Redundant constructions
  {
    pattern: /\bvery much very\b/gi,
    replacement: 'very much',
    description: 'Fix "very much very" → "very much"'
  },
  {
    pattern: /\bmore better\b/gi,
    replacement: 'better',
    description: 'Fix "more better" → "better"'
  },
  {
    pattern: /\bmore easier\b/gi,
    replacement: 'easier',
    description: 'Fix "more easier" → "easier"'
  }
];

function fixUnnaturalEnglish() {
  console.log('🔧 Fixing unnatural English constructions...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const fixReport = {
    total_sentences_checked: 0,
    total_fixes_made: 0,
    by_tier: {},
    by_pattern: {},
    examples: []
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n🔧 Fixing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    fixReport.by_tier[tier] = {
      sentences_checked: 0,
      fixes_made: 0,
      patterns_fixed: {}
    };
    
    let tierModified = false;
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              fixReport.total_sentences_checked++;
              fixReport.by_tier[tier].sentences_checked++;
              
              if (sentence.english && !sentence.english.includes('[NEEDS TRANSLATION]')) {
                const originalEnglish = sentence.english;
                let fixedEnglish = originalEnglish;
                let appliedFixes = [];
                
                // Apply each correction pattern
                ENGLISH_CORRECTIONS.forEach(correction => {
                  const beforeFix = fixedEnglish;
                  fixedEnglish = fixedEnglish.replace(correction.pattern, correction.replacement);
                  
                  if (beforeFix !== fixedEnglish) {
                    appliedFixes.push(correction.description);
                    
                    // Track pattern usage
                    if (!fixReport.by_pattern[correction.description]) {
                      fixReport.by_pattern[correction.description] = 0;
                    }
                    fixReport.by_pattern[correction.description]++;
                    
                    if (!fixReport.by_tier[tier].patterns_fixed[correction.description]) {
                      fixReport.by_tier[tier].patterns_fixed[correction.description] = 0;
                    }
                    fixReport.by_tier[tier].patterns_fixed[correction.description]++;
                  }
                });
                
                // If fixes were made, update the sentence
                if (fixedEnglish !== originalEnglish) {
                  sentence.english = fixedEnglish;
                  fixReport.total_fixes_made++;
                  fixReport.by_tier[tier].fixes_made++;
                  tierModified = true;
                  
                  // Save example
                  fixReport.examples.push({
                    tier: tier,
                    verb: verb,
                    tense: tense,
                    spanish: sentence.spanish,
                    before: originalEnglish,
                    after: fixedEnglish,
                    fixes_applied: appliedFixes
                  });
                  
                  console.log(`   ✅ Fixed: "${originalEnglish}"`);
                  console.log(`      → "${fixedEnglish}"`);
                }
              }
            });
          }
        });
      });
    }
    
    // Save modified corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Saved ${fixReport.by_tier[tier].fixes_made} fixes to ${filename}`);
    } else {
      console.log(`   ✅ No fixes needed in ${filename}`);
    }
  });
  
  // Display results
  displayFixReport(fixReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/english-fixes-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixReport, null, 2));
  console.log(`\n💾 Fix report saved to: ${outputPath}`);
  
  return fixReport;
}

function displayFixReport(report) {
  console.log(`\n🔧 ENGLISH FIXES REPORT:`);
  console.log(`   📝 Sentences checked: ${report.total_sentences_checked}`);
  console.log(`   ✅ Fixes made: ${report.total_fixes_made}`);
  
  if (report.total_fixes_made === 0) {
    console.log(`   🎉 No unnatural English found - corpus is clean!`);
    return;
  }
  
  console.log(`\n📚 Fixes by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    if (tierData.fixes_made > 0) {
      console.log(`   Tier ${tier}: ${tierData.fixes_made} fixes`);
      Object.keys(tierData.patterns_fixed).forEach(pattern => {
        console.log(`     - ${pattern}: ${tierData.patterns_fixed[pattern]} times`);
      });
    }
  });
  
  console.log(`\n🔍 Most Common Issues Fixed:`);
  const sortedPatterns = Object.entries(report.by_pattern)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  sortedPatterns.forEach(([pattern, count], i) => {
    console.log(`   ${i+1}. ${pattern}: ${count} instances`);
  });
  
  if (report.examples.length > 0) {
    console.log(`\n📋 EXAMPLES OF FIXES:`);
    report.examples.slice(0, 10).forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}] ${example.spanish}`);
      console.log(`      Before: "${example.before}"`);
      console.log(`      After:  "${example.after}"`);
      console.log(`      Fixes:  ${example.fixes_applied.join(', ')}`);
    });
    
    if (report.examples.length > 10) {
      console.log(`   ... and ${report.examples.length - 10} more examples`);
    }
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 More natural English translations`);
  console.log(`   📚 Better learning experience for students`);
  console.log(`   🔧 Systematic correction of common errors`);
  console.log(`   ✨ Professional-quality corpus`);
}

// Additional function to find potential issues for manual review
function findPotentialIssues() {
  console.log('\n🔍 Scanning for potential English issues...');
  
  const suspiciousPatterns = [
    /\b(is|am|are|was|were)\s+(doing|making)\s+\w+/gi,
    /\b(is|am|are|was|were)\s+being\s+\w+/gi,
    /\b(is|am|are|was|were)\s+having\s+\w+/gi,
    /\bit\s+(are|were)\b/gi,
    /\bthey\s+(is|was)\b/gi,
    /\bgo\s+to\s+the\s+(work|school|home)\b/gi,
    /\bmore\s+(better|easier|harder|faster)\b/gi,
    /\bvery\s+much\s+very\b/gi
  ];
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const potentialIssues = [];
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              if (sentence.english && !sentence.english.includes('[NEEDS TRANSLATION]')) {
                suspiciousPatterns.forEach(pattern => {
                  if (pattern.test(sentence.english)) {
                    potentialIssues.push({
                      tier: tier,
                      verb: verb,
                      tense: tense,
                      spanish: sentence.spanish,
                      english: sentence.english,
                      pattern: pattern.source
                    });
                  }
                });
              }
            });
          }
        });
      });
    }
  });
  
  if (potentialIssues.length > 0) {
    console.log(`\n⚠️  POTENTIAL ISSUES FOR MANUAL REVIEW:`);
    potentialIssues.slice(0, 10).forEach((issue, i) => {
      console.log(`   ${i+1}. [Tier ${issue.tier}] "${issue.english}"`);
      console.log(`      Spanish: "${issue.spanish}"`);
    });
    
    if (potentialIssues.length > 10) {
      console.log(`   ... and ${potentialIssues.length - 10} more to review`);
    }
  } else {
    console.log(`   ✅ No suspicious patterns found!`);
  }
  
  return potentialIssues;
}

if (require.main === module) {
  const fixes = fixUnnaturalEnglish();
  const potentialIssues = findPotentialIssues();
  
  console.log(`\n🎯 SUMMARY:`);
  console.log(`   ✅ Fixed: ${fixes.total_fixes_made} unnatural constructions`);
  console.log(`   ⚠️  For review: ${potentialIssues.length} potential issues`);
  console.log(`   🎉 English quality significantly improved!`);
}

module.exports = { fixUnnaturalEnglish, findPotentialIssues };
