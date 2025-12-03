#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Beginner-level vocabulary expansion templates - VERB-SPECIFIC
const expansionTemplates = {
  HABLAR: [
    { spanish: "Ella habla inglés muy bien.", english: "She speaks English very well.", subject: "ella", source: "language_skills" },
    { spanish: "Hablamos por teléfono cada día.", english: "We talk on the phone every day.", subject: "nosotros", source: "daily_communication" },
    { spanish: "Ellos hablan en la clase.", english: "They speak in class.", subject: "ellos", source: "classroom_activity" },
    { spanish: "Usted habla muy claro.", english: "You (formal) speak very clearly.", subject: "usted", source: "clear_communication" },
    { spanish: "Habláis mucho en la mesa.", english: "You all talk a lot at the table.", subject: "vosotros", source: "family_dinner" },
    { spanish: "Habla con su hermana.", english: "He talks with his sister.", subject: "él", source: "family_talk" },
    { spanish: "Ustedes hablan español en casa.", english: "You all speak Spanish at home.", subject: "ustedes", source: "home_language" }
  ],
  
  COMER: [
    { spanish: "Como pan en el desayuno.", english: "I eat bread for breakfast.", subject: "yo", source: "breakfast_routine" },
    { spanish: "Comes mucha fruta.", english: "You (informal) eat a lot of fruit.", subject: "tú", source: "healthy_eating" },
    { spanish: "Ella come en el restaurante.", english: "She eats at the restaurant.", subject: "ella", source: "dining_out" },
    { spanish: "Él come pizza los viernes.", english: "He eats pizza on Fridays.", subject: "él", source: "weekly_treat" },
    { spanish: "Usted come muy poco.", english: "You (formal) eat very little.", subject: "usted", source: "eating_habits" },
    { spanish: "Coméis en el jardín.", english: "You all eat in the garden.", subject: "vosotros", source: "outdoor_eating" },
    { spanish: "Ellos comen pescado.", english: "They eat fish.", subject: "ellos", source: "food_preference" },
    { spanish: "Ustedes comen en casa.", english: "You all eat at home.", subject: "ustedes", source: "home_meals" }
  ],
  
  VIVIR: [
    { spanish: "Vivo cerca del parque.", english: "I live near the park.", subject: "yo", source: "neighborhood" },
    { spanish: "Vives en una casa pequeña.", english: "You (informal) live in a small house.", subject: "tú", source: "housing_type" },
    { spanish: "Ella vive con su familia.", english: "She lives with her family.", subject: "ella", source: "family_living" },
    { spanish: "Él vive solo.", english: "He lives alone.", subject: "él", source: "living_situation" },
    { spanish: "Usted vive en el centro.", english: "You (formal) live downtown.", subject: "usted", source: "city_location" },
    { spanish: "Vivís en el campo.", english: "You all live in the countryside.", subject: "vosotros", source: "rural_living" },
    { spanish: "Ellos viven aquí.", english: "They live here.", subject: "ellos", source: "location_reference" },
    { spanish: "Ustedes viven lejos.", english: "You all live far away.", subject: "ustedes", source: "distance_reference" }
  ],
  
  IR: [
    { spanish: "Vas a la escuela.", english: "You (informal) go to school.", subject: "tú", source: "education_routine" },
    { spanish: "Ella va al mercado.", english: "She goes to the market.", subject: "ella", source: "shopping_routine" },
    { spanish: "Él va en autobús.", english: "He goes by bus.", subject: "él", source: "transportation" },
    { spanish: "Vamos al parque.", english: "We go to the park.", subject: "nosotros", source: "leisure_activity" },
    { spanish: "Usted va temprano.", english: "You (formal) go early.", subject: "usted", source: "time_reference" },
    { spanish: "Vais a casa.", english: "You all go home.", subject: "vosotros", source: "return_home" },
    { spanish: "Ellos van juntos.", english: "They go together.", subject: "ellos", source: "group_activity" },
    { spanish: "Ustedes van a pie.", english: "You all go on foot.", subject: "ustedes", source: "walking" }
  ],
  
  PODER: [
    { spanish: "Puedo ayudar.", english: "I can help.", subject: "yo", source: "offering_help" },
    { spanish: "Puedes venir.", english: "You (informal) can come.", subject: "tú", source: "invitation" },
    { spanish: "Ella puede cocinar.", english: "She can cook.", subject: "ella", source: "cooking_ability" },
    { spanish: "Él puede nadar.", english: "He can swim.", subject: "él", source: "swimming_ability" },
    { spanish: "Podemos estudiar.", english: "We can study.", subject: "nosotros", source: "study_plan" },
    { spanish: "Usted puede entrar.", english: "You (formal) can enter.", subject: "usted", source: "permission" },
    { spanish: "Podéis jugar.", english: "You all can play.", subject: "vosotros", source: "play_permission" },
    { spanish: "Ustedes pueden salir.", english: "You all can leave.", subject: "ustedes", source: "departure_permission" }
  ],
  
  QUERER: [
    { spanish: "Quiero agua.", english: "I want water.", subject: "yo", source: "basic_need" },
    { spanish: "Quieres café.", english: "You (informal) want coffee.", subject: "tú", source: "beverage_preference" },
    { spanish: "Ella quiere estudiar.", english: "She wants to study.", subject: "ella", source: "academic_goal" },
    { spanish: "Él quiere trabajar.", english: "He wants to work.", subject: "él", source: "work_desire" },
    { spanish: "Queremos comer.", english: "We want to eat.", subject: "nosotros", source: "hunger_expression" },
    { spanish: "Usted quiere descansar.", english: "You (formal) want to rest.", subject: "usted", source: "rest_need" },
    { spanish: "Queréis ir.", english: "You all want to go.", subject: "vosotros", source: "departure_desire" },
    { spanish: "Ellos quieren jugar.", english: "They want to play.", subject: "ellos", source: "play_desire" }
  ],
  
  TENER: [
    { spanish: "Tengo hambre.", english: "I am hungry.", subject: "yo", source: "hunger_expression" },
    { spanish: "Tienes sed.", english: "You (informal) are thirsty.", subject: "tú", source: "thirst_expression" },
    { spanish: "Ella tiene frío.", english: "She is cold.", subject: "ella", source: "temperature_feeling" },
    { spanish: "Tenemos tiempo.", english: "We have time.", subject: "nosotros", source: "time_availability" },
    { spanish: "Usted tiene razón.", english: "You (formal) are right.", subject: "usted", source: "agreement" },
    { spanish: "Tenéis suerte.", english: "You all are lucky.", subject: "vosotros", source: "luck_expression" },
    { spanish: "Ellos tienen dinero.", english: "They have money.", subject: "ellos", source: "financial_status" },
    { spanish: "Ustedes tienen clase.", english: "You all have class.", subject: "ustedes", source: "school_schedule" }
  ],
  
  SER: [
    { spanish: "Soy estudiante.", english: "I am a student.", subject: "yo", source: "identity" },
    { spanish: "Eres alto.", english: "You (informal) are tall.", subject: "tú", source: "physical_description" },
    { spanish: "Ella es doctora.", english: "She is a doctor.", subject: "ella", source: "profession" },
    { spanish: "Él es joven.", english: "He is young.", subject: "él", source: "age_description" },
    { spanish: "Somos amigos.", english: "We are friends.", subject: "nosotros", source: "relationship" },
    { spanish: "Usted es muy amable.", english: "You (formal) are very kind.", subject: "usted", source: "personality_trait" },
    { spanish: "Sois hermanos.", english: "You all are brothers.", subject: "vosotros", source: "family_relationship" },
    { spanish: "Ellos son buenos.", english: "They are good.", subject: "ellos", source: "character_trait" },
    { spanish: "Ustedes son maestros.", english: "You all are teachers.", subject: "ustedes", source: "profession_plural" }
  ],
  
  ESTAR: [
    { spanish: "Estoy en casa.", english: "I am at home.", subject: "yo", source: "location" },
    { spanish: "Estás cansado.", english: "You (informal) are tired.", subject: "tú", source: "physical_state" },
    { spanish: "Ella está feliz.", english: "She is happy.", subject: "ella", source: "emotional_state" },
    { spanish: "Él está aquí.", english: "He is here.", subject: "él", source: "location_reference" },
    { spanish: "Estamos listos.", english: "We are ready.", subject: "nosotros", source: "readiness_state" },
    { spanish: "Usted está bien.", english: "You (formal) are well.", subject: "usted", source: "health_state" },
    { spanish: "Estáis ocupados.", english: "You all are busy.", subject: "vosotros", source: "activity_state" },
    { spanish: "Ellos están tristes.", english: "They are sad.", subject: "ellos", source: "emotional_state" },
    { spanish: "Ustedes están cerca.", english: "You all are close.", subject: "ustedes", source: "proximity" }
  ],
  
  HACER: [
    { spanish: "Hago la tarea.", english: "I do homework.", subject: "yo", source: "school_activity" },
    { spanish: "Haces deporte.", english: "You (informal) do sports.", subject: "tú", source: "physical_activity" },
    { spanish: "Ella hace la cama.", english: "She makes the bed.", subject: "ella", source: "household_chore" },
    { spanish: "Él hace preguntas.", english: "He asks questions.", subject: "él", source: "inquiry" },
    { spanish: "Hacemos la comida.", english: "We make food.", subject: "nosotros", source: "cooking_activity" },
    { spanish: "Usted hace ejercicio.", english: "You (formal) exercise.", subject: "usted", source: "fitness_activity" },
    { spanish: "Hacéis ruido.", english: "You all make noise.", subject: "vosotros", source: "sound_making" },
    { spanish: "Ellos hacen planes.", english: "They make plans.", subject: "ellos", source: "planning_activity" }
  ]
};

