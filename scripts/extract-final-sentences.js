#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import card generation module
const CardGenerator = require('./lib/card-generator');

// Load data files
function loadData(baseDir) {
  console.log('📂 Loading data files...');
  const verbsText = fs.readFileSync(path.join(baseDir, 'data', 'verbs.tsv'), 'utf-8');
  const conjugations = JSON.parse(fs.readFileSync(path.join(baseDir, 'data', 'conjugations.json'), 'utf-8'));
  
  const corpus = {};
  for (let tier = 1; tier <= 5; tier++) {
    try {
      corpus[tier] = JSON.parse(fs.readFileSync(path.join(baseDir, 'data', 'corpus', `tier${tier}-complete.json`), 'utf-8'));
      console.log(`  ✓ Tier ${tier}: ${corpus[tier].metadata.verb_count} verbs`);
    } catch (e) {
      corpus[tier] = { metadata: {}, verbs: {} };
    }
  }
  return { verbsText, conjugations, corpus };
}

// Parse verbs from TSV file
function parseVerbs(verbsText) {
  const verbs = [];
  let id = 0;
  const lines = verbsText.split('\n');
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [verb, english, tagsRaw, notes] = line.split('\t');
    if (!verb || !english) continue;
    
    const tags = {};
    if (tagsRaw) {
      tagsRaw.split(';').forEach(t => { 
        const [k,v] = t.split(':'); 
        if(k && v) tags[k.trim()] = v.trim(); 
      });
    }
    
    verbs.push({ 
      id: id++, 
      verb: verb.toUpperCase(), 
      english: english.trim(), 
      tags, 
      tier: tags.tier ? parseInt(tags.tier) : null,
      notes: notes || ''
    });
  }
  return verbs;
}

// Region configurations
const regionConfigs = {
  mexico: {
    name: 'Mexico / Latin America',
    subjects: ['yo', 'tú', 'él', 'ella', 'usted', 'nosotros', 'ellos', 'ellas', 'ustedes'],
    regions: ['universal'],
    filePrefix: 'mexico'
  }
};

// Tier configurations
const TIER_CONFIGS = {
  1: { name: 'Foundations', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'] },
  2: { name: 'Daily Routines', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite'] },
  3: { name: 'Irregular Essentials', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect'] },
  4: { name: 'Emotional & Cognitive', tenseOrder: ['present', 'present-progressive', 'going-to', 'present-perfect'] },
  5: { name: 'Gustar-Type Verbs', tenseOrder: ['present', 'going-to', 'preterite'] }
};

const TENSE_MAPPING = {
  'present': 'Present', 'present-progressive': 'Gerund', 'going-to': 'Going-to Future',
  'preterite': 'Preterite', 'present-perfect': 'Present Perfect', 'future': 'Simple Future'
};

// Main function
async function main() {
  const baseDir = path.resolve(__dirname, '..');
  const regionConfig = regionConfigs.mexico;
  
  console.log('\n🔍 DrillMaster Final Sentence Extractor\n');
  console.log('This script generates the exact sentences as they appear on Anki cards\n');
  
  const { verbsText, conjugations, corpus } = loadData(baseDir);
  const verbs = parseVerbs(verbsText);
  console.log(`\n📚 Loaded ${verbs.length} verbs\n`);
  
  const generator = new CardGenerator(conjugations, regionConfig, TIER_CONFIGS, TENSE_MAPPING);
  
  // Extract final sentences for each tier
  for (let tierNum = 1; tierNum <= 5; tierNum++) {
    console.log(`\n🚀 Extracting Tier ${tierNum}: ${TIER_CONFIGS[tierNum].name}...`);
    
    const cards = generator.generateTierCards(tierNum, verbs, corpus);
    console.log(`   Generated ${cards.length} cards`);
    
    if (cards.length === 0) {
      console.log(`   ⚠ No cards for tier ${tierNum}`);
      continue;
    }
    
    // Group cards by verb and tense for organized output
    const cardsByVerb = {};
    cards.forEach(card => {
      if (!cardsByVerb[card.verb]) {
        cardsByVerb[card.verb] = {};
      }
      if (!cardsByVerb[card.verb][card.tense]) {
        cardsByVerb[card.verb][card.tense] = [];
      }
      cardsByVerb[card.verb][card.tense].push(card);
    });
    
    // Generate output file
    const outputLines = [];
    outputLines.push(`=== TIER ${tierNum}: ${TIER_CONFIGS[tierNum].name.toUpperCase()} ===`);
    outputLines.push(`Generated: ${new Date().toISOString()}`);
    outputLines.push(`Total Cards: ${cards.length}`);
    outputLines.push('');
    outputLines.push('FORMAT: [CARD_TYPE] Spanish → English (Subject: X, Tense: Y)');
    outputLines.push('');
    
    Object.keys(cardsByVerb).sort().forEach(verbName => {
      outputLines.push(`--- ${verbName} ---`);
      
      const tenseOrder = TIER_CONFIGS[tierNum].tenseOrder;
      tenseOrder.forEach(tense => {
        if (cardsByVerb[verbName][tense]) {
          outputLines.push(`\n${TENSE_MAPPING[tense] || tense}:`);
          
          cardsByVerb[verbName][tense].forEach(card => {
            const cardType = card.type === 'trans-es-en' ? 'ES→EN' : 'EN→ES';
            const front = card.front.replace(/<[^>]*>/g, ''); // Remove HTML tags
            const back = card.back.replace(/<[^>]*>/g, ''); // Remove HTML tags
            
            outputLines.push(`  [${cardType}] ${front} → ${back} (Subject: ${card.subject})`);
          });
        }
      });
      
      outputLines.push('');
    });
    
    // Write to file
    const filename = `/tmp/tier${tierNum}-final-sentences.txt`;
    fs.writeFileSync(filename, outputLines.join('\n'));
    console.log(`   ✅ Saved: ${filename}`);
  }
  
  console.log('\n✨ All final sentences extracted!');
  console.log('\nFiles created:');
  console.log('  /tmp/tier1-final-sentences.txt');
  console.log('  /tmp/tier2-final-sentences.txt');
  console.log('  /tmp/tier3-final-sentences.txt');
  console.log('  /tmp/tier4-final-sentences.txt');
  console.log('  /tmp/tier5-final-sentences.txt');
  console.log('\nThese files show the exact Spanish and English text as it appears on the Anki cards,');
  console.log('including all pronoun additions, capitalization fixes, and HTML removal.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
