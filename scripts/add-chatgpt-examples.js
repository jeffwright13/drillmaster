#!/usr/bin/env node

/**
 * Add ChatGPT's High-Quality Examples to Corpus
 * Integrate reflexive, irregular, emotional, gustar-type, and present-for-future examples
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's examples organized by tier and verb
const CHATGPT_EXAMPLES = {
  // Tier 2: Reflexive verbs
  tier2: {
    'DUCHARSE': [
      {
        spanish: "Te duchas antes de ir al trabajo, ¿verdad?",
        english: "You shower before going to work, right?",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Siempre te duchas rápido cuando tienes prisa.",
        english: "You always shower quickly when you're in a hurry.",
        subject: "tú", 
        tense: "present"
      },
      {
        spanish: "Te duchas en la noche para relajarte.",
        english: "You shower at night to relax.",
        subject: "tú",
        tense: "present"
      }
    ],
    'SENTARSE': [
      {
        spanish: "Te sientas en la sala para tomar tu café.",
        english: "You sit in the living room to drink your coffee.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Siempre te sientas en la misma mesa para estudiar.",
        english: "You always sit at the same table to study.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Te sientas un rato después de llegar a casa.",
        english: "You sit down for a bit after getting home.",
        subject: "tú",
        tense: "present"
      }
    ],
    'ACOSTARSE': [
      {
        spanish: "Te acuestas temprano los lunes porque trabajas temprano.",
        english: "You go to bed early on Mondays because you work early.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Normalmente te acuestas viendo videos en tu teléfono.",
        english: "You usually go to bed watching videos on your phone.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Te acuestas tarde cuando hace mucho calor.",
        english: "You go to bed late when it's really hot.",
        subject: "tú",
        tense: "present"
      }
    ],
    'DESPERTARSE': [
      {
        spanish: "Te despiertas a las seis todos los días.",
        english: "You wake up at six every day.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Te despiertas con el sonido de tu alarma, aunque no quieras.",
        english: "You wake up with your alarm, even if you don't want to.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Te despiertas temprano incluso los fines de semana.",
        english: "You wake up early even on weekends.",
        subject: "tú",
        tense: "present"
      }
    ],
    'LAVARSE': [
      {
        spanish: "Te lavas las manos antes de comer.",
        english: "You wash your hands before eating.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Siempre te lavas la cara al levantarte.",
        english: "You always wash your face when you get up.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Te lavas los dientes después del desayuno.",
        english: "You brush your teeth after breakfast.",
        subject: "tú",
        tense: "present"
      }
    ]
  },
  
  // Tier 3: Irregular verbs
  tier3: {
    'OÍR': [
      {
        spanish: "¿Oyes ese ruido afuera? Parece un carro.",
        english: "Do you hear that noise outside? Sounds like a car.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "No oigo bien; ¿puedes repetir?",
        english: "I can't hear well; can you repeat?",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "Anoche oí un golpe fuerte en la cocina.",
        english: "Last night I heard a loud bang in the kitchen.",
        subject: "yo",
        tense: "preterite"
      },
      {
        spanish: "Ella no oyó el teléfono porque estaba en la ducha.",
        english: "She didn't hear the phone because she was in the shower.",
        subject: "él/ella/usted",
        tense: "preterite"
      }
    ],
    'TRAER': [
      {
        spanish: "Siempre traes tu botella de agua a todas partes.",
        english: "You always bring your water bottle everywhere.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "¿Traigo algo para la cena?",
        english: "Should I bring anything for dinner?",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "Ayer traje los documentos que necesitabas.",
        english: "Yesterday I brought the documents you needed.",
        subject: "yo",
        tense: "preterite"
      },
      {
        spanish: "Ellos trajeron tacos para todos.",
        english: "They brought tacos for everyone.",
        subject: "ellos/ellas/ustedes",
        tense: "preterite"
      }
    ],
    'CREER': [
      {
        spanish: "Creo que va a llover más tarde.",
        english: "I think it's going to rain later.",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "¿Tú crees que esa serie está buena?",
        english: "Do you think that show is good?",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "No lo creí al principio, pero sí era cierto.",
        english: "I didn't believe it at first, but it was true.",
        subject: "yo",
        tense: "preterite"
      },
      {
        spanish: "Ella creyó que ya habías llegado.",
        english: "She thought you had already arrived.",
        subject: "él/ella/usted",
        tense: "preterite"
      }
    ],
    'LEER': [
      {
        spanish: "Leo un rato todas las noches antes de dormir.",
        english: "I read for a bit every night before bed.",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "¿Qué libro lees ahorita?",
        english: "What book are you reading right now?",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Ayer leí un artículo bien interesante.",
        english: "Yesterday I read a really interesting article.",
        subject: "yo",
        tense: "preterite"
      },
      {
        spanish: "Mi mamá leyó tu mensaje y se rió.",
        english: "My mom read your message and laughed.",
        subject: "él/ella/usted",
        tense: "preterite"
      }
    ]
  },
  
  // Tier 4: Emotional verbs
  tier4: {
    'SENTIRSE': [
      {
        spanish: "Me siento muy cansado hoy; no dormí bien.",
        english: "I feel really tired today; I didn't sleep well.",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "¿Cómo te sientes después del ejercicio?",
        english: "How do you feel after exercising?",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Ella se siente mejor con esa noticia.",
        english: "She feels better with that news.",
        subject: "él/ella/usted",
        tense: "present"
      }
    ],
    'PREOCUPARSE': [
      {
        spanish: "Me preocupo cuando no me contestas el mensaje.",
        english: "I worry when you don't answer my message.",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "No te preocupes; todo va a salir bien.",
        english: "Don't worry; everything is going to be fine.",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Mi mamá se preocupa mucho por mí.",
        english: "My mom worries about me a lot.",
        subject: "él/ella/usted",
        tense: "present"
      }
    ],
    'DIVERTIRSE': [
      {
        spanish: "Siempre me divierto cuando salgo con mis amigos.",
        english: "I always have fun when I go out with my friends.",
        subject: "yo",
        tense: "present"
      },
      {
        spanish: "¿Te diviertes en tus clases de español?",
        english: "Are you having fun in your Spanish classes?",
        subject: "tú",
        tense: "present"
      },
      {
        spanish: "Los niños se divierten en el parque todas las tardes.",
        english: "The kids have fun at the park every afternoon.",
        subject: "ellos/ellas/ustedes",
        tense: "present"
      }
    ]
  },
  
  // Tier 5: Gustar-type verbs
  tier5: {
    'MOLESTAR': [
      {
        spanish: "Me molesta cuando hacen ruido tan temprano.",
        english: "It bothers me when they make noise so early.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "¿Te molesta si prendo la tele?",
        english: "Does it bother you if I turn on the TV?",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "A ella le molesta que no la escuches.",
        english: "It annoys her that you don't listen to her.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      }
    ],
    'IMPORTAR': [
      {
        spanish: "No me importa lo que digan los demás.",
        english: "I don't care what other people say.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "¿Te importa si me siento aquí?",
        english: "Do you mind if I sit here?",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "A nosotros nos importa mucho la familia.",
        english: "Family matters a lot to us.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      }
    ],
    'PARECER': [
      {
        spanish: "Me parece que va a llover hoy.",
        english: "It seems to me that it's going to rain today.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "¿Qué te parece este restaurante?",
        english: "What do you think of this restaurant?",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "A ellos les parece buena idea salir temprano.",
        english: "It seems like a good idea to them to leave early.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      }
    ],
    'FALTAR': [
      {
        spanish: "Me falta dinero para pagar la cuenta.",
        english: "I'm missing money to pay the bill.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "¿Cuánto te falta para terminar?",
        english: "How much do you have left to finish?",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      },
      {
        spanish: "A él le falta una semana para las vacaciones.",
        english: "He has one week left until vacation.",
        subject: "él/ella/usted", // impersonal
        tense: "present"
      }
    ]
  }
};

// Present tense for future examples (distributed across tiers)
const PRESENT_FOR_FUTURE_EXAMPLES = {
  tier1: [
    {
      spanish: "El autobús llega a las siete de la mañana.",
      english: "The bus arrives at seven in the morning.",
      verb: "LLEGAR",
      context: "transportation"
    },
    {
      spanish: "Mi cita es el lunes a las diez.",
      english: "My appointment is on Monday at ten.",
      verb: "SER",
      context: "appointments"
    }
  ],
  tier2: [
    {
      spanish: "El vuelo sale a las tres y media.",
      english: "The flight leaves at three-thirty.",
      verb: "SALIR",
      context: "transportation"
    },
    {
      spanish: "La reunión empieza a las ocho en punto.",
      english: "The meeting starts at eight sharp.",
      verb: "EMPEZAR",
      context: "work"
    }
  ],
  tier3: [
    {
      spanish: "El metro no funciona el domingo.",
      english: "The subway isn't operating on Sunday.",
      verb: "FUNCIONAR",
      context: "transportation"
    },
    {
      spanish: "La película empieza a las seis.",
      english: "The movie starts at six.",
      verb: "EMPEZAR",
      context: "entertainment"
    }
  ]
};

function addChatGPTExamples() {
  console.log('🤖 Adding ChatGPT\'s high-quality examples to corpus...');
  
  const integration = {
    total_added: 0,
    by_tier: {},
    by_category: {
      reflexive: 0,
      irregular: 0,
      emotional: 0,
      gustar_type: 0,
      present_for_future: 0
    },
    examples_added: []
  };
  
  // Process each tier
  Object.keys(CHATGPT_EXAMPLES).forEach(tierKey => {
    const tier = tierKey.replace('tier', '');
    const filename = `tier${tier}-complete.json`;
    const filePath = path.join(__dirname, '../data/corpus', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} not found, skipping...`);
      return;
    }
    
    console.log(`\n🤖 Enhancing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    integration.by_tier[tier] = {
      added: 0,
      verbs_enhanced: []
    };
    
    const tierExamples = CHATGPT_EXAMPLES[tierKey];
    let tierModified = false;
    
    // Add verb examples
    Object.keys(tierExamples).forEach(verb => {
      const examples = tierExamples[verb];
      
      // Create verb entry if it doesn't exist
      if (!corpus.verbs) corpus.verbs = {};
      if (!corpus.verbs[verb]) {
        corpus.verbs[verb] = {};
        console.log(`   ➕ Created new verb: ${verb}`);
      }
      
      examples.forEach(example => {
        // Ensure tense array exists
        if (!corpus.verbs[verb][example.tense]) {
          corpus.verbs[verb][example.tense] = [];
        }
        
        // Create enhanced sentence
        const enhancedSentence = {
          spanish: example.spanish,
          english: example.english,
          subject: example.subject,
          region: "universal",
          source: {
            type: "chatgpt_generated",
            origin: "chatgpt_gap_filling",
            method: "natural_conversation_examples",
            date_collected: new Date().toISOString().split('T')[0]
          },
          quality: {
            score: 48, // Very high quality - ChatGPT generated
            authenticity: "natural_conversation",
            linguistic_review: "chatgpt_approved",
            reviewer: "chatgpt_mexican_spanish"
          },
          linguistic: {
            difficulty: "beginner_intermediate",
            register: "conversational",
            frequency: "high",
            mexican_spanish: true
          },
          pedagogy: {
            learning_focus: getVerbCategory(verb, tier),
            cultural_context: "daily_life",
            tier_appropriate: true,
            complexity_score: 3,
            chatgpt_generated: true
          },
          tags: [
            "region:universal",
            `subject:${example.subject}`,
            `tense:${example.tense}`,
            "word-type:verb",
            "source:chatgpt",
            "quality:very_high",
            `verb:${verb.toLowerCase()}`,
            "mexican_spanish:true",
            "natural_conversation:true"
          ]
        };
        
        corpus.verbs[verb][example.tense].push(enhancedSentence);
        
        integration.total_added++;
        integration.by_tier[tier].added++;
        integration.by_tier[tier].verbs_enhanced.push(verb);
        
        // Track by category
        const category = getVerbCategory(verb, tier)[0];
        if (integration.by_category[category] !== undefined) {
          integration.by_category[category]++;
        }
        
        integration.examples_added.push({
          tier: tier,
          verb: verb,
          tense: example.tense,
          spanish: example.spanish,
          english: example.english,
          category: category
        });
        
        tierModified = true;
        
        console.log(`   ✅ Added: "${example.spanish}" (${verb} - ${example.tense})`);
      });
    });
    
    // Add present-for-future examples if available
    if (PRESENT_FOR_FUTURE_EXAMPLES[tierKey]) {
      PRESENT_FOR_FUTURE_EXAMPLES[tierKey].forEach(example => {
        const verb = example.verb;
        
        if (!corpus.verbs[verb]) {
          corpus.verbs[verb] = {};
        }
        if (!corpus.verbs[verb]['present']) {
          corpus.verbs[verb]['present'] = [];
        }
        
        const enhancedSentence = {
          spanish: example.spanish,
          english: example.english,
          subject: "él/ella/usted", // Most are impersonal/3rd person
          region: "universal",
          source: {
            type: "chatgpt_generated",
            origin: "present_for_future_patterns",
            method: "scheduled_events",
            date_collected: new Date().toISOString().split('T')[0]
          },
          quality: {
            score: 46,
            authenticity: "natural_conversation",
            linguistic_review: "chatgpt_approved"
          },
          linguistic: {
            construction: "present_for_future",
            difficulty: "intermediate",
            register: "neutral",
            frequency: "high"
          },
          pedagogy: {
            learning_focus: ["present_tense", "future_meaning", "schedules"],
            cultural_context: example.context,
            tier_appropriate: true,
            complexity_score: 3,
            special_construction: "present_for_future"
          },
          tags: [
            "region:universal",
            "subject:él/ella/usted",
            "tense:present",
            "word-type:verb",
            "source:chatgpt",
            "construction:present_for_future",
            `context:${example.context}`,
            "high_roi:true"
          ]
        };
        
        corpus.verbs[verb]['present'].push(enhancedSentence);
        
        integration.total_added++;
        integration.by_tier[tier].added++;
        integration.by_category.present_for_future++;
        
        tierModified = true;
        
        console.log(`   ✅ Added present-for-future: "${example.spanish}" (${verb})`);
      });
    }
    
    // Save enhanced corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Saved ${integration.by_tier[tier].added} enhancements to ${filename}`);
    }
  });
  
  // Display results
  displayIntegrationReport(integration);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-integration-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(integration, null, 2));
  console.log(`\n💾 Integration report saved to: ${outputPath}`);
  
  return integration;
}

function getVerbCategory(verb, tier) {
  const categories = {
    '2': {
      'DUCHARSE': ['reflexive', 'daily_routine'],
      'SENTARSE': ['reflexive', 'daily_routine'],
      'ACOSTARSE': ['reflexive', 'daily_routine'],
      'DESPERTARSE': ['reflexive', 'daily_routine'],
      'LAVARSE': ['reflexive', 'daily_routine']
    },
    '3': {
      'OÍR': ['irregular', 'senses'],
      'TRAER': ['irregular', 'movement'],
      'CREER': ['irregular', 'cognition'],
      'LEER': ['irregular', 'activities']
    },
    '4': {
      'SENTIRSE': ['emotional', 'reflexive'],
      'PREOCUPARSE': ['emotional', 'reflexive'],
      'DIVERTIRSE': ['emotional', 'reflexive']
    },
    '5': {
      'MOLESTAR': ['gustar_type', 'emotions'],
      'IMPORTAR': ['gustar_type', 'opinions'],
      'PARECER': ['gustar_type', 'opinions'],
      'FALTAR': ['gustar_type', 'necessity']
    }
  };
  
  return categories[tier] && categories[tier][verb] || ['general'];
}

function displayIntegrationReport(integration) {
  console.log(`\n🤖 CHATGPT INTEGRATION REPORT:`);
  console.log(`   ✅ Total examples added: ${integration.total_added}`);
  
  console.log(`\n📚 Integration by Tier:`);
  Object.keys(integration.by_tier).forEach(tier => {
    const tierData = integration.by_tier[tier];
    console.log(`   Tier ${tier}: ${tierData.added} examples added`);
    if (tierData.verbs_enhanced.length > 0) {
      const uniqueVerbs = [...new Set(tierData.verbs_enhanced)];
      console.log(`     Verbs: ${uniqueVerbs.join(', ')}`);
    }
  });
  
  console.log(`\n🎯 Integration by Category:`);
  Object.keys(integration.by_category).forEach(category => {
    const count = integration.by_category[category];
    if (count > 0) {
      console.log(`   ${category}: ${count} examples`);
    }
  });
  
  if (integration.examples_added.length > 0) {
    console.log(`\n📋 SAMPLE INTEGRATIONS:`);
    integration.examples_added.slice(0, 12).forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}] ${example.spanish}`);
      console.log(`      "${example.english}" (${example.verb} - ${example.category})`);
    });
    
    if (integration.examples_added.length > 12) {
      console.log(`   ... and ${integration.examples_added.length - 12} more examples`);
    }
  }
  
  console.log(`\n✅ CHATGPT QUALITY BENEFITS:`);
  console.log(`   🗣️  Natural, conversational Mexican Spanish`);
  console.log(`   🎯 Fills critical gaps in reflexive, irregular, emotional verbs`);
  console.log(`   📚 Pedagogically appropriate for each tier`);
  console.log(`   🌟 High authenticity and linguistic quality`);
  console.log(`   ⚡ Immediate practical use in daily conversation`);
  
  console.log(`\n🚀 IMPACT:`);
  console.log(`   📈 Comprehensive coverage of essential verb patterns`);
  console.log(`   🎯 Natural examples students will actually use`);
  console.log(`   ✨ Professional-quality corpus ready for learners`);
}

if (require.main === module) {
  addChatGPTExamples();
}

module.exports = { addChatGPTExamples };
