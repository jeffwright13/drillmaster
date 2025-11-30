const fs = require('fs');
const path = require('path');

// Conjugation patterns for new tenses
const newTensePatterns = {
  'present-progressive': {
    'yo': (gerund) => `estoy ${gerund}`,
    'tú': (gerund) => `estás ${gerund}`,
    'vos': (gerund) => `estás ${gerund}`,
    'él/ella/usted': (gerund) => `está ${gerund}`,
    'nosotros': (gerund) => `estamos ${gerund}`,
    'vosotros': (gerund) => `estáis ${gerund}`,
    'ellos/ellas/ustedes': (gerund) => `están ${gerund}`
  },
  'going-to': {
    'yo': (infinitive) => `voy a ${infinitive}`,
    'tú': (infinitive) => `vas a ${infinitive}`,
    'vos': (infinitive) => `vas a ${infinitive}`,
    'él/ella/usted': (infinitive) => `va a ${infinitive}`,
    'nosotros': (infinitive) => `vamos a ${infinitive}`,
    'vosotros': (infinitive) => `vais a ${infinitive}`,
    'ellos/ellas/ustedes': (infinitive) => `van a ${infinitive}`
  },
  'present-perfect': {
    'yo': (pastParticiple) => `he ${pastParticiple}`,
    'tú': (pastParticiple) => `has ${pastParticiple}`,
    'vos': (pastParticiple) => `has ${pastParticiple}`,
    'él/ella/usted': (pastParticiple) => `ha ${pastParticiple}`,
    'nosotros': (pastParticiple) => `hemos ${pastParticiple}`,
    'vosotros': (pastParticiple) => `habéis ${pastParticiple}`,
    'ellos/ellas/ustedes': (pastParticiple) => `han ${pastParticiple}`
  }
};

