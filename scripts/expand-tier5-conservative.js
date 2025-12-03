#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 5 corpus
const tier5Path = path.join(__dirname, '../data/corpus/tier5-complete.json');
const tier5Data = JSON.parse(fs.readFileSync(tier5Path, 'utf8'));

console.log('🚀 EXPANDING TIER 5 - CONSERVATIVE EXPANSION (3 sentences per verb per tense)\n');
console.log('Gustar-type verbs: Special grammar with indirect object pronouns\n');
console.log('Focus: Present, Going-to Future, Present Perfect (avoiding progressive due to complexity)\n');

// Tier 5 expansion templates - focusing on gustar-type verb patterns
const tier5ExpansionTemplates = {
  GUSTAR: {
    present: [
      { spanish: "Me gusta el chocolate.", english: "I like chocolate.", subject: "me", source: "chocolate_preference" },
      { spanish: "Te gustan los deportes.", english: "You (informal) like sports.", subject: "te", source: "sports_preference" },
      { spanish: "Le gusta viajar.", english: "He/She likes to travel.", subject: "le", source: "travel_preference" }
    ],
    "going-to": [
      { spanish: "Me va a gustar la película.", english: "I am going to like the movie.", subject: "me", source: "movie_prediction" },
      { spanish: "Te van a gustar mis amigos.", english: "You (informal) are going to like my friends.", subject: "te", source: "friend_prediction" }
    ],
    "present-perfect": [
      { spanish: "Me ha gustado mucho el libro.", english: "I have really liked the book.", subject: "me", source: "book_enjoyment" },
      { spanish: "Le han gustado las clases.", english: "He/She has liked the classes.", subject: "le", source: "class_enjoyment" }
    ]
  },

  DOLER: {
    present: [
      { spanish: "Me duele la cabeza.", english: "My head hurts.", subject: "me", source: "headache" },
      { spanish: "Te duelen los pies.", english: "Your feet hurt.", subject: "te", source: "foot_pain" },
      { spanish: "Le duele el estómago.", english: "His/Her stomach hurts.", subject: "le", source: "stomach_pain" }
    ],
    "going-to": [
      { spanish: "Me va a doler la espalda.", english: "My back is going to hurt.", subject: "me", source: "back_pain_prediction" },
      { spanish: "Te van a doler las piernas.", english: "Your legs are going to hurt.", subject: "te", source: "leg_pain_prediction" }
    ],
    "present-perfect": [
      { spanish: "Me ha dolido todo el día.", english: "It has hurt me all day.", subject: "me", source: "all_day_pain" },
      { spanish: "Le han dolido los ojos.", english: "His/Her eyes have hurt.", subject: "le", source: "eye_pain" }
    ]
  },

  ENCANTAR: {
    present: [
      { spanish: "Me encanta la música.", english: "I love music.", subject: "me", source: "music_love" },
      { spanish: "Te encantan las flores.", english: "You (informal) love flowers.", subject: "te", source: "flower_love" },
      { spanish: "Le encanta cocinar.", english: "He/She loves to cook.", subject: "le", source: "cooking_love" }
    ],
    "going-to": [
      { spanish: "Me va a encantar París.", english: "I am going to love Paris.", subject: "me", source: "paris_love_prediction" },
      { spanish: "Te van a encantar mis padres.", english: "You (informal) are going to love my parents.", subject: "te", source: "parent_love_prediction" }
    ],
    "present-perfect": [
      { spanish: "Me ha encantado conocerte.", english: "I have loved meeting you.", subject: "me", source: "meeting_joy" },
      { spanish: "Le han encantado los regalos.", english: "He/She has loved the gifts.", subject: "le", source: "gift_love" }
    ]
  },

  MOLESTAR: {
    present: [
      { spanish: "Me molesta el ruido.", english: "The noise bothers me.", subject: "me", source: "noise_annoyance" },
      { spanish: "Te molestan las interrupciones.", english: "Interruptions bother you (informal).", subject: "te", source: "interruption_annoyance" },
      { spanish: "Le molesta esperar.", english: "Waiting bothers him/her.", subject: "le", source: "waiting_annoyance" }
    ],
    "going-to": [
      { spanish: "Me va a molestar el calor.", english: "The heat is going to bother me.", subject: "me", source: "heat_annoyance_prediction" },
      { spanish: "Te van a molestar los mosquitos.", english: "The mosquitoes are going to bother you (informal).", subject: "te", source: "mosquito_annoyance" }
    ],
    "present-perfect": [
      { spanish: "Me ha molestado su actitud.", english: "His/Her attitude has bothered me.", subject: "me", source: "attitude_annoyance" },
      { spanish: "Le han molestado los comentarios.", english: "The comments have bothered him/her.", subject: "le", source: "comment_annoyance" }
    ]
  },

  IMPORTAR: {
    present: [
      { spanish: "Me importa tu opinión.", english: "Your opinion matters to me.", subject: "me", source: "opinion_importance" },
      { spanish: "Te importan los resultados.", english: "The results matter to you (informal).", subject: "te", source: "result_importance" },
      { spanish: "Le importa la familia.", english: "Family matters to him/her.", subject: "le", source: "family_importance" }
    ],
    "going-to": [
      { spanish: "Me va a importar el precio.", english: "The price is going to matter to me.", subject: "me", source: "price_importance" },
      { spanish: "Te van a importar las consecuencias.", english: "The consequences are going to matter to you (informal).", subject: "te", source: "consequence_importance" }
    ],
    "present-perfect": [
      { spanish: "Me ha importado siempre la verdad.", english: "The truth has always mattered to me.", subject: "me", source: "truth_importance" },
      { spanish: "Le han importado los detalles.", english: "The details have mattered to him/her.", subject: "le", source: "detail_importance" }
    ]
  },

  FALTAR: {
    present: [
      { spanish: "Me falta dinero.", english: "I lack money.", subject: "me", source: "money_lack" },
      { spanish: "Te faltan cinco minutos.", english: "You (informal) need five more minutes.", subject: "te", source: "time_shortage" },
      { spanish: "Le falta experiencia.", english: "He/She lacks experience.", subject: "le", source: "experience_lack" }
    ],
    "going-to": [
      { spanish: "Me va a faltar tiempo.", english: "I am going to lack time.", subject: "me", source: "time_shortage_prediction" },
      { spanish: "Te van a faltar ingredientes.", english: "You (informal) are going to lack ingredients.", subject: "te", source: "ingredient_shortage" }
    ],
    "present-perfect": [
      { spanish: "Me ha faltado valor.", english: "I have lacked courage.", subject: "me", source: "courage_lack" },
      { spanish: "Le han faltado oportunidades.", english: "He/She has lacked opportunities.", subject: "le", source: "opportunity_lack" }
    ]
  },

  PARECER: {
    present: [
      { spanish: "Me parece interesante.", english: "It seems interesting to me.", subject: "me", source: "interesting_opinion" },
      { spanish: "Te parece difícil.", english: "It seems difficult to you (informal).", subject: "te", source: "difficulty_opinion" },
      { spanish: "Le parece buena idea.", english: "It seems like a good idea to him/her.", subject: "le", source: "good_idea_opinion" }
    ],
    "going-to": [
      { spanish: "Me va a parecer extraño.", english: "It is going to seem strange to me.", subject: "me", source: "strangeness_prediction" },
      { spanish: "Te van a parecer caros.", english: "They are going to seem expensive to you (informal).", subject: "te", source: "expense_prediction" }
    ],
    "present-perfect": [
      { spanish: "Me ha parecido muy amable.", english: "He/She has seemed very kind to me.", subject: "me", source: "kindness_impression" },
      { spanish: "Le han parecido correctas.", english: "They have seemed correct to him/her.", subject: "le", source: "correctness_impression" }
    ]
  }
};

// Process each verb and tense (only the 3 pedagogically appropriate tenses)
const allowedTenses = ['present', 'going-to', 'present-perfect'];

Object.keys(tier5ExpansionTemplates).forEach(verbName => {
  const verb = tier5Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in Tier 5 corpus`);
    return;
  }

  const verbTemplates = tier5ExpansionTemplates[verbName];
  
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
          "tier:5",
          verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:gustar",
          "word-type:verb"
        ]
      }));
      
      // Combine existing and new sentences
      verb[tense] = [...currentSentences, ...enhancedNewSentences];
    }
  });
});

// Update metadata
tier5Data.metadata.sentence_count = 
  Object.values(tier5Data.verbs).reduce((total, verb) => {
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
fs.writeFileSync(tier5Path, JSON.stringify(tier5Data, null, 2));

console.log('\n✅ TIER 5 CONSERVATIVE EXPANSION COMPLETE!');
console.log(`📊 Updated total sentence count: ${tier5Data.metadata.sentence_count}`);
console.log('\n🎯 Ready to test card generation!');
