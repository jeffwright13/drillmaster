# DrillMaster CLI - APKG Generator

Command-line interface for generating DrillMaster Anki .apkg files.

## Installation

<div style="position: relative;">
  <button onclick="navigator.clipboard.writeText('npm install')" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📋 Copy</button>

```bash
npm install
```
</div>

## Usage

⚠️ **IMPORTANT**: When updating existing decks with fixes, Anki's "Update existing deck" feature may not work reliably. For major updates, you may need to delete existing decks and reimport, which will lose your progress. Always export your progress first (File → Export → Include scheduling information).

## Features

✅ **Perfect Grammar**: All sentences have correct subject-verb agreement  
✅ **Clear Disambiguation**: "You (informal)" vs "You (formal)" hints  
✅ **Mexico/Latin America Spanish**: No vos (Argentina) or vosotros (Spain)  
✅ **2 Card Types**: Translation EN→ES, ES→EN (focused, essential practice)  
✅ **Pedagogical Structure**: 5 tiers with progressive difficulty  
✅ **~1,200 Total Cards**: Ultra-streamlined, focused coverage across all tiers

### Generate all tiers for Mexico/Latin America:
<div style="position: relative;">
  <button onclick="navigator.clipboard.writeText('npm run generate:all')" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📋 Copy</button>

```bash
npm run generate:all
```
</div>

### Generate specific tier:
<div style="position: relative;">
  <button onclick="navigator.clipboard.writeText('npm run generate:mexico:tier1')" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📋 Copy</button>

```bash
npm run generate:mexico:tier1
npm run generate:mexico:tier2
npm run generate:mexico:tier3
npm run generate:mexico:tier4
npm run generate:mexico:tier5
```
</div>

### Direct CLI usage:
<div style="position: relative;">
  <button onclick="navigator.clipboard.writeText('# Generate all tiers\nnode scripts/generate-apkg.js --region mexico\n\n# Generate specific tier\nnode scripts/generate-apkg.js --region mexico --tier 1\n\n# Custom output directory\nnode scripts/generate-apkg.js --region mexico --output ./dist\n\n# Show help\nnode scripts/generate-apkg.js --help')" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📋 Copy</button>

```bash
# Generate all tiers
node scripts/generate-apkg.js --region mexico

# Generate specific tier
node scripts/generate-apkg.js --region mexico --tier 1

# Custom output directory
node scripts/generate-apkg.js --region mexico --output ./dist

# Show help
node scripts/generate-apkg.js --help
```
</div>

## Output

Generated `.apkg` files will be saved in the `./output` directory:

- `DrillMaster-Tier1-Foundations-mexico.apkg` (722 cards)
- `DrillMaster-Tier2-DailyRoutines-mexico.apkg` (~168 cards)
- `DrillMaster-Tier3-IrregularEssentials-mexico.apkg` (~132 cards)
- `DrillMaster-Tier4-Emotional&Cognitive-mexico.apkg` (~144 cards)
- `DrillMaster-Tier5-Gustar-TypeVerbs-mexico.apkg` (~60 cards)

**Total: ~1,226 cards across all tiers**

## Anki Import Instructions

