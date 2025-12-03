#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 2 corpus
const tier2Path = path.join(__dirname, '../data/corpus/tier2-complete.json');
const tier2Data = JSON.parse(fs.readFileSync(tier2Path, 'utf8'));

console.log('=== TIER 2 CURRENT SENTENCE COUNTS BY TENSE ===\n');

const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
const verbs = Object.keys(tier2Data.verbs || {});

console.log(`Found ${verbs.length} verbs in Tier 2\n`);

console.log('Verb'.padEnd(15) + tenses.map(t => t.padEnd(12)).join('') + 'Total');
console.log('-'.repeat(15 + (tenses.length * 12) + 5));

let totals = {};
tenses.forEach(tense => totals[tense] = 0);

verbs.forEach(verbName => {
  const verbData = tier2Data.verbs[verbName];
  let row = verbName.padEnd(15);
  let verbTotal = 0;
  
  tenses.forEach(tense => {
    let count = 0;
    const tenseData = verbData[tense];
    
    if (Array.isArray(tenseData)) {
      count = tenseData.length;
    } else if (tenseData && tenseData.sentences) {
      count = tenseData.sentences.length;
    }
    
    row += count.toString().padEnd(12);
    totals[tense] += count;
    verbTotal += count;
  });
  
  row += verbTotal.toString();
  console.log(row);
});

console.log('-'.repeat(15 + (tenses.length * 12) + 5));
let totalRow = 'TOTAL'.padEnd(15);
let grandTotal = 0;
tenses.forEach(tense => {
  totalRow += totals[tense].toString().padEnd(12);
  grandTotal += totals[tense];
});
totalRow += grandTotal.toString();
console.log(totalRow);

console.log('\n=== TIER 2 VERB LIST ===');
verbs.forEach((verb, index) => {
  console.log(`${index + 1}. ${verb}`);
});

console.log('\n=== EXPANSION OPPORTUNITY ===');
console.log('Current Tier 2: 72 cards from ~36 sentences');
console.log('If we expand like Tier 1 (9-10 sentences per verb per tense):');
console.log(`Target: ${verbs.length} verbs × 6 tenses × 9 sentences = ${verbs.length * 6 * 9} sentences`);
console.log(`That would generate ~${verbs.length * 6 * 9 * 2} cards (massive expansion!)`);

console.log(`\nCurrent total: ${grandTotal} sentences`);
console.log(`Expansion potential: ${(verbs.length * 6 * 9) - grandTotal} new sentences needed`);
