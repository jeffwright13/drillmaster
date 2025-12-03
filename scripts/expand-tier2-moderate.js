#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 2 corpus
const tier2Path = path.join(__dirname, '../data/corpus/tier2-complete.json');
const tier2Data = JSON.parse(fs.readFileSync(tier2Path, 'utf8'));

console.log('🚀 EXPANDING TIER 2 - MODERATE EXPANSION (5 sentences per verb per tense)\n');
console.log('Following PEDAGOGICAL_MAP.md: Present → Gerund → Going-to Future → Preterite\n');
console.log('Skipping Present Perfect and Simple Future for Tier 2\n');

// Tier 2 expansion templates - focusing on daily routines and reflexives
const tier2ExpansionTemplates = {
  // REFLEXIVE VERBS - Daily routines
  SENTARSE: {
    present: [
      { spanish: "Me siento en la silla.", english: "I sit in the chair.", subject: "yo", source: "furniture_use" },
      { spanish: "Te sientas cerca de la ventana.", english: "You (informal) sit near the window.", subject: "tú", source: "seating_preference" },
      { spanish: "Nos sentamos juntos.", english: "We sit together.", subject: "nosotros", source: "group_seating" }
    ],
    "present-progressive": [
      { spanish: "Me estoy sentando.", english: "I am sitting down.", subject: "yo", source: "sitting_action" },
      { spanish: "Te estás sentando muy despacio.", english: "You (informal) are sitting down very slowly.", subject: "tú", source: "slow_sitting" }
    ],
    "going-to": [
      { spanish: "Me voy a sentar aquí.", english: "I am going to sit here.", subject: "yo", source: "seating_plan" },
      { spanish: "Te vas a sentar conmigo.", english: "You (informal) are going to sit with me.", subject: "tú", source: "companion_seating" }
    ],
    preterite: [
      { spanish: "Me senté en el sofá.", english: "I sat on the sofa.", subject: "yo", source: "past_seating" },
      { spanish: "Te sentaste al lado mío.", english: "You (informal) sat next to me.", subject: "tú", source: "close_seating" }
    ]
  },

  ACOSTARSE: {
    present: [
      { spanish: "Me acuesto temprano.", english: "I go to bed early.", subject: "yo", source: "bedtime_routine" },
      { spanish: "Te acuestas tarde.", english: "You (informal) go to bed late.", subject: "tú", source: "late_bedtime" },
      { spanish: "Se acuesta a las diez.", english: "He/She goes to bed at ten.", subject: "él", source: "specific_bedtime" }
    ],
    "present-progressive": [
      { spanish: "Me estoy acostando.", english: "I am going to bed.", subject: "yo", source: "bedtime_action" },
      { spanish: "Se está acostando ahora.", english: "He/She is going to bed now.", subject: "él", source: "current_bedtime" }
    ],
    "going-to": [
      { spanish: "Me voy a acostar pronto.", english: "I am going to go to bed soon.", subject: "yo", source: "bedtime_plan" },
      { spanish: "Te vas a acostar temprano.", english: "You (informal) are going to go to bed early.", subject: "tú", source: "early_bedtime_plan" }
    ],
    preterite: [
      { spanish: "Me acosté a medianoche.", english: "I went to bed at midnight.", subject: "yo", source: "late_bedtime_past" },
      { spanish: "Se acostó muy cansado.", english: "He went to bed very tired.", subject: "él", source: "tired_bedtime" }
    ]
  },

  DESPERTARSE: {
    present: [
      { spanish: "Me despierto a las siete.", english: "I wake up at seven.", subject: "yo", source: "morning_routine" },
      { spanish: "Te despiertas con el sol.", english: "You (informal) wake up with the sun.", subject: "tú", source: "natural_waking" },
      { spanish: "Se despierta muy temprano.", english: "He/She wakes up very early.", subject: "él", source: "early_waking" }
    ],
    "present-progressive": [
      { spanish: "Me estoy despertando.", english: "I am waking up.", subject: "yo", source: "waking_process" },
      { spanish: "Se está despertando lentamente.", english: "He/She is waking up slowly.", subject: "él", source: "gradual_waking" }
    ],
    "going-to": [
      { spanish: "Me voy a despertar temprano.", english: "I am going to wake up early.", subject: "yo", source: "early_wake_plan" },
      { spanish: "Te vas a despertar tarde.", english: "You (informal) are going to wake up late.", subject: "tú", source: "late_wake_plan" }
    ],
    preterite: [
      { spanish: "Me desperté a las seis.", english: "I woke up at six.", subject: "yo", source: "past_waking" },
      { spanish: "Se despertó con ruido.", english: "He/She woke up from noise.", subject: "él", source: "noise_waking" }
    ]
  },

  VESTIRSE: {
    present: [
      { spanish: "Me visto rápido.", english: "I get dressed quickly.", subject: "yo", source: "quick_dressing" },
      { spanish: "Te vistes muy bien.", english: "You (informal) dress very well.", subject: "tú", source: "good_dressing" },
      { spanish: "Se viste de negro.", english: "He/She dresses in black.", subject: "él", source: "color_preference" }
    ],
    "present-progressive": [
      { spanish: "Me estoy vistiendo.", english: "I am getting dressed.", subject: "yo", source: "dressing_action" },
      { spanish: "Se está vistiendo para la fiesta.", english: "He/She is getting dressed for the party.", subject: "él", source: "party_preparation" }
    ],
    "going-to": [
      { spanish: "Me voy a vestir elegante.", english: "I am going to dress elegantly.", subject: "yo", source: "elegant_dressing_plan" },
      { spanish: "Te vas a vestir cómodo.", english: "You (informal) are going to dress comfortably.", subject: "tú", source: "comfortable_dressing" }
    ],
    preterite: [
      { spanish: "Me vestí con prisa.", english: "I got dressed in a hurry.", subject: "yo", source: "rushed_dressing" },
      { spanish: "Se vistió muy elegante.", english: "He/She dressed very elegantly.", subject: "él", source: "elegant_past_dressing" }
    ]
  },

  LEVANTARSE: {
    present: [
      { spanish: "Me levanto temprano.", english: "I get up early.", subject: "yo", source: "early_rising" },
      { spanish: "Te levantas de la cama.", english: "You (informal) get up from bed.", subject: "tú", source: "bed_rising" },
      { spanish: "Se levanta con energía.", english: "He/She gets up with energy.", subject: "él", source: "energetic_rising" }
    ],
    "present-progressive": [
      { spanish: "Me estoy levantando.", english: "I am getting up.", subject: "yo", source: "rising_action" },
      { spanish: "Se está levantando despacio.", english: "He/She is getting up slowly.", subject: "él", source: "slow_rising" }
    ],
    "going-to": [
      { spanish: "Me voy a levantar pronto.", english: "I am going to get up soon.", subject: "yo", source: "rising_plan" },
      { spanish: "Te vas a levantar tarde.", english: "You (informal) are going to get up late.", subject: "tú", source: "late_rising_plan" }
    ],
    preterite: [
      { spanish: "Me levanté a las cinco.", english: "I got up at five.", subject: "yo", source: "very_early_rising" },
      { spanish: "Se levantó con dolor.", english: "He/She got up with pain.", subject: "él", source: "painful_rising" }
    ]
  },

  // NON-REFLEXIVE ESSENTIAL VERBS
  VER: {
    present: [
      { spanish: "Veo la televisión.", english: "I watch television.", subject: "yo", source: "tv_watching" },
      { spanish: "Ves películas.", english: "You (informal) watch movies.", subject: "tú", source: "movie_watching" },
      { spanish: "Ve a sus amigos.", english: "He/She sees his/her friends.", subject: "él", source: "friend_meeting" }
    ],
    "present-progressive": [
      { spanish: "Estoy viendo las noticias.", english: "I am watching the news.", subject: "yo", source: "news_watching" },
      { spanish: "Está viendo un programa.", english: "He/She is watching a program.", subject: "él", source: "program_watching" }
    ],
    "going-to": [
      { spanish: "Voy a ver una película.", english: "I am going to watch a movie.", subject: "yo", source: "movie_plan" },
      { spanish: "Vas a ver a tu familia.", english: "You (informal) are going to see your family.", subject: "tú", source: "family_visit_plan" }
    ],
    preterite: [
      { spanish: "Vi un documental.", english: "I watched a documentary.", subject: "yo", source: "documentary_viewing" },
      { spanish: "Vio el partido.", english: "He/She watched the game.", subject: "él", source: "game_watching" }
    ]
  },

  DAR: {
    present: [
      { spanish: "Doy regalos.", english: "I give gifts.", subject: "yo", source: "gift_giving" },
      { spanish: "Das consejos.", english: "You (informal) give advice.", subject: "tú", source: "advice_giving" },
      { spanish: "Da las gracias.", english: "He/She gives thanks.", subject: "él", source: "gratitude_expression" }
    ],
    "present-progressive": [
      { spanish: "Estoy dando una clase.", english: "I am giving a class.", subject: "yo", source: "teaching_action" },
      { spanish: "Está dando un paseo.", english: "He/She is taking a walk.", subject: "él", source: "walking_action" }
    ],
    "going-to": [
      { spanish: "Voy a dar un regalo.", english: "I am going to give a gift.", subject: "yo", source: "gift_plan" },
      { spanish: "Vas a dar una fiesta.", english: "You (informal) are going to throw a party.", subject: "tú", source: "party_plan" }
    ],
    preterite: [
      { spanish: "Di mi opinión.", english: "I gave my opinion.", subject: "yo", source: "opinion_sharing" },
      { spanish: "Dio una sorpresa.", english: "He/She gave a surprise.", subject: "él", source: "surprise_giving" }
    ]
  },

  DECIR: {
    present: [
      { spanish: "Digo la verdad.", english: "I tell the truth.", subject: "yo", source: "truth_telling" },
      { spanish: "Dices cosas interesantes.", english: "You (informal) say interesting things.", subject: "tú", source: "interesting_speech" },
      { spanish: "Dice buenos chistes.", english: "He/She tells good jokes.", subject: "él", source: "joke_telling" }
    ],
    "present-progressive": [
      { spanish: "Estoy diciendo algo importante.", english: "I am saying something important.", subject: "yo", source: "important_speech" },
      { spanish: "Está diciendo la verdad.", english: "He/She is telling the truth.", subject: "él", source: "truth_speaking" }
    ],
    "going-to": [
      { spanish: "Voy a decir mi nombre.", english: "I am going to say my name.", subject: "yo", source: "name_introduction" },
      { spanish: "Vas a decir que sí.", english: "You (informal) are going to say yes.", subject: "tú", source: "affirmative_response" }
    ],
    preterite: [
      { spanish: "Dije hola.", english: "I said hello.", subject: "yo", source: "greeting" },
      { spanish: "Dijo adiós.", english: "He/She said goodbye.", subject: "él", source: "farewell" }
    ]
  },

  SABER: {
    present: [
      { spanish: "Sé español.", english: "I know Spanish.", subject: "yo", source: "language_knowledge" },
      { spanish: "Sabes cocinar.", english: "You (informal) know how to cook.", subject: "tú", source: "cooking_skill" },
      { spanish: "Sabe la respuesta.", english: "He/She knows the answer.", subject: "él", source: "answer_knowledge" }
    ],
    "present-progressive": [
      { spanish: "Estoy aprendiendo más.", english: "I am learning more.", subject: "yo", source: "learning_process" },
      { spanish: "Está descubriendo la verdad.", english: "He/She is discovering the truth.", subject: "él", source: "truth_discovery" }
    ],
    "going-to": [
      { spanish: "Voy a saber manejar.", english: "I am going to know how to drive.", subject: "yo", source: "driving_skill_plan" },
      { spanish: "Vas a saber nadar.", english: "You (informal) are going to know how to swim.", subject: "tú", source: "swimming_skill_plan" }
    ],
    preterite: [
      { spanish: "Supe la noticia.", english: "I found out the news.", subject: "yo", source: "news_discovery" },
      { spanish: "Supo la verdad.", english: "He/She found out the truth.", subject: "él", source: "truth_discovery_past" }
    ]
  },

  ENCONTRAR: {
    present: [
      { spanish: "Encuentro mis llaves.", english: "I find my keys.", subject: "yo", source: "key_finding" },
      { spanish: "Encuentras buenas ofertas.", english: "You (informal) find good deals.", subject: "tú", source: "deal_finding" },
      { spanish: "Encuentra tiempo libre.", english: "He/She finds free time.", subject: "él", source: "time_finding" }
    ],
    "present-progressive": [
      { spanish: "Estoy encontrando problemas.", english: "I am finding problems.", subject: "yo", source: "problem_discovery" },
      { spanish: "Está encontrando soluciones.", english: "He/She is finding solutions.", subject: "él", source: "solution_discovery" }
    ],
    "going-to": [
      { spanish: "Voy a encontrar trabajo.", english: "I am going to find work.", subject: "yo", source: "job_search_plan" },
      { spanish: "Vas a encontrar amor.", english: "You (informal) are going to find love.", subject: "tú", source: "love_finding_plan" }
    ],
    preterite: [
      { spanish: "Encontré dinero.", english: "I found money.", subject: "yo", source: "money_discovery" },
      { spanish: "Encontró una solución.", english: "He/She found a solution.", subject: "él", source: "solution_discovery_past" }
    ]
  }
};

// Process each verb and tense
Object.keys(tier2ExpansionTemplates).forEach(verbName => {
  const verb = tier2Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in Tier 2 corpus`);
    return;
  }

  const verbTemplates = tier2ExpansionTemplates[verbName];
  
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
          verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
          `subject:${sentence.subject}`,
          `tense:${tense}`,
          "tier:2",
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
tier2Data.metadata.sentence_count = 
  Object.values(tier2Data.verbs).reduce((total, verb) => {
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
fs.writeFileSync(tier2Path, JSON.stringify(tier2Data, null, 2));

console.log('\n✅ TIER 2 MODERATE EXPANSION COMPLETE!');
console.log(`📊 Updated total sentence count: ${tier2Data.metadata.sentence_count}`);
console.log('\n🎯 Ready to test card generation!');
