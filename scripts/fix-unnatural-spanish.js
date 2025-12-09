#!/usr/bin/env node

/**
 * Fix Unnatural Spanish Constructions
 * Find and correct Spanish progressive forms that should be simple present
 */

const fs = require('fs');
const path = require('path');

// Unnatural Spanish patterns and their corrections
const SPANISH_CORRECTIONS = [
  {
    // "Estás siendo inteligente" → "Eres inteligente"
    pattern: /\b(estoy|estás|está|estamos|estáis|están)\s+siendo\s+(muy\s+)?(inteligente|inteligentes|guapo|guapa|guapos|guapas|bonito|bonita|bonitos|bonitas|alto|alta|altos|altas|bajo|baja|bajos|bajas)\b/gi,
    replacement: (match, estar, muy, adjective) => {
      const serForms = {
        'estoy': 'soy',
        'estás': 'eres', 
        'está': 'es',
        'estamos': 'somos',
        'estáis': 'sois',
        'están': 'son'
      };
      const serForm = serForms[estar.toLowerCase()];
      return `${serForm} ${muy || ''}${adjective}`;
    },
    description: 'Fix "estás siendo inteligente" → "eres inteligente" (permanent characteristics)'
  },
  {
    // "Estás siendo profesor" → "Eres profesor"  
    pattern: /\b(estoy|estás|está|estamos|estáis|están)\s+siendo\s+(un|una|el|la)?\s*(profesor|profesora|doctor|doctora|estudiante|ingeniero|ingeniera|abogado|abogada)\b/gi,
    replacement: (match, estar, article, profession) => {
      const serForms = {
        'estoy': 'soy',
        'estás': 'eres',
        'está': 'es', 
        'estamos': 'somos',
        'estáis': 'sois',
        'están': 'son'
      };
      const serForm = serForms[estar.toLowerCase()];
      return `${serForm} ${article ? article + ' ' : ''}${profession}`;
    },
    description: 'Fix "estás siendo profesor" → "eres profesor" (professions)'
  },
  {
    // "Estoy teniendo" → "Tengo" (stative verbs)
    pattern: /\b(estoy|estás|está|estamos|estáis|están)\s+(teniendo|queriendo|necesitando|sabiendo|conociendo)\b/gi,
    replacement: (match, estar, gerund) => {
      const subjects = {
        'estoy': 'yo',
        'estás': 'tú',
        'está': 'él/ella',
        'estamos': 'nosotros', 
        'estáis': 'vosotros',
        'están': 'ellos'
      };
      
      const verbForms = {
        'teniendo': { 'yo': 'tengo', 'tú': 'tienes', 'él/ella': 'tiene', 'nosotros': 'tenemos', 'vosotros': 'tenéis', 'ellos': 'tienen' },
        'queriendo': { 'yo': 'quiero', 'tú': 'quieres', 'él/ella': 'quiere', 'nosotros': 'queremos', 'vosotros': 'queréis', 'ellos': 'quieren' },
        'necesitando': { 'yo': 'necesito', 'tú': 'necesitas', 'él/ella': 'necesita', 'nosotros': 'necesitamos', 'vosotros': 'necesitáis', 'ellos': 'necesitan' },
        'sabiendo': { 'yo': 'sé', 'tú': 'sabes', 'él/ella': 'sabe', 'nosotros': 'sabemos', 'vosotros': 'sabéis', 'ellos': 'saben' },
        'conociendo': { 'yo': 'conozco', 'tú': 'conoces', 'él/ella': 'conoce', 'nosotros': 'conocemos', 'vosotros': 'conocéis', 'ellos': 'conocen' }
      };
      
      const subject = subjects[estar.toLowerCase()];
      const correctForm = verbForms[gerund.toLowerCase()][subject];
      return correctForm;
    },
    description: 'Fix "estoy teniendo" → "tengo" (stative verbs)'
  },
  {
    // "Está tomando pizza" → "Está comiendo pizza" (food items)
    pattern: /\b(estoy|estás|está|estamos|estáis|están)\s+tomando\s+(pizza|hamburguesa|sándwich|sandwich|tacos?|burrito|quesadilla|comida|almuerzo|cena|desayuno)\b/gi,
    replacement: (match, estar, food) => {
      const comerForms = {
        'estoy': 'estoy comiendo',
        'estás': 'estás comiendo',
        'está': 'está comiendo',
        'estamos': 'estamos comiendo',
        'estáis': 'estáis comiendo',
        'están': 'están comiendo'
      };
      const comerForm = comerForms[estar.toLowerCase()];
      return `${comerForm} ${food}`;
    },
    description: 'Fix "está tomando pizza" → "está comiendo pizza" (food items)'
  },
  {
    // Keep natural progressive forms (actions in progress)
    pattern: /\b(estoy|estás|está|estamos|estáis|están)\s+(hablando|comiendo|trabajando|estudiando|leyendo|escribiendo|corriendo|caminando|durmiendo)\b/gi,
    replacement: '$1 $2',
    description: 'Keep natural progressive forms (actions in progress)'
  }
];

