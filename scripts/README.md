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
✅ **4 Card Types**: Translation EN→ES, ES→EN, Cloze, Conjugation Practice  
✅ **Pedagogical Structure**: 5 tiers with progressive difficulty  
✅ **1,834 Total Cards**: Comprehensive coverage across all tiers

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

- `DrillMaster-Tier1-Foundations-mexico.apkg` (1,078 cards)
- `DrillMaster-Tier2-DailyRoutines-mexico.apkg` (252 cards)
- `DrillMaster-Tier3-IrregularEssentials-mexico.apkg` (198 cards)
- `DrillMaster-Tier4-Emotional&Cognitive-mexico.apkg` (216 cards)
- `DrillMaster-Tier5-Gustar-TypeVerbs-mexico.apkg` (90 cards)

**Total: 1,834 cards across all tiers**

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

Each tier generates 4 card types:
1. **Recognition (ES→EN)** - Spanish to English translation
2. **Production (EN→ES)** - English to Spanish translation
3. **Cloze** - Fill-in-the-blank exercises
4. **Conjugation Practice** - Verb conjugation drills

## Deck Structure

Decks are organized pedagogically:
```
Tier 1: Foundations/
├── 01 Present/
│   ├── A Recognition (ES→EN)
│   ├── B Production (EN→ES)
│   └── C Grammar (Cloze & Conjugation)
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
