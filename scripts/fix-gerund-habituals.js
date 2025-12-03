#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns for unnatural gerund + habitual combinations
const unnaturalGerundPatterns = [
  // Present progressive + habitual time expressions
  /am.*ing.*(every|each|todos los|cada)/i,
  /are.*ing.*(every|each|todos los|cada)/i,
  /is.*ing.*(every|each|todos los|cada)/i,
  
  // Going-to future + habitual (also unnatural)
  /going to.*\b(every|each|todos los|cada)/i
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
        
        // Filter out unnatural sentences
        verb[tense] = verb[tense].filter(sentence => {
          const isUnnatural = unnaturalGerundPatterns.some(pattern => 
            pattern.test(sentence.english)
          );
          
          if (isUnnatural) {
            console.log(`  ❌ Removing: "${sentence.english}"`);
            console.log(`     Spanish: "${sentence.spanish}"`);
            removedCount++;
          }
          
          return !isUnnatural;
        });
      }
    });
  });
  
  // Write cleaned data back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`  ✅ Removed ${removedCount} unnatural sentences out of ${totalSentences} total`);
  return removedCount;
}

function main() {
  console.log('🧹 Fixing unnatural gerund + habitual combinations...');
  console.log('❌ Removing: "I am eating every day" (unnatural)');
  console.log('✅ Keeping: "I eat every day" (natural present)');
  console.log('✅ Keeping: "I am eating now" (natural progressive)');
  
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
  
  console.log(`\n🎯 Total unnatural gerund sentences removed: ${totalRemoved}`);
  console.log('✨ English gerund cleanup complete!');
}

if (require.main === module) {
  main();
}
