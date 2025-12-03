#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 3 corpus
const tier3Path = path.join(__dirname, '../data/corpus/tier3-complete.json');
const tier3Data = JSON.parse(fs.readFileSync(tier3Path, 'utf8'));

console.log('=== TIER 3 CURRENT SENTENCE COUNTS BY TENSE ===\n');

const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
const verbs = Object.keys(tier3Data.verbs || {});

console.log(`Found ${verbs.length} verbs in Tier 3\n`);

console.log('Verb'.padEnd(15) + tenses.map(t => t.padEnd(12)).join('') + 'Total');
console.log('-'.repeat(15 + (tenses.length * 12) + 5));

let totals = {};
tenses.forEach(tense => totals[tense] = 0);

verbs.forEach(verbName => {
  const verbData = tier3Data.verbs[verbName];
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

console.log('\n=== TIER 3 VERB LIST ===');
verbs.forEach((verb, index) => {
  console.log(`${index + 1}. ${verb}`);
});

console.log('\n=== TIER 3 PEDAGOGICAL PLAN ===');
console.log('Following PEDAGOGICAL_MAP.md: Present → Gerund → Going-to Future → Preterite → Present Perfect');
console.log('(Skipping Simple Future as optional)');

console.log('\n=== EXPANSION OPPORTUNITY ===');
console.log('Current Tier 3: 54 cards from ~27 sentences');
console.log('Target: Moderate expansion like Tier 2 (~5 sentences per verb per tense)');
const targetTenses = 5; // Present, Present-Progressive, Going-To, Preterite, Present-Perfect
console.log(`Target: ${verbs.length} verbs × ${targetTenses} tenses × 5 sentences = ${verbs.length * targetTenses * 5} sentences`);
console.log(`That would generate ~${verbs.length * targetTenses * 5 * 2} cards`);

console.log(`\nCurrent total: ${grandTotal} sentences`);
console.log(`Expansion potential: ${(verbs.length * targetTenses * 5) - grandTotal} new sentences needed`);
