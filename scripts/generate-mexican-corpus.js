#!/usr/bin/env node

/**
 * Generate authentic Mexican Spanish corpus using cultural patterns
 * Focus on natural, contextual sentences that Mexicans actually use
 */

const fs = require('fs');
const path = require('path');

// Load verbs and conjugations
function loadVerbs() {
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  const content = fs.readFileSync(verbsPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const [verb, english, tags] = line.split('\t');
    const tier = tags.match(/tier:(\d)/)?.[1] || '1';
    const isReflexive = tags.includes('reflexive:true');
    const stemChange = tags.match(/stem-change:([^;]+)/)?.[1];
    return { 
      verb: verb.toLowerCase(), 
      english, 
      tier: parseInt(tier),
      isReflexive,
      stemChange
    };
  });
}

function loadConjugations() {
  try {
    const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
    return JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load conjugations');
    return {};
  }
}

// Authentic Mexican Spanish contexts and vocabulary
const MEXICAN_CONTEXTS = {
  daily_routine: {
    morning: [
      'en la mañana temprano',
      'antes de ir al trabajo',
      'después de despertarme',
      'mientras desayuno',
      'antes de salir de casa'
    ],
    work: [
      'en la oficina',
      'durante el trabajo',
      'en la junta',
      'con mis compañeros',
      'en el proyecto'
    ],
    evening: [
      'por la tarde',
      'después del trabajo',
      'en la noche',
      'antes de dormir',
      'con la familia'
    ]
  },
  
  mexican_food: {
    meals: [
      'tacos de carnitas',
      'quesadillas de queso',
      'pozole rojo',
      'tamales de dulce',
      'mole poblano',
      'chiles rellenos',
      'cochinita pibil',
      'elote con mayonesa'
    ],
    places: [
      'en el mercado',
      'en la taquería',
      'en casa de mi abuela',
      'en la fonda',
      'en el puesto de la esquina'
    ]
  },
  
  family_social: {
    family: [
      'con mi familia',
      'con mis papás',
      'con mis hermanos',
      'con mi abuela',
      'con los primos',
      'en casa de mis tíos'
    ],
    friends: [
      'con mis amigos',
      'con mis cuates',
      'en la fiesta',
      'en el antro',
      'en la plaza'
    ]
  },
  
  mexican_places: {
    home: [
      'en mi casa',
      'en el departamento',
      'en la colonia',
      'en el barrio',
      'en la privada'
    ],
    city: [
      'en el centro',
      'en el Zócalo',
      'en la Ciudad de México',
      'en Guadalajara',
      'en Monterrey',
      'en Puebla'
    ]
  },
  
  time_expressions: {
    frequency: [
      'todos los días',
      'cada semana',
      'los fines de semana',
      'de vez en cuando',
      'siempre',
      'nunca'
    ],
    specific: [
      'ayer',
      'hoy',
      'mañana',
      'la semana pasada',
      'el próximo mes',
      'el año que viene'
    ]
  }
};

// Generate conjugated form
function getConjugatedForm(verb, tense, subject, conjugations) {
  const verbUpper = verb.toUpperCase();
  
  if (conjugations[verbUpper] && conjugations[verbUpper][tense] && conjugations[verbUpper][tense][subject]) {
    return conjugations[verbUpper][tense][subject];
  }
  
  // Basic fallback patterns
  return verb; // Placeholder
}

