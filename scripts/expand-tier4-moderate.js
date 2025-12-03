#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 4 corpus
const tier4Path = path.join(__dirname, '../data/corpus/tier4-complete.json');
const tier4Data = JSON.parse(fs.readFileSync(tier4Path, 'utf8'));

console.log('🚀 EXPANDING TIER 4 - MODERATE EXPANSION (4 sentences per verb per tense)\n');
console.log('Following PEDAGOGICAL_MAP.md: Present → Gerund → Going-to Future → Present Perfect\n');
console.log('Avoiding Preterite and Simple Future until much later\n');

// Tier 4 expansion templates - focusing on emotional/cognitive verbs
const tier4ExpansionTemplates = {
  // EMOTIONAL REFLEXIVE VERBS
  PREOCUPARSE: {
    present: [
      { spanish: "Me preocupo por ti.", english: "I worry about you.", subject: "yo", source: "personal_worry" },
      { spanish: "Te preocupas demasiado.", english: "You (informal) worry too much.", subject: "tú", source: "excessive_worry" },
      { spanish: "Se preocupa por el futuro.", english: "He/She worries about the future.", subject: "él", source: "future_anxiety" }
    ],
    "present-progressive": [
      { spanish: "Me estoy preocupando.", english: "I am getting worried.", subject: "yo", source: "worry_onset" },
      { spanish: "Se está preocupando mucho.", english: "He/She is worrying a lot.", subject: "él", source: "intense_worry" }
    ],
    "going-to": [
      { spanish: "Me voy a preocupar.", english: "I am going to worry.", subject: "yo", source: "worry_prediction" },
      { spanish: "Te vas a preocupar por nada.", english: "You (informal) are going to worry about nothing.", subject: "tú", source: "unnecessary_worry" }
    ],
    "present-perfect": [
      { spanish: "Me he preocupado toda la noche.", english: "I have worried all night.", subject: "yo", source: "night_worry" },
      { spanish: "Se ha preocupado sin razón.", english: "He/She has worried without reason.", subject: "él", source: "baseless_worry" }
    ]
  },

  DIVERTIRSE: {
    present: [
      { spanish: "Me divierto en las fiestas.", english: "I have fun at parties.", subject: "yo", source: "party_enjoyment" },
      { spanish: "Te diviertes con tus amigos.", english: "You (informal) have fun with your friends.", subject: "tú", source: "friend_enjoyment" },
      { spanish: "Se divierte jugando.", english: "He/She has fun playing.", subject: "él", source: "play_enjoyment" }
    ],
    "present-progressive": [
      { spanish: "Me estoy divirtiendo mucho.", english: "I am having a lot of fun.", subject: "yo", source: "current_fun" },
      { spanish: "Se está divirtiendo en el parque.", english: "He/She is having fun in the park.", subject: "él", source: "park_fun" }
    ],
    "going-to": [
      { spanish: "Me voy a divertir esta noche.", english: "I am going to have fun tonight.", subject: "yo", source: "tonight_fun" },
      { spanish: "Te vas a divertir en la playa.", english: "You (informal) are going to have fun at the beach.", subject: "tú", source: "beach_fun" }
    ],
    "present-perfect": [
      { spanish: "Me he divertido mucho hoy.", english: "I have had a lot of fun today.", subject: "yo", source: "today_fun" },
      { spanish: "Se ha divertido en el viaje.", english: "He/She has had fun on the trip.", subject: "él", source: "trip_fun" }
    ]
  },

  ENCONTRARSE: {
    present: [
      { spanish: "Me encuentro bien.", english: "I feel well.", subject: "yo", source: "wellness_state" },
      { spanish: "Te encuentras cansado.", english: "You (informal) feel tired.", subject: "tú", source: "fatigue_state" },
      { spanish: "Se encuentra en casa.", english: "He/She is at home.", subject: "él", source: "location_state" }
    ],
    "present-progressive": [
      { spanish: "Me estoy sintiendo mejor.", english: "I am feeling better.", subject: "yo", source: "improvement_feeling" },
      { spanish: "Se está encontrando mal.", english: "He/She is feeling bad.", subject: "él", source: "illness_feeling" }
    ],
    "going-to": [
      { spanish: "Me voy a encontrar con María.", english: "I am going to meet with María.", subject: "yo", source: "meeting_plan" },
      { spanish: "Te vas a encontrar sorpresas.", english: "You (informal) are going to find surprises.", subject: "tú", source: "surprise_discovery" }
    ],
    "present-perfect": [
      { spanish: "Me he encontrado con problemas.", english: "I have encountered problems.", subject: "yo", source: "problem_encounter" },
      { spanish: "Se ha encontrado muy feliz.", english: "He/She has found himself/herself very happy.", subject: "él", source: "happiness_discovery" }
    ]
  },

  // COGNITIVE VERBS
  CREER: {
    present: [
      { spanish: "Creo en ti.", english: "I believe in you.", subject: "yo", source: "personal_belief" },
      { spanish: "Crees que es verdad.", english: "You (informal) believe it's true.", subject: "tú", source: "truth_belief" },
      { spanish: "Cree en Dios.", english: "He/She believes in God.", subject: "él", source: "religious_belief" }
    ],
    "present-progressive": [
      { spanish: "Estoy creyendo más en mí.", english: "I am believing more in myself.", subject: "yo", source: "self_confidence" },
      { spanish: "Está creyendo la historia.", english: "He/She is believing the story.", subject: "él", source: "story_acceptance" }
    ],
    "going-to": [
      { spanish: "Voy a creer en el proyecto.", english: "I am going to believe in the project.", subject: "yo", source: "project_faith" },
      { spanish: "Vas a creer cuando lo veas.", english: "You (informal) are going to believe when you see it.", subject: "tú", source: "visual_proof" }
    ],
    "present-perfect": [
      { spanish: "He creído siempre en la justicia.", english: "I have always believed in justice.", subject: "yo", source: "justice_belief" },
      { spanish: "Ha creído en sus sueños.", english: "He/She has believed in his/her dreams.", subject: "él", source: "dream_belief" }
    ]
  },

  CONOCER: {
    present: [
      { spanish: "Conozco a tu hermana.", english: "I know your sister.", subject: "yo", source: "person_acquaintance" },
      { spanish: "Conoces la ciudad.", english: "You (informal) know the city.", subject: "tú", source: "city_familiarity" },
      { spanish: "Conoce muchos idiomas.", english: "He/She knows many languages.", subject: "él", source: "language_knowledge" }
    ],
    "present-progressive": [
      { spanish: "Estoy conociendo gente nueva.", english: "I am meeting new people.", subject: "yo", source: "social_networking" },
      { spanish: "Está conociendo la cultura.", english: "He/She is getting to know the culture.", subject: "él", source: "cultural_learning" }
    ],
    "going-to": [
      { spanish: "Voy a conocer París.", english: "I am going to get to know Paris.", subject: "yo", source: "paris_exploration" },
      { spanish: "Vas a conocer a mis padres.", english: "You (informal) are going to meet my parents.", subject: "tú", source: "parent_introduction" }
    ],
    "present-perfect": [
      { spanish: "He conocido lugares increíbles.", english: "I have known incredible places.", subject: "yo", source: "travel_experience" },
      { spanish: "Ha conocido el amor verdadero.", english: "He/She has known true love.", subject: "él", source: "love_experience" }
    ]
  },

  // IRREGULAR SENSORY/COGNITIVE VERBS
  OÍR: {
    present: [
      { spanish: "Oigo música.", english: "I hear music.", subject: "yo", source: "music_hearing" },
      { spanish: "Oyes voces.", english: "You (informal) hear voices.", subject: "tú", source: "voice_hearing" },
      { spanish: "Oye el teléfono.", english: "He/She hears the phone.", subject: "él", source: "phone_hearing" }
    ],
    "present-progressive": [
      { spanish: "Estoy oyendo ruidos.", english: "I am hearing noises.", subject: "yo", source: "noise_hearing" },
      { spanish: "Está oyendo las noticias.", english: "He/She is hearing the news.", subject: "él", source: "news_hearing" }
    ],
    "going-to": [
      { spanish: "Voy a oír tu opinión.", english: "I am going to hear your opinion.", subject: "yo", source: "opinion_listening" },
      { spanish: "Vas a oír cosas interesantes.", english: "You (informal) are going to hear interesting things.", subject: "tú", source: "interesting_hearing" }
    ],
    "present-perfect": [
      { spanish: "He oído esa canción.", english: "I have heard that song.", subject: "yo", source: "song_recognition" },
      { spanish: "Ha oído buenos comentarios.", english: "He/She has heard good comments.", subject: "él", source: "positive_feedback" }
    ]
  },

  TRAER: {
    present: [
      { spanish: "Traigo el libro.", english: "I bring the book.", subject: "yo", source: "book_bringing" },
      { spanish: "Traes buenas noticias.", english: "You (informal) bring good news.", subject: "tú", source: "news_delivery" },
      { spanish: "Trae problemas.", english: "He/She brings problems.", subject: "él", source: "problem_causing" }
    ],
    "present-progressive": [
      { spanish: "Estoy trayendo la comida.", english: "I am bringing the food.", subject: "yo", source: "food_delivery" },
      { spanish: "Está trayendo a su familia.", english: "He/She is bringing his/her family.", subject: "él", source: "family_bringing" }
    ],
    "going-to": [
      { spanish: "Voy a traer más dinero.", english: "I am going to bring more money.", subject: "yo", source: "money_bringing" },
      { spanish: "Vas a traer alegría.", english: "You (informal) are going to bring joy.", subject: "tú", source: "joy_bringing" }
    ],
    "present-perfect": [
      { spanish: "He traído regalos.", english: "I have brought gifts.", subject: "yo", source: "gift_bringing" },
      { spanish: "Ha traído buena suerte.", english: "He/She has brought good luck.", subject: "él", source: "luck_bringing" }
    ]
  },

  // REGULAR EMOTIONAL/COGNITIVE VERBS
  LLEVAR: {
    present: [
      { spanish: "Llevo una chaqueta.", english: "I wear a jacket.", subject: "yo", source: "clothing_wearing" },
      { spanish: "Llevas el pelo largo.", english: "You (informal) wear your hair long.", subject: "tú", source: "hairstyle_choice" },
      { spanish: "Lleva gafas.", english: "He/She wears glasses.", subject: "él", source: "glasses_wearing" }
    ],
    "present-progressive": [
      { spanish: "Estoy llevando una vida feliz.", english: "I am leading a happy life.", subject: "yo", source: "happy_lifestyle" },
      { spanish: "Está llevando el proyecto.", english: "He/She is leading the project.", subject: "él", source: "project_leadership" }
    ],
    "going-to": [
      { spanish: "Voy a llevar flores.", english: "I am going to bring flowers.", subject: "yo", source: "flower_bringing" },
      { spanish: "Esto va a llevar tiempo.", english: "This is going to take time.", subject: "impersonal", source: "time_requirement" }
    ],
    "present-perfect": [
      { spanish: "He llevado una buena vida.", english: "I have led a good life.", subject: "yo", source: "life_assessment" },
      { spanish: "Ha llevado muchas responsabilidades.", english: "He/She has carried many responsibilities.", subject: "él", source: "responsibility_burden" }
    ]
  },

  NECESITAR: {
    present: [
      { spanish: "Necesito ayuda.", english: "I need help.", subject: "yo", source: "help_need" },
      { spanish: "Necesitas descansar.", english: "You (informal) need to rest.", subject: "tú", source: "rest_need" },
      { spanish: "Necesita más tiempo.", english: "He/She needs more time.", subject: "él", source: "time_need" }
    ],
    "present-progressive": [
      { spanish: "Estoy necesitando apoyo.", english: "I am needing support.", subject: "yo", source: "support_need" },
      { spanish: "Está necesitando atención.", english: "He/She is needing attention.", subject: "él", source: "attention_need" }
    ],
    "going-to": [
      { spanish: "Voy a necesitar dinero.", english: "I am going to need money.", subject: "yo", source: "money_need" },
      { spanish: "Vas a necesitar paciencia.", english: "You (informal) are going to need patience.", subject: "tú", source: "patience_need" }
    ],
    "present-perfect": [
      { spanish: "He necesitado tu consejo.", english: "I have needed your advice.", subject: "yo", source: "advice_need" },
      { spanish: "Ha necesitado mucho amor.", english: "He/She has needed a lot of love.", subject: "él", source: "love_need" }
    ]
  }
};

