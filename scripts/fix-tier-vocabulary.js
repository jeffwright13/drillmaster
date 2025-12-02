/**
 * Vocabulary Level Fixer for DrillMaster Tiers
 * 
 * This script audits and fixes vocabulary that's too advanced for a given tier level.
 * It replaces complex words with simpler, tier-appropriate alternatives.
 * 
 * Usage:
 * 1. Set TIER_NUMBER to the tier you want to fix (1-5)
 * 2. Update the replacements array with tier-appropriate substitutions
 * 3. Run: node scripts/fix-tier-vocabulary.js
 * 
 * Based on vocabulary guidelines in docs/VOCABULARY_GUIDELINES.md
 */

const fs = require('fs');

// Configuration - modify for different tiers
const TIER_NUMBER = 1; // Change this for other tiers
const TIER_FILE = `data/corpus/tier${TIER_NUMBER}-complete.json`;

// Load the corpus
const corpus = JSON.parse(fs.readFileSync(TIER_FILE, 'utf-8'));

console.log(`🔧 Fixing Tier ${TIER_NUMBER} advanced vocabulary...`);

let fixedCount = 0;

// Replacement patterns for Tier 4 advanced vocabulary
// Tier 4 can handle more complexity, but still avoid highly specialized terms
const replacements = [
  // PROYECTO (project) -> TRABAJO (work) - still too business-focused
  {
    find: /proyecto/g,
    replace: 'trabajo',
    englishFind: /project/g,
    englishReplace: 'work'
  },
  
  // OFICINA (office) -> CASA (house) - can be simplified
  {
    find: /oficina/g,
    replace: 'casa',
    englishFind: /office/g,
    englishReplace: 'house'
  },
  
  // REUNIÓN (meeting) -> CLASE (class)
  {
    find: /reunión/g,
    replace: 'clase',
    englishFind: /meeting/g,
    englishReplace: 'class'
  },
  
  // HOSPITAL (hospital) -> CASA (house) - medical context still advanced
  {
    find: /hospital/g,
    replace: 'casa',
    englishFind: /hospital/g,
    englishReplace: 'house'
  },
  
  // CIRUGÍA (surgery) -> TRABAJO (work) - medical context too advanced
  {
    find: /cirugía/g,
    replace: 'trabajo',
    englishFind: /surgery/g,
    englishReplace: 'work'
  },
  
  // INVESTIGACIÓN (research) -> ESTUDIO (study)
  {
    find: /investigación/g,
    replace: 'estudio',
    englishFind: /research/g,
    englishReplace: 'study'
  },
  
  // UNIVERSIDAD (university) -> ESCUELA (school) - still simplify
  {
    find: /universidad/g,
    replace: 'escuela',
    englishFind: /university/g,
    englishReplace: 'school'
  },
  
  // PROFESOR (professor) -> MAESTRO (teacher) - simpler term
  {
    find: /profesor/g,
    replace: 'maestro',
    englishFind: /professor/g,
    englishReplace: 'teacher'
  },
  
  // TRATAMIENTO (treatment) -> AYUDA (help)
  {
    find: /tratamiento/g,
    replace: 'ayuda',
    englishFind: /treatment/g,
    englishReplace: 'help'
  },
  
  // Note: Keep "experiencia" and "increíble" - Tier 4 can handle these
];

// Apply replacements to all sentences
Object.keys(corpus.verbs).forEach(verbName => {
  Object.keys(corpus.verbs[verbName]).forEach(tense => {
    if (Array.isArray(corpus.verbs[verbName][tense])) {
      corpus.verbs[verbName][tense].forEach(sentence => {
        let originalSpanish = sentence.spanish;
        let originalEnglish = sentence.english;
        
        replacements.forEach(replacement => {
          sentence.spanish = sentence.spanish.replace(replacement.find, replacement.replace);
          sentence.english = sentence.english.replace(replacement.englishFind, replacement.englishReplace);
        });
        
        if (originalSpanish !== sentence.spanish || originalEnglish !== sentence.english) {
          fixedCount++;
        }
      });
    }
  });
});

// Save the updated corpus
fs.writeFileSync(TIER_FILE, JSON.stringify(corpus, null, 2));

console.log(`✅ Fixed ${fixedCount} sentences with advanced vocabulary`);

// Show some examples of what was changed
console.log('\n📝 Sample changes made for Tier 4:');
console.log('- "proyecto" → "trabajo"');
console.log('- "oficina" → "casa"'); 
console.log('- "reunión" → "clase"');
console.log('- "hospital" → "casa"');
console.log('- "cirugía" → "trabajo"');
console.log('- "investigación" → "estudio"');
console.log('- "universidad" → "escuela"');
console.log('- "profesor" → "maestro"');
console.log('- "tratamiento" → "ayuda"');
console.log('- Note: Kept "experiencia" and "increíble" (appropriate for Tier 4)');

console.log(`\n🎯 Tier ${TIER_NUMBER} now uses appropriate vocabulary for its level!`);

console.log('\n💡 To use for other tiers:');
console.log('1. Change TIER_NUMBER at the top of this file');
console.log('2. Update the replacements array for tier-appropriate vocabulary');
console.log('3. Run: node scripts/fix-tier-vocabulary.js');
