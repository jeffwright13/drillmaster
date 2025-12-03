#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 4 corpus
const tier4Path = path.join(__dirname, '../data/corpus/tier4-complete.json');
const tier4Data = JSON.parse(fs.readFileSync(tier4Path, 'utf8'));

console.log('=== TIER 4 CURRENT SENTENCE COUNTS BY TENSE ===\n');

const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
const verbs = Object.keys(tier4Data.verbs || {});

console.log(`Found ${verbs.length} verbs in Tier 4\n`);

console.log('Verb'.padEnd(15) + tenses.map(t => t.padEnd(12)).join('') + 'Total');
console.log('-'.repeat(15 + (tenses.length * 12) + 5));

let totals = {};
tenses.forEach(tense => totals[tense] = 0);

verbs.forEach(verbName => {
  const verbData = tier4Data.verbs[verbName];
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

console.log('\n=== TIER 4 VERB LIST ===');
verbs.forEach((verb, index) => {
  console.log(`${index + 1}. ${verb}`);
});

console.log('\n=== TIER 4 PEDAGOGICAL PLAN ===');
console.log('Following PEDAGOGICAL_MAP.md: Present → Gerund → Going-to Future → Present Perfect');
console.log('(Avoiding Preterite and Simple Future until much later)');

console.log('\n=== EXPANSION OPPORTUNITY ===');
console.log('Current Tier 4: 46 cards from ~23 sentences');
console.log('Target: Moderate expansion like other tiers (~4-5 sentences per verb per tense)');
const targetTenses = 4; // Present, Present-Progressive, Going-To, Present-Perfect
console.log(`Target: ${verbs.length} verbs × ${targetTenses} tenses × 4 sentences = ${verbs.length * targetTenses * 4} sentences`);
console.log(`That would generate ~${verbs.length * targetTenses * 4 * 2} cards`);

console.log(`\nCurrent total: ${grandTotal} sentences`);
console.log(`Expansion potential: ${(verbs.length * targetTenses * 4) - grandTotal} new sentences needed`);
