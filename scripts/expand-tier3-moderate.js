#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 3 corpus
const tier3Path = path.join(__dirname, '../data/corpus/tier3-complete.json');
const tier3Data = JSON.parse(fs.readFileSync(tier3Path, 'utf8'));

console.log('🚀 EXPANDING TIER 3 - MODERATE EXPANSION (5 sentences per verb per tense)\n');
console.log('Following PEDAGOGICAL_MAP.md: Present → Gerund → Going-to Future → Preterite → Present Perfect\n');
console.log('Skipping Simple Future (optional for Tier 3)\n');

// Tier 3 expansion templates - focusing on irregular essentials
const tier3ExpansionTemplates = {
  // REFLEXIVE IRREGULARS
  IRSE: {
    present: [
      { spanish: "Me voy temprano.", english: "I leave early.", subject: "yo", source: "early_departure" },
      { spanish: "Te vas de la ciudad.", english: "You (informal) are leaving the city.", subject: "tú", source: "city_departure" },
      { spanish: "Se va en tren.", english: "He/She leaves by train.", subject: "él", source: "train_departure" }
    ],
    "present-progressive": [
      { spanish: "Me estoy yendo.", english: "I am leaving.", subject: "yo", source: "departure_action" },
      { spanish: "Se está yendo rápido.", english: "He/She is leaving quickly.", subject: "él", source: "quick_departure" }
    ],
    "going-to": [
      { spanish: "Me voy a ir mañana.", english: "I am going to leave tomorrow.", subject: "yo", source: "departure_plan" },
      { spanish: "Te vas a ir solo.", english: "You (informal) are going to leave alone.", subject: "tú", source: "solo_departure" }
    ],
    preterite: [
      { spanish: "Me fui ayer.", english: "I left yesterday.", subject: "yo", source: "past_departure" },
      { spanish: "Se fue sin decir adiós.", english: "He/She left without saying goodbye.", subject: "él", source: "sudden_departure" }
    ],
    "present-perfect": [
      { spanish: "Me he ido de casa.", english: "I have left home.", subject: "yo", source: "home_departure" },
      { spanish: "Se ha ido de vacaciones.", english: "He/She has gone on vacation.", subject: "él", source: "vacation_departure" }
    ]
  },

  PONERSE: {
    present: [
      { spanish: "Me pongo la chaqueta.", english: "I put on the jacket.", subject: "yo", source: "clothing_action" },
      { spanish: "Te pones nervioso.", english: "You (informal) get nervous.", subject: "tú", source: "emotional_state" },
      { spanish: "Se pone contento.", english: "He/She gets happy.", subject: "él", source: "happiness_change" }
    ],
    "present-progressive": [
      { spanish: "Me estoy poniendo los zapatos.", english: "I am putting on my shoes.", subject: "yo", source: "shoe_wearing" },
      { spanish: "Se está poniendo triste.", english: "He/She is getting sad.", subject: "él", source: "sadness_onset" }
    ],
    "going-to": [
      { spanish: "Me voy a poner el abrigo.", english: "I am going to put on the coat.", subject: "yo", source: "coat_plan" },
      { spanish: "Te vas a poner feliz.", english: "You (informal) are going to get happy.", subject: "tú", source: "happiness_prediction" }
    ],
    preterite: [
      { spanish: "Me puse el sombrero.", english: "I put on the hat.", subject: "yo", source: "hat_wearing" },
      { spanish: "Se puso enfermo.", english: "He/She got sick.", subject: "él", source: "illness_onset" }
    ],
    "present-perfect": [
      { spanish: "Me he puesto cómodo.", english: "I have gotten comfortable.", subject: "yo", source: "comfort_achievement" },
      { spanish: "Se ha puesto mejor.", english: "He/She has gotten better.", subject: "él", source: "improvement" }
    ]
  },

  SENTIRSE: {
    present: [
      { spanish: "Me siento bien.", english: "I feel well.", subject: "yo", source: "wellness_feeling" },
      { spanish: "Te sientes cansado.", english: "You (informal) feel tired.", subject: "tú", source: "fatigue_feeling" },
      { spanish: "Se siente feliz.", english: "He/She feels happy.", subject: "él", source: "happiness_feeling" }
    ],
    "present-progressive": [
      { spanish: "Me estoy sintiendo mejor.", english: "I am feeling better.", subject: "yo", source: "improvement_feeling" },
      { spanish: "Se está sintiendo mal.", english: "He/She is feeling bad.", subject: "él", source: "illness_feeling" }
    ],
    "going-to": [
      { spanish: "Me voy a sentir orgulloso.", english: "I am going to feel proud.", subject: "yo", source: "pride_prediction" },
      { spanish: "Te vas a sentir aliviado.", english: "You (informal) are going to feel relieved.", subject: "tú", source: "relief_prediction" }
    ],
    preterite: [
      { spanish: "Me sentí triste.", english: "I felt sad.", subject: "yo", source: "past_sadness" },
      { spanish: "Se sintió confundido.", english: "He/She felt confused.", subject: "él", source: "past_confusion" }
    ],
    "present-perfect": [
      { spanish: "Me he sentido solo.", english: "I have felt lonely.", subject: "yo", source: "loneliness_experience" },
      { spanish: "Se ha sentido apoyado.", english: "He/She has felt supported.", subject: "él", source: "support_experience" }
    ]
  },

  // STEM-CHANGING VERBS
  PENSAR: {
    present: [
      { spanish: "Pienso en ti.", english: "I think about you.", subject: "yo", source: "romantic_thought" },
      { spanish: "Piensas mucho.", english: "You (informal) think a lot.", subject: "tú", source: "deep_thinking" },
      { spanish: "Piensa en el futuro.", english: "He/She thinks about the future.", subject: "él", source: "future_planning" }
    ],
    "present-progressive": [
      { spanish: "Estoy pensando en el problema.", english: "I am thinking about the problem.", subject: "yo", source: "problem_consideration" },
      { spanish: "Está pensando en viajar.", english: "He/She is thinking about traveling.", subject: "él", source: "travel_consideration" }
    ],
    "going-to": [
      { spanish: "Voy a pensar en tu propuesta.", english: "I am going to think about your proposal.", subject: "yo", source: "proposal_consideration" },
      { spanish: "Vas a pensar diferente.", english: "You (informal) are going to think differently.", subject: "tú", source: "perspective_change" }
    ],
    preterite: [
      { spanish: "Pensé en llamarte.", english: "I thought about calling you.", subject: "yo", source: "call_consideration" },
      { spanish: "Pensó en su familia.", english: "He/She thought about his/her family.", subject: "él", source: "family_thought" }
    ],
    "present-perfect": [
      { spanish: "He pensado en cambiar de trabajo.", english: "I have thought about changing jobs.", subject: "yo", source: "career_consideration" },
      { spanish: "Ha pensado en mudarse.", english: "He/She has thought about moving.", subject: "él", source: "relocation_consideration" }
    ]
  },

  ENTENDER: {
    present: [
      { spanish: "Entiendo español.", english: "I understand Spanish.", subject: "yo", source: "language_comprehension" },
      { spanish: "Entiendes la lección.", english: "You (informal) understand the lesson.", subject: "tú", source: "lesson_comprehension" },
      { spanish: "Entiende el problema.", english: "He/She understands the problem.", subject: "él", source: "problem_comprehension" }
    ],
    "present-progressive": [
      { spanish: "Estoy entendiendo mejor.", english: "I am understanding better.", subject: "yo", source: "improving_comprehension" },
      { spanish: "Está entendiendo la situación.", english: "He/She is understanding the situation.", subject: "él", source: "situation_comprehension" }
    ],
    "going-to": [
      { spanish: "Voy a entender todo.", english: "I am going to understand everything.", subject: "yo", source: "complete_understanding" },
      { spanish: "Vas a entender pronto.", english: "You (informal) are going to understand soon.", subject: "tú", source: "quick_understanding" }
    ],
    preterite: [
      { spanish: "Entendí la explicación.", english: "I understood the explanation.", subject: "yo", source: "explanation_comprehension" },
      { spanish: "Entendió el mensaje.", english: "He/She understood the message.", subject: "él", source: "message_comprehension" }
    ],
    "present-perfect": [
      { spanish: "He entendido tu punto.", english: "I have understood your point.", subject: "yo", source: "point_comprehension" },
      { spanish: "Ha entendido la importancia.", english: "He/She has understood the importance.", subject: "él", source: "importance_comprehension" }
    ]
  },

  SENTIR: {
    present: [
      { spanish: "Siento el frío.", english: "I feel the cold.", subject: "yo", source: "cold_sensation" },
      { spanish: "Sientes dolor.", english: "You (informal) feel pain.", subject: "tú", source: "pain_sensation" },
      { spanish: "Siente la música.", english: "He/She feels the music.", subject: "él", source: "music_sensation" }
    ],
    "present-progressive": [
      { spanish: "Estoy sintiendo calor.", english: "I am feeling heat.", subject: "yo", source: "heat_sensation" },
      { spanish: "Está sintiendo emociones fuertes.", english: "He/She is feeling strong emotions.", subject: "él", source: "emotional_intensity" }
    ],
    "going-to": [
      { spanish: "Voy a sentir nostalgia.", english: "I am going to feel nostalgia.", subject: "yo", source: "nostalgia_prediction" },
      { spanish: "Vas a sentir alivio.", english: "You (informal) are going to feel relief.", subject: "tú", source: "relief_prediction" }
    ],
    preterite: [
      { spanish: "Sentí una vibración.", english: "I felt a vibration.", subject: "yo", source: "vibration_sensation" },
      { spanish: "Sintió miedo.", english: "He/She felt fear.", subject: "él", source: "fear_sensation" }
    ],
    "present-perfect": [
      { spanish: "He sentido su presencia.", english: "I have felt his/her presence.", subject: "yo", source: "presence_sensation" },
      { spanish: "Ha sentido amor verdadero.", english: "He/She has felt true love.", subject: "él", source: "love_sensation" }
    ]
  },

  // IRREGULAR VERBS
  VENIR: {
    present: [
      { spanish: "Vengo de España.", english: "I come from Spain.", subject: "yo", source: "origin_statement" },
      { spanish: "Vienes conmigo.", english: "You (informal) come with me.", subject: "tú", source: "accompaniment" },
      { spanish: "Viene en autobús.", english: "He/She comes by bus.", subject: "él", source: "transportation_method" }
    ],
    "present-progressive": [
      { spanish: "Estoy viniendo hacia ti.", english: "I am coming toward you.", subject: "yo", source: "approach_action" },
      { spanish: "Está viniendo rápido.", english: "He/She is coming quickly.", subject: "él", source: "quick_approach" }
    ],
    "going-to": [
      { spanish: "Voy a venir mañana.", english: "I am going to come tomorrow.", subject: "yo", source: "future_visit" },
      { spanish: "Vas a venir a la fiesta.", english: "You (informal) are going to come to the party.", subject: "tú", source: "party_attendance" }
    ],
    preterite: [
      { spanish: "Vine en taxi.", english: "I came by taxi.", subject: "yo", source: "taxi_arrival" },
      { spanish: "Vino sin avisar.", english: "He/She came without warning.", subject: "él", source: "surprise_arrival" }
    ],
    "present-perfect": [
      { spanish: "He venido a ayudar.", english: "I have come to help.", subject: "yo", source: "help_arrival" },
      { spanish: "Ha venido desde lejos.", english: "He/She has come from far away.", subject: "él", source: "distant_arrival" }
    ]
  },

  PONER: {
    present: [
      { spanish: "Pongo la mesa.", english: "I set the table.", subject: "yo", source: "table_setting" },
      { spanish: "Pones música.", english: "You (informal) put on music.", subject: "tú", source: "music_playing" },
      { spanish: "Pone atención.", english: "He/She pays attention.", subject: "él", source: "attention_giving" }
    ],
    "present-progressive": [
      { spanish: "Estoy poniendo orden.", english: "I am putting things in order.", subject: "yo", source: "organizing_action" },
      { spanish: "Está poniendo la televisión.", english: "He/She is turning on the television.", subject: "él", source: "tv_activation" }
    ],
    "going-to": [
      { spanish: "Voy a poner una foto.", english: "I am going to put up a photo.", subject: "yo", source: "photo_placement" },
      { spanish: "Vas a poner las reglas.", english: "You (informal) are going to set the rules.", subject: "tú", source: "rule_setting" }
    ],
    preterite: [
      { spanish: "Puse el libro aquí.", english: "I put the book here.", subject: "yo", source: "book_placement" },
      { spanish: "Puso una sonrisa.", english: "He/She put on a smile.", subject: "él", source: "smile_display" }
    ],
    "present-perfect": [
      { spanish: "He puesto mi confianza en ti.", english: "I have put my trust in you.", subject: "yo", source: "trust_placement" },
      { spanish: "Ha puesto mucho esfuerzo.", english: "He/She has put in a lot of effort.", subject: "él", source: "effort_investment" }
    ]
  },

  SALIR: {
    present: [
      { spanish: "Salgo de casa.", english: "I leave home.", subject: "yo", source: "home_departure" },
      { spanish: "Sales con amigos.", english: "You (informal) go out with friends.", subject: "tú", source: "social_outing" },
      { spanish: "Sale del trabajo.", english: "He/She leaves work.", subject: "él", source: "work_departure" }
    ],
    "present-progressive": [
      { spanish: "Estoy saliendo del edificio.", english: "I am leaving the building.", subject: "yo", source: "building_exit" },
      { spanish: "Está saliendo bien.", english: "It is turning out well.", subject: "impersonal", source: "positive_outcome" }
    ],
    "going-to": [
      { spanish: "Voy a salir temprano.", english: "I am going to leave early.", subject: "yo", source: "early_departure_plan" },
      { spanish: "Vas a salir en la foto.", english: "You (informal) are going to appear in the photo.", subject: "tú", source: "photo_appearance" }
    ],
    preterite: [
      { spanish: "Salí corriendo.", english: "I left running.", subject: "yo", source: "running_departure" },
      { spanish: "Salió muy bien.", english: "It turned out very well.", subject: "impersonal", source: "excellent_outcome" }
    ],
    "present-perfect": [
      { spanish: "He salido de dudas.", english: "I have cleared up my doubts.", subject: "yo", source: "doubt_resolution" },
      { spanish: "Ha salido adelante.", english: "He/She has gotten ahead.", subject: "él", source: "progress_achievement" }
    ]
  }
};

// Process each verb and tense
Object.keys(tier3ExpansionTemplates).forEach(verbName => {
  const verb = tier3Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in Tier 3 corpus`);
    return;
  }

  const verbTemplates = tier3ExpansionTemplates[verbName];
  
  Object.keys(verbTemplates).forEach(tense => {
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
          verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:irregular",
          `subject:${sentence.subject}`,
          `tense:${tense}`,
          "tier:3",
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
tier3Data.metadata.sentence_count = 
  Object.values(tier3Data.verbs).reduce((total, verb) => {
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
fs.writeFileSync(tier3Path, JSON.stringify(tier3Data, null, 2));

console.log('\n✅ TIER 3 MODERATE EXPANSION COMPLETE!');
console.log(`📊 Updated total sentence count: ${tier3Data.metadata.sentence_count}`);
console.log('\n🎯 Ready to test card generation!');
