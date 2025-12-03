#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level gerund expansion templates - ONLY for gerund-friendly verbs
const gerundExpansionTemplates = {
  HABLAR: [
    { spanish: "Estoy hablando con mi madre.", english: "I am talking with my mother.", subject: "yo", source: "family_call" },
    { spanish: "Estás hablando muy rápido.", english: "You (informal) are speaking very fast.", subject: "tú", source: "speech_pace" },
    { spanish: "Ella está hablando por teléfono.", english: "She is talking on the phone.", subject: "ella", source: "phone_conversation" },
    { spanish: "Él está hablando en inglés.", english: "He is speaking in English.", subject: "él", source: "language_practice" },
    { spanish: "Estamos hablando del trabajo.", english: "We are talking about work.", subject: "nosotros", source: "work_discussion" },
    { spanish: "Usted está hablando muy bien.", english: "You (formal) are speaking very well.", subject: "usted", source: "language_compliment" },
    { spanish: "Estáis hablando en la cocina.", english: "You all are talking in the kitchen.", subject: "vosotros", source: "kitchen_chat" },
    { spanish: "Ellos están hablando de fútbol.", english: "They are talking about soccer.", subject: "ellos", source: "sports_discussion" },
    { spanish: "Ustedes están hablando español.", english: "You all are speaking Spanish.", subject: "ustedes", source: "language_learning" }
  ],
  
  COMER: [
    { spanish: "Estoy comiendo una manzana.", english: "I am eating an apple.", subject: "yo", source: "healthy_snack" },
    { spanish: "Estás comiendo muy despacio.", english: "You (informal) are eating very slowly.", subject: "tú", source: "eating_pace" },
    { spanish: "Ella está comiendo en el parque.", english: "She is eating in the park.", subject: "ella", source: "outdoor_meal" },
    { spanish: "Él está comiendo con sus amigos.", english: "He is eating with his friends.", subject: "él", source: "social_dining" },
    { spanish: "Estamos comiendo pizza.", english: "We are eating pizza.", subject: "nosotros", source: "casual_meal" },
    { spanish: "Usted está comiendo saludable.", english: "You (formal) are eating healthy.", subject: "usted", source: "healthy_eating" },
    { spanish: "Estáis comiendo en casa.", english: "You all are eating at home.", subject: "vosotros", source: "home_dining" },
    { spanish: "Ellos están comiendo helado.", english: "They are eating ice cream.", subject: "ellos", source: "dessert_time" },
    { spanish: "Ustedes están comiendo juntos.", english: "You all are eating together.", subject: "ustedes", source: "group_meal" }
  ],
  
  VIVIR: [
    { spanish: "Estoy viviendo en Madrid.", english: "I am living in Madrid.", subject: "yo", source: "current_residence" },
    { spanish: "Estás viviendo solo ahora.", english: "You (informal) are living alone now.", subject: "tú", source: "independent_living" },
    { spanish: "Ella está viviendo con amigos.", english: "She is living with friends.", subject: "ella", source: "shared_housing" },
    { spanish: "Él está viviendo cerca del trabajo.", english: "He is living near work.", subject: "él", source: "convenient_location" },
    { spanish: "Estamos viviendo una experiencia increíble.", english: "We are living an incredible experience.", subject: "nosotros", source: "life_experience" },
    { spanish: "Usted está viviendo en el centro.", english: "You (formal) are living downtown.", subject: "usted", source: "urban_living" },
    { spanish: "Estáis viviendo momentos difíciles.", english: "You all are living through difficult times.", subject: "vosotros", source: "challenging_period" },
    { spanish: "Ellos están viviendo en una casa nueva.", english: "They are living in a new house.", subject: "ellos", source: "new_home" },
    { spanish: "Ustedes están viviendo bien.", english: "You all are living well.", subject: "ustedes", source: "good_life" }
  ],
  
  IR: [
    { spanish: "Estoy yendo al supermercado.", english: "I am going to the supermarket.", subject: "yo", source: "shopping_trip" },
    { spanish: "Estás yendo muy rápido.", english: "You (informal) are going very fast.", subject: "tú", source: "speed_reference" },
    { spanish: "Ella está yendo a casa.", english: "She is going home.", subject: "ella", source: "return_journey" },
    { spanish: "Él está yendo en bicicleta.", english: "He is going by bicycle.", subject: "él", source: "bike_transport" },
    { spanish: "Estamos yendo al cine.", english: "We are going to the movies.", subject: "nosotros", source: "entertainment_outing" },
    { spanish: "Usted está yendo por el camino correcto.", english: "You (formal) are going the right way.", subject: "usted", source: "correct_direction" },
    { spanish: "Estáis yendo a la playa.", english: "You all are going to the beach.", subject: "vosotros", source: "beach_trip" },
    { spanish: "Ellos están yendo juntos.", english: "They are going together.", subject: "ellos", source: "group_travel" },
    { spanish: "Ustedes están yendo temprano.", english: "You all are going early.", subject: "ustedes", source: "early_departure" }
  ],
  
  TENER: [
    { spanish: "Estoy teniendo un buen día.", english: "I am having a good day.", subject: "yo", source: "positive_experience" },
    { spanish: "Estás teniendo problemas.", english: "You (informal) are having problems.", subject: "tú", source: "difficulty_situation" },
    { spanish: "Ella está teniendo una reunión.", english: "She is having a meeting.", subject: "ella", source: "business_meeting" },
    { spanish: "Él está teniendo suerte.", english: "He is having luck.", subject: "él", source: "fortunate_situation" },
    { spanish: "Estamos teniendo una fiesta.", english: "We are having a party.", subject: "nosotros", source: "celebration" },
    { spanish: "Usted está teniendo éxito.", english: "You (formal) are having success.", subject: "usted", source: "achievement" },
    { spanish: "Estáis teniendo una conversación.", english: "You all are having a conversation.", subject: "vosotros", source: "group_discussion" },
    { spanish: "Ellos están teniendo dificultades.", english: "They are having difficulties.", subject: "ellos", source: "challenging_time" },
    { spanish: "Ustedes están teniendo una experiencia única.", english: "You all are having a unique experience.", subject: "ustedes", source: "special_moment" }
  ],
  
  HACER: [
    { spanish: "Estoy haciendo la comida.", english: "I am making food.", subject: "yo", source: "cooking_activity" },
    { spanish: "Estás haciendo ejercicio.", english: "You (informal) are exercising.", subject: "tú", source: "fitness_activity" },
    { spanish: "Ella está haciendo la tarea.", english: "She is doing homework.", subject: "ella", source: "study_time" },
    { spanish: "Él está haciendo un proyecto.", english: "He is doing a project.", subject: "él", source: "work_project" },
    { spanish: "Estamos haciendo planes.", english: "We are making plans.", subject: "nosotros", source: "planning_session" },
    { spanish: "Usted está haciendo un buen trabajo.", english: "You (formal) are doing good work.", subject: "usted", source: "work_performance" },
    { spanish: "Estáis haciendo ruido.", english: "You all are making noise.", subject: "vosotros", source: "noise_making" },
    { spanish: "Ellos están haciendo deporte.", english: "They are doing sports.", subject: "ellos", source: "sports_activity" },
    { spanish: "Ustedes están haciendo algo importante.", english: "You all are doing something important.", subject: "ustedes", source: "important_task" }
  ]
};

console.log('🚀 EXPANDING TIER 1 PRESENT-PROGRESSIVE (GERUND) SENTENCES\n');
console.log('Note: Keeping PODER, QUERER, SER, ESTAR empty (linguistically correct)\n');

// Add new sentences to gerund-friendly verbs only
Object.keys(gerundExpansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb['present-progressive'] || [];
  const newSentences = gerundExpansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:present-progressive",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb['present-progressive'] = [...currentSentences, ...enhancedNewSentences];
});

// Update metadata
tier1Data.metadata.sentence_count = 
  Object.values(tier1Data.verbs).reduce((total, verb) => {
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
fs.writeFileSync(tier1Path, JSON.stringify(tier1Data, null, 2));

console.log('\n✅ GERUND EXPANSION COMPLETE!');

// Count new gerund sentences
const newGerundTotal = Object.keys(gerundExpansionTemplates).reduce((total, verbName) => {
  const verb = tier1Data.verbs[verbName];
  return total + (verb['present-progressive']?.length || 0);
}, 0);

console.log(`📊 Total Present-Progressive sentences: ${newGerundTotal}`);
console.log(`📈 Updated total sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 Ready for ChatGPT review!');
