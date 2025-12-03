#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level Preterite expansion templates - with correct irregular conjugations
const preteriteExpansionTemplates = {
  HABLAR: [
    { spanish: "Hablé con mi madre ayer.", english: "I spoke with my mother yesterday.", subject: "yo", source: "family_conversation" },
    { spanish: "Hablaste muy bien en la presentación.", english: "You (informal) spoke very well in the presentation.", subject: "tú", source: "presentation_success" },
    { spanish: "Ella habló por teléfono toda la noche.", english: "She talked on the phone all night.", subject: "ella", source: "long_phone_call" },
    { spanish: "Él habló con el doctor.", english: "He spoke with the doctor.", subject: "él", source: "medical_consultation" },
    { spanish: "Hablamos en español durante la clase.", english: "We spoke in Spanish during class.", subject: "nosotros", source: "classroom_practice" },
    { spanish: "Usted habló muy claro.", english: "You (formal) spoke very clearly.", subject: "usted", source: "clear_communication" },
    { spanish: "Hablasteis de vuestros planes.", english: "You all talked about your plans.", subject: "vosotros", source: "planning_discussion" },
    { spanish: "Ellos hablaron hasta muy tarde.", english: "They talked until very late.", subject: "ellos", source: "late_conversation" }
  ],
  
  COMER: [
    { spanish: "Comí pizza anoche.", english: "I ate pizza last night.", subject: "yo", source: "dinner_memory" },
    { spanish: "Comiste demasiado en la fiesta.", english: "You (informal) ate too much at the party.", subject: "tú", source: "party_overeating" },
    { spanish: "Ella comió en un restaurante italiano.", english: "She ate at an Italian restaurant.", subject: "ella", source: "italian_dining" },
    { spanish: "Él comió muy poco ayer.", english: "He ate very little yesterday.", subject: "él", source: "light_eating" },
    { spanish: "Comimos juntos el domingo.", english: "We ate together on Sunday.", subject: "nosotros", source: "family_meal" },
    { spanish: "Usted comió muy bien.", english: "You (formal) ate very well.", subject: "usted", source: "good_appetite" },
    { spanish: "Comisteis paella en Valencia.", english: "You all ate paella in Valencia.", subject: "vosotros", source: "spanish_cuisine" },
    { spanish: "Ellos comieron helado después de la cena.", english: "They ate ice cream after dinner.", subject: "ellos", source: "dessert_time" }
  ],
  
  VIVIR: [
    { spanish: "Viví en Madrid durante dos años.", english: "I lived in Madrid for two years.", subject: "yo", source: "past_residence" },
    { spanish: "Viviste una experiencia increíble.", english: "You (informal) lived an incredible experience.", subject: "tú", source: "amazing_experience" },
    { spanish: "Ella vivió sola por primera vez.", english: "She lived alone for the first time.", subject: "ella", source: "independence_milestone" },
    { spanish: "Él vivió con sus abuelos.", english: "He lived with his grandparents.", subject: "él", source: "family_arrangement" },
    { spanish: "Vivimos momentos muy felices.", english: "We lived very happy moments.", subject: "nosotros", source: "happy_memories" },
    { spanish: "Usted vivió en el extranjero.", english: "You (formal) lived abroad.", subject: "usted", source: "international_experience" },
    { spanish: "Vivisteis cerca de la playa.", english: "You all lived near the beach.", subject: "vosotros", source: "coastal_living" },
    { spanish: "Ellos vivieron una aventura.", english: "They lived an adventure.", subject: "ellos", source: "adventure_experience" }
  ],
  
  IR: [
    { spanish: "Fui al médico la semana pasada.", english: "I went to the doctor last week.", subject: "yo", source: "medical_visit" },
    { spanish: "Fuiste a la universidad.", english: "You (informal) went to university.", subject: "tú", source: "education_journey" },
    { spanish: "Ella fue de compras.", english: "She went shopping.", subject: "ella", source: "shopping_trip" },
    { spanish: "Él fue en tren a Barcelona.", english: "He went by train to Barcelona.", subject: "él", source: "train_travel" },
    { spanish: "Fuimos al cine anoche.", english: "We went to the movies last night.", subject: "nosotros", source: "entertainment_outing" },
    { spanish: "Usted fue muy amable.", english: "You (formal) were very kind.", subject: "usted", source: "kindness_appreciation" },
    { spanish: "Fuisteis a la playa.", english: "You all went to the beach.", subject: "vosotros", source: "beach_trip" },
    { spanish: "Ellos fueron juntos.", english: "They went together.", subject: "ellos", source: "group_travel" }
  ],
  
  PODER: [
    { spanish: "Pude terminar el proyecto.", english: "I was able to finish the project.", subject: "yo", source: "project_completion" },
    { spanish: "Pudiste resolver el problema.", english: "You (informal) were able to solve the problem.", subject: "tú", source: "problem_solving" },
    { spanish: "Ella pudo venir a la fiesta.", english: "She was able to come to the party.", subject: "ella", source: "party_attendance" },
    { spanish: "Él pudo ayudar a su hermano.", english: "He was able to help his brother.", subject: "él", source: "family_assistance" },
    { spanish: "Pudimos salir temprano.", english: "We were able to leave early.", subject: "nosotros", source: "early_departure" },
    { spanish: "Usted pudo descansar.", english: "You (formal) were able to rest.", subject: "usted", source: "rest_opportunity" },
    { spanish: "Pudisteis ver la película.", english: "You all were able to see the movie.", subject: "vosotros", source: "movie_viewing" },
    { spanish: "Ellos pudieron estudiar juntos.", english: "They were able to study together.", subject: "ellos", source: "group_study" }
  ],
  
  QUERER: [
    { spanish: "Quise llamarte ayer.", english: "I wanted to call you yesterday.", subject: "yo", source: "communication_attempt" },
    { spanish: "Quisiste venir pero no pudiste.", english: "You (informal) wanted to come but couldn't.", subject: "tú", source: "frustrated_intention" },
    { spanish: "Ella quiso estudiar medicina.", english: "She wanted to study medicine.", subject: "ella", source: "career_aspiration" },
    { spanish: "Él quiso ayudar.", english: "He wanted to help.", subject: "él", source: "helpful_intention" },
    { spanish: "Quisimos quedarnos más tiempo.", english: "We wanted to stay longer.", subject: "nosotros", source: "extended_visit" },
    { spanish: "Usted quiso hablar conmigo.", english: "You (formal) wanted to speak with me.", subject: "usted", source: "conversation_request" },
    { spanish: "Quisisteis ir al concierto.", english: "You all wanted to go to the concert.", subject: "vosotros", source: "concert_desire" },
    { spanish: "Ellos quisieron celebrar.", english: "They wanted to celebrate.", subject: "ellos", source: "celebration_desire" }
  ],
  
  TENER: [
    { spanish: "Tuve una reunión importante.", english: "I had an important meeting.", subject: "yo", source: "business_meeting" },
    { spanish: "Tuviste suerte en el examen.", english: "You (informal) had luck on the exam.", subject: "tú", source: "exam_fortune" },
    { spanish: "Ella tuvo un bebé.", english: "She had a baby.", subject: "ella", source: "childbirth" },
    { spanish: "Él tuvo problemas con el coche.", english: "He had problems with the car.", subject: "él", source: "car_trouble" },
    { spanish: "Tuvimos una fiesta increíble.", english: "We had an incredible party.", subject: "nosotros", source: "memorable_celebration" },
    { spanish: "Usted tuvo razón.", english: "You (formal) were right.", subject: "usted", source: "correct_judgment" },
    { spanish: "Tuvisteis tiempo para descansar.", english: "You all had time to rest.", subject: "vosotros", source: "rest_time" },
    { spanish: "Ellos tuvieron éxito.", english: "They had success.", subject: "ellos", source: "achievement" }
  ],
  
  SER: [
    { spanish: "Fui estudiante de medicina.", english: "I was a medical student.", subject: "yo", source: "past_identity" },
    { spanish: "Fuiste muy inteligente.", english: "You (informal) were very intelligent.", subject: "tú", source: "intelligence_compliment" },
    { spanish: "Ella fue mi profesora.", english: "She was my teacher.", subject: "ella", source: "educational_relationship" },
    { spanish: "Él fue el ganador.", english: "He was the winner.", subject: "él", source: "competition_victory" },
    { spanish: "Fuimos compañeros de clase.", english: "We were classmates.", subject: "nosotros", source: "school_relationship" },
    { spanish: "Usted fue muy amable.", english: "You (formal) were very kind.", subject: "usted", source: "kindness_memory" },
    { spanish: "Fuisteis los mejores.", english: "You all were the best.", subject: "vosotros", source: "excellence_recognition" },
    { spanish: "Ellos fueron mis amigos.", english: "They were my friends.", subject: "ellos", source: "friendship_memory" }
  ],
  
  ESTAR: [
    { spanish: "Estuve en casa todo el día.", english: "I was at home all day.", subject: "yo", source: "home_day" },
    { spanish: "Estuviste muy ocupado.", english: "You (informal) were very busy.", subject: "tú", source: "busy_period" },
    { spanish: "Ella estuvo enferma.", english: "She was sick.", subject: "ella", source: "illness_period" },
    { spanish: "Él estuvo en París.", english: "He was in Paris.", subject: "él", source: "travel_experience" },
    { spanish: "Estuvimos listos a tiempo.", english: "We were ready on time.", subject: "nosotros", source: "punctual_preparation" },
    { spanish: "Usted estuvo muy bien.", english: "You (formal) were very well.", subject: "usted", source: "wellness_state" },
    { spanish: "Estuvisteis contentos.", english: "You all were happy.", subject: "vosotros", source: "happiness_state" },
    { spanish: "Ellos estuvieron aquí ayer.", english: "They were here yesterday.", subject: "ellos", source: "past_presence" }
  ],
  
  HACER: [
    { spanish: "Hice la tarea anoche.", english: "I did homework last night.", subject: "yo", source: "homework_completion" },
    { spanish: "Hiciste un buen trabajo.", english: "You (informal) did good work.", subject: "tú", source: "work_accomplishment" },
    { spanish: "Ella hizo la comida.", english: "She made the food.", subject: "ella", source: "cooking_task" },
    { spanish: "Él hizo ejercicio.", english: "He exercised.", subject: "él", source: "fitness_activity" },
    { spanish: "Hicimos planes para el verano.", english: "We made plans for summer.", subject: "nosotros", source: "summer_planning" },
    { spanish: "Usted hizo una pregunta.", english: "You (formal) asked a question.", subject: "usted", source: "inquiry_action" },
    { spanish: "Hicisteis ruido.", english: "You all made noise.", subject: "vosotros", source: "noise_incident" },
    { spanish: "Ellos hicieron deporte.", english: "They did sports.", subject: "ellos", source: "sports_activity" }
  ]
};

console.log('🚀 EXPANDING TIER 1 PRETERITE SENTENCES\n');
console.log('Note: Using correct irregular conjugations for IR, SER, TENER, HACER, ESTAR, PODER, QUERER\n');

// Add new sentences to all verbs
Object.keys(preteriteExpansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb['preterite'] || [];
  const newSentences = preteriteExpansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:preterite",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb['preterite'] = [...currentSentences, ...enhancedNewSentences];
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

console.log('\n✅ PRETERITE EXPANSION COMPLETE!');

// Count new preterite sentences
const newPreteriteTotal = Object.keys(preteriteExpansionTemplates).reduce((total, verbName) => {
  const verb = tier1Data.verbs[verbName];
  return total + (verb['preterite']?.length || 0);
}, 0);

console.log(`📊 Total Preterite sentences: ${newPreteriteTotal}`);
console.log(`📈 Updated total sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 Ready for ChatGPT review!');
