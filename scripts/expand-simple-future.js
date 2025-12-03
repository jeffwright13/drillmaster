#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level Simple Future expansion templates - with correct irregular stems
const simpleFutureExpansionTemplates = {
  HABLAR: [
    { spanish: "Hablaré con el jefe mañana.", english: "I will speak with the boss tomorrow.", subject: "yo", source: "boss_meeting" },
    { spanish: "Hablarás muy bien español.", english: "You (informal) will speak Spanish very well.", subject: "tú", source: "language_progress" },
    { spanish: "Ella hablará en la conferencia.", english: "She will speak at the conference.", subject: "ella", source: "conference_presentation" },
    { spanish: "Él hablará por teléfono.", english: "He will talk on the phone.", subject: "él", source: "phone_conversation" },
    { spanish: "Hablaremos después de la clase.", english: "We will talk after class.", subject: "nosotros", source: "post_class_discussion" },
    { spanish: "Usted hablará con el doctor.", english: "You (formal) will speak with the doctor.", subject: "usted", source: "medical_consultation" },
    { spanish: "Hablaréis en público.", english: "You all will speak in public.", subject: "vosotros", source: "public_speaking" },
    { spanish: "Ellos hablarán español.", english: "They will speak Spanish.", subject: "ellos", source: "language_commitment" }
  ],
  
  COMER: [
    { spanish: "Comeré en casa esta noche.", english: "I will eat at home tonight.", subject: "yo", source: "dinner_plan" },
    { spanish: "Comerás con nosotros.", english: "You (informal) will eat with us.", subject: "tú", source: "meal_invitation" },
    { spanish: "Ella comerá saludable.", english: "She will eat healthy.", subject: "ella", source: "diet_commitment" },
    { spanish: "Él comerá en el restaurante.", english: "He will eat at the restaurant.", subject: "él", source: "dining_plan" },
    { spanish: "Comeremos juntos.", english: "We will eat together.", subject: "nosotros", source: "group_meal" },
    { spanish: "Usted comerá bien.", english: "You (formal) will eat well.", subject: "usted", source: "good_meal_promise" },
    { spanish: "Comeréis paella.", english: "You all will eat paella.", subject: "vosotros", source: "spanish_cuisine" },
    { spanish: "Ellos comerán temprano.", english: "They will eat early.", subject: "ellos", source: "early_dinner" }
  ],
  
  VIVIR: [
    { spanish: "Viviré en España.", english: "I will live in Spain.", subject: "yo", source: "relocation_plan" },
    { spanish: "Vivirás solo.", english: "You (informal) will live alone.", subject: "tú", source: "independence_future" },
    { spanish: "Ella vivirá cerca del trabajo.", english: "She will live near work.", subject: "ella", source: "convenient_housing" },
    { spanish: "Él vivirá con amigos.", english: "He will live with friends.", subject: "él", source: "shared_living" },
    { spanish: "Viviremos mejor.", english: "We will live better.", subject: "nosotros", source: "life_improvement" },
    { spanish: "Usted vivirá muchos años.", english: "You (formal) will live many years.", subject: "usted", source: "longevity_wish" },
    { spanish: "Viviréis una aventura.", english: "You all will live an adventure.", subject: "vosotros", source: "adventure_prediction" },
    { spanish: "Ellos vivirán felices.", english: "They will live happily.", subject: "ellos", source: "happiness_prediction" }
  ],
  
  IR: [
    { spanish: "Iré al médico.", english: "I will go to the doctor.", subject: "yo", source: "medical_appointment" },
    { spanish: "Irás en tren.", english: "You (informal) will go by train.", subject: "tú", source: "travel_method" },
    { spanish: "Ella irá de compras.", english: "She will go shopping.", subject: "ella", source: "shopping_plan" },
    { spanish: "Él irá temprano.", english: "He will go early.", subject: "él", source: "early_departure" },
    { spanish: "Iremos de vacaciones.", english: "We will go on vacation.", subject: "nosotros", source: "vacation_plan" },
    { spanish: "Usted irá conmigo.", english: "You (formal) will go with me.", subject: "usted", source: "companion_travel" },
    { spanish: "Iréis juntos.", english: "You all will go together.", subject: "vosotros", source: "group_travel" },
    { spanish: "Ellos irán en coche.", english: "They will go by car.", subject: "ellos", source: "car_travel" }
  ],
  
  PODER: [
    { spanish: "Podré ayudarte.", english: "I will be able to help you.", subject: "yo", source: "future_assistance" },
    { spanish: "Podrás hacerlo.", english: "You (informal) will be able to do it.", subject: "tú", source: "capability_confidence" },
    { spanish: "Ella podrá venir.", english: "She will be able to come.", subject: "ella", source: "attendance_possibility" },
    { spanish: "Él podrá estudiar.", english: "He will be able to study.", subject: "él", source: "study_opportunity" },
    { spanish: "Podremos salir.", english: "We will be able to leave.", subject: "nosotros", source: "departure_possibility" },
    { spanish: "Usted podrá descansar.", english: "You (formal) will be able to rest.", subject: "usted", source: "rest_opportunity" },
    { spanish: "Podréis jugar.", english: "You all will be able to play.", subject: "vosotros", source: "play_opportunity" },
    { spanish: "Ellos podrán ganar.", english: "They will be able to win.", subject: "ellos", source: "victory_possibility" }
  ],
  
  QUERER: [
    { spanish: "Querré más café.", english: "I will want more coffee.", subject: "yo", source: "coffee_desire" },
    { spanish: "Querrás venir.", english: "You (informal) will want to come.", subject: "tú", source: "visit_prediction" },
    { spanish: "Ella querrá estudiar.", english: "She will want to study.", subject: "ella", source: "academic_motivation" },
    { spanish: "Él querrá descansar.", english: "He will want to rest.", subject: "él", source: "rest_desire" },
    { spanish: "Querremos celebrar.", english: "We will want to celebrate.", subject: "nosotros", source: "celebration_anticipation" },
    { spanish: "Usted querrá ver esto.", english: "You (formal) will want to see this.", subject: "usted", source: "interesting_show" },
    { spanish: "Querréis más tiempo.", english: "You all will want more time.", subject: "vosotros", source: "time_need" },
    { spanish: "Ellos querrán participar.", english: "They will want to participate.", subject: "ellos", source: "participation_interest" }
  ],
  
  TENER: [
    { spanish: "Tendré una reunión.", english: "I will have a meeting.", subject: "yo", source: "scheduled_meeting" },
    { spanish: "Tendrás suerte.", english: "You (informal) will have luck.", subject: "tú", source: "luck_prediction" },
    { spanish: "Ella tendrá éxito.", english: "She will have success.", subject: "ella", source: "success_prediction" },
    { spanish: "Él tendrá tiempo.", english: "He will have time.", subject: "él", source: "time_availability" },
    { spanish: "Tendremos una fiesta.", english: "We will have a party.", subject: "nosotros", source: "party_plan" },
    { spanish: "Usted tendrá razón.", english: "You (formal) will be right.", subject: "usted", source: "correctness_prediction" },
    { spanish: "Tendréis problemas.", english: "You all will have problems.", subject: "vosotros", source: "trouble_warning" },
    { spanish: "Ellos tendrán hijos.", english: "They will have children.", subject: "ellos", source: "family_planning" }
  ],
  
  SER: [
    { spanish: "Seré médico.", english: "I will be a doctor.", subject: "yo", source: "career_goal" },
    { spanish: "Serás muy feliz.", english: "You (informal) will be very happy.", subject: "tú", source: "happiness_prediction" },
    { spanish: "Ella será profesora.", english: "She will be a teacher.", subject: "ella", source: "profession_plan" },
    { spanish: "Él será padre.", english: "He will be a father.", subject: "él", source: "parenthood_future" },
    { spanish: "Seremos amigos.", english: "We will be friends.", subject: "nosotros", source: "friendship_prediction" },
    { spanish: "Usted será muy importante.", english: "You (formal) will be very important.", subject: "usted", source: "importance_prediction" },
    { spanish: "Seréis los mejores.", english: "You all will be the best.", subject: "vosotros", source: "excellence_prediction" },
    { spanish: "Ellos serán famosos.", english: "They will be famous.", subject: "ellos", source: "fame_prediction" }
  ],
  
  ESTAR: [
    { spanish: "Estaré en casa.", english: "I will be at home.", subject: "yo", source: "location_plan" },
    { spanish: "Estarás cansado.", english: "You (informal) will be tired.", subject: "tú", source: "fatigue_prediction" },
    { spanish: "Ella estará lista.", english: "She will be ready.", subject: "ella", source: "readiness_prediction" },
    { spanish: "Él estará aquí.", english: "He will be here.", subject: "él", source: "presence_confirmation" },
    { spanish: "Estaremos ocupados.", english: "We will be busy.", subject: "nosotros", source: "busy_schedule" },
    { spanish: "Usted estará bien.", english: "You (formal) will be well.", subject: "usted", source: "wellness_assurance" },
    { spanish: "Estaréis contentos.", english: "You all will be happy.", subject: "vosotros", source: "happiness_assurance" },
    { spanish: "Ellos estarán juntos.", english: "They will be together.", subject: "ellos", source: "togetherness_prediction" }
  ],
  
  HACER: [
    { spanish: "Haré la tarea.", english: "I will do homework.", subject: "yo", source: "homework_plan" },
    { spanish: "Harás ejercicio.", english: "You (informal) will exercise.", subject: "tú", source: "fitness_plan" },
    { spanish: "Ella hará la comida.", english: "She will make the food.", subject: "ella", source: "cooking_plan" },
    { spanish: "Él hará un viaje.", english: "He will take a trip.", subject: "él", source: "travel_plan" },
    { spanish: "Haremos una fiesta.", english: "We will have a party.", subject: "nosotros", source: "party_organization" },
    { spanish: "Usted hará un buen trabajo.", english: "You (formal) will do good work.", subject: "usted", source: "work_confidence" },
    { spanish: "Haréis deporte.", english: "You all will do sports.", subject: "vosotros", source: "sports_plan" },
    { spanish: "Ellos harán planes.", english: "They will make plans.", subject: "ellos", source: "planning_activity" }
  ]
};

console.log('🚀 EXPANDING TIER 1 SIMPLE FUTURE SENTENCES\n');
console.log('Note: Using correct irregular stems (tendr-, har-, podr-, querr-, etc.)\n');

// Add new sentences to all verbs
Object.keys(simpleFutureExpansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb['future'] || [];
  const newSentences = simpleFutureExpansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:future",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb['future'] = [...currentSentences, ...enhancedNewSentences];
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

console.log('\n✅ SIMPLE FUTURE EXPANSION COMPLETE!');

// Count new future sentences
const newFutureTotal = Object.keys(simpleFutureExpansionTemplates).reduce((total, verbName) => {
  const verb = tier1Data.verbs[verbName];
  return total + (verb['future']?.length || 0);
}, 0);

console.log(`📊 Total Simple Future sentences: ${newFutureTotal}`);
console.log(`📈 Updated total sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 Ready for ChatGPT review!');
