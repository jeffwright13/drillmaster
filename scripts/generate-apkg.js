#!/usr/bin/env node
/**
 * CLI script to generate DrillMaster .apkg files
 * 
 * Usage:
 *   # Generate all 5 tiers as separate .apkg files (default):
 *   node scripts/generate-apkg.js
 * 
 *   # Generate specific tier(s):
 *   node scripts/generate-apkg.js --tier 1
 *   node scripts/generate-apkg.js --tier 1,3,5
 *   node scripts/generate-apkg.js --tier 1-3          # range: 1,2,3
 * 
 *   # Generate uber-deck (all tiers as subdecks in one .apkg):
 *   node scripts/generate-apkg.js --tier all
 * 
 *   # Generate both individual tiers AND uber-deck:
 *   node scripts/generate-apkg.js --tier 1,3,5,all
 *   node scripts/generate-apkg.js --tier 1-5,all
 * 
 *   # Other options:
 *   node scripts/generate-apkg.js --region mexico     # Spanish variant (default: mexico)
 *   node scripts/generate-apkg.js --output ./dist     # Output directory (default: ./output)
 *   node scripts/generate-apkg.js --help              # Show help
 */

const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = require('../package.json');
const VERSION = packageJson.version;

// Parse tier argument into { tiers: number[], includeUber: boolean }
function parseTierArg(tierArg) {
  if (!tierArg) {
    return { tiers: [1, 2, 3, 4, 5], includeUber: false };
  }
  
  const tiers = new Set();
  let includeUber = false;
  
  const parts = tierArg.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed === 'all') {
      includeUber = true;
    } else if (trimmed.includes('-')) {
      // Range: "1-3" -> [1, 2, 3]
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= 5) tiers.add(i);
        }
      }
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        tiers.add(num);
      }
    }
  }
  
  return { tiers: Array.from(tiers).sort((a, b) => a - b), includeUber };
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { region: 'mexico', tierArg: null, output: './output' };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--region' && args[i + 1]) { options.region = args[i + 1]; i++; }
    else if (args[i] === '--tier' && args[i + 1]) { options.tierArg = args[i + 1]; i++; }
    else if (args[i] === '--output' && args[i + 1]) { options.output = args[i + 1]; i++; }
    else if (args[i] === '--version' || args[i] === '-v') {
      console.log(`DrillMaster v${VERSION}`);
      process.exit(0);
    }
    else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
DrillMaster APKG Generator v${VERSION}

Usage: node scripts/generate-apkg.js [options]

Options:
  --tier <tiers>      Tier(s) to generate. Examples:
                        1         Single tier
                        1,3,5     Multiple tiers
                        1-3       Range (1,2,3)
                        all       Uber-deck (all tiers as subdecks)
                        1,3,all   Both individual tiers AND uber-deck
                      Default: 1-5 (all tiers as separate files)
  --region <region>   Spanish variant: mexico (default)
  --output <path>     Output directory (default: ./output)
  --version, -v       Show version
  --help, -h          Show this help
      `);
      process.exit(0);
    }
  }
  
  // Parse tier argument
  const { tiers, includeUber } = parseTierArg(options.tierArg);
  options.tiers = tiers;
  options.includeUber = includeUber;
  
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
  
  // Build description of what will be generated
  const tierDesc = options.tiers.length > 0 ? `Tiers: ${options.tiers.join(', ')}` : '';
  const uberDesc = options.includeUber ? 'Uber-deck' : '';
  const genDesc = [tierDesc, uberDesc].filter(Boolean).join(' + ') || 'Tiers: 1-5';
  
  console.log('\n🎯 DrillMaster APKG Generator\n');
  console.log(`Region: ${options.region}`);
  console.log(`Generate: ${genDesc}`);
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
  
  // Generate individual tier decks
  if (options.tiers.length > 0) {
    for (const tierNum of options.tiers) {
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
  
  // Generate uber-deck if requested
  if (options.includeUber) {
    console.log('🚀 Generating Complete DrillMaster Collection (Uber-deck)...');
    
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
    
    if (totalCards > 0) {
      const apkgBuffer = await generator.createUberApkg(allCards, regionConfig);
      const filename = `DrillMaster-Complete-${regionConfig.filePrefix}.apkg`;
      fs.writeFileSync(path.join(outputDir, filename), apkgBuffer);
      console.log(`   ✅ Saved: ${filename}`);
    } else {
      console.log('   ⚠ No cards generated');
    }
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
