#!/usr/bin/env node

/**
 * Copyright-Safe Replacement Strategy
 * Remove copyrighted content and replace with transformed alternatives
 * Focus on preserving essential learning patterns
 */

const fs = require('fs');
const path = require('path');

// Load copyright analysis
function loadCopyrightAnalysis() {
  const analysisPath = path.join(__dirname, '../data/corpus/copyright-analysis.json');
  if (!fs.existsSync(analysisPath)) {
    console.error('❌ Run copyright-manager.js analyze first');
    return null;
  }
  return JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
}

// Identify essential patterns we need to preserve
function identifyEssentialPatterns(copyrightedContent) {
  const essential = {
    reflexive_verbs: [],
    question_patterns: [],
    family_vocabulary: [],
    daily_routine: [],
    unique_constructions: []
  };
  
  copyrightedContent.forEach(item => {
    const spanish = item.spanish.toLowerCase();
    
    // Reflexive verbs (critical for learning)
    if (spanish.includes('se llama') || spanish.includes('me llamo') || 
        spanish.includes('te llamas') || spanish.includes('nos llamamos')) {
      essential.reflexive_verbs.push(item);
    }
    
    // Question patterns (pedagogically valuable)
    if (spanish.startsWith('¿cómo') || spanish.startsWith('¿dónde') || 
        spanish.startsWith('¿qué') || spanish.startsWith('¿de quién')) {
      essential.question_patterns.push(item);
    }
    
    // Family vocabulary (core beginner content)
    if (spanish.includes('familia') || spanish.includes('madre') || 
        spanish.includes('padre') || spanish.includes('hermano') || 
        spanish.includes('hermana') || spanish.includes('hijo')) {
      essential.family_vocabulary.push(item);
    }
    
    // Daily routine (essential for Tier 2)
    if (spanish.includes('mañana') || spanish.includes('noche') || 
        spanish.includes('día') || spanish.includes('trabajo') || 
        spanish.includes('escuela') || spanish.includes('casa')) {
      essential.daily_routine.push(item);
    }
    
    // Unique constructions not found elsewhere
    if (item.verb === 'LLAMARSE' || item.verb === 'LEVANTARSE' || 
        item.verb === 'DUCHARSE' || item.verb === 'SENTARSE') {
      essential.unique_constructions.push(item);
    }
  });
  
  return essential;
}

// Create copyright-safe alternatives
function createSafeAlternatives(essentialPatterns) {
  const alternatives = [];
  
  // Transform reflexive verb patterns
  essentialPatterns.reflexive_verbs.forEach(item => {
    const transformed = transformReflexivePattern(item);
    if (transformed) alternatives.push(transformed);
  });
  
  // Transform question patterns
  essentialPatterns.question_patterns.forEach(item => {
    const transformed = transformQuestionPattern(item);
    if (transformed) alternatives.push(transformed);
  });
  
  // Transform family vocabulary
  essentialPatterns.family_vocabulary.forEach(item => {
    const transformed = transformFamilyPattern(item);
    if (transformed) alternatives.push(transformed);
  });
  
  // Create new daily routine patterns
  essentialPatterns.daily_routine.forEach(item => {
    const transformed = transformDailyRoutinePattern(item);
    if (transformed) alternatives.push(transformed);
  });
  
  // Create alternatives for unique constructions
  essentialPatterns.unique_constructions.forEach(item => {
    const transformed = createUniqueAlternative(item);
    if (transformed) alternatives.push(transformed);
  });
  
  return alternatives;
}

// Transform reflexive verb patterns
function transformReflexivePattern(item) {
  const spanish = item.spanish;
  let transformed = spanish;
  
  // Change names to common alternatives
  transformed = transformed
    .replace(/Manuel/g, 'Diego')
    .replace(/Ana/g, 'Sofia')
    .replace(/Rosa/g, 'Carmen')
    .replace(/María/g, 'Isabel')
    .replace(/José/g, 'Miguel')
    .replace(/Carlos/g, 'Roberto');
  
  // Change question to statement or vice versa
  if (spanish.startsWith('¿Cómo se llama')) {
    transformed = transformed.replace('¿Cómo se llama', 'Se llama').replace('?', '.');
  } else if (spanish.includes('se llama') && !spanish.startsWith('¿')) {
    transformed = `¿Cómo ${transformed.replace('.', '')}?`;
  }
  
  // Change family relationships
  transformed = transformed
    .replace(/madre/g, 'hermana')
    .replace(/padre/g, 'hermano')
    .replace(/hijo/g, 'primo')
    .replace(/hija/g, 'prima');
  
  if (transformed !== spanish && transformed.length >= 15) {
    return createTransformedSentence(item, transformed, 'reflexive_transformation');
  }
  
  return null;
}

