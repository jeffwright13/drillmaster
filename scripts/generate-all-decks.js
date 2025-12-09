#!/usr/bin/env node

/**
 * Generate All DrillMaster Deck Variants
 * 
 * Creates all combinations of:
 * - Regions: mexico (future: argentina, spain)
 * - Tiers: 1-5 individual + complete uber-deck
 * - Audio: with and without
 * 
 * Usage:
 *   node scripts/generate-all-decks.js [options]
 * 
 * Options:
 *   --region <region>   Generate only for specific region (default: all)
 *   --tier <tier>       Generate only specific tier (default: all)
 *   --audio-only        Generate only audio versions
 *   --text-only         Generate only text versions
 *   --no-uber           Skip uber-deck generation
 *   --dry-run           Show what would be generated without creating files
 *   --help              Show this help
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const REGIONS = ['mexico']; // Future: ['mexico', 'argentina', 'spain']
const TIERS = [1, 2, 3, 4, 5];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    regions: null,
    tiers: null,
    audioOnly: false,
    textOnly: false,
    includeUber: true,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--region':
        options.regions = [args[++i]];
        break;
      case '--tier':
        options.tiers = [parseInt(args[++i])];
        break;
      case '--audio-only':
        options.audioOnly = true;
        break;
      case '--text-only':
        options.textOnly = true;
        break;
      case '--no-uber':
        options.includeUber = false;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
DrillMaster Deck Generator - All Variants

Generates all combinations of decks:
- Regions: ${REGIONS.join(', ')} (future: argentina, spain)
- Tiers: 1-5 individual + complete uber-deck
- Formats: Text-only and Audio versions

Usage: node scripts/generate-all-decks.js [options]

Options:
  --region <region>   Generate only for specific region
                      Available: ${REGIONS.join(', ')}
  --tier <tier>       Generate only specific tier (1-5)
  --audio-only        Generate only audio versions
  --text-only         Generate only text versions
  --no-uber           Skip uber-deck generation
  --dry-run           Show what would be generated without creating files
  --help, -h          Show this help

Examples:
  # Generate everything
  node scripts/generate-all-decks.js

  # Generate only tier 1 for Mexico
  node scripts/generate-all-decks.js --region mexico --tier 1

  # Generate only text versions (no audio)
  node scripts/generate-all-decks.js --text-only

  # Preview what would be generated
  node scripts/generate-all-decks.js --dry-run
`);
        process.exit(0);
    }
  }

  // Apply defaults
  if (!options.regions) options.regions = REGIONS;
  if (!options.tiers) options.tiers = TIERS;

  return options;
}

function runCommand(cmd, dryRun) {
  if (dryRun) {
    console.log(`  [DRY RUN] ${cmd}`);
    return;
  }
  
  try {
    execSync(cmd, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
  } catch (err) {
    console.error(`  ❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

function checkAudioCorpusExists(tier) {
  const audioCorpusPath = path.resolve(__dirname, '..', 'data', 'corpus', `tier${tier}-complete.with-audio.json`);
  return fs.existsSync(audioCorpusPath);
}

function main() {
  const options = parseArgs();
  const baseDir = path.resolve(__dirname, '..');
  const outputDir = path.join(baseDir, 'output');

  console.log('\n🎯 DrillMaster Deck Generator - All Variants\n');
  console.log('='.repeat(60));
  console.log(`Regions:      ${options.regions.join(', ')}`);
  console.log(`Tiers:        ${options.tiers.join(', ')}`);
  console.log(`Include Uber: ${options.includeUber}`);
  console.log(`Audio:        ${options.textOnly ? 'No' : 'Yes'}`);
  console.log(`Text:         ${options.audioOnly ? 'No' : 'Yes'}`);
  console.log(`Dry run:      ${options.dryRun}`);
  console.log('='.repeat(60));
  console.log('');

  // Ensure output directory exists
  if (!options.dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalDecks = 0;
  const generatedDecks = [];
  const skippedDecks = [];

  for (const region of options.regions) {
    console.log(`\n📍 Region: ${region.toUpperCase()}\n`);

    // Generate individual tier decks
    for (const tier of options.tiers) {
      // Text-only version
      if (!options.audioOnly) {
        console.log(`  📚 Tier ${tier} (Text-only)...`);
        const cmd = `node scripts/generate-apkg.js --region ${region} --tier ${tier}`;
        runCommand(cmd, options.dryRun);
        totalDecks++;
        generatedDecks.push(`Tier ${tier} - Text (${region})`);
      }

      // Audio version
      if (!options.textOnly) {
        if (checkAudioCorpusExists(tier)) {
          console.log(`  🔊 Tier ${tier} (Audio)...`);
          const cmd = `node scripts/generate-apkg.js --region ${region} --tier ${tier} --with-audio`;
          runCommand(cmd, options.dryRun);
          totalDecks++;
          generatedDecks.push(`Tier ${tier} - Audio (${region})`);
        } else {
          console.log(`  ⚠️  Tier ${tier} (Audio) - SKIPPED: No audio corpus found`);
          console.log(`      Run: npm run audio:tier${tier}`);
          skippedDecks.push(`Tier ${tier} - Audio (${region}): Missing tier${tier}-complete.with-audio.json`);
        }
      }
    }

    // Generate uber-deck (all tiers combined)
    if (options.includeUber) {
      // Text-only uber-deck
      if (!options.audioOnly) {
        console.log(`  📚 Complete Collection (Text-only)...`);
        const cmd = `node scripts/generate-apkg.js --region ${region} --tier all`;
        runCommand(cmd, options.dryRun);
        totalDecks++;
        generatedDecks.push(`Complete - Text (${region})`);
      }

      // Audio uber-deck
      if (!options.textOnly) {
        const allAudioExists = options.tiers.every(t => checkAudioCorpusExists(t));
        if (allAudioExists) {
          console.log(`  🔊 Complete Collection (Audio)...`);
          const cmd = `node scripts/generate-apkg.js --region ${region} --tier all --with-audio`;
          runCommand(cmd, options.dryRun);
          totalDecks++;
          generatedDecks.push(`Complete - Audio (${region})`);
        } else {
          console.log(`  ⚠️  Complete Collection (Audio) - SKIPPED: Missing audio corpus for some tiers`);
          skippedDecks.push(`Complete - Audio (${region}): Missing audio corpus files`);
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`\nGenerated: ${generatedDecks.length} decks`);
  generatedDecks.forEach(d => console.log(`  ✅ ${d}`));

  if (skippedDecks.length > 0) {
    console.log(`\nSkipped: ${skippedDecks.length} decks`);
    skippedDecks.forEach(d => console.log(`  ⚠️  ${d}`));
  }

  if (!options.dryRun) {
    console.log(`\nOutput directory: ${outputDir}`);
    
    // List generated files with sizes
    console.log('\nGenerated files:');
    const files = fs.readdirSync(outputDir)
      .filter(f => f.endsWith('.apkg'))
      .sort();
    
    let totalSize = 0;
    files.forEach(f => {
      const stats = fs.statSync(path.join(outputDir, f));
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      totalSize += stats.size;
      console.log(`  ${f} (${sizeMB} MB)`);
    });
    
    console.log(`\nTotal size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  console.log('\n✨ Done!\n');
}

main();