// Verb forms for generating conjugations
const verbForms = {
  'HABLAR': { infinitive: 'hablar', gerund: 'hablando', pastParticiple: 'hablado' },
  'COMER': { infinitive: 'comer', gerund: 'comiendo', pastParticiple: 'comido' },
  'VIVIR': { infinitive: 'vivir', gerund: 'viviendo', pastParticiple: 'vivido' },
  'SER': { infinitive: 'ser', gerund: 'siendo', pastParticiple: 'sido' },
  'ESTAR': { infinitive: 'estar', gerund: 'estando', pastParticiple: 'estado' },
  'TENER': { infinitive: 'tener', gerund: 'teniendo', pastParticiple: 'tenido' },
  'IR': { infinitive: 'ir', gerund: 'yendo', pastParticiple: 'ido' },
  'HACER': { infinitive: 'hacer', gerund: 'haciendo', pastParticiple: 'hecho' },
  'PODER': { infinitive: 'poder', gerund: 'pudiendo', pastParticiple: 'podido' },
  'QUERER': { infinitive: 'querer', gerund: 'queriendo', pastParticiple: 'querido' },
  'NECESITAR': { infinitive: 'necesitar', gerund: 'necesitando', pastParticiple: 'necesitado' },
  'LLEVAR': { infinitive: 'llevar', gerund: 'llevando', pastParticiple: 'llevado' },
  'IRSE': { infinitive: 'irse', gerund: 'yéndose', pastParticiple: 'ido' },
  'LLAMARSE': { infinitive: 'llamarse', gerund: 'llamándose', pastParticiple: 'llamado' },
  'LEVANTARSE': { infinitive: 'levantarse', gerund: 'levantándose', pastParticiple: 'levantado' },
  'SENTARSE': { infinitive: 'sentarse', gerund: 'sentándose', pastParticiple: 'sentado' },
  'ACOSTARSE': { infinitive: 'acostarse', gerund: 'acostándose', pastParticiple: 'acostado' },
  'DESPERTARSE': { infinitive: 'despertarse', gerund: 'despertándose', pastParticiple: 'despertado' },
  'DUCHARSE': { infinitive: 'ducharse', gerund: 'duchándose', pastParticiple: 'duchado' },
  'LAVARSE': { infinitive: 'lavarse', gerund: 'lavándose', pastParticiple: 'lavado' },
  'LAVAR': { infinitive: 'lavar', gerund: 'lavando', pastParticiple: 'lavado' },
  'PONERSE': { infinitive: 'ponerse', gerund: 'poniéndose', pastParticiple: 'puesto' },
  'VESTIRSE': { infinitive: 'vestirse', gerund: 'vistiéndose', pastParticiple: 'vestido' },
  'QUEDARSE': { infinitive: 'quedarse', gerund: 'quedándose', pastParticiple: 'quedado' },
  'VER': { infinitive: 'ver', gerund: 'viendo', pastParticiple: 'visto' },
  'DAR': { infinitive: 'dar', gerund: 'dando', pastParticiple: 'dado' },
  'DECIR': { infinitive: 'decir', gerund: 'diciendo', pastParticiple: 'dicho' },
  'SABER': { infinitive: 'saber', gerund: 'sabiendo', pastParticiple: 'sabido' },
  'ENCONTRAR': { infinitive: 'encontrar', gerund: 'encontrando', pastParticiple: 'encontrado' },
  'VENIR': { infinitive: 'venir', gerund: 'viniendo', pastParticiple: 'venido' },
  'PONER': { infinitive: 'poner', gerund: 'poniendo', pastParticiple: 'puesto' },
  'SALIR': { infinitive: 'salir', gerund: 'saliendo', pastParticiple: 'salido' },
  'OÍR': { infinitive: 'oír', gerund: 'oyendo', pastParticiple: 'oído' },
  'TRAER': { infinitive: 'traer', gerund: 'trayendo', pastParticiple: 'traído' },
  'CREER': { infinitive: 'creer', gerund: 'creyendo', pastParticiple: 'creído' },
  'ENCANTAR': { infinitive: 'encantar', gerund: 'encantando', pastParticiple: 'encantado' },
  'MOLESTAR': { infinitive: 'molestar', gerund: 'molestando', pastParticiple: 'molestado' },
  'IMPORTAR': { infinitive: 'importar', gerund: 'importando', pastParticiple: 'importado' },
  'PENSAR': { infinitive: 'pensar', gerund: 'pensando', pastParticiple: 'pensado' },
  'ENTENDER': { infinitive: 'entender', gerund: 'entendiendo', pastParticiple: 'entendido' },
  'SENTIR': { infinitive: 'sentir', gerund: 'sintiendo', pastParticiple: 'sentido' },
  'SENTIRSE': { infinitive: 'sentirse', gerund: 'sintiéndose', pastParticiple: 'sentido' },
  'CONOCER': { infinitive: 'conocer', gerund: 'conociendo', pastParticiple: 'conocido' },
  'ENCONTRARSE': { infinitive: 'encontrarse', gerund: 'encontrándose', pastParticiple: 'encontrado' },
  'PREOCUPARSE': { infinitive: 'preocuparse', gerund: 'preocupándose', pastParticiple: 'preocupado' },
  'DIVERTIRSE': { infinitive: 'divertirse', gerund: 'divirtiéndose', pastParticiple: 'divertido' },
  'GUSTAR': { infinitive: 'gustar', gerund: 'gustando', pastParticiple: 'gustado' },
  'DOLER': { infinitive: 'doler', gerund: 'doliendo', pastParticiple: 'dolido' },
  'FALTAR': { infinitive: 'faltar', gerund: 'faltando', pastParticiple: 'faltado' },
  'PARECER': { infinitive: 'parecer', gerund: 'pareciendo', pastParticiple: 'parecido' }
};

function addNewTensesToConjugations() {
  const conjugationsPath = path.join(__dirname, '..', 'data', 'conjugations.json');
  
  console.log('Loading conjugations.json...');
  const conjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf8'));
  
  let verbsUpdated = 0;
  
  Object.keys(conjugations).forEach(verbName => {
    const verb = conjugations[verbName];
    const forms = verbForms[verbName];
    
    if (!forms) {
      console.log(`⚠️  No verb forms defined for ${verbName}`);
      return;
    }
    
    // Add new tenses
    Object.keys(newTensePatterns).forEach(tense => {
      if (!verb[tense]) {
        verb[tense] = {};
        
        Object.keys(newTensePatterns[tense]).forEach(subject => {
          const pattern = newTensePatterns[tense][subject];
          
          switch (tense) {
            case 'present-progressive':
              verb[tense][subject] = pattern(forms.gerund);
              break;
            case 'going-to':
              verb[tense][subject] = pattern(forms.infinitive);
              break;
            case 'present-perfect':
              verb[tense][subject] = pattern(forms.pastParticiple);
              break;
          }
        });
        
        console.log(`✅ Added ${tense} for ${verbName}`);
      }
    });
    
    verbsUpdated++;
  });
  
  // Write updated conjugations
  fs.writeFileSync(conjugationsPath, JSON.stringify(conjugations, null, 2));
  
  console.log(`\n🎉 Successfully updated ${verbsUpdated} verbs with new tenses`);
  console.log('Added tenses: present-progressive, going-to, present-perfect');
}

if (require.main === module) {
  addNewTensesToConjugations();
}

module.exports = { addNewTensesToConjugations };
