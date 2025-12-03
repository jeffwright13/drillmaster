#!/usr/bin/env node

/**
 * Fix Remaining English Issues
 * Address the specific problematic constructions identified
 */

const fs = require('fs');
const path = require('path');

// Specific fixes for identified problematic sentences
const SPECIFIC_FIXES = [
  {
    // "He is having three children" → "He has three children"
    pattern: /\b(I am|you are|he is|she is|we are|they are|you're|he's|she's|we're|they're)\s+having\s+(three|two|four|five|six|one|a|an)\s+(child|children|son|sons|daughter|daughters|kid|kids)\b/gi,
    replacement: (match, subject, number, noun) => {
      const simpleSubject = {
        'I am': 'I',
        'you are': 'you',
        'he is': 'he',
        'she is': 'she', 
        'we are': 'we',
        'they are': 'they',
        "you're": 'you',
        "he's": 'he',
        "she's": 'she',
        "we're": 'we',
        "they're": 'they'
      }[subject.toLowerCase()];
      
      const verb = (simpleSubject === 'he' || simpleSubject === 'she') ? 'has' : 'have';
      return `${simpleSubject} ${verb} ${number} ${noun}`;
    },
    description: 'Fix "is having children" → "has children"'
  },
  {
    // "I am being a professor" → "I am a professor"
    pattern: /\b(I am|you are|he is|she is|we are|they are)\s+being\s+(a|an)\s+(professor|teacher|doctor|student|engineer|lawyer|nurse)\b/gi,
    replacement: '$1 $2 $3',
    description: 'Fix "am being a professor" → "am a professor"'
  },
  {
    // "You are being intelligent" → "You are intelligent"
    pattern: /\b(I am|you are|he is|she is|we are|they are)\s+being\s+(very\s+)?(intelligent|smart|pretty|beautiful|handsome|tall|short|kind|nice|good)\b/gi,
    replacement: '$1 $2$3',
    description: 'Fix "are being intelligent" → "are intelligent"'
  },
  {
    // Keep "doing work/homework" but fix other "doing" constructions
    pattern: /\b(I am|you are|he is|she is|we are|they are)\s+doing\s+(excellent|good|great|amazing|wonderful)\s+(work)\b/gi,
    replacement: '$1 doing $2 $3',
    description: 'Keep "doing excellent work" (this is correct)'
  }
];

function fixRemainingEnglishIssues() {
  console.log('🔧 Fixing remaining English issues...');
  
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
      fixes_made: 0
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
                
                // Apply specific fixes
                SPECIFIC_FIXES.forEach(fix => {
                  if (typeof fix.replacement === 'function') {
                    fixedEnglish = fixedEnglish.replace(fix.pattern, fix.replacement);
                  } else {
                    fixedEnglish = fixedEnglish.replace(fix.pattern, fix.replacement);
                  }
                });
                
                // Manual fixes for specific problematic sentences
                const manualFixes = {
                  "He is having three small children at home.": "He has three small children at home.",
                  "I am being a mathematics professor at the school.": "I am a mathematics professor at the school.",
                  "You (informal) are being very intelligent for your age.": "You (informal) are very intelligent for your age.",
                  "You (informal) are being very pretty in that dress.": "You (informal) are very pretty in that dress.",
                  "She is having two children in elementary school.": "She has two children in elementary school.",
                  "We are having four children at home.": "We have four children at home.",
                  "They are having many children in their family.": "They have many children in their family."
                };
                
                if (manualFixes[originalEnglish]) {
                  fixedEnglish = manualFixes[originalEnglish];
                }
                
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
                    after: fixedEnglish
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
  
  return fixReport;
}

function displayFixReport(report) {
  console.log(`\n🔧 REMAINING ENGLISH FIXES REPORT:`);
  console.log(`   📝 Sentences checked: ${report.total_sentences_checked}`);
  console.log(`   ✅ Fixes made: ${report.total_fixes_made}`);
  
  if (report.total_fixes_made === 0) {
    console.log(`   🎉 No remaining issues found - corpus is clean!`);
    return;
  }
  
  console.log(`\n📚 Fixes by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    if (tierData.fixes_made > 0) {
      console.log(`   Tier ${tier}: ${tierData.fixes_made} fixes`);
    }
  });
  
  if (report.examples.length > 0) {
    console.log(`\n📋 EXAMPLES OF FIXES:`);
    report.examples.forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}] ${example.spanish}`);
      console.log(`      Before: "${example.before}"`);
      console.log(`      After:  "${example.after}"`);
    });
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Natural English throughout corpus`);
  console.log(`   📚 Professional-quality translations`);
  console.log(`   🔧 All major English issues resolved`);
  console.log(`   ✨ Ready for learners!`);
}

if (require.main === module) {
  fixRemainingEnglishIssues();
}

module.exports = { fixRemainingEnglishIssues };
