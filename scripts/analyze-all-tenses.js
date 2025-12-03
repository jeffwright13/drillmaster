#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== TIER 1 CURRENT SENTENCE COUNTS BY TENSE ===\n');

const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
const verbs = Object.keys(tier1Data.verbs);

console.log('Verb'.padEnd(12) + tenses.map(t => t.padEnd(12)).join('') + 'Total');
console.log('-'.repeat(12 + (tenses.length * 12) + 5));

let totals = {};
tenses.forEach(tense => totals[tense] = 0);

verbs.forEach(verbName => {
  const verbData = tier1Data.verbs[verbName];
  let row = verbName.padEnd(12);
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

console.log('-'.repeat(12 + (tenses.length * 12) + 5));
let totalRow = 'TOTAL'.padEnd(12);
let grandTotal = 0;
tenses.forEach(tense => {
  totalRow += totals[tense].toString().padEnd(12);
  grandTotal += totals[tense];
});
totalRow += grandTotal.toString();
console.log(totalRow);

console.log('\n=== EXPANSION TARGETS ===');
console.log('Target: ~9 sentences per verb per tense = 90 sentences per tense');
tenses.forEach(tense => {
  const current = totals[tense];
  const target = 90;
  const needed = Math.max(0, target - current);
  console.log(`${tense.padEnd(20)}: ${current.toString().padEnd(3)} → ${target} (need ${needed} more)`);
});

console.log(`\nCurrent total: ${grandTotal} sentences`);
console.log(`Target total:  ${90 * tenses.length} sentences`);
console.log(`Need to add:   ${(90 * tenses.length) - grandTotal} sentences`);