function fixUnnaturalSpanish() {
  console.log('🔧 Fixing unnatural Spanish constructions...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const fixReport = {
    total_sentences_checked: 0,
    total_fixes_made: 0,
    by_tier: {},
    by_pattern: {},
    examples: []
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n🔧 Fixing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    fixReport.by_tier[tier] = {
      sentences_checked: 0,
      fixes_made: 0,
      patterns_fixed: {}
    };
    
    let tierModified = false;
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              fixReport.total_sentences_checked++;
              fixReport.by_tier[tier].sentences_checked++;
              
              if (sentence.spanish) {
                const originalSpanish = sentence.spanish;
                let fixedSpanish = originalSpanish;
                let appliedFixes = [];
                
                // Apply each correction pattern
                SPANISH_CORRECTIONS.forEach(correction => {
                  const beforeFix = fixedSpanish;
                  
                  if (typeof correction.replacement === 'function') {
                    fixedSpanish = fixedSpanish.replace(correction.pattern, correction.replacement);
                  } else {
                    fixedSpanish = fixedSpanish.replace(correction.pattern, correction.replacement);
                  }
                  
                  if (beforeFix !== fixedSpanish) {
                    appliedFixes.push(correction.description);
                    
                    // Track pattern usage
                    if (!fixReport.by_pattern[correction.description]) {
                      fixReport.by_pattern[correction.description] = 0;
                    }
                    fixReport.by_pattern[correction.description]++;
                    
                    if (!fixReport.by_tier[tier].patterns_fixed[correction.description]) {
                      fixReport.by_tier[tier].patterns_fixed[correction.description] = 0;
                    }
                    fixReport.by_tier[tier].patterns_fixed[correction.description]++;
                  }
                });
                
                // Manual fixes for specific problematic sentences
                const manualFixes = {
                  "Tú estás siendo muy inteligente para tu edad.": "Tú eres muy inteligente para tu edad.",
                  "Estás siendo muy inteligente para tu edad.": "Eres muy inteligente para tu edad.",
                  "Está siendo muy guapa con ese vestido.": "Está muy guapa con ese vestido.",
                  "Estás estando muy guapa con ese vestido.": "Estás muy guapa con ese vestido.",
                  "Estoy siendo profesora de matemáticas en la escuela.": "Soy profesora de matemáticas en la escuela.",
                  "Está siendo profesor de historia.": "Es profesor de historia.",
                  "Estamos siendo estudiantes universitarios.": "Somos estudiantes universitarios."
                };
                
                if (manualFixes[originalSpanish]) {
                  fixedSpanish = manualFixes[originalSpanish];
                  appliedFixes.push('Manual correction');
                }
                
                // If fixes were made, update the sentence
                if (fixedSpanish !== originalSpanish) {
                  sentence.spanish = fixedSpanish;
                  fixReport.total_fixes_made++;
                  fixReport.by_tier[tier].fixes_made++;
                  tierModified = true;
                  
                  // Save example
                  fixReport.examples.push({
                    tier: tier,
                    verb: verb,
                    tense: tense,
                    english: sentence.english,
                    before: originalSpanish,
                    after: fixedSpanish,
                    fixes_applied: appliedFixes
                  });
                  
                  console.log(`   ✅ Fixed: "${originalSpanish}"`);
                  console.log(`      → "${fixedSpanish}"`);
                }
              }
            });
          }
        });
      });
    }
    
    // Save modified corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Saved ${fixReport.by_tier[tier].fixes_made} fixes to ${filename}`);
    } else {
      console.log(`   ✅ No fixes needed in ${filename}`);
    }
  });
  
  // Display results
  displayFixReport(fixReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/spanish-fixes-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixReport, null, 2));
  console.log(`\n💾 Spanish fix report saved to: ${outputPath}`);
  
  return fixReport;
}

function displayFixReport(report) {
  console.log(`\n🔧 SPANISH FIXES REPORT:`);
  console.log(`   📝 Sentences checked: ${report.total_sentences_checked}`);
  console.log(`   ✅ Fixes made: ${report.total_fixes_made}`);
  
  if (report.total_fixes_made === 0) {
    console.log(`   🎉 No unnatural Spanish found - corpus is clean!`);
    return;
  }
  
  console.log(`\n📚 Fixes by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    if (tierData.fixes_made > 0) {
      console.log(`   Tier ${tier}: ${tierData.fixes_made} fixes`);
      Object.keys(tierData.patterns_fixed).forEach(pattern => {
        console.log(`     - ${pattern}: ${tierData.patterns_fixed[pattern]} times`);
      });
    }
  });
  
  console.log(`\n🔍 Most Common Issues Fixed:`);
  const sortedPatterns = Object.entries(report.by_pattern)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  sortedPatterns.forEach(([pattern, count], i) => {
    console.log(`   ${i+1}. ${pattern}: ${count} instances`);
  });
  
  if (report.examples.length > 0) {
    console.log(`\n📋 EXAMPLES OF FIXES:`);
    report.examples.slice(0, 10).forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}]`);
      console.log(`      Before: "${example.before}"`);
      console.log(`      After:  "${example.after}"`);
      console.log(`      English: "${example.english}"`);
      console.log(`      Fixes:  ${example.fixes_applied.join(', ')}`);
    });
    
    if (report.examples.length > 10) {
      console.log(`   ... and ${report.examples.length - 10} more examples`);
    }
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 Natural Spanish throughout corpus`);
  console.log(`   📚 Proper ser vs estar usage`);
  console.log(`   🔧 Correct progressive vs simple present`);
  console.log(`   ✨ Native-like Spanish for learners`);
}

if (require.main === module) {
  fixUnnaturalSpanish();
}

module.exports = { fixUnnaturalSpanish };
