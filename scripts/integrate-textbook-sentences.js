#!/usr/bin/env node

/**
 * Integrate BASICO textbook sentences into the corpus
 * These are pre-approved pedagogical examples
 */

const fs = require('fs');
const path = require('path');

function integrateTextbookSentences() {
  console.log('📚 Integrating BASICO textbook sentences into corpus...');
  
  // Load textbook data
  const textbookPath = path.join(__dirname, '../data/corpus/basico-textbook-scraped.json');
  if (!fs.existsSync(textbookPath)) {
    console.error('❌ No textbook data found. Run pdf-textbook-scraper.js first.');
    return;
  }
  
  const textbookData = JSON.parse(fs.readFileSync(textbookPath, 'utf-8'));
  console.log(`📖 Loaded ${textbookData.metadata.pedagogical_sentences_found} textbook sentences`);
  console.log(`   📚 From: ${textbookData.metadata.source_files.join(', ')}`);
  console.log(`   🔤 Verbs: ${textbookData.metadata.verbs_found}`);
  
  // Load existing corpus files
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  let totalAdded = 0;
  const verbsAdded = new Set();
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Processing ${filename}...`);
    
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let addedToFile = 0;
    
    // Add textbook sentences to existing corpus
    Object.keys(textbookData.verbs).forEach(verb => {
      if (corpus.verbs && corpus.verbs[verb]) {
        Object.keys(textbookData.verbs[verb]).forEach(tense => {
          if (!corpus.verbs[verb][tense]) {
            corpus.verbs[verb][tense] = [];
          }
          
          // Add all textbook sentences (they're pre-approved)
          textbookData.verbs[verb][tense].forEach(sentence => {
            corpus.verbs[verb][tense].push(sentence);
            addedToFile++;
            totalAdded++;
            verbsAdded.add(verb);
          });
        });
      }
    });
    
    // Save updated corpus
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
    console.log(`   ✅ Added ${addedToFile} textbook sentences`);
  });
  
  console.log(`\n🎯 Integration complete!`);
  console.log(`   📝 Total sentences added: ${totalAdded}`);
  console.log(`   🔤 Verbs enhanced: ${verbsAdded.size}`);
  console.log(`   📚 Source: AVENTURAS Y VISTAS I textbook`);
  console.log(`   ✨ All sentences are pedagogically approved`);
  
  // Show some examples of what was added
  console.log(`\n📋 Examples of added textbook sentences:`);
  let exampleCount = 0;
  Object.keys(textbookData.verbs).slice(0, 5).forEach(verb => {
    Object.keys(textbookData.verbs[verb]).forEach(tense => {
      if (exampleCount < 10) {
        const sentence = textbookData.verbs[verb][tense][0];
        console.log(`   ${exampleCount + 1}. [${sentence.quality.score}] ${sentence.spanish}`);
        console.log(`      Verb: ${verb}, Tense: ${tense}, Volume: ${sentence.source.origin}`);
        exampleCount++;
      }
    });
  });
}

if (require.main === module) {
  integrateTextbookSentences();
}

module.exports = { integrateTextbookSentences };
