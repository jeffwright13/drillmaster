/**
 * Verify conjugations against a trusted source
 * 
 * This script will check our generated conjugations against
 * the verbo library which has accurate Spanish conjugations
 * 
 * Usage: npm install verbo && node scripts/verify-conjugations.js
 */

const fs = require('fs');
const path = require('path');

// First, let's check if verbo is installed
let verbo;
try {
  verbo = require('verbo');
} catch (e) {
  console.error('❌ verbo library not installed');
  console.log('\nPlease run: npm install verbo');
  console.log('Then run this script again.\n');
  process.exit(1);
}

// Read our generated conjugations
const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
const ourConjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));

// Read verbs list
const verbsPath = path.join(__dirname, '../data/verbs.tsv');
const verbsContent = fs.readFileSync(verbsPath, 'utf-8');
const lines = verbsContent.trim().split('\n').slice(1);
const verbs = lines.filter(line => line.trim()).map(line => {
  const [verb] = line.split('\t');
  return verb;
});

// Subject mapping between our format and verbo
const subjectMap = {
  'yo': 'yo',
  'tú': 'tú',
  'vos': 'vos',
  'él/ella/usted': 'él',
  'nosotros': 'nosotros',
  'vosotros': 'vosotros',
  'ellos/ellas/ustedes': 'ellos'
};

// Tense mapping
const tenseMap = {
  'present': 'presente',
  'preterite': 'pretérito',
  'future': 'futuro'
};

console.log('🔍 Verifying conjugations against verbo library...\n');

let totalChecks = 0;
let errors = 0;
const errorList = [];

verbs.forEach(verbUpper => {
  const verb = verbUpper.toLowerCase();
  const ourConj = ourConjugations[verbUpper];
  
  if (!ourConj) {
    console.log(`⚠️  ${verbUpper}: Not found in our conjugations`);
    return;
  }
  
  console.log(`Checking ${verbUpper}...`);
  
  // Try to get conjugations from verbo
  let verboConj;
  try {
    verboConj = verbo.conjugate(verb);
  } catch (e) {
    console.log(`  ⚠️  Could not get conjugations from verbo: ${e.message}`);
    return;
  }
  
  // Check each tense and subject
  ['present', 'preterite', 'future'].forEach(tense => {
    const verboTense = tenseMap[tense];
    
    Object.keys(subjectMap).forEach(ourSubject => {
      const verboSubject = subjectMap[ourSubject];
      totalChecks++;
      
      const ourForm = ourConj[tense][ourSubject];
      let verboForm;
      
      try {
        verboForm = verboConj.indicativo[verboTense][verboSubject];
      } catch (e) {
        // Tense or subject not found in verbo
        return;
      }
      
      if (ourForm !== verboForm) {
        errors++;
        const error = {
          verb: verbUpper,
          tense,
          subject: ourSubject,
          ours: ourForm,
          correct: verboForm
        };
        errorList.push(error);
        console.log(`  ❌ ${tense} ${ourSubject}: "${ourForm}" should be "${verboForm}"`);
      }
    });
  });
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Verification Results:`);
console.log(`   Total checks: ${totalChecks}`);
console.log(`   Errors found: ${errors}`);
console.log(`   Accuracy: ${((totalChecks - errors) / totalChecks * 100).toFixed(1)}%\n`);

if (errors > 0) {
  console.log('❌ Errors found. Summary:\n');
  
  // Group errors by verb
  const errorsByVerb = {};
  errorList.forEach(err => {
    if (!errorsByVerb[err.verb]) {
      errorsByVerb[err.verb] = [];
    }
    errorsByVerb[err.verb].push(err);
  });
  
  Object.keys(errorsByVerb).forEach(verb => {
    console.log(`${verb}: ${errorsByVerb[verb].length} errors`);
    errorsByVerb[verb].forEach(err => {
      console.log(`  - ${err.tense} ${err.subject}: "${err.ours}" → "${err.correct}"`);
    });
    console.log('');
  });
  
  // Save errors to file
  const errorsPath = path.join(__dirname, '../data/conjugation-errors.json');
  fs.writeFileSync(errorsPath, JSON.stringify(errorsByVerb, null, 2));
  console.log(`💾 Errors saved to: ${errorsPath}\n`);
  
} else {
  console.log('✅ All conjugations verified successfully!\n');
}
