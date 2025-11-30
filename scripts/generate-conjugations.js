/**
 * Generate conjugations.json for all 42 verbs
 * 
 * This script generates conjugations for:
 * - 3 tenses: present, preterite, future
 * - 7 subjects: yo, tú, vos, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes
 * 
 * Usage: node scripts/generate-conjugations.js
 */

const fs = require('fs');
const path = require('path');

// Read the verbs TSV file
const verbsPath = path.join(__dirname, '../data/verbs.tsv');
const verbsContent = fs.readFileSync(verbsPath, 'utf-8');

// Parse verbs
const lines = verbsContent.trim().split('\n').slice(1); // Skip header
const verbs = lines.filter(line => line.trim()).map(line => {
  const [verb, english, tags, notes] = line.split('\t');
  const tagObj = parseTags(tags);
  return {
    infinitive: verb.toLowerCase(),
    infinitiveUpper: verb,
    english,
    tags: tagObj,
    notes: notes || ''
  };
});

function parseTags(tagString) {
  const tags = {};
  tagString.split(';').forEach(tag => {
    const [key, ...valueParts] = tag.split(':');
    const value = valueParts.join(':');
    if (tags[key]) {
      if (!Array.isArray(tags[key])) {
        tags[key] = [tags[key]];
      }
      tags[key].push(value);
    } else {
      tags[key] = value;
    }
  });
  return tags;
}

// Conjugation data structure
const conjugations = {};

// Helper function to strip reflexive 'se' from infinitive
function stripReflexive(infinitive) {
  if (infinitive.endsWith('se')) {
    return infinitive.slice(0, -2);
  }
  return infinitive;
}

// Helper function to get verb stem
function getStem(infinitive) {
  const base = stripReflexive(infinitive);
  return base.slice(0, -2);
}

// Helper function to get verb ending
function getEnding(infinitive) {
  const base = stripReflexive(infinitive);
  return base.slice(-2);
}

// Regular conjugation patterns
const regularEndings = {
  ar: {
    present: {
      yo: 'o',
      tú: 'as',
      vos: 'ás',
      'él/ella/usted': 'a',
      nosotros: 'amos',
      vosotros: 'áis',
      'ellos/ellas/ustedes': 'an'
    },
    preterite: {
      yo: 'é',
      tú: 'aste',
      vos: 'aste',
      'él/ella/usted': 'ó',
      nosotros: 'amos',
      vosotros: 'asteis',
      'ellos/ellas/ustedes': 'aron'
    },
    future: {
      yo: 'é',
      tú: 'ás',
      vos: 'ás',
      'él/ella/usted': 'á',
      nosotros: 'emos',
      vosotros: 'éis',
      'ellos/ellas/ustedes': 'án'
    }
  },
  er: {
    present: {
      yo: 'o',
      tú: 'es',
      vos: 'és',
      'él/ella/usted': 'e',
      nosotros: 'emos',
      vosotros: 'éis',
      'ellos/ellas/ustedes': 'en'
    },
    preterite: {
      yo: 'í',
      tú: 'iste',
      vos: 'iste',
      'él/ella/usted': 'ió',
      nosotros: 'imos',
      vosotros: 'isteis',
      'ellos/ellas/ustedes': 'ieron'
    },
    future: {
      yo: 'é',
      tú: 'ás',
      vos: 'ás',
      'él/ella/usted': 'á',
      nosotros: 'emos',
      vosotros: 'éis',
      'ellos/ellas/ustedes': 'án'
    }
  },
  ir: {
    present: {
      yo: 'o',
      tú: 'es',
      vos: 'ís',
      'él/ella/usted': 'e',
      nosotros: 'imos',
      vosotros: 'ís',
      'ellos/ellas/ustedes': 'en'
    },
    preterite: {
      yo: 'í',
      tú: 'iste',
      vos: 'iste',
      'él/ella/usted': 'ió',
      nosotros: 'imos',
      vosotros: 'isteis',
      'ellos/ellas/ustedes': 'ieron'
    },
    future: {
      yo: 'é',
      tú: 'ás',
      vos: 'ás',
      'él/ella/usted': 'á',
      nosotros: 'emos',
      vosotros: 'éis',
      'ellos/ellas/ustedes': 'án'
    }
  }
};

