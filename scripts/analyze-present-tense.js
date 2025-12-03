#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== CURRENT TIER 1 PRESENT TENSE SENTENCES ===\n');

let totalSentences = 0;
const verbs = Object.keys(tier1Data.verbs || {});

verbs.forEach((verbName, index) => {
  const verbData = tier1Data.verbs[verbName];
  const presentSentences = verbData.present || [];
  
  console.log(`${index + 1}. ${verbName} (${presentSentences.length} sentences):`);
  
  presentSentences.forEach((sentence, sentIndex) => {
    console.log(`   ${sentIndex + 1}. ES: "${sentence.spanish}"`);
    console.log(`      EN: "${sentence.english}"`);
    console.log(`      Subject: ${sentence.subject}`);
    console.log(`      Source: ${sentence.source || 'N/A'}`);
    console.log('');
    totalSentences++;
  });
  
  console.log('---\n');
});

console.log(`TOTAL PRESENT TENSE SENTENCES: ${totalSentences}`);
console.log(`TARGET: 90 sentences (need ${90 - totalSentences} more)`);