console.log('🔧 FIXED EXPANSION: Verb-specific sentences with beginner vocabulary\n');

// Add new sentences to each verb
Object.keys(expansionTemplates).forEach(verbName => {
  const verb = tier1Data.verbs[verbName];
  if (!verb) {
    console.log(`❌ Verb ${verbName} not found in corpus`);
    return;
  }
  
  const currentSentences = verb.present || [];
  const newSentences = expansionTemplates[verbName];
  
  console.log(`📝 ${verbName}: ${currentSentences.length} → ${currentSentences.length + newSentences.length} sentences`);
  
  // Add proper metadata to new sentences
  const enhancedNewSentences = newSentences.map(sentence => ({
    ...sentence,
    region: "universal",
    tags: [
      "region:universal",
      verb.metadata?.regularity ? `regularity:${verb.metadata.regularity}` : "regularity:regular",
      `subject:${sentence.subject}`,
      "tense:present",
      "tier:1",
      verb.metadata?.["verb-type"] ? `verb-type:${verb.metadata["verb-type"]}` : "verb-type:ar",
      "word-type:verb"
    ]
  }));
  
  // Combine existing and new sentences
  verb.present = [...currentSentences, ...enhancedNewSentences];
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

console.log('\n✅ FIXED EXPANSION COMPLETE!');
console.log(`📊 Total Present Tense sentences: ${Object.values(tier1Data.verbs).reduce((total, verb) => total + (verb.present?.length || 0), 0)}`);
console.log(`📈 Updated sentence count: ${tier1Data.metadata.sentence_count}`);
console.log('\n🎯 All sentences now use correct verb conjugations and beginner vocabulary!');
