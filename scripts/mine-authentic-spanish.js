#!/usr/bin/env node

/**
 * Mine authentic Mexican Spanish sentences from web sources
 * Target: 2-3 natural examples per verb × tense × subject
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load our verb list and conjugations
function loadVerbs() {
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  const content = fs.readFileSync(verbsPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const [verb, english, tags] = line.split('\t');
    const tier = tags.match(/tier:(\d)/)?.[1] || '1';
    return { verb: verb.toLowerCase(), english, tier: parseInt(tier) };
  });
}

// Load conjugations to identify target forms
function loadConjugations() {
  try {
    const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
    return JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load conjugations, will use basic patterns');
    return {};
  }
}

// Mexican Spanish news and content sources
const SOURCES = {
  news: [
    'https://www.milenio.com',
    'https://www.eluniversal.com.mx', 
    'https://www.excelsior.com.mx',
    'https://www.jornada.com.mx'
  ],
  educational: [
    'https://www.conjuguemos.com',
    'https://www.spanishdict.com',
    'https://www.lingolia.com/es'
  ],
  social: [
    // We'll use RSS feeds and public content
    'https://rss.cnn.com/rss/mexico.rss'
  ]
};

// Target verb forms for each tense
const TENSE_PATTERNS = {
  present: {
    yo: (verb) => getConjugation(verb, 'present', 'yo'),
    tú: (verb) => getConjugation(verb, 'present', 'tú'),
    'él/ella/usted': (verb) => getConjugation(verb, 'present', 'él/ella/usted'),
    nosotros: (verb) => getConjugation(verb, 'present', 'nosotros'),
    'ellos/ellas/ustedes': (verb) => getConjugation(verb, 'present', 'ellos/ellas/ustedes')
  },
  'present-progressive': {
    yo: (verb) => `estoy ${getGerund(verb)}`,
    tú: (verb) => `estás ${getGerund(verb)}`,
    'él/ella/usted': (verb) => `está ${getGerund(verb)}`,
    nosotros: (verb) => `estamos ${getGerund(verb)}`,
    'ellos/ellas/ustedes': (verb) => `están ${getGerund(verb)}`
  },
  'going-to': {
    yo: (verb) => `voy a ${verb}`,
    tú: (verb) => `vas a ${verb}`,
    'él/ella/usted': (verb) => `va a ${verb}`,
    nosotros: (verb) => `vamos a ${verb}`,
    'ellos/ellas/ustedes': (verb) => `van a ${verb}`
  },
  preterite: {
    yo: (verb) => getConjugation(verb, 'preterite', 'yo'),
    tú: (verb) => getConjugation(verb, 'preterite', 'tú'),
    'él/ella/usted': (verb) => getConjugation(verb, 'preterite', 'él/ella/usted'),
    nosotros: (verb) => getConjugation(verb, 'preterite', 'nosotros'),
    'ellos/ellas/ustedes': (verb) => getConjugation(verb, 'preterite', 'ellos/ellas/ustedes')
  }
};

let conjugations = {};

function getConjugation(verb, tense, subject) {
  const verbUpper = verb.toUpperCase();
  if (conjugations[verbUpper] && conjugations[verbUpper][tense] && conjugations[verbUpper][tense][subject]) {
    return conjugations[verbUpper][tense][subject];
  }
  
  // Fallback to basic patterns
  const basicPatterns = {
    hablar: { present: { yo: 'hablo', tú: 'hablas', 'él/ella/usted': 'habla', nosotros: 'hablamos', 'ellos/ellas/ustedes': 'hablan' }},
    comer: { present: { yo: 'como', tú: 'comes', 'él/ella/usted': 'come', nosotros: 'comemos', 'ellos/ellas/ustedes': 'comen' }},
    vivir: { present: { yo: 'vivo', tú: 'vives', 'él/ella/usted': 'vive', nosotros: 'vivimos', 'ellos/ellas/ustedes': 'viven' }}
  };
  
  return basicPatterns[verb]?.[tense]?.[subject] || verb;
}

function getGerund(verb) {
  if (verb.endsWith('ar')) return verb.slice(0, -2) + 'ando';
  if (verb.endsWith('er') || verb.endsWith('ir')) return verb.slice(0, -2) + 'iendo';
  return verb + 'ndo';
}

// Fetch content from URL
function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract sentences containing target verb forms
function extractSentences(content, targetForms) {
  const sentences = [];
  
  // Split content into sentences
  const rawSentences = content
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/[""]/g, '"')    // Normalize quotes
    .split(/[.!?]+/)          // Split on sentence endings
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 200); // Reasonable length
  
  rawSentences.forEach(sentence => {
    targetForms.forEach(form => {
      if (sentence.toLowerCase().includes(form.toLowerCase())) {
        sentences.push({
          text: sentence,
          targetForm: form,
          source: 'web_mining'
        });
      }
    });
  });
  
  return sentences;
}

// Generate English translations (basic)
function generateEnglishTranslation(spanishSentence, verb, tense, subject) {
  // This is a placeholder - in production you'd use a translation API
  const subjectMap = {
    yo: 'I',
    tú: 'You',
    'él/ella/usted': 'He/She/You',
    nosotros: 'We',
    'ellos/ellas/ustedes': 'They'
  };
  
  return `${subjectMap[subject]} ${verb.english.replace('to ', '')}...`; // Placeholder
}

// Mine sentences for a specific verb
async function mineVerbSentences(verb, targetCount = 3) {
  console.log(`🔍 Mining sentences for: ${verb.verb.toUpperCase()}`);
  
  const results = {
    verb: verb.verb.toUpperCase(),
    sentences: {}
  };
  
  // Generate target forms for each tense/subject combination
  const tenses = ['present', 'present-progressive', 'going-to', 'preterite'];
  const subjects = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'];
  
  for (const tense of tenses) {
    results.sentences[tense] = [];
    
    for (const subject of subjects) {
      const targetForms = [];
      
      if (TENSE_PATTERNS[tense] && TENSE_PATTERNS[tense][subject]) {
        const form = TENSE_PATTERNS[tense][subject](verb.verb);
        targetForms.push(form);
      }
      
      // Try to find sentences from web sources
      let foundSentences = [];
      
      for (const sourceCategory of Object.keys(SOURCES)) {
        for (const url of SOURCES[sourceCategory]) {
          try {
            console.log(`  📡 Checking ${url}...`);
            const content = await fetchContent(url);
            const extracted = extractSentences(content, targetForms);
            foundSentences.push(...extracted);
            
            if (foundSentences.length >= targetCount) break;
          } catch (error) {
            console.warn(`  ⚠️  Failed to fetch ${url}: ${error.message}`);
          }
        }
        if (foundSentences.length >= targetCount) break;
      }
      
      // Process found sentences
      foundSentences.slice(0, targetCount).forEach(sentence => {
        results.sentences[tense].push({
          spanish: sentence.text,
          english: generateEnglishTranslation(sentence.text, verb, tense, subject),
          subject: subject,
          region: 'universal',
          source: 'web_mining',
          targetForm: sentence.targetForm,
          tags: [
            `region:universal`,
            `subject:${subject}`,
            `tense:${tense}`,
            `tier:${verb.tier}`,
            `verb-type:${verb.verb.slice(-2)}`,
            `word-type:verb`
          ]
        });
      });
    }
  }
  
  return results;
}

// Main mining function
async function mineAuthentic() {
  console.log('🌐 Starting authentic Mexican Spanish mining...');
  
  // Load data
  conjugations = loadConjugations();
  const verbs = loadVerbs();
  
  console.log(`📚 Loaded ${verbs.length} verbs`);
  console.log(`🎯 Target: 2-3 sentences per verb × tense × subject`);
  
  const results = {
    metadata: {
      source: 'web_mining',
      date: new Date().toISOString(),
      region: 'mexico',
      totalVerbs: verbs.length
    },
    verbs: {}
  };
  
  // Mine sentences for each verb (start with Tier 1)
  const tier1Verbs = verbs.filter(v => v.tier === 1);
  console.log(`🚀 Starting with Tier 1: ${tier1Verbs.length} verbs`);
  
  for (const verb of tier1Verbs) {
    try {
      const verbResults = await mineVerbSentences(verb);
      results.verbs[verb.verb.toUpperCase()] = verbResults.sentences;
      
      // Add delay to be respectful to servers
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to mine ${verb.verb}: ${error.message}`);
    }
  }
  
  // Save results
  const outputPath = path.join(__dirname, '../data/corpus/mined-authentic.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`💾 Saved mined corpus to: ${outputPath}`);
  console.log(`✨ Mining complete!`);
  
  // Summary
  const totalSentences = Object.values(results.verbs)
    .reduce((sum, verb) => {
      return sum + Object.values(verb).reduce((verbSum, tense) => verbSum + tense.length, 0);
    }, 0);
  
  console.log(`📊 Summary:`);
  console.log(`   - Verbs processed: ${Object.keys(results.verbs).length}`);
  console.log(`   - Total sentences: ${totalSentences}`);
  console.log(`   - Average per verb: ${Math.round(totalSentences / Object.keys(results.verbs).length)}`);
}

// Alternative: Generate high-quality templates based on Mexican Spanish patterns
function generateMexicanTemplates() {
  console.log('🇲🇽 Generating Mexican Spanish templates...');
  
  const mexicanContexts = {
    daily: [
      'en la mañana', 'por la tarde', 'en la noche',
      'todos los días', 'cada semana', 'los fines de semana'
    ],
    places: [
      'en casa', 'en el trabajo', 'en la escuela', 'en el mercado',
      'en la ciudad', 'en el centro', 'en la colonia'
    ],
    mexican_food: [
      'tacos', 'quesadillas', 'pozole', 'tamales', 'mole',
      'tortillas', 'frijoles', 'arroz', 'salsa'
    ],
    mexican_culture: [
      'con la familia', 'en la fiesta', 'en el pueblo',
      'con los amigos', 'en la plaza', 'en la iglesia'
    ]
  };
  
  // This would generate contextually appropriate Mexican Spanish sentences
  // using authentic vocabulary and expressions
  
  console.log('📝 Template generation would create authentic Mexican patterns');
  console.log('🎯 Focus on: Mexican vocabulary, expressions, cultural contexts');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--templates')) {
    generateMexicanTemplates();
  } else {
    mineAuthentic().catch(console.error);
  }
}

module.exports = { mineAuthentic, generateMexicanTemplates };
