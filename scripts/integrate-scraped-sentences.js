#!/usr/bin/env node

/**
 * Integrate all scraped authentic sentences into the corpus
 * Preserve existing good sentences, add scraped ones
 */

const fs = require('fs');
const path = require('path');

function integrateScrapedSentences() {
  console.log('🔄 Integrating scraped sentences into corpus...');
  
  // Load scraped data
  const scrapedPath = path.join(__dirname, '../data/corpus/latin-american-scraped.json');
  const scrapedData = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
  
  // Load existing corpus files
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  let totalAdded = 0;
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Processing ${filename}...`);
    
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let addedToFile = 0;
    
    // Add scraped sentences to existing corpus
    Object.keys(scrapedData.verbs).forEach(verb => {
      if (corpus.verbs && corpus.verbs[verb]) {
        Object.keys(scrapedData.verbs[verb]).forEach(tense => {
          if (!corpus.verbs[verb][tense]) {
            corpus.verbs[verb][tense] = [];
          }
          
          // Add scraped sentences (they're already authentic)
          scrapedData.verbs[verb][tense].forEach(sentence => {
            // Only add if it's actually from scraping (not existing)
            if (sentence.source && sentence.source.includes('scraping')) {
              corpus.verbs[verb][tense].push(sentence);
              addedToFile++;
              totalAdded++;
            }
          });
        });
      }
    });
    
    // Save updated corpus
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
    console.log(`   ✅ Added ${addedToFile} authentic sentences`);
  });
  
  console.log(`\n🎯 Integration complete!`);
  console.log(`   📝 Total sentences added: ${totalAdded}`);
  console.log(`   ✨ All scraped authentic sentences now in corpus`);
}

if (require.main === module) {
  integrateScrapedSentences();
}

module.exports = { integrateScrapedSentences };
