const fs = require('fs');
const path = require('path');

// Conjugation mappings for new tenses
const conjugations = {
  'present-progressive': {
    'yo': 'Estoy',
    'tú': 'Estás', 
    'vos': 'Estás',
    'él/ella/usted': 'Está',
    'nosotros': 'Estamos',
    'vosotros': 'Estáis',
    'ellos/ellas/ustedes': 'Están'
  },
  'going-to': {
    'yo': 'Voy a',
    'tú': 'Vas a',
    'vos': 'Vas a', 
    'él/ella/usted': 'Va a',
    'nosotros': 'Vamos a',
    'vosotros': 'Vais a',
    'ellos/ellas/ustedes': 'Van a'
  },
  'present-perfect': {
    'yo': 'He',
    'tú': 'Has',
    'vos': 'Has',
    'él/ella/usted': 'Ha', 
    'nosotros': 'Hemos',
    'vosotros': 'Habéis',
    'ellos/ellas/ustedes': 'Han'
  }
};

// English transformations
const englishTransforms = {
  'present-progressive': {
    'yo': (verb) => `I am ${getGerund(verb)}`,
    'tú': (verb) => `You are ${getGerund(verb)}`,
    'vos': (verb) => `You are ${getGerund(verb)}`,
    'él/ella/usted': (verb) => `He/She is ${getGerund(verb)}`,
    'nosotros': (verb) => `We are ${getGerund(verb)}`,
    'vosotros': (verb) => `You all are ${getGerund(verb)}`,
    'ellos/ellas/ustedes': (verb) => `They are ${getGerund(verb)}`
  },
  'going-to': {
    'yo': (verb) => `I'm going to ${verb}`,
    'tú': (verb) => `You're going to ${verb}`,
    'vos': (verb) => `You're going to ${verb}`,
    'él/ella/usted': (verb) => `He/She is going to ${verb}`,
    'nosotros': (verb) => `We're going to ${verb}`,
    'vosotros': (verb) => `You all are going to ${verb}`,
    'ellos/ellas/ustedes': (verb) => `They're going to ${verb}`
  },
  'present-perfect': {
    'yo': (verb) => `I have ${getPastParticiple(verb)}`,
    'tú': (verb) => `You have ${getPastParticiple(verb)}`,
    'vos': (verb) => `You have ${getPastParticiple(verb)}`,
    'él/ella/usted': (verb) => `He/She has ${getPastParticiple(verb)}`,
    'nosotros': (verb) => `We have ${getPastParticiple(verb)}`,
    'vosotros': (verb) => `You all have ${getPastParticiple(verb)}`,
    'ellos/ellas/ustedes': (verb) => `They have ${getPastParticiple(verb)}`
  }
};

