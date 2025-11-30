const fs = require('fs');
const path = require('path');

// Define which verbs need to be moved to tier 5
const gustartypeVerbs = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];

// Current locations of these verbs
const verbLocations = {
  'GUSTAR': 'tier2-complete.json',
  'DOLER': 'tier2-complete.json',
  'ENCANTAR': 'tier3-complete.json', 
  'MOLESTAR': 'tier3-complete.json',
  'IMPORTAR': 'tier3-complete.json',
  'FALTAR': 'tier4-complete.json',
  'PARECER': 'tier4-complete.json'
};

function updateTierTags(verbData, newTier) {
  // Update metadata tags
  if (verbData.metadata && verbData.metadata.tags) {
    verbData.metadata.tags = verbData.metadata.tags.map(tag => 
      tag.startsWith('tier:') ? `tier:${newTier}` : tag
    );
  }
  
  // Update all sentence tags
  Object.keys(verbData).forEach(tense => {
    if (Array.isArray(verbData[tense])) {
      verbData[tense].forEach(sentence => {
        if (sentence.tags) {
          sentence.tags = sentence.tags.map(tag => 
            tag.startsWith('tier:') ? `tier:${newTier}` : tag
          );
        }
      });
    }
  });
  
  return verbData;
}

function moveVerbsToTier5() {
  console.log('Moving Gustar-type verbs to Tier 5...');
  
  // Load tier5-complete.json
  const tier5Path = path.join(__dirname, '..', 'data', 'corpus', 'tier5-complete.json');
  let tier5Data = JSON.parse(fs.readFileSync(tier5Path, 'utf8'));
  
  let totalMoved = 0;
  
  // Process each verb
  gustartypeVerbs.forEach(verbName => {
    const sourceFile = verbLocations[verbName];
    const sourcePath = path.join(__dirname, '..', 'data', 'corpus', sourceFile);
    
    console.log(`Moving ${verbName} from ${sourceFile} to tier5-complete.json`);
    
    // Load source file
    let sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    
    // Check if verb exists in source
    if (sourceData.verbs[verbName]) {
      // Get the verb data and update tier tags
      let verbData = sourceData.verbs[verbName];
      verbData = updateTierTags(verbData, 5);
      
      // Add to tier 5 (skip GUSTAR since it's already there)
      if (verbName !== 'GUSTAR') {
        tier5Data.verbs[verbName] = verbData;
      }
      
      // Remove from source file
      delete sourceData.verbs[verbName];
      
      // Update source file metadata
      sourceData.metadata.verb_count = Object.keys(sourceData.verbs).length;
      
      // Recalculate sentence count for source
      let sentenceCount = 0;
      Object.values(sourceData.verbs).forEach(verb => {
        Object.values(verb).forEach(tenseData => {
          if (Array.isArray(tenseData)) {
            sentenceCount += tenseData.length;
          }
        });
      });
      sourceData.metadata.sentence_count = sentenceCount;
      
      // Write updated source file
      fs.writeFileSync(sourcePath, JSON.stringify(sourceData, null, 2));
      
      totalMoved++;
      console.log(`✅ Moved ${verbName}`);
    } else {
      console.log(`⚠️  ${verbName} not found in ${sourceFile}`);
    }
  });
  
  // Update tier 5 metadata
  tier5Data.metadata.verb_count = Object.keys(tier5Data.verbs).length;
  
  // Calculate sentence count for tier 5
  let tier5SentenceCount = 0;
  Object.values(tier5Data.verbs).forEach(verb => {
    Object.values(verb).forEach(tenseData => {
      if (Array.isArray(tenseData)) {
        tier5SentenceCount += tenseData.length;
      }
    });
  });
  tier5Data.metadata.sentence_count = tier5SentenceCount;
  
  // Write updated tier 5 file
  fs.writeFileSync(tier5Path, JSON.stringify(tier5Data, null, 2));
  
  console.log(`\n🎉 Successfully moved ${totalMoved} verbs to Tier 5`);
  console.log(`Tier 5 now contains ${tier5Data.metadata.verb_count} verbs with ${tier5Data.metadata.sentence_count} sentences`);
}

if (require.main === module) {
  moveVerbsToTier5();
}

module.exports = { moveVerbsToTier5 };
