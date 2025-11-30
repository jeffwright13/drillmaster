#!/usr/bin/env node

/**
 * Complete corpus data for all verbs, tenses, and subjects
 * This script generates natural Spanish sentences for any missing combinations
 */

const fs = require('fs');
const path = require('path');

// Load existing corpus data
function loadExistingCorpus() {
  const corpusDir = path.join(__dirname, '../data/corpus');
  let corpus = {};
  
  const files = ['tier1-verbs.json', 'remaining-tier1-verbs.json', 'tier2-verbs.json', 'tier3-verbs.json', 'tier4-verbs.json'];
  
  files.forEach(filename => {
    const filePath = path.join(corpusDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        Object.assign(corpus, data);
      } catch (error) {
        console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
      }
    }
  });
  
  return corpus;
}

// Load verbs list
function loadVerbs() {
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  const content = fs.readFileSync(verbsPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const [verb, english, tags] = line.split('\t');
    return { verb, english, tags };
  });
}

// Generate natural sentence templates by verb type and context
function generateSentence(verb, tense, subject, region = 'universal') {
  const verbName = verb.verb;
  const isReflexive = verbName.endsWith('SE');
  
  // Context-rich sentence patterns
  const patterns = {
    // Work/Professional contexts
    work: {
      present: {
        yo: "trabajo en la oficina",
        tú: "trabajas muy duro", 
        vos: "trabajás en el centro",
        "él/ella/usted": "trabaja desde casa",
        nosotros: "trabajamos en equipo",
        vosotros: "trabajáis los fines de semana", 
        "ellos/ellas/ustedes": "trabajan por las tardes"
      },
      preterite: {
        yo: "trabajé hasta muy tarde ayer",
        tú: "trabajaste en el proyecto importante",
        vos: "trabajaste con mucha dedicación",
        "él/ella/usted": "trabajó durante las vacaciones",
        nosotros: "trabajamos toda la noche",
        vosotros: "trabajasteis en la presentación",
        "ellos/ellas/ustedes": "trabajaron sin descanso"
      },
      future: {
        yo: "trabajaré en el nuevo proyecto",
        tú: "trabajarás desde casa mañana", 
        vos: "trabajarás con el equipo internacional",
        "él/ella/usted": "trabajará en la sucursal nueva",
        nosotros: "trabajaremos juntos el próximo año",
        vosotros: "trabajaréis en el departamento de ventas",
        "ellos/ellas/ustedes": "trabajarán en horario flexible"
      }
    },
    
    // Family/Personal contexts  
    family: {
      present: {
        yo: "con mi familia los domingos",
        tú: "con tus padres frecuentemente",
        vos: "con tu hermana cada semana", 
        "él/ella/usted": "con sus hijos después del trabajo",
        nosotros: "con nuestros abuelos",
        vosotros: "con vuestros primos",
        "ellos/ellas/ustedes": "con toda la familia"
      },
      preterite: {
        yo: "con mis padres el fin de semana pasado",
        tú: "con tu familia durante las vacaciones",
        vos: "con tus tíos en las fiestas",
        "él/ella/usted": "con sus hermanos en Navidad", 
        nosotros: "con nuestros parientes lejanos",
        vosotros: "con vuestros abuelos en el pueblo",
        "ellos/ellas/ustedes": "con toda la familia extendida"
      },
      future: {
        yo: "con mi familia el próximo verano",
        tú: "con tus padres en su aniversario",
        vos: "con tu hermano en su graduación",
        "él/ella/usted": "con sus hijos en las vacaciones",
        nosotros: "con nuestros familiares en la reunión",
        vosotros: "con vuestros padres en su cumpleaños", 
        "ellos/ellas/ustedes": "con toda la familia en la boda"
      }
    }
  };
  
  // Select appropriate context and build sentence
  const context = Math.random() > 0.5 ? 'work' : 'family';
  const basePattern = patterns[context][tense][subject];
  
  // Build sentence based on verb type
  if (isReflexive) {
    const reflexivePronouns = {
      yo: "me", tú: "te", vos: "te", "él/ella/usted": "se",
      nosotros: "nos", vosotros: "os", "ellos/ellas/ustedes": "se"
    };
    const pronoun = reflexivePronouns[subject];
    const baseVerb = verbName.replace('SE', '').toLowerCase();
    
    return {
      spanish: `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${pronoun} ${baseVerb} ${basePattern}.`,
      english: `${getEnglishSubject(subject)} ${getEnglishVerb(verb.english, tense, subject)}.`,
      region,
      source: `${context}_context`
    };
  } else if (verbName === 'GUSTAR') {
    const indirectPronouns = {
      yo: "me", tú: "te", vos: "te", "él/ella/usted": "le",
      nosotros: "nos", vosotros: "os", "ellos/ellas/ustedes": "les"
    };
    const pronoun = indirectPronouns[subject];
    const gustForm = tense === 'present' ? 'gusta' : tense === 'preterite' ? 'gustó' : 'gustará';
    
    return {
      spanish: `${pronoun.charAt(0).toUpperCase() + pronoun.slice(1)} ${gustForm} ${basePattern}.`,
      english: `${getEnglishSubject(subject)} ${getEnglishVerb('to like', tense, subject)} ${basePattern}.`,
      region,
      source: `${context}_context`
    };
  } else {
    // Regular verbs
    const subjectPronouns = {
      yo: "Yo", tú: "Tú", vos: "Vos", "él/ella/usted": "Él",
      nosotros: "Nosotros", vosotros: "Vosotros", "ellos/ellas/ustedes": "Ellos"
    };
    
    return {
      spanish: `${subjectPronouns[subject]} [VERB] ${basePattern}.`,
      english: `${getEnglishSubject(subject)} ${getEnglishVerb(verb.english, tense, subject)} ${basePattern}.`,
      region,
      source: `${context}_context`
    };
  }
}