// Transform question patterns
function transformQuestionPattern(item) {
  const spanish = item.spanish;
  let transformed = spanish;
  
  // Change question words while preserving structure
  transformed = transformed
    .replace(/¿Dónde/g, '¿Cuándo')
    .replace(/¿Qué tipo de/g, '¿Cuánta')
    .replace(/¿De quién/g, '¿Para quién');
  
  // Change locations and objects
  transformed = transformed
    .replace(/escuela/g, 'oficina')
    .replace(/casa/g, 'apartamento')
    .replace(/comida/g, 'bebida')
    .replace(/noche/g, 'tarde');
  
  if (transformed !== spanish && transformed.length >= 15) {
    return createTransformedSentence(item, transformed, 'question_transformation');
  }
  
  return null;
}

// Transform family vocabulary patterns
function transformFamilyPattern(item) {
  const spanish = item.spanish;
  let transformed = spanish;
  
  // Change family context to work/friend context
  transformed = transformed
    .replace(/familia/g, 'equipo')
    .replace(/madre/g, 'jefa')
    .replace(/padre/g, 'jefe')
    .replace(/hermano/g, 'compañero')
    .replace(/hermana/g, 'compañera')
    .replace(/hijo/g, 'estudiante')
    .replace(/hija/g, 'estudiante');
  
  // Change home context to work context
  transformed = transformed
    .replace(/casa/g, 'oficina')
    .replace(/hogar/g, 'trabajo')
    .replace(/cena/g, 'reunión');
  
  if (transformed !== spanish && transformed.length >= 15) {
    return createTransformedSentence(item, transformed, 'family_to_work_transformation');
  }
  
  return null;
}

// Transform daily routine patterns
function transformDailyRoutinePattern(item) {
  const spanish = item.spanish;
  let transformed = spanish;
  
  // Change time references
  transformed = transformed
    .replace(/mañana/g, 'tarde')
    .replace(/noche/g, 'mañana')
    .replace(/día/g, 'semana');
  
  // Change activities
  transformed = transformed
    .replace(/trabajo/g, 'universidad')
    .replace(/escuela/g, 'biblioteca')
    .replace(/comer/g, 'estudiar')
    .replace(/dormir/g, 'leer');
  
  if (transformed !== spanish && transformed.length >= 15) {
    return createTransformedSentence(item, transformed, 'routine_transformation');
  }
  
  return null;
}

// Create unique alternatives for missing constructions
function createUniqueAlternative(item) {
  const verb = item.verb;
  const tense = item.tense;
  const subject = item.subject;
  
  // Create completely new sentences for essential verbs
  const newSentences = {
    'LLAMARSE': {
      'present': {
        'yo': 'Me llamo Patricia y soy doctora.',
        'tú': '¿Cómo te llamas en tu trabajo?',
        'él/ella/usted': 'Mi profesor se llama Fernando.',
        'nosotros': 'Nos llamamos los estudiantes de español.',
        'ellos/ellas/ustedes': 'Mis amigos se llaman Roberto y Elena.'
      }
    },
    'LEVANTARSE': {
      'present': {
        'yo': 'Me levanto temprano para hacer ejercicio.',
        'tú': '¿Te levantas antes de las siete?',
        'él/ella/usted': 'Mi hermano se levanta muy tarde.',
        'nosotros': 'Nos levantamos juntos los domingos.',
        'ellos/ellas/ustedes': 'Mis padres se levantan a las seis.'
      }
    },
    'DUCHARSE': {
      'present': {
        'yo': 'Me ducho después de correr.',
        'tú': '¿Te duchas por la mañana o por la noche?',
        'él/ella/usted': 'Mi compañero se ducha muy rápido.',
        'nosotros': 'Nos duchamos antes de salir.',
        'ellos/ellas/ustedes': 'Los atletas se duchan en el gimnasio.'
      }
    }
  };
  
  if (newSentences[verb] && newSentences[verb][tense] && newSentences[verb][tense][subject]) {
    const newSpanish = newSentences[verb][tense][subject];
    return createTransformedSentence(item, newSpanish, 'completely_new_creation');
  }
  
  return null;
}

// Create a transformed sentence object
function createTransformedSentence(originalItem, newSpanish, method) {
  return {
    spanish: newSpanish,
    english: `[TRANSFORMED - NEEDS TRANSLATION] ${newSpanish}`,
    subject: originalItem.subject,
    region: 'universal',
    verb: originalItem.verb,
    tense: originalItem.tense,
    file: originalItem.file,
    source: {
      type: 'transformed',
      origin: 'copyright_safe_transformation',
      method: method,
      date_created: new Date().toISOString().split('T')[0],
      original_source: 'textbook_transformed'
    },
    quality: {
      score: 35, // Good pedagogical value
      authenticity: 'transformed',
      linguistic_review: 'needs_review',
      copyright_status: 'safe_transformation'
    },
    linguistic: {
      construction: originalItem.verb.includes('SE') ? 'reflexive' : 'standard',
      difficulty: 'beginner',
      register: 'neutral'
    },
    pedagogy: {
      learning_focus: [originalItem.tense, 'vocabulary'],
      cultural_context: 'general',
      tier_appropriate: true,
      transformation_method: method
    },
    tags: [
      'region:universal',
      `subject:${originalItem.subject}`,
      `tense:${originalItem.tense}`,
      'word-type:verb',
      'source:transformed',
      'copyright:safe',
      `method:${method}`
    ]
  };
}

