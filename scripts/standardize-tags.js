const fs = require('fs');
const path = require('path');

// Tag standardization mapping based on tag_system_v3_documentation.md
const tagMappings = {
  // Tense mappings
  'present': 'tense:present',
  'present-progressive': 'tense:present-progressive', 
  'going-to': 'tense:going-to',
  'preterite': 'tense:preterite',
  'present-perfect': 'tense:present-perfect',
  'future': 'tense:future',
  
  // Regularity mappings
  'regular': 'regularity:regular',
  'irregular': 'regularity:irregular',
  'highly-irregular': 'regularity:highly-irregular',
  
  // Verb type mappings
  'ar-verb': 'verb-type:ar',
  'er-verb': 'verb-type:er', 
  'ir-verb': 'verb-type:ir',
  
  // Special verb properties
  'copula': 'copula:true',
  'reflexive': 'reflexive:true',
  
  // Stem changes (these are already correct format, but included for completeness)
  'stem-change:e-ie': 'stem-change:e-ie',
  'stem-change:o-ue': 'stem-change:o-ue',
  'stem-change:e-i': 'stem-change:e-i',
  
  // Yo-form irregularities
  'yo-form:irregular': 'yo-form:irregular',
  'yo-form:zco': 'yo-form:zco',
  'yo-form:go': 'yo-form:go',
  
  // Special constructions
  'special-construction:indirect-object': 'special-construction:indirect-object',
  'backwards-verb': 'special-construction:indirect-object', // Legacy tag for GUSTAR-type verbs
  
  // Spelling changes
  'spelling-change:preterite': 'spelling-change:preterite',
  'spelling-change:true': 'spelling-change:true'
};

// Required tags that should be added if missing
const requiredTags = {
  'word-type:verb': true // All current entries are verbs
};

// Verb metadata for adding missing verb-specific tags
const verbMetadata = {
  // Tier 1 verbs
  'HABLAR': { type: 'ar', regularity: 'regular' },
  'COMER': { type: 'er', regularity: 'regular' },
  'VIVIR': { type: 'ir', regularity: 'regular' },
  'SER': { type: 'er', regularity: 'highly-irregular', copula: true },
  'ESTAR': { type: 'ar', regularity: 'highly-irregular', copula: true },
  'TENER': { type: 'er', regularity: 'irregular', stemChange: 'e-ie' },
  'IR': { type: 'ir', regularity: 'highly-irregular' },
  'HACER': { type: 'er', regularity: 'irregular', yoForm: 'go' },
  'PODER': { type: 'er', regularity: 'irregular', stemChange: 'o-ue' },
  'QUERER': { type: 'er', regularity: 'irregular', stemChange: 'e-ie' },
  
  // Tier 2 verbs
  'LLAMARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  'LEVANTARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  'SENTARSE': { type: 'ar', regularity: 'irregular', stemChange: 'e-ie', reflexive: true },
  'ACOSTARSE': { type: 'ar', regularity: 'irregular', stemChange: 'o-ue', reflexive: true },
  'DESPERTARSE': { type: 'ar', regularity: 'irregular', stemChange: 'e-ie', reflexive: true },
  'DUCHARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  'LAVARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  'LAVAR': { type: 'ar', regularity: 'regular' },
  'PONERSE': { type: 'er', regularity: 'irregular', yoForm: 'go', reflexive: true },
  'VESTIRSE': { type: 'ir', regularity: 'irregular', stemChange: 'e-i', reflexive: true },
  'QUEDARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  
  // Tier 3 verbs  
  'IRSE': { type: 'ir', regularity: 'highly-irregular', reflexive: true },
  'VENIR': { type: 'ir', regularity: 'irregular', stemChange: 'e-ie' },
  'PONER': { type: 'er', regularity: 'irregular', yoForm: 'go' },
  'SALIR': { type: 'ir', regularity: 'irregular', yoForm: 'go' },
  'VER': { type: 'er', regularity: 'irregular' },
  'DAR': { type: 'ar', regularity: 'irregular' },
  'DECIR': { type: 'ir', regularity: 'irregular', stemChange: 'e-i', yoForm: 'go' },
  'SABER': { type: 'er', regularity: 'irregular', yoForm: 'irregular' },
  'OÍR': { type: 'ir', regularity: 'highly-irregular' },
  'TRAER': { type: 'er', regularity: 'irregular', yoForm: 'go' },
  'CREER': { type: 'er', regularity: 'regular', spellingChange: 'preterite' },
  'SENTIRSE': { type: 'ir', regularity: 'irregular', stemChange: 'e-ie', reflexive: true },
  
  // Tier 4 verbs
  'NECESITAR': { type: 'ar', regularity: 'regular' },
  'LLEVAR': { type: 'ar', regularity: 'regular' },
  'PENSAR': { type: 'ar', regularity: 'irregular', stemChange: 'e-ie' },
  'ENTENDER': { type: 'er', regularity: 'irregular', stemChange: 'e-ie' },
  'SENTIR': { type: 'ir', regularity: 'irregular', stemChange: 'e-ie' },
  'CONOCER': { type: 'er', regularity: 'irregular', yoForm: 'zco' },
  'ENCONTRAR': { type: 'ar', regularity: 'irregular', stemChange: 'o-ue' },
  'ENCONTRARSE': { type: 'ar', regularity: 'irregular', stemChange: 'o-ue', reflexive: true },
  'PREOCUPARSE': { type: 'ar', regularity: 'regular', reflexive: true },
  'DIVERTIRSE': { type: 'ir', regularity: 'irregular', stemChange: 'e-ie', reflexive: true },
  
  // Tier 5 verbs (backwards/gustar-type)
  'GUSTAR': { type: 'ar', regularity: 'regular', specialConstruction: 'indirect-object' },
  'DOLER': { type: 'er', regularity: 'irregular', stemChange: 'o-ue', specialConstruction: 'indirect-object' },
  'ENCANTAR': { type: 'ar', regularity: 'regular', specialConstruction: 'indirect-object' },
  'MOLESTAR': { type: 'ar', regularity: 'regular', specialConstruction: 'indirect-object' },
  'IMPORTAR': { type: 'ar', regularity: 'regular', specialConstruction: 'indirect-object' },
  'FALTAR': { type: 'ar', regularity: 'regular', specialConstruction: 'indirect-object' },
  'PARECER': { type: 'er', regularity: 'irregular', yoForm: 'zco', specialConstruction: 'indirect-object' }
};

