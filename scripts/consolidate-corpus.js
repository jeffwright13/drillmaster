#!/usr/bin/env node

/**
 * Consolidate fragmented corpus files into clean per-tier files with metadata and tags
 */

const fs = require('fs');
const path = require('path');

// Load verb metadata from verbs.tsv
function loadVerbMetadata() {
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  const content = fs.readFileSync(verbsPath, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // Skip header
  
  const metadata = {};
  lines.forEach(line => {
    const [verb, english, tags, notes] = line.split('\t');
    if (verb) {
      const tagMap = {};
      tags.split(';').forEach(tag => {
        const [key, value] = tag.split(':');
        if (value) {
          tagMap[key] = value;
        } else {
          tagMap[key] = true;
        }
      });
      
      metadata[verb] = {
        english,
        tags: tagMap,
        notes: notes || ''
      };
    }
  });
  
  return metadata;
}

// Add tags to sentence based on verb metadata and sentence properties
function addTagsToSentence(sentence, verb, verbMeta, tense) {
  const tags = [
    tense,
    `tier:${verbMeta.tags.tier}`,
    verbMeta.tags.regularity,
    `region:${sentence.region}`,
    `subject:${sentence.subject}`
  ];
  
  // Add verb type tags
  if (verbMeta.tags['verb-type']) tags.push(`${verbMeta.tags['verb-type']}-verb`);
  if (verbMeta.tags.reflexive) tags.push('reflexive');
  if (verbMeta.tags.copula) tags.push('copula');
  if (verbMeta.tags['stem-change']) tags.push('stem-changing');
  if (verbMeta.tags['special-construction']) tags.push('special-construction');
  
  return {
    ...sentence,
    tags
  };
}

// Load all corpus data from fragmented files
function loadAllCorpusData() {
  const corpusDir = path.join(__dirname, '../data/corpus');
  const allData = {};
  
  // Files to load (in order of preference)
  const sourceFiles = [
    'tier1-completion.json',
    'tier2-completion.json', 
    'tier3-complete-verbs.json',
    'tier3-missing-tenses.json',
    'tier4-complete-verbs.json',
    'tier4-missing-tenses.json',
    'tier2-missing-tenses.json',
    'tier1-verbs.json',
    'tier2-verbs.json',
    'tier3-verbs.json',
    'tier4-verbs.json',
    'remaining-tier1-verbs.json'
  ];
  
  sourceFiles.forEach(filename => {
    const filePath = path.join(corpusDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`Loading ${filename}...`);
        
        // Merge data, avoiding duplicates
        Object.keys(data).forEach(verb => {
          if (!allData[verb]) {
            allData[verb] = {};
          }
          
          Object.keys(data[verb]).forEach(tense => {
            if (!allData[verb][tense]) {
              allData[verb][tense] = data[verb][tense];
            }
          });
        });
      } catch (error) {
        console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
      }
    }
  });
  
  return allData;
}

// Consolidate data by tier
function consolidateByTier() {
  const verbMetadata = loadVerbMetadata();
  const allCorpusData = loadAllCorpusData();
  
  console.log('📊 Loaded corpus data for verbs:', Object.keys(allCorpusData).sort().join(', '));
  
  // Group by tier
  const tiers = { 1: {}, 2: {}, 3: {}, 4: {} };
  
  Object.keys(allCorpusData).forEach(verb => {
    const meta = verbMetadata[verb];
    if (!meta) {
      console.warn(`⚠️  No metadata found for verb: ${verb}`);
      return;
    }
    
    const tier = parseInt(meta.tags.tier);
    if (!tiers[tier]) {
      console.warn(`⚠️  Invalid tier ${tier} for verb: ${verb}`);
      return;
    }
    
    // Process verb data with metadata and tags
    const verbData = {
      metadata: {
        english: meta.english,
        verb_type: meta.tags['verb-type'] || 'unknown',
        regularity: meta.tags.regularity || 'unknown',
        tags: [
          `tier:${tier}`,
          meta.tags.regularity,
          meta.tags['verb-type'] ? `${meta.tags['verb-type']}-verb` : null,
          meta.tags.reflexive ? 'reflexive' : null,
          meta.tags.copula ? 'copula' : null,
          meta.tags['stem-change'] ? 'stem-changing' : null,
          meta.tags['special-construction'] ? 'special-construction' : null
        ].filter(Boolean)
      }
    };
    
    // Add sentences with tags
    ['present', 'preterite', 'future'].forEach(tense => {
      if (allCorpusData[verb][tense]) {
        verbData[tense] = allCorpusData[verb][tense].map(sentence => 
          addTagsToSentence(sentence, verb, meta, tense)
        );
      }
    });
    
    tiers[tier][verb] = verbData;
  });
  
  // Create consolidated files
  [1, 2, 3, 4].forEach(tierNum => {
    const tierData = tiers[tierNum];
    const verbCount = Object.keys(tierData).length;
    const sentenceCount = Object.values(tierData).reduce((total, verb) => {
      return total + ['present', 'preterite', 'future'].reduce((verbTotal, tense) => {
        return verbTotal + (verb[tense] ? verb[tense].length : 0);
      }, 0);
    }, 0);
    
    const consolidatedData = {
      metadata: {
        tier: tierNum,
        description: getTierDescription(tierNum),
        verb_count: verbCount,
        sentence_count: sentenceCount,
        tenses: ['present', 'preterite', 'future'],
        subjects: ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'],
        regions: ['universal', 'argentina', 'spain']
      },
      verbs: tierData
    };
    
    const outputPath = path.join(__dirname, `../data/corpus/tier${tierNum}-complete.json`);
    fs.writeFileSync(outputPath, JSON.stringify(consolidatedData, null, 2));
    
    console.log(`✅ Created tier${tierNum}-complete.json: ${verbCount} verbs, ${sentenceCount} sentences`);
  });
}

function getTierDescription(tier) {
  const descriptions = {
    1: 'Most essential Spanish verbs - fundamental for basic communication',
    2: 'Essential daily life verbs - reflexive verbs and common actions', 
    3: 'Important intermediate verbs - emotions, cognition, and complex actions',
    4: 'Advanced verbs - specialized actions and complex constructions'
  };
  return descriptions[tier];
}

// Main execution
if (require.main === module) {
  console.log('🔄 Consolidating fragmented corpus files...\n');
  consolidateByTier();
  console.log('\n🎉 Consolidation complete!');
}
