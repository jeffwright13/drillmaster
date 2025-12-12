#!/usr/bin/env node
/**
 * generate-audio-from-corpus.mjs
 * 
 * Generates MP3 audio files for Spanish sentences in the corpus using OpenAI TTS API.
 * Adds an 'audio' field to each sentence object pointing to the generated audio file.
 * 
 * Usage:
 *   node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier5-complete.json
 *   node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier1-complete.json --limit 5 --dry-run
 *   node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier5-complete.json --skip-existing
 * 
 * Options:
 *   --corpus <path>       Path to corpus JSON file (required)
 *   --out <path>          Output JSON path (default: <corpus>.with-audio.json)
 *   --limit <n>           Max number of sentences to process
 *   --dry-run             Log what would happen without calling API or writing files
 *   --skip-existing       Skip sentences that already have an audio field
 *   --fix-pronouns        Regenerate audio with subject pronouns prepended
 *   --voice <voice>       OpenAI TTS voice (default: coral)
 *   --speed <speed>       Speech speed 0.25-4.0 (default: 1.0)
 *   --verbose             Show detailed logging for each sentence
 *   --help                Show this help message
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Available voices for reference
const AVAILABLE_VOICES = ['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer'];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    corpus: null,
    out: null,
    limit: null,
    dryRun: false,
    skipExisting: false,
    fixPronouns: false,
    regenFile: null,
    ttsText: null,
    voice: 'coral',
    speed: 1.0,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--corpus':
        options.corpus = args[++i];
        break;
      case '--out':
        options.out = args[++i];
        break;
      case '--limit':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--fix-pronouns':
        options.fixPronouns = true;
        break;
      case '--regen-file':
        options.regenFile = args[++i];
        break;
      case '--tts-text':
        options.ttsText = args[++i];
        break;
      case '--voice':
        options.voice = args[++i];
        break;
      case '--speed':
        options.speed = parseFloat(args[++i]);
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Usage: node scripts/generate-audio-from-corpus.mjs [options]

Options:
  --corpus <path>       Path to corpus JSON file (required)
  --out <path>          Output JSON path (default: <corpus>.with-audio.json)
  --limit <n>           Max number of sentences to process
  --dry-run             Log what would happen without calling API or writing files
  --skip-existing       Skip sentences that already have an audio field
  --fix-pronouns        Regenerate audio with subject pronouns prepended
  --regen-file <name>   Regenerate a single audio file by filename (overwrites existing)
  --tts-text <text>     Override the exact text sent to TTS (use with --regen-file)
  --voice <voice>       OpenAI TTS voice (default: coral)
                        Available: ${AVAILABLE_VOICES.join(', ')}
  --speed <speed>       Speech speed 0.25-4.0 (default: 1.0)
  --verbose             Show detailed logging for each sentence
  --help                Show this help message

Examples:
  # Process all sentences in tier5
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier5-complete.json

  # Test with 5 sentences, dry run
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier1-complete.json --limit 5 --dry-run

  # Resume processing, skip already processed sentences
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier5-complete.json --skip-existing

  # Fix audio files to include subject pronouns
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier1-complete.json --fix-pronouns

  # Regenerate just one audio file (example)
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier2-complete.with-audio.json --out data/corpus/tier2-complete.with-audio.json --regen-file tier2_ACOSTARSE_present_0004.mp3 --fix-pronouns

  # Regenerate one file with custom TTS text to enforce a pause
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier2-complete.with-audio.json --out data/corpus/tier2-complete.with-audio.json --regen-file tier2_ACOSTARSE_present_0004.mp3 --tts-text "Tú, normalmente te acuestas viendo videos en tu teléfono."

  # Use different voice and speed
  node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier1-complete.json --voice nova --speed 0.9
`);
}

// Extract tier prefix from corpus filename
function getTierPrefix(corpusPath) {
  const basename = path.basename(corpusPath, '.json');
  // e.g., "tier5-complete" -> "tier5"
  const match = basename.match(/^(tier\d+)/i);
  return match ? match[1] : basename.split('-')[0];
}

// Generate deterministic audio filename
function generateAudioFilename(tierPrefix, verbKey, tenseKey, index) {
  const paddedIndex = String(index).padStart(4, '0');
  return `${tierPrefix}_${verbKey}_${tenseKey}_${paddedIndex}.mp3`;
}

// Prepend subject pronoun to Spanish text (matches card-generator.js logic)
function prependPronoun(spanishText, subject, verbKey) {
  const spanishPronouns = {
    'yo': 'Yo',
    'tú': 'Tú',
    'él': 'Él',
    'ella': 'Ella', 
    'usted': 'Usted',
    'nosotros': 'Nosotros',
    'ellos': 'Ellos',
    'ellas': 'Ellas',
    'ustedes': 'Ustedes',
    'vos': 'Vos',
    'vosotros': 'Vosotros',
    // Handle compound subjects
    'él/ella/usted': 'Usted',
    'ellos/ellas/ustedes': 'Ustedes'
  };

  // Gustar-type verbs don't need subject pronouns prepended
  const GUSTAR_TYPE_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
  if (GUSTAR_TYPE_VERBS.includes(verbKey.toUpperCase())) {
    return spanishText;
  }

  const pronoun = spanishPronouns[subject] || subject;
  if (!pronoun) {
    return spanishText;
  }

  // Check if sentence already starts with the pronoun
  if (spanishText.startsWith('¿')) {
    // For questions, check if pronoun already exists after ¿
    const afterQuestion = spanishText.substring(1).trim();
    if (afterQuestion.toLowerCase().startsWith(pronoun.toLowerCase() + ' ')) {
      return spanishText; // Already has pronoun
    }
    // Insert pronoun after ¿ and lowercase the next letter
    const rest = spanishText.substring(1);
    const firstChar = rest.charAt(0).toLowerCase();
    const restOfSentence = rest.slice(1);
    return `¿${pronoun} ${firstChar}${restOfSentence}`;
  } else {
    // Check if sentence already starts with the pronoun
    if (spanishText.toLowerCase().startsWith(pronoun.toLowerCase() + ' ')) {
      return spanishText; // Already has pronoun
    }
    // Prepend pronoun and lowercase the first letter
    const firstChar = spanishText.charAt(0).toLowerCase();
    const restOfSentence = spanishText.slice(1);
    return `${pronoun} ${firstChar}${restOfSentence}`;
  }
}

// Check if a sentence needs pronoun fix (doesn't already have pronoun)
function needsPronounFix(spanishText, subject, verbKey) {
  const GUSTAR_TYPE_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
  if (GUSTAR_TYPE_VERBS.includes(verbKey.toUpperCase())) {
    return false; // Gustar-type verbs don't need fixing
  }

  const spanishPronouns = {
    'yo': 'Yo', 'tú': 'Tú', 'él': 'Él', 'ella': 'Ella', 'usted': 'Usted',
    'nosotros': 'Nosotros', 'ellos': 'Ellos', 'ellas': 'Ellas', 'ustedes': 'Ustedes',
    'vos': 'Vos', 'vosotros': 'Vosotros',
    'él/ella/usted': 'Usted', 'ellos/ellas/ustedes': 'Ustedes'
  };

  const pronoun = spanishPronouns[subject];
  if (!pronoun) return false;

  // Check if already has pronoun
  const textToCheck = spanishText.startsWith('¿') ? spanishText.substring(1).trim() : spanishText;
  return !textToCheck.toLowerCase().startsWith(pronoun.toLowerCase() + ' ');
}

// Collect all sentences from corpus with their location info
function collectSentences(corpus, options) {
  const sentences = [];
  const verbs = corpus.verbs || {};

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    // Track index per verb+tense combination
    const tenseIndices = {};

    for (const [tenseKey, tenseData] of Object.entries(verbData)) {
      // Skip metadata and non-array properties
      if (tenseKey === 'metadata' || !Array.isArray(tenseData)) {
        continue;
      }

      tenseIndices[tenseKey] = 0;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];

        // Skip entries without spanish text
        if (!sentence || typeof sentence.spanish !== 'string') {
          continue;
        }

        // Skip if already has audio and --skip-existing is set
        if (options.skipExisting && sentence.audio) {
          continue;
        }

        tenseIndices[tenseKey]++;

        sentences.push({
          verbKey,
          tenseKey,
          arrayIndex: i,
          tenseIndex: tenseIndices[tenseKey],
          sentence
        });
      }
    }
  }

  return sentences;
}

// Call OpenAI TTS API
async function generateAudio(openai, spanishText, options) {
  const response = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: options.voice,
    speed: options.speed,
    input: spanishText,
    instructions: 'Speak clearly in natural Latin American Spanish at normal conversational speed.'
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer;
}

// Main processing function
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Validate required options
  if (!options.corpus) {
    console.error('Error: --corpus is required');
    showHelp();
    process.exit(1);
  }

  // Validate voice
  if (!AVAILABLE_VOICES.includes(options.voice)) {
    console.error(`Error: Invalid voice '${options.voice}'. Available: ${AVAILABLE_VOICES.join(', ')}`);
    process.exit(1);
  }

  // Validate speed
  if (options.speed < 0.25 || options.speed > 4.0) {
    console.error('Error: Speed must be between 0.25 and 4.0');
    process.exit(1);
  }

  // Check API key
  if (!options.dryRun && !process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
  }

  // Resolve paths
  const corpusPath = path.resolve(options.corpus);
  const tierPrefix = getTierPrefix(corpusPath);
  const audioDir = path.resolve(path.dirname(corpusPath), '..', 'audio');
  
  // Default output path
  const outPath = options.out 
    ? path.resolve(options.out)
    : corpusPath.replace('.json', '.with-audio.json');

  console.log('='.repeat(60));
  console.log('OpenAI TTS Audio Generator for DrillMaster Corpus');
  console.log('='.repeat(60));
  console.log(`Corpus file:    ${corpusPath}`);
  console.log(`Output file:    ${outPath}`);
  console.log(`Audio dir:      ${audioDir}`);
  console.log(`Tier prefix:    ${tierPrefix}`);
  console.log(`Voice:          ${options.voice}`);
  console.log(`Speed:          ${options.speed}`);
  console.log(`Dry run:        ${options.dryRun}`);
  console.log(`Skip existing:  ${options.skipExisting}`);
  console.log(`Fix pronouns:   ${options.fixPronouns}`);
  if (options.regenFile) {
    console.log(`Regen file:     ${options.regenFile}`);
  }
  if (options.limit) {
    console.log(`Limit:          ${options.limit}`);
  }
  console.log('='.repeat(60));

  // Load corpus
  if (!fs.existsSync(corpusPath)) {
    console.error(`Error: Corpus file not found: ${corpusPath}`);
    process.exit(1);
  }

  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf-8'));
  console.log(`\nLoaded corpus: ${corpus.metadata?.description || 'Unknown'}`);

  // Collect sentences to process
  const allSentences = collectSentences(corpus, options);
  console.log(`Found ${allSentences.length} sentences to process`);

  // If we're regenerating a single file, filter down to exactly that sentence
  let filteredSentences = allSentences;
  if (options.regenFile) {
    filteredSentences = allSentences.filter(({ verbKey, tenseKey, tenseIndex, sentence }) => {
      if (sentence?.audio === options.regenFile) {
        return true;
      }
      const expected = generateAudioFilename(tierPrefix, verbKey, tenseKey, tenseIndex);
      return expected === options.regenFile;
    });

    if (filteredSentences.length === 0) {
      console.error(`Error: Could not find any sentence in corpus matching --regen-file ${options.regenFile}`);
      process.exit(1);
    }
    if (filteredSentences.length > 1) {
      console.error(`Error: Found multiple sentences matching --regen-file ${options.regenFile}. Aborting to avoid overwriting the wrong file.`);
      process.exit(1);
    }
  }

  // Apply limit
  const sentencesToProcess = options.limit 
    ? filteredSentences.slice(0, options.limit)
    : filteredSentences;

  if (options.limit) {
    console.log(`Processing ${sentencesToProcess.length} sentences (limited)`);
  }

  // Create audio directory if needed
  if (!options.dryRun && !fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`Created audio directory: ${audioDir}`);
  }

  // Initialize OpenAI client (only if not dry run)
  const openai = options.dryRun ? null : new OpenAI();

  // Process sentences
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  let deleted = 0;

  for (const item of sentencesToProcess) {
    const { verbKey, tenseKey, arrayIndex, tenseIndex, sentence } = item;
    const audioFilename = generateAudioFilename(tierPrefix, verbKey, tenseKey, tenseIndex);
    const audioPath = path.join(audioDir, audioFilename);

    // Determine the text to use for TTS
    let spanishTextForTTS = options.fixPronouns 
      ? prependPronoun(sentence.spanish, sentence.subject, verbKey)
      : sentence.spanish;

    // Allow overriding the exact TTS text (useful for punctuation-based pauses)
    if (options.ttsText) {
      if (!options.regenFile) {
        console.error('Error: --tts-text is only supported when used with --regen-file');
        process.exit(1);
      }
      spanishTextForTTS = options.ttsText;
      if (options.verbose) {
        console.log(`  TTS OVERRIDE: ${spanishTextForTTS}`);
      }
    }

    // Truncate spanish text for logging
    const truncatedSpanish = spanishTextForTTS.length > 50 
      ? spanishTextForTTS.substring(0, 47) + '...'
      : spanishTextForTTS;

    if (options.verbose) {
      console.log(`\n[${verbKey}/${tenseKey}] ${truncatedSpanish}`);
      console.log(`  -> ${audioFilename}`);
    }

    // --regen-file forces regeneration of this one file (overwrite existing)
    if (options.regenFile) {
      if (!options.dryRun && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
        deleted++;
        if (options.verbose) {
          console.log(`  DELETED: Existing audio file (forced regen)`);
        }
      }
    } else {
      // Handle --fix-pronouns mode
      if (options.fixPronouns) {
        const needsFix = needsPronounFix(sentence.spanish, sentence.subject, verbKey);

        if (!needsFix) {
          if (options.verbose) {
            console.log(`  SKIP: No pronoun fix needed`);
          }
          corpus.verbs[verbKey][tenseKey][arrayIndex].audio = audioFilename;
          skipped++;
          continue;
        }

        // Delete existing audio file if it exists (needs regeneration)
        if (!options.dryRun && fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
          deleted++;
          if (options.verbose) {
            console.log(`  DELETED: Old audio file (will regenerate with pronoun)`);
          }
        }
      } else {
        // Normal mode: skip if audio file already exists
        if (!options.dryRun && fs.existsSync(audioPath)) {
          if (options.verbose) {
            console.log(`  SKIP: Audio file already exists`);
          }
          corpus.verbs[verbKey][tenseKey][arrayIndex].audio = audioFilename;
          skipped++;
          continue;
        }
      }
    }

    if (options.dryRun) {
      if (options.verbose) {
        const action = options.fixPronouns ? 'Would regenerate with pronoun' : 'Would generate audio';
        console.log(`  DRY RUN: ${action}`);
      }
      processed++;
      continue;
    }

    // Generate audio
    try {
      const audioBuffer = await generateAudio(openai, spanishTextForTTS, options);
      fs.writeFileSync(audioPath, audioBuffer);
      
      // Update sentence object with audio field
      corpus.verbs[verbKey][tenseKey][arrayIndex].audio = audioFilename;
      
      processed++;
      
      if (!options.verbose) {
        // Progress indicator
        process.stdout.write(`\rProcessed: ${processed}/${sentencesToProcess.length}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`\nError processing "${truncatedSpanish}": ${error.message}`);
      errors++;
    }
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total sentences found:  ${allSentences.length}`);
  console.log(`Sentences processed:    ${processed}`);
  console.log(`Sentences skipped:      ${skipped}`);
  if (options.fixPronouns && deleted > 0) {
    console.log(`Old files deleted:      ${deleted}`);
  }
  console.log(`Errors:                 ${errors}`);

  // Write updated corpus
  if (!options.dryRun) {
    fs.writeFileSync(outPath, JSON.stringify(corpus, null, 2));
    console.log(`\nUpdated corpus written to: ${outPath}`);
  } else {
    console.log(`\nDRY RUN: Would write updated corpus to: ${outPath}`);
  }

  console.log('\nDone!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