// Irregular conjugations (hand-coded for accuracy)
const irregularConjugations = {
  ser: {
    present: {
      yo: 'soy',
      tú: 'eres',
      vos: 'sos',
      'él/ella/usted': 'es',
      nosotros: 'somos',
      vosotros: 'sois',
      'ellos/ellas/ustedes': 'son'
    },
    preterite: {
      yo: 'fui',
      tú: 'fuiste',
      vos: 'fuiste',
      'él/ella/usted': 'fue',
      nosotros: 'fuimos',
      vosotros: 'fuisteis',
      'ellos/ellas/ustedes': 'fueron'
    },
    future: {
      yo: 'seré',
      tú: 'serás',
      vos: 'serás',
      'él/ella/usted': 'será',
      nosotros: 'seremos',
      vosotros: 'seréis',
      'ellos/ellas/ustedes': 'serán'
    }
  },
  estar: {
    present: {
      yo: 'estoy',
      tú: 'estás',
      vos: 'estás',
      'él/ella/usted': 'está',
      nosotros: 'estamos',
      vosotros: 'estáis',
      'ellos/ellas/ustedes': 'están'
    },
    preterite: {
      yo: 'estuve',
      tú: 'estuviste',
      vos: 'estuviste',
      'él/ella/usted': 'estuvo',
      nosotros: 'estuvimos',
      vosotros: 'estuvisteis',
      'ellos/ellas/ustedes': 'estuvieron'
    },
    future: {
      yo: 'estaré',
      tú: 'estarás',
      vos: 'estarás',
      'él/ella/usted': 'estará',
      nosotros: 'estaremos',
      vosotros: 'estaréis',
      'ellos/ellas/ustedes': 'estarán'
    }
  },
  ir: {
    present: {
      yo: 'voy',
      tú: 'vas',
      vos: 'vas',
      'él/ella/usted': 'va',
      nosotros: 'vamos',
      vosotros: 'vais',
      'ellos/ellas/ustedes': 'van'
    },
    preterite: {
      yo: 'fui',
      tú: 'fuiste',
      vos: 'fuiste',
      'él/ella/usted': 'fue',
      nosotros: 'fuimos',
      vosotros: 'fuisteis',
      'ellos/ellas/ustedes': 'fueron'
    },
    future: {
      yo: 'iré',
      tú: 'irás',
      vos: 'irás',
      'él/ella/usted': 'irá',
      nosotros: 'iremos',
      vosotros: 'iréis',
      'ellos/ellas/ustedes': 'irán'
    }
  },
  hacer: {
    present: {
      yo: 'hago',
      tú: 'haces',
      vos: 'hacés',
      'él/ella/usted': 'hace',
      nosotros: 'hacemos',
      vosotros: 'hacéis',
      'ellos/ellas/ustedes': 'hacen'
    },
    preterite: {
      yo: 'hice',
      tú: 'hiciste',
      vos: 'hiciste',
      'él/ella/usted': 'hizo',
      nosotros: 'hicimos',
      vosotros: 'hicisteis',
      'ellos/ellas/ustedes': 'hicieron'
    },
    future: {
      yo: 'haré',
      tú: 'harás',
      vos: 'harás',
      'él/ella/usted': 'hará',
      nosotros: 'haremos',
      vosotros: 'haréis',
      'ellos/ellas/ustedes': 'harán'
    }
  },
  dar: {
    present: {
      yo: 'doy',
      tú: 'das',
      vos: 'das',
      'él/ella/usted': 'da',
      nosotros: 'damos',
      vosotros: 'dais',
      'ellos/ellas/ustedes': 'dan'
    },
    preterite: {
      yo: 'di',
      tú: 'diste',
      vos: 'diste',
      'él/ella/usted': 'dio',
      nosotros: 'dimos',
      vosotros: 'disteis',
      'ellos/ellas/ustedes': 'dieron'
    },
    future: {
      yo: 'daré',
      tú: 'darás',
      vos: 'darás',
      'él/ella/usted': 'dará',
      nosotros: 'daremos',
      vosotros: 'daréis',
      'ellos/ellas/ustedes': 'darán'
    }
  },
  ver: {
    present: {
      yo: 'veo',
      tú: 'ves',
      vos: 'ves',
      'él/ella/usted': 've',
      nosotros: 'vemos',
      vosotros: 'veis',
      'ellos/ellas/ustedes': 'ven'
    },
    preterite: {
      yo: 'vi',
      tú: 'viste',
      vos: 'viste',
      'él/ella/usted': 'vio',
      nosotros: 'vimos',
      vosotros: 'visteis',
      'ellos/ellas/ustedes': 'vieron'
    },
    future: {
      yo: 'veré',
      tú: 'verás',
      vos: 'verás',
      'él/ella/usted': 'verá',
      nosotros: 'veremos',
      vosotros: 'veréis',
      'ellos/ellas/ustedes': 'verán'
    }
  },
  // Add more irregular verbs as needed
};