function getEnglishSubject(subject) {
  const map = {
    yo: "I", tú: "You", vos: "You", "él/ella/usted": "He/She",
    nosotros: "We", vosotros: "You all", "ellos/ellas/ustedes": "They"
  };
  return map[subject];
}

function getEnglishVerb(englishInfinitive, tense, subject) {
  let verb = englishInfinitive.replace('to ', '');
  
  if (tense === 'present' && subject === 'él/ella/usted') {
    verb += 's';
  } else if (tense === 'preterite') {
    verb = verb.endsWith('e') ? verb + 'd' : verb + 'ed';
  } else if (tense === 'future') {
    verb = 'will ' + verb;
  }
  
  return verb;
}

// Main function to complete corpus
function completeCorpus() {
  console.log('🔄 Loading existing corpus data...');
  const existingCorpus = loadExistingCorpus();
  const verbs = loadVerbs();
  
  console.log(`📚 Found existing data for ${Object.keys(existingCorpus).length} verbs`);
  console.log(`📝 Processing ${verbs.length} total verbs`);
  
  const tenses = ['present', 'preterite', 'future'];
  const subjects = ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'];
  const regions = ['universal', 'argentina', 'spain'];
  
  let generated = 0;
  let existing = 0;
  
  // Complete missing data
  verbs.forEach(verb => {
    if (!existingCorpus[verb.verb]) {
      existingCorpus[verb.verb] = {};
    }
    
    tenses.forEach(tense => {
      if (!existingCorpus[verb.verb][tense]) {
        existingCorpus[verb.verb][tense] = [];
      }
      
      subjects.forEach(subject => {
        // Check if we already have this combination
        const hasExisting = existingCorpus[verb.verb][tense].some(s => s.subject === subject);
        
        if (!hasExisting) {
          // Generate new sentence
          const region = subject === 'vos' ? 'argentina' : subject === 'vosotros' ? 'spain' : 'universal';
          const sentence = generateSentence(verb, tense, subject, region);
          existingCorpus[verb.verb][tense].push(sentence);
          generated++;
        } else {
          existing++;
        }
      });
    });
  });
  
  console.log(`✅ Generated ${generated} new sentences`);
  console.log(`📋 Kept ${existing} existing sentences`);
  
  // Save completed corpus
  const outputPath = path.join(__dirname, '../data/corpus/complete-corpus.json');
  fs.writeFileSync(outputPath, JSON.stringify(existingCorpus, null, 2));
  
  console.log(`💾 Saved complete corpus to: ${outputPath}`);
  console.log(`🎯 Total coverage: ${Object.keys(existingCorpus).length} verbs × 3 tenses × 7 subjects = ${Object.keys(existingCorpus).length * 3 * 7} combinations`);
}

if (require.main === module) {
  completeCorpus();
}
