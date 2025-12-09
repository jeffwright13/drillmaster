#!/usr/bin/env node
/**
 * CLI script to generate DrillMaster .apkg files
 * 
 * Usage:
 *   # Generate all 5 tiers as separate .apkg files:
 *   node scripts/generate-apkg.js --region mexico
 * 
 *   # Generate a single tier:
 *   node scripts/generate-apkg.js --region mexico --tier 1
 *   node scripts/generate-apkg.js --region mexico --tier 2
 *   node scripts/generate-apkg.js --region mexico --tier 3
 *   node scripts/generate-apkg.js --region mexico --tier 4
 *   node scripts/generate-apkg.js --region mexico --tier 5
 * 
 *   # Generate uber-deck (all 5 tiers as subdecks in one .apkg):
 *   node scripts/generate-apkg.js --region mexico --tier all
 * 
 *   # Custom output directory:
 *   node scripts/generate-apkg.js --region mexico --output ./dist
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { region: 'mexico', tier: null, output: './output' };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--region' && args[i + 1]) { options.region = args[i + 1]; i++; }
    else if (args[i] === '--tier' && args[i + 1]) {
      const tierArg = args[i + 1];
      options.tier = tierArg === 'all' ? 'all' : parseInt(tierArg);
      i++;
    }
    else if (args[i] === '--output' && args[i + 1]) { options.output = args[i + 1]; i++; }
        else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
DrillMaster APKG Generator

Usage: node scripts/generate-apkg.js [options]

Options:
  --region <region>   Spanish variant: mexico (default)
  --tier <1-5|all>    Generate specific tier, or 'all' for uber-deck with all tiers as subdecks
  --output <path>     Output directory (default: ./output)
  --help, -h          Show this help
      `);
      process.exit(0);
    }
  }
  return options;
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

// Load data files
async function loadData(baseDir) {
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

// Import card generation module
const CardGenerator = require('./lib/card-generator');

// Main
async function main() {
  const options = parseArgs();
  const baseDir = path.resolve(__dirname, '..');
  
  console.log('\n🎯 DrillMaster APKG Generator\n');
  console.log(`Region: ${options.region}`);
  console.log(`Tier: ${options.tier === 'all' ? 'all (uber-deck)' : (options.tier || 'all (individual)')}`);
  console.log(`Output: ${options.output}\n`);
  
  const regionConfig = regionConfigs[options.region];
  if (!regionConfig) {
    console.error(`❌ Invalid region. Use: ${Object.keys(regionConfigs).join(', ')}`);
    process.exit(1);
  }
  
  const { verbsText, conjugations, corpus } = await loadData(baseDir);
  const verbs = parseVerbs(verbsText);
  console.log(`\n📚 Loaded ${verbs.length} verbs\n`);
  
  const outputDir = path.resolve(baseDir, options.output);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  if (options.tier === 'all') {
    // Generate single uber-deck with all tiers as subdecks
    console.log('🚀 Generating Complete DrillMaster Collection (All Tiers)...');
    
    const generator = new CardGenerator(conjugations, regionConfig, TIER_CONFIGS, TENSE_MAPPING);
    const allCards = [];
    let totalCards = 0;
    
    // Generate cards for all tiers
    for (let tierNum = 1; tierNum <= 5; tierNum++) {
      const tierCards = generator.generateTierCards(tierNum, verbs, corpus);
      console.log(`   Tier ${tierNum}: ${tierCards.length} cards`);
      
      // Add tier information to each card for subdeck organization
      tierCards.forEach(card => {
        card.tier = tierNum;
        card.tierName = TIER_CONFIGS[tierNum].name;
      });
      
      allCards.push(...tierCards);
      totalCards += tierCards.length;
    }
    
    console.log(`   Total: ${totalCards} cards across 5 tiers`);
    
    if (totalCards === 0) {
      console.log('   ⚠ No cards generated');
      return;
    }
    
    // Create uber-deck APKG
    const apkgBuffer = await generator.createUberApkg(allCards, regionConfig);
    const filename = `DrillMaster-Complete-${regionConfig.filePrefix}.apkg`;
    fs.writeFileSync(path.join(outputDir, filename), apkgBuffer);
    console.log(`   ✅ Saved: ${filename}`);
    
  } else {
    // Generate individual tier decks (existing behavior)
    const tiersToGenerate = options.tier && options.tier !== 'all' ? [options.tier] : [1, 2, 3, 4, 5];
    
    for (const tierNum of tiersToGenerate) {
      console.log(`🚀 Generating Tier ${tierNum}: ${TIER_CONFIGS[tierNum].name}...`);
      
      const generator = new CardGenerator(conjugations, regionConfig, TIER_CONFIGS, TENSE_MAPPING);
      const cards = generator.generateTierCards(tierNum, verbs, corpus);
      console.log(`   Generated ${cards.length} cards`);
      
      if (cards.length === 0) { console.log(`   ⚠ Skipping empty tier`); continue; }
      
      const apkgBuffer = await generator.createApkg(tierNum, cards);
      const filename = `DrillMaster-Tier${tierNum}-${TIER_CONFIGS[tierNum].name.replace(/\s+/g, '')}-${regionConfig.filePrefix}.apkg`;
      fs.writeFileSync(path.join(outputDir, filename), apkgBuffer);
      console.log(`   ✅ Saved: ${filename}`);
    }
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