// Verb forms mappings
const verbForms = {
  // Tier 1 - Foundation
  'HABLAR': { infinitive: 'hablar', gerund: 'hablando', pastParticiple: 'hablado', englishInf: 'speak', englishGerund: 'speaking', englishPP: 'spoken' },
  'COMER': { infinitive: 'comer', gerund: 'comiendo', pastParticiple: 'comido', englishInf: 'eat', englishGerund: 'eating', englishPP: 'eaten' },
  'VIVIR': { infinitive: 'vivir', gerund: 'viviendo', pastParticiple: 'vivido', englishInf: 'live', englishGerund: 'living', englishPP: 'lived' },
  'SER': { infinitive: 'ser', gerund: 'siendo', pastParticiple: 'sido', englishInf: 'be', englishGerund: 'being', englishPP: 'been' },
  'ESTAR': { infinitive: 'estar', gerund: 'estando', pastParticiple: 'estado', englishInf: 'be', englishGerund: 'being', englishPP: 'been' },
  'TENER': { infinitive: 'tener', gerund: 'teniendo', pastParticiple: 'tenido', englishInf: 'have', englishGerund: 'having', englishPP: 'had' },
  'IR': { infinitive: 'ir', gerund: 'yendo', pastParticiple: 'ido', englishInf: 'go', englishGerund: 'going', englishPP: 'gone' },
  'HACER': { infinitive: 'hacer', gerund: 'haciendo', pastParticiple: 'hecho', englishInf: 'do', englishGerund: 'doing', englishPP: 'done' },
  'PODER': { infinitive: 'poder', gerund: 'pudiendo', pastParticiple: 'podido', englishInf: 'be able', englishGerund: 'being able', englishPP: 'been able' },
  'QUERER': { infinitive: 'querer', gerund: 'queriendo', pastParticiple: 'querido', englishInf: 'want', englishGerund: 'wanting', englishPP: 'wanted' },
  'NECESITAR': { infinitive: 'necesitar', gerund: 'necesitando', pastParticiple: 'necesitado', englishInf: 'need', englishGerund: 'needing', englishPP: 'needed' },
  'LLEVAR': { infinitive: 'llevar', gerund: 'llevando', pastParticiple: 'llevado', englishInf: 'carry', englishGerund: 'carrying', englishPP: 'carried' },
  'IRSE': { infinitive: 'irse', gerund: 'yéndose', pastParticiple: 'ido', englishInf: 'leave', englishGerund: 'leaving', englishPP: 'left' },
  'LLAMARSE': { infinitive: 'llamarse', gerund: 'llamándose', pastParticiple: 'llamado', englishInf: 'be called', englishGerund: 'being called', englishPP: 'been called' },
  
  // Tier 2 - Daily Routine  
  'LEVANTARSE': { infinitive: 'levantarse', gerund: 'levantándose', pastParticiple: 'levantado', englishInf: 'get up', englishGerund: 'getting up', englishPP: 'gotten up' },
  'SENTARSE': { infinitive: 'sentarse', gerund: 'sentándose', pastParticiple: 'sentado', englishInf: 'sit down', englishGerund: 'sitting down', englishPP: 'sat down' },
  'ACOSTARSE': { infinitive: 'acostarse', gerund: 'acostándose', pastParticiple: 'acostado', englishInf: 'go to bed', englishGerund: 'going to bed', englishPP: 'gone to bed' },
  'DESPERTARSE': { infinitive: 'despertarse', gerund: 'despertándose', pastParticiple: 'despertado', englishInf: 'wake up', englishGerund: 'waking up', englishPP: 'woken up' },
  'DUCHARSE': { infinitive: 'ducharse', gerund: 'duchándose', pastParticiple: 'duchado', englishInf: 'shower', englishGerund: 'showering', englishPP: 'showered' },
  'LAVARSE': { infinitive: 'lavarse', gerund: 'lavándose', pastParticiple: 'lavado', englishInf: 'wash oneself', englishGerund: 'washing oneself', englishPP: 'washed oneself' },
  'LAVAR': { infinitive: 'lavar', gerund: 'lavando', pastParticiple: 'lavado', englishInf: 'wash', englishGerund: 'washing', englishPP: 'washed' },
  'PONERSE': { infinitive: 'ponerse', gerund: 'poniéndose', pastParticiple: 'puesto', englishInf: 'put on', englishGerund: 'putting on', englishPP: 'put on' },
  'VESTIRSE': { infinitive: 'vestirse', gerund: 'vistiéndose', pastParticiple: 'vestido', englishInf: 'get dressed', englishGerund: 'getting dressed', englishPP: 'gotten dressed' },
  'QUEDARSE': { infinitive: 'quedarse', gerund: 'quedándose', pastParticiple: 'quedado', englishInf: 'stay', englishGerund: 'staying', englishPP: 'stayed' },
  'VER': { infinitive: 'ver', gerund: 'viendo', pastParticiple: 'visto', englishInf: 'see', englishGerund: 'seeing', englishPP: 'seen' },
  'DAR': { infinitive: 'dar', gerund: 'dando', pastParticiple: 'dado', englishInf: 'give', englishGerund: 'giving', englishPP: 'given' },
  'DECIR': { infinitive: 'decir', gerund: 'diciendo', pastParticiple: 'dicho', englishInf: 'say', englishGerund: 'saying', englishPP: 'said' },
  'SABER': { infinitive: 'saber', gerund: 'sabiendo', pastParticiple: 'sabido', englishInf: 'know', englishGerund: 'knowing', englishPP: 'known' },
  'ENCONTRAR': { infinitive: 'encontrar', gerund: 'encontrando', pastParticiple: 'encontrado', englishInf: 'find', englishGerund: 'finding', englishPP: 'found' },
  'GUSTAR': { infinitive: 'gustar', gerund: 'gustando', pastParticiple: 'gustado', englishInf: 'like', englishGerund: 'liking', englishPP: 'liked' },
  'DOLER': { infinitive: 'doler', gerund: 'doliendo', pastParticiple: 'dolido', englishInf: 'hurt', englishGerund: 'hurting', englishPP: 'hurt' },
  
  // Tier 3 - Irregular Core
  'VENIR': { infinitive: 'venir', gerund: 'viniendo', pastParticiple: 'venido', englishInf: 'come', englishGerund: 'coming', englishPP: 'come' },
  'PONER': { infinitive: 'poner', gerund: 'poniendo', pastParticiple: 'puesto', englishInf: 'put', englishGerund: 'putting', englishPP: 'put' },
  'SALIR': { infinitive: 'salir', gerund: 'saliendo', pastParticiple: 'salido', englishInf: 'leave', englishGerund: 'leaving', englishPP: 'left' },
  'OÍR': { infinitive: 'oír', gerund: 'oyendo', pastParticiple: 'oído', englishInf: 'hear', englishGerund: 'hearing', englishPP: 'heard' },
  'TRAER': { infinitive: 'traer', gerund: 'trayendo', pastParticiple: 'traído', englishInf: 'bring', englishGerund: 'bringing', englishPP: 'brought' },
  'CREER': { infinitive: 'creer', gerund: 'creyendo', pastParticiple: 'creído', englishInf: 'believe', englishGerund: 'believing', englishPP: 'believed' },
  'ENCANTAR': { infinitive: 'encantar', gerund: 'encantando', pastParticiple: 'encantado', englishInf: 'love', englishGerund: 'loving', englishPP: 'loved' },
  'MOLESTAR': { infinitive: 'molestar', gerund: 'molestando', pastParticiple: 'molestado', englishInf: 'bother', englishGerund: 'bothering', englishPP: 'bothered' },
  'IMPORTAR': { infinitive: 'importar', gerund: 'importando', pastParticiple: 'importado', englishInf: 'matter', englishGerund: 'mattering', englishPP: 'mattered' },
  
  // Tier 4 - Emotional & Cognitive
  'PENSAR': { infinitive: 'pensar', gerund: 'pensando', pastParticiple: 'pensado', englishInf: 'think', englishGerund: 'thinking', englishPP: 'thought' },
  'ENTENDER': { infinitive: 'entender', gerund: 'entendiendo', pastParticiple: 'entendido', englishInf: 'understand', englishGerund: 'understanding', englishPP: 'understood' },
  'SENTIR': { infinitive: 'sentir', gerund: 'sintiendo', pastParticiple: 'sentido', englishInf: 'feel', englishGerund: 'feeling', englishPP: 'felt' },
  'SENTIRSE': { infinitive: 'sentirse', gerund: 'sintiéndose', pastParticiple: 'sentido', englishInf: 'feel', englishGerund: 'feeling', englishPP: 'felt' },
  'CONOCER': { infinitive: 'conocer', gerund: 'conociendo', pastParticiple: 'conocido', englishInf: 'know', englishGerund: 'knowing', englishPP: 'known' },
  'ENCONTRARSE': { infinitive: 'encontrarse', gerund: 'encontrándose', pastParticiple: 'encontrado', englishInf: 'meet', englishGerund: 'meeting', englishPP: 'met' },
  'PREOCUPARSE': { infinitive: 'preocuparse', gerund: 'preocupándose', pastParticiple: 'preocupado', englishInf: 'worry', englishGerund: 'worrying', englishPP: 'worried' },
  'DIVERTIRSE': { infinitive: 'divertirse', gerund: 'divirtiéndose', pastParticiple: 'divertido', englishInf: 'have fun', englishGerund: 'having fun', englishPP: 'had fun' },
  
  // Tier 5 - Gustar-type
  'FALTAR': { infinitive: 'faltar', gerund: 'faltando', pastParticiple: 'faltado', englishInf: 'lack', englishGerund: 'lacking', englishPP: 'lacked' },
  'PARECER': { infinitive: 'parecer', gerund: 'pareciendo', pastParticiple: 'parecido', englishInf: 'seem', englishGerund: 'seeming', englishPP: 'seemed' }
};