function standardizeTags(tags, verbName = null) {
  const standardized = [];
  const processed = new Set();
  
  // Add required tags first
  Object.keys(requiredTags).forEach(tag => {
    standardized.push(tag);
    processed.add(tag);
  });
  
  // Process existing tags
  tags.forEach(tag => {
    // Skip if already processed
    if (processed.has(tag)) return;
    
    // Check if tag needs mapping
    if (tagMappings[tag]) {
      const mappedTag = tagMappings[tag];
      if (!processed.has(mappedTag)) {
        standardized.push(mappedTag);
        processed.add(mappedTag);
      }
    } else if (tag.includes(':')) {
      // Already in key:value format, keep as-is
      if (!processed.has(tag)) {
        standardized.push(tag);
        processed.add(tag);
      }
    } else {
      // Unknown standalone tag, keep as-is but warn
      console.log(`  ⚠️  Unknown standalone tag: "${tag}" for ${verbName || 'unknown verb'}`);
      if (!processed.has(tag)) {
        standardized.push(tag);
        processed.add(tag);
      }
    }
  });
  
  // Add missing verb-specific tags based on metadata
  if (verbName && verbMetadata[verbName]) {
    const meta = verbMetadata[verbName];
    
    // Add verb-type if missing
    const verbTypeTag = `verb-type:${meta.type}`;
    if (!processed.has(verbTypeTag)) {
      standardized.push(verbTypeTag);
      processed.add(verbTypeTag);
    }
    
    // Add regularity if missing
    const regularityTag = `regularity:${meta.regularity}`;
    if (!processed.has(regularityTag)) {
      standardized.push(regularityTag);
      processed.add(regularityTag);
    }
    
    // Add optional properties
    if (meta.stemChange && !processed.has(`stem-change:${meta.stemChange}`)) {
      standardized.push(`stem-change:${meta.stemChange}`);
    }
    if (meta.yoForm && !processed.has(`yo-form:${meta.yoForm}`)) {
      standardized.push(`yo-form:${meta.yoForm}`);
    }
    if (meta.reflexive && !processed.has('reflexive:true')) {
      standardized.push('reflexive:true');
    }
    if (meta.copula && !processed.has('copula:true')) {
      standardized.push('copula:true');
    }
    if (meta.specialConstruction && !processed.has(`special-construction:${meta.specialConstruction}`)) {
      standardized.push(`special-construction:${meta.specialConstruction}`);
    }
    if (meta.spellingChange && !processed.has(`spelling-change:${meta.spellingChange}`)) {
      standardized.push(`spelling-change:${meta.spellingChange}`);
    }
  }
  
  return standardized.sort(); // Sort for consistency
}

