#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level Going-To Future expansion templates - ALL verbs work with "ir a + infinitive"
const goingToExpansionTemplates = {
  HABLAR: [
    { spanish: "Voy a hablar con el profesor.", english: "I am going to talk with the teacher.", subject: "yo", source: "school_meeting" },
    { spanish: "Vas a hablar en público.", english: "You (informal) are going to speak in public.", subject: "tú", source: "public_speaking" },
    { spanish: "Ella va a hablar mañana.", english: "She is going to speak tomorrow.", subject: "ella", source: "future_presentation" },
    { spanish: "Él va a hablar por teléfono.", english: "He is going to talk on the phone.", subject: "él", source: "phone_call_plan" },
    { spanish: "Vamos a hablar después.", english: "We are going to talk later.", subject: "nosotros", source: "delayed_conversation" },
    { spanish: "Usted va a hablar muy bien.", english: "You (formal) are going to speak very well.", subject: "usted", source: "encouragement" },
    { spanish: "Vais a hablar en español.", english: "You all are going to speak in Spanish.", subject: "vosotros", source: "language_practice" }
  ],
  
  COMER: [
    { spanish: "Voy a comer pizza esta noche.", english: "I am going to eat pizza tonight.", subject: "yo", source: "dinner_plan" },
    { spanish: "Vas a comer con nosotros.", english: "You (informal) are going to eat with us.", subject: "tú", source: "meal_invitation" },
    { spanish: "Ella va a comer saludable.", english: "She is going to eat healthy.", subject: "ella", source: "diet_plan" },
    { spanish: "Él va a comer en el restaurante.", english: "He is going to eat at the restaurant.", subject: "él", source: "dining_out_plan" },
    { spanish: "Vamos a comer juntos.", english: "We are going to eat together.", subject: "nosotros", source: "group_meal_plan" },
    { spanish: "Usted va a comer muy bien.", english: "You (formal) are going to eat very well.", subject: "usted", source: "good_meal_promise" },
    { spanish: "Vais a comer paella.", english: "You all are going to eat paella.", subject: "vosotros", source: "spanish_cuisine" }
  ],
  
  VIVIR: [
    { spanish: "Voy a vivir en España.", english: "I am going to live in Spain.", subject: "yo", source: "relocation_plan" },
    { spanish: "Vas a vivir solo.", english: "You (informal) are going to live alone.", subject: "tú", source: "independence_plan" },
    { spanish: "Ella va a vivir cerca del trabajo.", english: "She is going to live near work.", subject: "ella", source: "convenient_housing" },
    { spanish: "Él va a vivir con amigos.", english: "He is going to live with friends.", subject: "él", source: "shared_living_plan" },
    { spanish: "Vamos a vivir mejor.", english: "We are going to live better.", subject: "nosotros", source: "life_improvement" },
    { spanish: "Usted va a vivir muchos años.", english: "You (formal) are going to live many years.", subject: "usted", source: "longevity_wish" },
    { spanish: "Vais a vivir una aventura.", english: "You all are going to live an adventure.", subject: "vosotros", source: "exciting_experience" }
  ],
  
  IR: [
    { spanish: "Voy a ir al médico.", english: "I am going to go to the doctor.", subject: "yo", source: "medical_appointment" },
    { spanish: "Vas a ir en tren.", english: "You (informal) are going to go by train.", subject: "tú", source: "travel_method" },
    { spanish: "Ella va a ir temprano.", english: "She is going to go early.", subject: "ella", source: "early_departure" },
    { spanish: "Él va a ir conmigo.", english: "He is going to go with me.", subject: "él", source: "companion_travel" },
    { spanish: "Vamos a ir de vacaciones.", english: "We are going to go on vacation.", subject: "nosotros", source: "holiday_plan" },
    { spanish: "Usted va a ir por la mañana.", english: "You (formal) are going to go in the morning.", subject: "usted", source: "morning_schedule" },
    { spanish: "Vais a ir juntos.", english: "You all are going to go together.", subject: "vosotros", source: "group_travel_plan" }
  ],
  
  PODER: [
    { spanish: "Voy a poder ayudarte.", english: "I am going to be able to help you.", subject: "yo", source: "future_assistance" },
    { spanish: "Vas a poder hacerlo.", english: "You (informal) are going to be able to do it.", subject: "tú", source: "capability_assurance" },
    { spanish: "Ella va a poder venir.", english: "She is going to be able to come.", subject: "ella", source: "attendance_possibility" },
    { spanish: "Él va a poder estudiar.", english: "He is going to be able to study.", subject: "él", source: "study_opportunity" },
    { spanish: "Vamos a poder salir.", english: "We are going to be able to leave.", subject: "nosotros", source: "departure_possibility" },
    { spanish: "Usted va a poder descansar.", english: "You (formal) are going to be able to rest.", subject: "usted", source: "rest_opportunity" }
  ],
  
  QUERER: [
    { spanish: "Voy a querer más café.", english: "I am going to want more coffee.", subject: "yo", source: "future_desire" },
    { spanish: "Vas a querer venir con nosotros.", english: "You (informal) are going to want to come with us.", subject: "tú", source: "invitation_prediction" },
    { spanish: "Ella va a querer estudiar medicina.", english: "She is going to want to study medicine.", subject: "ella", source: "career_aspiration" },
    { spanish: "Él va a querer descansar.", english: "He is going to want to rest.", subject: "él", source: "rest_need_prediction" },
    { spanish: "Vamos a querer celebrar.", english: "We are going to want to celebrate.", subject: "nosotros", source: "celebration_anticipation" },
    { spanish: "Usted va a querer ver esto.", english: "You (formal) are going to want to see this.", subject: "usted", source: "interesting_show" },
    { spanish: "Vais a querer más tiempo.", english: "You all are going to want more time.", subject: "vosotros", source: "time_need_prediction" }
  ],
  
  TENER: [
    { spanish: "Voy a tener una reunión.", english: "I am going to have a meeting.", subject: "yo", source: "scheduled_meeting" },
    { spanish: "Vas a tener suerte.", english: "You (informal) are going to have luck.", subject: "tú", source: "luck_prediction" },
    { spanish: "Ella va a tener un bebé.", english: "She is going to have a baby.", subject: "ella", source: "pregnancy_announcement" },
    { spanish: "Él va a tener tiempo.", english: "He is going to have time.", subject: "él", source: "time_availability" },
    { spanish: "Vamos a tener una fiesta.", english: "We are going to have a party.", subject: "nosotros", source: "party_plan" },
    { spanish: "Usted va a tener éxito.", english: "You (formal) are going to have success.", subject: "usted", source: "success_prediction" },
    { spanish: "Vais a tener problemas.", english: "You all are going to have problems.", subject: "vosotros", source: "trouble_warning" }
  ],
  
  SER: [
    { spanish: "Voy a ser médico.", english: "I am going to be a doctor.", subject: "yo", source: "career_goal" },
    { spanish: "Vas a ser muy feliz.", english: "You (informal) are going to be very happy.", subject: "tú", source: "happiness_prediction" },
    { spanish: "Ella va a ser profesora.", english: "She is going to be a teacher.", subject: "ella", source: "profession_plan" },
    { spanish: "Él va a ser padre.", english: "He is going to be a father.", subject: "él", source: "parenthood_announcement" },
    { spanish: "Vamos a ser amigos.", english: "We are going to be friends.", subject: "nosotros", source: "friendship_prediction" },
    { spanish: "Usted va a ser muy importante.", english: "You (formal) are going to be very important.", subject: "usted", source: "importance_prediction" },
    { spanish: "Vais a ser los mejores.", english: "You all are going to be the best.", subject: "vosotros", source: "excellence_prediction" }
  ],
  
  ESTAR: [
    { spanish: "Voy a estar en casa.", english: "I am going to be at home.", subject: "yo", source: "location_plan" },
    { spanish: "Vas a estar cansado.", english: "You (informal) are going to be tired.", subject: "tú", source: "fatigue_prediction" },
    { spanish: "Ella va a estar lista.", english: "She is going to be ready.", subject: "ella", source: "readiness_prediction" },
    { spanish: "Él va a estar aquí.", english: "He is going to be here.", subject: "él", source: "presence_confirmation" },
    { spanish: "Vamos a estar ocupados.", english: "We are going to be busy.", subject: "nosotros", source: "busy_schedule" },
    { spanish: "Usted va a estar bien.", english: "You (formal) are going to be well.", subject: "usted", source: "wellness_assurance" },
    { spanish: "Vais a estar contentos.", english: "You all are going to be happy.", subject: "vosotros", source: "happiness_assurance" }
  ],
  
  HACER: [
    { spanish: "Voy a hacer la tarea.", english: "I am going to do homework.", subject: "yo", source: "homework_plan" },
    { spanish: "Vas a hacer ejercicio.", english: "You (informal) are going to exercise.", subject: "tú", source: "fitness_plan" },
    { spanish: "Ella va a hacer la comida.", english: "She is going to make food.", subject: "ella", source: "cooking_plan" },
    { spanish: "Él va a hacer un viaje.", english: "He is going to take a trip.", subject: "él", source: "travel_plan" },
    { spanish: "Vamos a hacer una fiesta.", english: "We are going to have a party.", subject: "nosotros", source: "party_organization" },
    { spanish: "Usted va a hacer un buen trabajo.", english: "You (formal) are going to do good work.", subject: "usted", source: "work_encouragement" },
    { spanish: "Vais a hacer deporte.", english: "You all are going to do sports.", subject: "vosotros", source: "sports_plan" }
  ]
};

console.log('🚀 EXPANDING TIER 1 GOING-TO FUTURE SENTENCES\n');
console.log('Note: All 10 verbs work naturally with "ir a + infinitive"\n');

// Add new sentences to all verbs
Object.keys(goingToExpansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb['going-to'] || [];
  const newSentences = goingToExpansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:going-to",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb['going-to'] = [...currentSentences, ...enhancedNewSentences];
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

console.log('\n✅ GOING-TO FUTURE EXPANSION COMPLETE!');

// Count new going-to sentences
const newGoingToTotal = Object.keys(goingToExpansionTemplates).reduce((total, verbName) => {
  const verb = tier1Data.verbs[verbName];
  return total + (verb['going-to']?.length || 0);
}, 0);

console.log(`📊 Total Going-To Future sentences: ${newGoingToTotal}`);
console.log(`📈 Updated total sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 Ready for ChatGPT review!');
