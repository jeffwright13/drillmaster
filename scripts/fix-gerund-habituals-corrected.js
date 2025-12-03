#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Only target PRESENT PROGRESSIVE + habitual (unnatural)
// NOT going-to future + habitual (which is natural)
const unnaturalGerundPatterns = [
  // Present progressive + habitual time expressions (unnatural)
  /\b(am|are|is)\s+\w+ing\b.*(every|each|todos los|cada)/i
];

function fixCorpusFile(filePath) {
  console.log(`\n🔍 Fixing ${path.basename(filePath)}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let removedCount = 0;
  let totalSentences = 0;
  
  // Process each verb
  Object.keys(data.verbs).forEach(verbKey => {
    const verb = data.verbs[verbKey];
    
    // Process each tense
    Object.keys(verb).forEach(tense => {
      if (Array.isArray(verb[tense])) {
        const originalLength = verb[tense].length;
        totalSentences += originalLength;
        
        // Only filter present-progressive tense for unnatural patterns
        if (tense === 'present-progressive') {
          verb[tense] = verb[tense].filter(sentence => {
            const isUnnatural = unnaturalGerundPatterns.some(pattern => 
              pattern.test(sentence.english)
            );
            
            if (isUnnatural) {
              console.log(`  ❌ Removing from ${tense}: "${sentence.english}"`);
              console.log(`     Spanish: "${sentence.spanish}"`);
              removedCount++;
            }
            
            return !isUnnatural;
          });
        }
        // Keep all going-to future sentences (they're natural)
      }
    });
  });
  
  // Write cleaned data back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`  ✅ Removed ${removedCount} unnatural sentences out of ${totalSentences} total`);
  return removedCount;
}

function main() {
  console.log('🧹 Fixing ONLY present progressive + habitual combinations...');
  console.log('❌ Removing: "I am eating every day" (present progressive + habitual = unnatural)');
  console.log('✅ Keeping: "I\'m going to eat every Friday" (going-to future + habitual = natural)');
  console.log('✅ Keeping: "I eat every day" (simple present + habitual = natural)');
  console.log('✅ Keeping: "I am eating now" (present progressive + now = natural)');
  
  const corpusDir = path.join(__dirname, '..', 'data', 'corpus');
  const files = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  let totalRemoved = 0;
  
  files.forEach(file => {
    const filePath = path.join(corpusDir, file);
    if (fs.existsSync(filePath)) {
      totalRemoved += fixCorpusFile(filePath);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });
  
  console.log(`\n🎯 Total unnatural present progressive sentences removed: ${totalRemoved}`);
  console.log('✨ Corrected gerund cleanup complete!');
  console.log('📝 Going-to future sentences preserved in their correct tense deck.');
}

if (require.main === module) {
  main();
}