1. Open Anki Desktop
2. **File → Import** (or `Ctrl+I` / `Cmd+I`)
3. Navigate to the `./output` directory
4. Import each file (order doesn't matter)
5. When prompted, select **"Merge Note Types"**
6. Verify deck structure appears correctly

Each tier creates a main deck with subdecks for different tenses and card types.

## Regional Variants

Currently only Mexico/Latin America is implemented:
- Uses: tú (informal), usted (formal), ustedes (plural)
- Excludes: vos (Argentina), vosotros (Spain)

Future regions planned:
- Argentina (vos, usted, ustedes)
- Spain (tú, usted, vosotros, ustedes)

## Card Types

Each tier generates 2 essential card types:
1. **Recognition (ES→EN)** - Spanish to English translation
2. **Production (EN→ES)** - English to Spanish translation

## Deck Structure

Decks are organized pedagogically:
```
Tier 1: Foundations/
├── 01 Present/
│   ├── A Recognition (ES→EN)
│   └── B Production (EN→ES)
├── 02 Gerund/
└── ...
```

## Subject Disambiguation

English sentences include formality hints:
- "You (informal)" → tú
- "You (formal)" → usted  
- "You all" → ustedes

This ensures students know exactly which Spanish conjugation to use.

## Development Scripts

### Vocabulary Level Fixing
<div style="position: relative;">
  <button onclick="navigator.clipboard.writeText('node scripts/fix-tier-vocabulary.js')" style="position: absolute; top: 5px; right: 5px; padding: 2px 8px; font-size: 12px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer;">📋 Copy</button>

```bash
node scripts/fix-tier-vocabulary.js
```
</div>

Audits and fixes vocabulary that's too advanced for a given tier level. 

**Usage:**
1. Edit `TIER_NUMBER` in the script (1-5)
2. Update `replacements` array with tier-appropriate substitutions  
3. Run the script to apply fixes

**Example fixes applied to Tier 1:**
- "ahorrar dinero" → "porque es barato" 
- "universidad" → "escuela"
- "medicina" → "español"
- "experiencia" → "tiempo"

See `docs/VOCABULARY_GUIDELINES.md` for tier-appropriate vocabulary standards.

## Audio Generation (TTS)

Generate MP3 audio files for Spanish sentences using OpenAI's Text-to-Speech API.

### Prerequisites

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Tip: Add this to `~/.zshrc_secrets` and source it from `~/.zshrc` to keep it persistent and secure.

### Quick Start

```bash
# Generate audio for all sentences in a tier
npm run audio:tier5

# Or use the script directly with options
node scripts/generate-audio-from-corpus.mjs --corpus data/corpus/tier5-complete.json

# View help (use node directly, not npm run)
node scripts/generate-audio-from-corpus.mjs --help
```

> **Note:** To pass flags like `--help` or `--dry-run`, run the script directly with `node` rather than using `npm run`. The npm script approach may not reliably pass additional arguments.

### CLI Options

| Option | Description |
|--------|-------------|
| `--corpus <path>` | Path to corpus JSON file (required) |
| `--out <path>` | Output JSON path (default: `<corpus>.with-audio.json`) |
| `--limit <n>` | Max number of sentences to process (for testing) |
| `--dry-run` | Preview what would happen without calling API |
| `--skip-existing` | Skip sentences that already have an `audio` field |
| `--voice <voice>` | TTS voice (default: `coral`) |
| `--speed <speed>` | Speech speed 0.25-4.0 (default: 1.0) |
| `--verbose` | Show detailed per-sentence logging |
| `--help` | Show help message |

### Available Voices

`alloy`, `ash`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`

### Examples

```bash
# Test with 5 sentences (dry run, no API calls)
node scripts/generate-audio-from-corpus.mjs \
  --corpus data/corpus/tier5-complete.json \
  --limit 5 \
  --dry-run \
  --verbose

# Generate audio for first 10 sentences
node scripts/generate-audio-from-corpus.mjs \
  --corpus data/corpus/tier1-complete.json \
  --limit 10

# Resume processing (skip already-processed sentences)
node scripts/generate-audio-from-corpus.mjs \
  --corpus data/corpus/tier1-complete.json \
  --skip-existing

# Use a different voice at slower speed
node scripts/generate-audio-from-corpus.mjs \
  --corpus data/corpus/tier5-complete.json \
  --voice nova \
  --speed 0.85
```

### Output

- **Audio files**: Saved to `data/audio/` with deterministic names like `tier5_GUSTAR_present_0001.mp3`
- **Updated corpus**: Written to `<corpus>.with-audio.json` with an `audio` field added to each sentence

### Cost Estimate

OpenAI TTS costs ~$0.015 per 1K characters. The full corpus (~1,500 sentences, ~75K characters) costs approximately **$1.13**.

### NPM Scripts

```bash
npm run audio:tier1   # Process tier 1 (593 sentences)
npm run audio:tier2   # Process tier 2 (283 sentences)
npm run audio:tier3   # Process tier 3 (297 sentences)
npm run audio:tier4   # Process tier 4 (231 sentences)
npm run audio:tier5   # Process tier 5 (97 sentences)
```

---

## Generate All Deck Variants

Generate all combinations of decks (text-only and audio versions) for distribution.

### Quick Start

```bash
# Generate all variants (text + audio for all tiers and uber-deck)
npm run generate:all-variants

# Generate only text versions (no audio)
npm run generate:text-only

# Preview what would be generated
node scripts/generate-all-decks.js --dry-run
```

### CLI Options

```bash
node scripts/generate-all-decks.js [options]
```

| Option | Description |
|--------|-------------|
| `--region <region>` | Generate only for specific region (default: all) |
| `--tier <tier>` | Generate only specific tier 1-5 (default: all) |
| `--audio-only` | Generate only audio versions |
| `--text-only` | Generate only text versions |
| `--no-uber` | Skip uber-deck (complete collection) generation |
| `--dry-run` | Preview what would be generated |
| `--help` | Show help |

### Output Files

The script generates decks in `./output/` with this naming convention:

**Text-only:**
- `DrillMaster-Tier1-Foundations-mexico.apkg` (~50 KB)
- `DrillMaster-Tier2-EssentialActions-mexico.apkg` (~50 KB)
- `DrillMaster-Complete-mexico.apkg` (~200 KB)

**With Audio:**
- `DrillMaster-Tier1-Foundations-Audio-mexico.apkg` (~14 MB)
- `DrillMaster-Tier2-EssentialActions-Audio-mexico.apkg` (~21 MB)
- `DrillMaster-Complete-Audio-mexico.apkg` (~80 MB)

### Storage Estimates

| Tier | Text-Only | With Audio |
|------|-----------|------------|
| 1 | ~50 KB | ~14 MB |
| 2 | ~50 KB | ~21 MB |
| 3 | ~50 KB | ~21 MB |
| 4 | ~50 KB | ~17 MB |
| 5 | ~30 KB | ~8 MB |
| **Complete** | **~200 KB** | **~80 MB** |

### Future Regions

Currently supports `mexico` (Latin American Spanish). Future versions will add:
- `argentina` - Argentine Spanish (vos)
- `spain` - Castilian Spanish (vosotros)
