#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Unnatural gerund patterns that should be removed
const unnaturalPatterns = [
  /estoy queriendo|estás queriendo|está queriendo|estamos queriendo|estáis queriendo|están queriendo/i,
  /estoy necesitando|estás necesitando|está necesitando|estamos necesitando|estáis necesitando|están necesitando/i,
  /estoy sabiendo|estás sabiendo|está sabiendo|estamos sabiendo|estáis sabiendo|están sabiendo/i
];

function cleanCorpusFile(filePath) {
  console.log(`\n🔍 Cleaning ${path.basename(filePath)}...`);
  
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
          const isUnnatural = unnaturalPatterns.some(pattern => 
            pattern.test(sentence.spanish)
          );
          
          if (isUnnatural) {
            console.log(`  ❌ Removing: "${sentence.spanish}"`);
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
  console.log('🧹 Cleaning unnatural gerund sentences from corpus...');
  
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
      totalRemoved += cleanCorpusFile(filePath);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  });
  
  console.log(`\n🎯 Total unnatural sentences removed: ${totalRemoved}`);
  console.log('✨ Corpus cleaning complete!');
}

if (require.main === module) {
  main();
}