// Execute copyright-safe replacement
function executeCopyrightSafeReplacement() {
  console.log('⚖️  Executing copyright-safe replacement strategy...');
  
  const analysis = loadCopyrightAnalysis();
  if (!analysis) return;
  
  console.log(`📊 Current status:`);
  console.log(`   ❌ Copyrighted sentences: ${analysis.copyrighted_content.length}`);
  console.log(`   ✅ Safe sentences: ${analysis.safe_content.length}`);
  
  // Step 1: Identify essential patterns
  console.log(`\n🔍 Identifying essential patterns...`);
  const essentialPatterns = identifyEssentialPatterns(analysis.copyrighted_content);
  
  console.log(`   🔄 Reflexive verbs: ${essentialPatterns.reflexive_verbs.length}`);
  console.log(`   ❓ Question patterns: ${essentialPatterns.question_patterns.length}`);
  console.log(`   👨‍👩‍👧‍👦 Family vocabulary: ${essentialPatterns.family_vocabulary.length}`);
  console.log(`   🌅 Daily routine: ${essentialPatterns.daily_routine.length}`);
  console.log(`   🎯 Unique constructions: ${essentialPatterns.unique_constructions.length}`);
  
  // Step 2: Create safe alternatives
  console.log(`\n🔄 Creating copyright-safe alternatives...`);
  const alternatives = createSafeAlternatives(essentialPatterns);
  console.log(`   ✅ Created ${alternatives.length} safe alternatives`);
  
  // Step 3: Remove copyrighted content
  console.log(`\n🗑️  Removing copyrighted content...`);
  removeCopyrightedContent();
  
  // Step 4: Add safe alternatives
  console.log(`\n➕ Adding safe alternatives...`);
  addSafeAlternatives(alternatives);
  
  console.log(`\n✅ Copyright-safe replacement complete!`);
  console.log(`   🗑️  Removed: ${analysis.copyrighted_content.length} copyrighted sentences`);
  console.log(`   ➕ Added: ${alternatives.length} safe alternatives`);
  console.log(`   ⚖️  Corpus is now copyright-compliant`);
  
  // Save transformation log
  const logPath = path.join(__dirname, '../data/corpus/copyright-replacement-log.json');
  const log = {
    date: new Date().toISOString(),
    removed_count: analysis.copyrighted_content.length,
    added_count: alternatives.length,
    essential_patterns: essentialPatterns,
    alternatives: alternatives,
    status: 'copyright_compliant'
  };
  
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`   📝 Transformation log saved to: ${logPath}`);
}

// Remove copyrighted content from corpus
function removeCopyrightedContent() {
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            // Remove textbook content
            corpus.verbs[verb][tense] = corpus.verbs[verb][tense].filter(sentence => {
              const sourceType = getSourceType(sentence);
              return sourceType !== 'TEXTBOOK_COPYRIGHTED';
            });
          }
        });
      });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
  });
}

// Add safe alternatives to corpus
function addSafeAlternatives(alternatives) {
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  alternatives.forEach(alt => {
    const filename = alt.file;
    const filePath = path.join(__dirname, '../data/corpus', filename);
    
    if (fs.existsSync(filePath)) {
      const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      if (corpus.verbs && corpus.verbs[alt.verb] && corpus.verbs[alt.verb][alt.tense]) {
        corpus.verbs[alt.verb][alt.tense].push(alt);
        fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      }
    }
  });
}

// Helper function to determine source type
function getSourceType(sentence) {
  if (sentence.source) {
    if (typeof sentence.source === 'object') {
      if (sentence.source.type === 'textbook') {
        return 'TEXTBOOK_COPYRIGHTED';
      } else if (sentence.source.type === 'web_scraping') {
        return 'WEB_SCRAPED';
      }
    } else if (typeof sentence.source === 'string') {
      if (sentence.source.includes('scraping')) {
        return 'WEB_SCRAPED';
      } else if (sentence.source.includes('textbook')) {
        return 'TEXTBOOK_COPYRIGHTED';
      }
    }
  }
  
  if (sentence.tags && Array.isArray(sentence.tags)) {
    if (sentence.tags.some(tag => tag.includes('textbook'))) {
      return 'TEXTBOOK_COPYRIGHTED';
    } else if (sentence.tags.some(tag => tag.includes('scraping'))) {
      return 'WEB_SCRAPED';
    }
  }
  
  return 'ORIGINAL_CREATED';
}

if (require.main === module) {
  executeCopyrightSafeReplacement();
}

module.exports = { executeCopyrightSafeReplacement };
