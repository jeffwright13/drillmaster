#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level Present-Perfect expansion templates - with correct past participles
const presentPerfectExpansionTemplates = {
  HABLAR: [
    { spanish: "He hablado con el director.", english: "I have spoken with the director.", subject: "yo", source: "director_meeting" },
    { spanish: "Has hablado muy bien hoy.", english: "You (informal) have spoken very well today.", subject: "tú", source: "daily_performance" },
    { spanish: "Ella ha hablado con sus padres.", english: "She has spoken with her parents.", subject: "ella", source: "family_communication" },
    { spanish: "Él ha hablado en público.", english: "He has spoken in public.", subject: "él", source: "public_speaking" },
    { spanish: "Hemos hablado de este tema.", english: "We have talked about this topic.", subject: "nosotros", source: "topic_discussion" },
    { spanish: "Usted ha hablado claramente.", english: "You (formal) have spoken clearly.", subject: "usted", source: "clear_expression" },
    { spanish: "Habéis hablado mucho.", english: "You all have talked a lot.", subject: "vosotros", source: "extensive_conversation" },
    { spanish: "Ellos han hablado español.", english: "They have spoken Spanish.", subject: "ellos", source: "language_practice" }
  ],
  
  COMER: [
    { spanish: "He comido demasiado.", english: "I have eaten too much.", subject: "yo", source: "overeating" },
    { spanish: "Has comido en ese restaurante.", english: "You (informal) have eaten at that restaurant.", subject: "tú", source: "restaurant_experience" },
    { spanish: "Ella ha comido sano.", english: "She has eaten healthy.", subject: "ella", source: "healthy_diet" },
    { spanish: "Él ha comido pizza.", english: "He has eaten pizza.", subject: "él", source: "pizza_consumption" },
    { spanish: "Hemos comido juntos.", english: "We have eaten together.", subject: "nosotros", source: "shared_meals" },
    { spanish: "Usted ha comido bien.", english: "You (formal) have eaten well.", subject: "usted", source: "good_eating" },
    { spanish: "Habéis comido paella.", english: "You all have eaten paella.", subject: "vosotros", source: "spanish_dish" },
    { spanish: "Ellos han comido helado.", english: "They have eaten ice cream.", subject: "ellos", source: "dessert_experience" }
  ],
  
  VIVIR: [
    { spanish: "He vivido en tres países.", english: "I have lived in three countries.", subject: "yo", source: "international_experience" },
    { spanish: "Has vivido una vida interesante.", english: "You (informal) have lived an interesting life.", subject: "tú", source: "life_assessment" },
    { spanish: "Ella ha vivido sola.", english: "She has lived alone.", subject: "ella", source: "independent_living" },
    { spanish: "Él ha vivido aquí siempre.", english: "He has always lived here.", subject: "él", source: "lifelong_residence" },
    { spanish: "Hemos vivido momentos difíciles.", english: "We have lived through difficult moments.", subject: "nosotros", source: "challenging_times" },
    { spanish: "Usted ha vivido muchas experiencias.", english: "You (formal) have lived many experiences.", subject: "usted", source: "rich_experience" },
    { spanish: "Habéis vivido en el campo.", english: "You all have lived in the countryside.", subject: "vosotros", source: "rural_experience" },
    { spanish: "Ellos han vivido bien.", english: "They have lived well.", subject: "ellos", source: "good_life" }
  ],
  
  IR: [
    { spanish: "He ido al médico.", english: "I have gone to the doctor.", subject: "yo", source: "medical_visits" },
    { spanish: "Has ido a la universidad.", english: "You (informal) have gone to university.", subject: "tú", source: "education_experience" },
    { spanish: "Ella ha ido de compras.", english: "She has gone shopping.", subject: "ella", source: "shopping_experience" },
    { spanish: "Él ha ido en avión.", english: "He has gone by plane.", subject: "él", source: "air_travel" },
    { spanish: "Hemos ido al cine.", english: "We have gone to the movies.", subject: "nosotros", source: "cinema_visits" },
    { spanish: "Usted ha ido lejos.", english: "You (formal) have gone far.", subject: "usted", source: "distant_travel" },
    { spanish: "Habéis ido juntos.", english: "You all have gone together.", subject: "vosotros", source: "group_travel" },
    { spanish: "Ellos han ido temprano.", english: "They have gone early.", subject: "ellos", source: "early_departure" }
  ],
  
  PODER: [
    { spanish: "He podido terminar el trabajo.", english: "I have been able to finish the work.", subject: "yo", source: "work_completion" },
    { spanish: "Has podido resolver el problema.", english: "You (informal) have been able to solve the problem.", subject: "tú", source: "problem_resolution" },
    { spanish: "Ella ha podido venir.", english: "She has been able to come.", subject: "ella", source: "attendance_success" },
    { spanish: "Él ha podido estudiar.", english: "He has been able to study.", subject: "él", source: "study_opportunity" },
    { spanish: "Hemos podido descansar.", english: "We have been able to rest.", subject: "nosotros", source: "rest_achievement" },
    { spanish: "Usted ha podido ayudar.", english: "You (formal) have been able to help.", subject: "usted", source: "assistance_success" },
    { spanish: "Habéis podido salir.", english: "You all have been able to leave.", subject: "vosotros", source: "departure_success" },
    { spanish: "Ellos han podido ganar.", english: "They have been able to win.", subject: "ellos", source: "victory_achievement" }
  ],
  
  QUERER: [
    { spanish: "He querido llamarte.", english: "I have wanted to call you.", subject: "yo", source: "communication_desire" },
    { spanish: "Has querido venir.", english: "You (informal) have wanted to come.", subject: "tú", source: "visit_desire" },
    { spanish: "Ella ha querido estudiar.", english: "She has wanted to study.", subject: "ella", source: "academic_desire" },
    { spanish: "Él ha querido ayudar.", english: "He has wanted to help.", subject: "él", source: "helpful_desire" },
    { spanish: "Hemos querido viajar.", english: "We have wanted to travel.", subject: "nosotros", source: "travel_desire" },
    { spanish: "Usted ha querido descansar.", english: "You (formal) have wanted to rest.", subject: "usted", source: "rest_desire" },
    { spanish: "Habéis querido celebrar.", english: "You all have wanted to celebrate.", subject: "vosotros", source: "celebration_desire" },
    { spanish: "Ellos han querido participar.", english: "They have wanted to participate.", subject: "ellos", source: "participation_desire" }
  ],
  
  TENER: [
    { spanish: "He tenido suerte.", english: "I have had luck.", subject: "yo", source: "fortune_experience" },
    { spanish: "Has tenido problemas.", english: "You (informal) have had problems.", subject: "tú", source: "difficulty_experience" },
    { spanish: "Ella ha tenido éxito.", english: "She has had success.", subject: "ella", source: "success_experience" },
    { spanish: "Él ha tenido tiempo.", english: "He has had time.", subject: "él", source: "time_availability" },
    { spanish: "Hemos tenido una reunión.", english: "We have had a meeting.", subject: "nosotros", source: "meeting_experience" },
    { spanish: "Usted ha tenido razón.", english: "You (formal) have been right.", subject: "usted", source: "correctness_validation" },
    { spanish: "Habéis tenido suerte.", english: "You all have had luck.", subject: "vosotros", source: "group_fortune" },
    { spanish: "Ellos han tenido una fiesta.", english: "They have had a party.", subject: "ellos", source: "party_experience" }
  ],
  
  SER: [
    { spanish: "He sido estudiante.", english: "I have been a student.", subject: "yo", source: "educational_identity" },
    { spanish: "Has sido muy amable.", english: "You (informal) have been very kind.", subject: "tú", source: "kindness_recognition" },
    { spanish: "Ella ha sido profesora.", english: "She has been a teacher.", subject: "ella", source: "teaching_experience" },
    { spanish: "Él ha sido el mejor.", english: "He has been the best.", subject: "él", source: "excellence_recognition" },
    { spanish: "Hemos sido amigos.", english: "We have been friends.", subject: "nosotros", source: "friendship_history" },
    { spanish: "Usted ha sido muy paciente.", english: "You (formal) have been very patient.", subject: "usted", source: "patience_appreciation" },
    { spanish: "Habéis sido valientes.", english: "You all have been brave.", subject: "vosotros", source: "courage_recognition" },
    { spanish: "Ellos han sido buenos.", english: "They have been good.", subject: "ellos", source: "goodness_assessment" }
  ],
  
  ESTAR: [
    { spanish: "He estado ocupado.", english: "I have been busy.", subject: "yo", source: "busy_period" },
    { spanish: "Has estado enfermo.", english: "You (informal) have been sick.", subject: "tú", source: "illness_period" },
    { spanish: "Ella ha estado feliz.", english: "She has been happy.", subject: "ella", source: "happiness_period" },
    { spanish: "Él ha estado aquí.", english: "He has been here.", subject: "él", source: "presence_confirmation" },
    { spanish: "Hemos estado trabajando.", english: "We have been working.", subject: "nosotros", source: "work_period" },
    { spanish: "Usted ha estado bien.", english: "You (formal) have been well.", subject: "usted", source: "wellness_period" },
    { spanish: "Habéis estado estudiando.", english: "You all have been studying.", subject: "vosotros", source: "study_period" },
    { spanish: "Ellos han estado viajando.", english: "They have been traveling.", subject: "ellos", source: "travel_period" }
  ],
  
  HACER: [
    { spanish: "He hecho la tarea.", english: "I have done homework.", subject: "yo", source: "homework_completion" },
    { spanish: "Has hecho un buen trabajo.", english: "You (informal) have done good work.", subject: "tú", source: "work_quality" },
    { spanish: "Ella ha hecho la comida.", english: "She has made the food.", subject: "ella", source: "cooking_completion" },
    { spanish: "Él ha hecho ejercicio.", english: "He has exercised.", subject: "él", source: "fitness_activity" },
    { spanish: "Hemos hecho planes.", english: "We have made plans.", subject: "nosotros", source: "planning_completion" },
    { spanish: "Usted ha hecho una pregunta.", english: "You (formal) have asked a question.", subject: "usted", source: "inquiry_completion" },
    { spanish: "Habéis hecho ruido.", english: "You all have made noise.", subject: "vosotros", source: "noise_creation" },
    { spanish: "Ellos han hecho deporte.", english: "They have done sports.", subject: "ellos", source: "sports_participation" }
  ]
};

console.log('🚀 EXPANDING TIER 1 PRESENT-PERFECT SENTENCES\n');
console.log('Note: Using haber + past participle (hecho, ido, sido, etc.)\n');

// Add new sentences to all verbs
Object.keys(presentPerfectExpansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb['present-perfect'] || [];
  const newSentences = presentPerfectExpansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:present-perfect",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb['present-perfect'] = [...currentSentences, ...enhancedNewSentences];
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

console.log('\n✅ PRESENT-PERFECT EXPANSION COMPLETE!');

// Count new present-perfect sentences
const newPresentPerfectTotal = Object.keys(presentPerfectExpansionTemplates).reduce((total, verbName) => {
  const verb = tier1Data.verbs[verbName];
  return total + (verb['present-perfect']?.length || 0);
}, 0);

console.log(`📊 Total Present-Perfect sentences: ${newPresentPerfectTotal}`);
console.log(`📈 Updated total sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 Ready for ChatGPT review!');