// Process each verb and tense (only the 4 pedagogically appropriate tenses)
const allowedTenses = ['present', 'present-progressive', 'going-to', 'present-perfect'];

Object.keys(tier4ExpansionTemplates).forEach(verbName => {
  const verb = tier4Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in Tier 4 corpus`);
    return;
  }

  const verbTemplates = tier4ExpansionTemplates[verbName];
  
  Object.keys(verbTemplates).forEach(tense => {
    if (!allowedTenses.includes(tense)) return; // Skip non-pedagogical tenses
    
    const currentSentences = verb[tense] || [];
    const newSentences = verbTemplates[tense];
    
    if (newSentences && newSentences.length > 0) {
      console.log(`📝 ${verbName} ${tense}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
      
      // Add proper metadata to new sentences
      const enhancedNewSentences = newSentences.map(sentence => ({
        ...sentence,
        region: "universal",
        tags: [
          "region:universal",
          verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
          `subject:${sentence.subject}`,
          `tense:${tense}`,
          "tier:4",
          verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
          "word-type:verb"
        ]
      }));
      
      // Combine existing and new sentences
      verb[tense] = [...currentSentences, ...enhancedNewSentences];
    }
  });
});

// Update metadata
tier4Data.metadata.sentence_count = 
  Object.values(tier4Data.verbs).reduce((total, verb) => {
    return total + Object.values(verb).reduce((verbTotal, tenseData) => {
      if (Array.isArray(tenseData)) {
        return verbTotal + tenseData.length;
      } else if (tenseData && tenseData.sentences) {
        return verbTotal + tenseData.sentences.length;
      }
      return verbTotal;
    }, 0);
  }, 0);

// Save updated corpus
fs.writeFileSync(tier4Path, JSON.stringify(tier4Data, null, 2));

console.log('\n✅ TIER 4 MODERATE EXPANSION COMPLETE!');
console.log(`📊 Updated total sentence count: ${tier4Data.metadata.sentence_count}`);
console.log('\n🎯 Ready to test card generation!');