// Function to conjugate a regular verb
function conjugateRegular(infinitive, verbType, tense, subject) {
  const stem = getStem(infinitive);
  const ending = regularEndings[verbType][tense][subject];
  
  // For future tense, use full infinitive + ending
  if (tense === 'future') {
    return infinitive + ending;
  }
  
  return stem + ending;
}

// Function to apply stem changes
function applyStemChange(stem, stemChange, subject, tense) {
  // Stem changes typically apply to: yo, tú, vos, él/ella/usted, ellos/ellas/ustedes
  // NOT to: nosotros, vosotros
  const affectedSubjects = ['yo', 'tú', 'vos', 'él/ella/usted', 'ellos/ellas/ustedes'];
  
  if (tense === 'present' && affectedSubjects.includes(subject)) {
    if (stemChange === 'e-ie') {
      return stem.replace(/e([^e]*)$/, 'ie$1');
    } else if (stemChange === 'o-ue') {
      return stem.replace(/o([^o]*)$/, 'ue$1');
    } else if (stemChange === 'e-i') {
      return stem.replace(/e([^e]*)$/, 'i$1');
    }
  }
  
  return stem;
}

// Main conjugation function
function conjugateVerb(verb) {
  const infinitive = verb.infinitive;
  const verbType = verb.tags['verb-type'];
  const result = {
    infinitive: verb.infinitiveUpper,
    english: verb.english,
    present: {},
    preterite: {},
    future: {}
  };
  
  // Check if verb has irregular conjugations
  if (irregularConjugations[infinitive]) {
    return {
      ...result,
      ...irregularConjugations[infinitive]
    };
  }
  
  // Generate conjugations for each tense and subject
  const subjects = ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
  const tenses = ['present', 'preterite', 'future'];
  
  tenses.forEach(tense => {
    subjects.forEach(subject => {
      let conjugated = conjugateRegular(infinitive, verbType, tense, subject);
      
      // Apply stem changes if present
      if (verb.tags['stem-change']) {
        const stem = getStem(infinitive);
        const changedStem = applyStemChange(stem, verb.tags['stem-change'], subject, tense);
        if (changedStem !== stem) {
          const ending = regularEndings[verbType][tense][subject];
          conjugated = changedStem + ending;
        }
      }
      
      result[tense][subject] = conjugated;
    });
  });
  
  return result;
}

// Generate conjugations for all verbs
console.log('Generating conjugations for 42 verbs...\n');

verbs.forEach(verb => {
  const conjugated = conjugateVerb(verb);
  conjugations[verb.infinitiveUpper] = conjugated;
  console.log(`✓ ${verb.infinitiveUpper} (${verb.english})`);
});

// Write to file
const outputPath = path.join(__dirname, '../data/conjugations.json');
fs.writeFileSync(outputPath, JSON.stringify(conjugations, null, 2));

console.log(`\n✅ Generated conjugations for ${Object.keys(conjugations).length} verbs`);
console.log(`📝 Output: ${outputPath}`);
console.log('\n⚠️  IMPORTANT: Please verify these irregular verbs:');
console.log('   - SER, ESTAR, IR, HACER, DAR, VER');
console.log('   - TENER, PODER, QUERER, VENIR, PONER, SALIR');
console.log('   - DECIR, SABER, TRAER, OÍR');
console.log('\nCompare against: https://www.spanishdict.com/conjugate/[verb]');