function getGerund(englishVerb) {
  // Simple gerund formation - can be enhanced
  if (englishVerb.endsWith('e')) {
    return englishVerb.slice(0, -1) + 'ing';
  }
  return englishVerb + 'ing';
}

function getPastParticiple(englishVerb) {
  // Simple past participle formation - can be enhanced  
  if (englishVerb.endsWith('e')) {
    return englishVerb + 'd';
  }
  return englishVerb + 'ed';
}

function extractVerbFromSpanish(spanish, verbName) {
  // Extract the conjugated verb from the Spanish sentence
  const forms = verbForms[verbName];
  if (!forms) return null;
  
  // This is a simplified extraction - would need more sophisticated parsing
  // For now, we'll use the verb forms we defined
  return forms;
}

function transformSpanishSentence(sentence, verbName, tenseType) {
  const subject = sentence.subject;
  const forms = verbForms[verbName];
  
  if (!forms || !conjugations[tenseType] || !conjugations[tenseType][subject]) {
    return null;
  }
  
  const auxiliary = conjugations[tenseType][subject];
  let newSpanish = sentence.spanish;
  
  switch (tenseType) {
    case 'present-progressive':
      // Replace conjugated verb with estar + gerund
      newSpanish = newSpanish.replace(/^([A-Z][a-záéíóúñü]*)\s/, `${auxiliary} ${forms.gerund} `);
      break;
      
    case 'going-to':
      // Replace conjugated verb with ir + a + infinitive
      newSpanish = newSpanish.replace(/^([A-Z][a-záéíóúñü]*)\s/, `${auxiliary} ${forms.infinitive} `);
      break;
      
    case 'present-perfect':
      // Replace conjugated verb with haber + past participle
      newSpanish = newSpanish.replace(/^([A-Z][a-záéíóúñü]*)\s/, `${auxiliary} ${forms.pastParticiple} `);
      break;
  }
  
  return newSpanish;
}