// Generate authentic Mexican Spanish sentences
function generateSentence(verb, tense, subject, conjugations) {
  const verbInfo = verb;
  const conjugatedForm = getConjugatedForm(verbInfo.verb, tense, subject, conjugations);
  
  // Select random contexts
  const contexts = Object.values(MEXICAN_CONTEXTS);
  const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
  const contextKeys = Object.keys(randomContext);
  const randomKey = contextKeys[Math.floor(Math.random() * contextKeys.length)];
  const phrases = randomContext[randomKey];
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  // Build sentence based on verb and tense
  let spanish = '';
  let english = '';
  
  // Subject pronouns (Mexican Spanish style)
  const pronouns = {
    yo: 'Yo',
    tú: 'Tú',
    'él/ella/usted': Math.random() > 0.5 ? 'Él' : 'Ella',
    nosotros: 'Nosotros',
    'ellos/ellas/ustedes': 'Ellos'
  };
  
  const englishSubjects = {
    yo: 'I',
    tú: 'You',
    'él/ella/usted': pronouns['él/ella/usted'] === 'Él' ? 'He' : 'She',
    nosotros: 'We',
    'ellos/ellas/ustedes': 'They'
  };
  
  // Verb-specific sentence patterns
  if (verbInfo.verb === 'hablar') {
    spanish = `${pronouns[subject]} ${conjugatedForm} español ${randomPhrase}.`;
    english = `${englishSubjects[subject]} speak Spanish ${randomPhrase}.`;
  } else if (verbInfo.verb === 'comer') {
    const food = MEXICAN_CONTEXTS.mexican_food.meals[Math.floor(Math.random() * MEXICAN_CONTEXTS.mexican_food.meals.length)];
    spanish = `${pronouns[subject]} ${conjugatedForm} ${food} ${randomPhrase}.`;
    english = `${englishSubjects[subject]} eat ${food} ${randomPhrase}.`;
  } else if (verbInfo.verb === 'vivir') {
    const place = MEXICAN_CONTEXTS.mexican_places.city[Math.floor(Math.random() * MEXICAN_CONTEXTS.mexican_places.city.length)];
    spanish = `${pronouns[subject]} ${conjugatedForm} ${place}.`;
    english = `${englishSubjects[subject]} live ${place}.`;
  } else if (verbInfo.verb === 'trabajar') {
    spanish = `${pronouns[subject]} ${conjugatedForm} ${randomPhrase}.`;
    english = `${englishSubjects[subject]} work ${randomPhrase}.`;
  } else {
    // Generic pattern
    spanish = `${pronouns[subject]} ${conjugatedForm} ${randomPhrase}.`;
    english = `${englishSubjects[subject]} ${verbInfo.english.replace('to ', '')} ${randomPhrase}.`;
  }
  
  return {
    spanish: spanish,
    english: english,
    subject: subject,
    region: 'universal',
    source: 'mexican_authentic',
    tags: [
      'region:universal',
      `subject:${subject}`,
      `tense:${tense}`,
      `tier:${verbInfo.tier}`,
      'word-type:verb'
    ]
  };
}

// Generate complete corpus for a tier
function generateTierCorpus(tierNum, verbs, conjugations) {
  console.log(`🇲🇽 Generating Tier ${tierNum} Mexican Spanish corpus...`);
  
  const tierVerbs = verbs.filter(v => v.tier === tierNum);
  const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'];
  const subjects = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'];
  
  const corpus = {
    metadata: {
      tier: tierNum,
      region: 'mexico',
      generated: new Date().toISOString(),
      verbs: tierVerbs.length
    },
    verbs: {}
  };
  
  tierVerbs.forEach(verb => {
    console.log(`  📝 Generating sentences for: ${verb.verb.toUpperCase()}`);
    
    corpus.verbs[verb.verb.toUpperCase()] = {};
    
    tenses.forEach(tense => {
      corpus.verbs[verb.verb.toUpperCase()][tense] = [];
      
      subjects.forEach(subject => {
        // Generate 2-3 sentences per combination
        for (let i = 0; i < 2; i++) {
          const sentence = generateSentence(verb, tense, subject, conjugations);
          corpus.verbs[verb.verb.toUpperCase()][tense].push(sentence);
        }
      });
    });
  });
  
  return corpus;
}

// Main generation function
async function generateMexicanCorpus() {
  console.log('🌮 Generating authentic Mexican Spanish corpus...');
  
  const verbs = loadVerbs();
  const conjugations = loadConjugations();
  
  console.log(`📚 Loaded ${verbs.length} verbs`);
  
  // Generate for each tier
  for (let tier = 1; tier <= 5; tier++) {
    const corpus = generateTierCorpus(tier, verbs, conjugations);
    
    const outputPath = path.join(__dirname, `../data/corpus/tier${tier}-mexican-authentic.json`);
    fs.writeFileSync(outputPath, JSON.stringify(corpus, null, 2));
    
    console.log(`💾 Saved Tier ${tier} to: ${outputPath}`);
    
    const sentenceCount = Object.values(corpus.verbs)
      .reduce((sum, verb) => {
        return sum + Object.values(verb).reduce((verbSum, tense) => verbSum + tense.length, 0);
      }, 0);
    
    console.log(`   📊 Generated ${sentenceCount} sentences for ${Object.keys(corpus.verbs).length} verbs`);
  }
  
  console.log('✨ Mexican Spanish corpus generation complete!');
  console.log('🎯 Features:');
  console.log('   - Authentic Mexican vocabulary (tacos, quesadillas, etc.)');
  console.log('   - Cultural contexts (familia, trabajo, comida)');
  console.log('   - Natural expressions and phrases');
  console.log('   - Mexico-specific places and references');
}

if (require.main === module) {
  generateMexicanCorpus().catch(console.error);
}

module.exports = { generateMexicanCorpus };