function standardizeCorpusFile(filePath) {
  console.log(`\n🔧 Processing: ${path.basename(filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  
  let totalChanges = 0;
  let verbsProcessed = 0;
  
  // Access the verbs object
  const verbs = data.verbs || data; // Handle both structures
  
  // Process each verb
  Object.keys(verbs).forEach(verbName => {
    if (verbName === 'metadata') return; // Skip metadata
    
    const verb = verbs[verbName];
    if (!verb || typeof verb !== 'object') return; // Skip invalid entries
    
    verbsProcessed++;
    console.log(`    Processing verb: ${verbName}`);
    
    // Process each tense
    Object.keys(verb).forEach(tense => {
      if (tense === 'metadata') return; // Skip verb metadata
      
      const sentences = verb[tense];
      if (!Array.isArray(sentences)) return;
      
      // Process each sentence
      sentences.forEach(sentence => {
        if (sentence.tags && Array.isArray(sentence.tags)) {
          const originalTags = [...sentence.tags];
          const standardizedTags = standardizeTags(sentence.tags, verbName);
          
          // Check if tags changed
          if (JSON.stringify(originalTags.sort()) !== JSON.stringify(standardizedTags.sort())) {
            console.log(`      📝 ${verbName} ${tense}: ${originalTags.join(', ')} → ${standardizedTags.join(', ')}`);
            sentence.tags = standardizedTags;
            totalChanges++;
          }
        }
      });
    });
  });
  
  // Write back to file
  if (totalChanges > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  ✅ Standardized ${totalChanges} tag sets across ${verbsProcessed} verbs`);
  } else {
    console.log(`  ✨ No changes needed for ${verbsProcessed} verbs`);
  }
  
  return { changes: totalChanges, verbs: verbsProcessed };
}

function standardizeAllTags() {
  const corpusDir = path.join(__dirname, '..', 'data', 'corpus');
  const files = [
    'tier1-complete.json',
    'tier2-complete.json',
    'tier3-complete.json', 
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  let totalChanges = 0;
  let totalVerbs = 0;
  
  console.log('🚀 Starting Tag Standardization...\n');
  console.log('📋 Converting to standardized key:value format:');
  console.log('  • "present" → "tense:present"');
  console.log('  • "regular" → "regularity:regular"');
  console.log('  • "ar-verb" → "verb-type:ar"');
  console.log('  • Adding missing "word-type:verb" tags');
  console.log('  • Adding missing verb-specific metadata tags\n');
  
  files.forEach(filename => {
    const filePath = path.join(corpusDir, filename);
    if (fs.existsSync(filePath)) {
      const result = standardizeCorpusFile(filePath);
      totalChanges += result.changes;
      totalVerbs += result.verbs;
    } else {
      console.log(`⚠️  File not found: ${filename}`);
    }
  });
  
  console.log(`\n🎉 COMPLETED! Standardized ${totalChanges} tag sets across ${totalVerbs} verbs.`);
  
  if (totalChanges > 0) {
    console.log('\n📊 Benefits of standardized tags:');
    console.log('  ✅ Precise Anki filtering: tag:tense:present vs tag:tense:present-progressive');
    console.log('  ✅ Consistent key:value format across all sentences');
    console.log('  ✅ Future-proof for database queries and advanced filtering');
    console.log('  ✅ Complete verb metadata for all 50 verbs');
    console.log('\n🔄 Refresh your browser to use the new standardized tag system!');
  }
}

if (require.main === module) {
  standardizeAllTags();
}

module.exports = { standardizeAllTags, standardizeTags };