function transformEnglishSentence(sentence, verbName, tenseType) {
  const subject = sentence.subject;
  const forms = verbForms[verbName];
  
  if (!forms || !englishTransforms[tenseType] || !englishTransforms[tenseType][subject]) {
    return null;
  }
  
  let newEnglish = sentence.english;
  
  // More sophisticated English transformation
  switch (tenseType) {
    case 'present-progressive':
      // Replace the main verb with present progressive form
      newEnglish = newEnglish.replace(/^(I|You|He\/She|We|They|You all)\s+([a-z]+)/, 
        (match, subj, verb) => {
          const transform = englishTransforms[tenseType][subject];
          return transform(verb).replace(getGerund(verb), forms.englishGerund);
        });
      break;
      
    case 'going-to':
      // Replace with going to + infinitive
      newEnglish = newEnglish.replace(/^(I|You|He\/She|We|They|You all)\s+([a-z]+)/, 
        (match, subj, verb) => {
          const transform = englishTransforms[tenseType][subject];
          return transform(forms.englishInf);
        });
      break;
      
    case 'present-perfect':
      // Replace with have/has + past participle
      newEnglish = newEnglish.replace(/^(I|You|He\/She|We|They|You all)\s+([a-z]+)/, 
        (match, subj, verb) => {
          const transform = englishTransforms[tenseType][subject];
          return transform(forms.englishPP);
        });
      break;
  }
  
  return newEnglish;
}

function generateNewTenses(corpusData) {
  const newCorpusData = JSON.parse(JSON.stringify(corpusData)); // Deep clone
  
  // Update metadata
  const currentTenses = newCorpusData.metadata.tenses;
  const newTenses = ['present-progressive', 'going-to', 'present-perfect'];
  
  newTenses.forEach(tense => {
    if (!currentTenses.includes(tense)) {
      currentTenses.push(tense);
    }
  });
  
  // Process each verb
  Object.keys(newCorpusData.verbs).forEach(verbName => {
    const verb = newCorpusData.verbs[verbName];
    
    if (!verb.present) {
      console.log(`Skipping ${verbName} - no present tense data`);
      return;
    }
    
    // Generate new tenses from present tense
    newTenses.forEach(tenseType => {
      if (!verb[tenseType]) {
        verb[tenseType] = [];
        
        verb.present.forEach(sentence => {
          const newSpanish = transformSpanishSentence(sentence, verbName, tenseType);
          const newEnglish = transformEnglishSentence(sentence, verbName, tenseType);
          
          if (newSpanish && newEnglish) {
            const newSentence = {
              ...sentence,
              spanish: newSpanish,
              english: newEnglish,
              tags: sentence.tags.map(tag => tag === 'present' ? tenseType : tag)
            };
            
            verb[tenseType].push(newSentence);
          }
        });
        
        console.log(`Generated ${verb[tenseType].length} sentences for ${verbName} ${tenseType}`);
      }
    });
  });
  
  // Update sentence count
  let totalSentences = 0;
  Object.values(newCorpusData.verbs).forEach(verb => {
    Object.values(verb).forEach(tenseData => {
      if (Array.isArray(tenseData)) {
        totalSentences += tenseData.length;
      }
    });
  });
  
  newCorpusData.metadata.sentence_count = totalSentences;
  
  return newCorpusData;
}

// Main execution
function main() {
  const tierFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  tierFiles.forEach(filename => {
    const filePath = path.join(__dirname, '..', 'data', 'corpus', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filename}`);
      return;
    }
    
    console.log(`Processing ${filename}...`);
    
    try {
      const corpusData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const updatedData = generateNewTenses(corpusData);
      
      // Write updated data back
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
      console.log(`✅ Updated ${filename}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
    }
  });
  
  console.log('\n🎉 Tense generation complete!');
}

if (require.main === module) {
  main();
}

module.exports = { generateNewTenses, transformSpanishSentence, transformEnglishSentence };
