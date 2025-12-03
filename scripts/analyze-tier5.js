#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 5 corpus
const tier5Path = path.join(__dirname, '../data/corpus/tier5-complete.json');
const tier5Data = JSON.parse(fs.readFileSync(tier5Path, 'utf8'));

console.log('=== TIER 5 CURRENT SENTENCE COUNTS BY TENSE ===\n');

const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
const verbs = Object.keys(tier5Data.verbs || {});

console.log(`Found ${verbs.length} verbs in Tier 5\n`);

console.log('Verb'.padEnd(15) + tenses.map(t => t.padEnd(12)).join('') + 'Total');
console.log('-'.repeat(15 + (tenses.length * 12) + 5));

let totals = {};
tenses.forEach(tense => totals[tense] = 0);

verbs.forEach(verbName => {
  const verbData = tier5Data.verbs[verbName];
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

console.log('\n=== TIER 5 VERB LIST ===');
verbs.forEach((verb, index) => {
  console.log(`${index + 1}. ${verb}`);
});

console.log('\n=== TIER 5 PEDAGOGICAL PLAN ===');
console.log('Gustar-type verbs have special grammar structure:');
console.log('- Indirect object pronouns (me, te, le, nos, os, les)');
console.log('- Verb agrees with the thing being liked/bothered/etc.');
console.log('- Limited tense introduction due to complexity');

console.log('\n=== EXPANSION OPPORTUNITY ===');
console.log('Current Tier 5: 48 cards from ~24 sentences');
console.log('Target: Conservative expansion due to special grammar (~3-4 sentences per verb per tense)');
const targetTenses = 3; // Present, Going-To, Present-Perfect (conservative)
console.log(`Target: ${verbs.length} verbs × ${targetTenses} tenses × 3 sentences = ${verbs.length * targetTenses * 3} sentences`);
console.log(`That would generate ~${verbs.length * targetTenses * 3 * 2} cards`);

console.log(`\nCurrent total: ${grandTotal} sentences`);
console.log(`Expansion potential: ${(verbs.length * targetTenses * 3) - grandTotal} new sentences needed`);
