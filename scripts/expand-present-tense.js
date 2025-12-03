#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load current Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

// Template variations for each verb
const expansionTemplates = {
  HABLAR: [
    { spanish: "Ella habla francés con fluidez.", english: "She speaks French fluently.", subject: "ella", source: "language_skills" },
    { spanish: "Hablamos sobre el proyecto en la reunión.", english: "We talk about the project in the meeting.", subject: "nosotros", source: "workplace_discussion" },
    { spanish: "Ellos hablan en voz baja en la biblioteca.", english: "They speak quietly in the library.", subject: "ellos", source: "library_etiquette" },
    { spanish: "Usted habla muy claro por teléfono.", english: "You (formal) speak very clearly on the phone.", subject: "usted", source: "phone_communication" },
    { spanish: "Habláis demasiado rápido para mí.", english: "You all speak too fast for me.", subject: "vosotros", source: "conversation_pace" },
    { spanish: "Habla con su madre todos los días.", english: "He talks with his mother every day.", subject: "él", source: "family_communication" },
    { spanish: "Ustedes hablan español en casa.", english: "You all speak Spanish at home.", subject: "ustedes", source: "home_language" }
  ],
  
  COMER: [
    { spanish: "Como frutas frescas en el desayuno.", english: "I eat fresh fruit for breakfast.", subject: "yo", source: "healthy_breakfast" },
    { spanish: "Comes demasiado rápido durante el almuerzo.", english: "You (informal) eat too fast during lunch.", subject: "tú", source: "eating_habits" },
    { spanish: "Ella come verduras todos los días.", english: "She eats vegetables every day.", subject: "ella", source: "healthy_diet" },
    { spanish: "Él come pizza los viernes por la noche.", english: "He eats pizza on Friday nights.", subject: "él", source: "weekend_tradition" },
    { spanish: "Usted come en restaurantes elegantes.", english: "You (formal) eat at elegant restaurants.", subject: "usted", source: "dining_preferences" },
    { spanish: "Coméis juntos en el jardín.", english: "You all eat together in the garden.", subject: "vosotros", source: "outdoor_dining" },
    { spanish: "Ellos comen mariscos en la playa.", english: "They eat seafood at the beach.", subject: "ellos", source: "beach_dining" },
    { spanish: "Ustedes comen comida casera.", english: "You all eat homemade food.", subject: "ustedes", source: "home_cooking" }
  ],
  
  VIVIR: [
    { spanish: "Vivo cerca del centro de la ciudad.", english: "I live near the city center.", subject: "yo", source: "urban_living" },
    { spanish: "Vives en un apartamento moderno.", english: "You (informal) live in a modern apartment.", subject: "tú", source: "housing_style" },
    { spanish: "Ella vive con sus padres.", english: "She lives with her parents.", subject: "ella", source: "family_arrangement" },
    { spanish: "Él vive solo desde hace dos años.", english: "He has been living alone for two years.", subject: "él", source: "independent_living" },
    { spanish: "Usted vive en una zona tranquila.", english: "You (formal) live in a quiet area.", subject: "usted", source: "neighborhood_description" },
    { spanish: "Vivís en el campo.", english: "You all live in the countryside.", subject: "vosotros", source: "rural_living" },
    { spanish: "Ellos viven cerca de la universidad.", english: "They live near the university.", subject: "ellos", source: "student_housing" },
    { spanish: "Ustedes viven en una casa histórica.", english: "You all live in a historic house.", subject: "ustedes", source: "heritage_housing" }
  ],
  
  IR: [
    { spanish: "Vas al gimnasio tres veces por semana.", english: "You (informal) go to the gym three times a week.", subject: "tú", source: "fitness_routine" },
    { spanish: "Ella va a la universidad en autobús.", english: "She goes to university by bus.", subject: "ella", source: "student_commute" },
    { spanish: "Él va de compras los sábados.", english: "He goes shopping on Saturdays.", subject: "él", source: "shopping_routine" },
    { spanish: "Vamos al cine esta noche.", english: "We're going to the movies tonight.", subject: "nosotros", source: "entertainment_plans" },
    { spanish: "Usted va a trabajar temprano.", english: "You (formal) go to work early.", subject: "usted", source: "work_schedule" },
    { spanish: "Vais a la playa en verano.", english: "You all go to the beach in summer.", subject: "vosotros", source: "summer_activities" },
    { spanish: "Ellos van al parque con sus hijos.", english: "They go to the park with their children.", subject: "ellos", source: "family_activities" },
    { spanish: "Ustedes van a restaurantes nuevos.", english: "You all go to new restaurants.", subject: "ustedes", source: "culinary_exploration" }
  ],
  
  PODER: [
    { spanish: "Puedo ayudarte con la tarea.", english: "I can help you with the homework.", subject: "yo", source: "academic_assistance" },
    { spanish: "Puedes llamarme cuando quieras.", english: "You (informal) can call me whenever you want.", subject: "tú", source: "open_communication" },
    { spanish: "Ella puede hablar tres idiomas.", english: "She can speak three languages.", subject: "ella", source: "language_abilities" },
    { spanish: "Él puede cocinar muy bien.", english: "He can cook very well.", subject: "él", source: "culinary_skills" },
    { spanish: "Podemos resolver este problema juntos.", english: "We can solve this problem together.", subject: "nosotros", source: "collaborative_problem_solving" },
    { spanish: "Usted puede reservar una mesa.", english: "You (formal) can reserve a table.", subject: "usted", source: "restaurant_booking" },
    { spanish: "Podéis venir a la fiesta.", english: "You all can come to the party.", subject: "vosotros", source: "social_invitation" },
    { spanish: "Ustedes pueden usar mi coche.", english: "You all can use my car.", subject: "ustedes", source: "vehicle_sharing" }
  ],
  
  QUERER: [
    { spanish: "Quiero aprender a tocar guitarra.", english: "I want to learn to play guitar.", subject: "yo", source: "musical_aspirations" },
    { spanish: "Quieres viajar por Europa.", english: "You (informal) want to travel through Europe.", subject: "tú", source: "travel_dreams" },
    { spanish: "Ella quiere estudiar medicina.", english: "She wants to study medicine.", subject: "ella", source: "career_goals" },
    { spanish: "Él quiere cambiar de trabajo.", english: "He wants to change jobs.", subject: "él", source: "career_change" },
    { spanish: "Queremos mudarnos a la costa.", english: "We want to move to the coast.", subject: "nosotros", source: "relocation_plans" },
    { spanish: "Usted quiere mejorar su español.", english: "You (formal) want to improve your Spanish.", subject: "usted", source: "language_learning" },
    { spanish: "Queréis organizar una reunión.", english: "You all want to organize a meeting.", subject: "vosotros", source: "event_planning" },
    { spanish: "Ellos quieren adoptar un perro.", english: "They want to adopt a dog.", subject: "ellos", source: "pet_adoption" }
  ],
  
  TENER: [
    { spanish: "Tengo una cita con el médico.", english: "I have an appointment with the doctor.", subject: "yo", source: "medical_appointment" },
    { spanish: "Tienes mucha experiencia en ventas.", english: "You (informal) have a lot of experience in sales.", subject: "tú", source: "professional_experience" },
    { spanish: "Ella tiene dos hermanas mayores.", english: "She has two older sisters.", subject: "ella", source: "family_structure" },
    { spanish: "Tenemos una reunión importante mañana.", english: "We have an important meeting tomorrow.", subject: "nosotros", source: "business_schedule" },
    { spanish: "Usted tiene razón sobre este tema.", english: "You (formal) are right about this topic.", subject: "usted", source: "agreement_expression" },
    { spanish: "Tenéis tiempo para un café.", english: "You all have time for coffee.", subject: "vosotros", source: "social_invitation" },
    { spanish: "Ellos tienen una casa en la montaña.", english: "They have a house in the mountains.", subject: "ellos", source: "vacation_property" },
    { spanish: "Ustedes tienen buenas ideas.", english: "You all have good ideas.", subject: "ustedes", source: "creative_collaboration" }
  ],
  
  SER: [
    { spanish: "Soy profesor de matemáticas.", english: "I am a math teacher.", subject: "yo", source: "professional_identity" },
    { spanish: "Eres muy inteligente.", english: "You (informal) are very intelligent.", subject: "tú", source: "personal_compliment" },
    { spanish: "Ella es de Argentina.", english: "She is from Argentina.", subject: "ella", source: "nationality_origin" },
    { spanish: "Él es médico en el hospital.", english: "He is a doctor at the hospital.", subject: "él", source: "medical_profession" },
    { spanish: "Somos estudiantes universitarios.", english: "We are university students.", subject: "nosotros", source: "academic_status" },
    { spanish: "Usted es muy amable.", english: "You (formal) are very kind.", subject: "usted", source: "personality_trait" },
    { spanish: "Sois los mejores amigos.", english: "You all are the best friends.", subject: "vosotros", source: "friendship_bond" },
    { spanish: "Ellos son hermanos gemelos.", english: "They are twin brothers.", subject: "ellos", source: "family_relationship" },
    { spanish: "Ustedes son muy trabajadores.", english: "You all are very hardworking.", subject: "ustedes", source: "work_ethic" }
  ],
  
  ESTAR: [
    { spanish: "Estoy en casa trabajando.", english: "I am at home working.", subject: "yo", source: "remote_work" },
    { spanish: "Estás muy cansado hoy.", english: "You (informal) are very tired today.", subject: "tú", source: "physical_state" },
    { spanish: "Ella está en la oficina.", english: "She is at the office.", subject: "ella", source: "workplace_location" },
    { spanish: "Él está estudiando para el examen.", english: "He is studying for the exam.", subject: "él", source: "academic_preparation" },
    { spanish: "Estamos listos para salir.", english: "We are ready to leave.", subject: "nosotros", source: "departure_readiness" },
    { spanish: "Usted está muy elegante.", english: "You (formal) look very elegant.", subject: "usted", source: "appearance_compliment" },
    { spanish: "Estáis contentos con los resultados.", english: "You all are happy with the results.", subject: "vosotros", source: "satisfaction_expression" },
    { spanish: "Ellos están de vacaciones.", english: "They are on vacation.", subject: "ellos", source: "holiday_status" },
    { spanish: "Ustedes están invitados a la boda.", english: "You all are invited to the wedding.", subject: "ustedes", source: "social_invitation" }
  ],
  
  HACER: [
    { spanish: "Hago ejercicio todas las mañanas.", english: "I exercise every morning.", subject: "yo", source: "fitness_routine" },
    { spanish: "Haces un trabajo excelente.", english: "You (informal) do excellent work.", subject: "tú", source: "work_performance" },
    { spanish: "Ella hace la cena para la familia.", english: "She makes dinner for the family.", subject: "ella", source: "family_cooking" },
    { spanish: "Él hace preguntas inteligentes.", english: "He asks intelligent questions.", subject: "él", source: "intellectual_curiosity" },
    { spanish: "Hacemos planes para el fin de semana.", english: "We make plans for the weekend.", subject: "nosotros", source: "weekend_planning" },
    { spanish: "Usted hace negocios internacionales.", english: "You (formal) do international business.", subject: "usted", source: "global_commerce" },
    { spanish: "Hacéis ruido en el apartamento.", english: "You all make noise in the apartment.", subject: "vosotros", source: "neighbor_complaint" },
    { spanish: "Ellos hacen voluntariado los domingos.", english: "They do volunteer work on Sundays.", subject: "ellos", source: "community_service" }
  ]
};

console.log('🚀 EXPANDING TIER 1 PRESENT TENSE SENTENCES\n');

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

console.log('\n✅ EXPANSION COMPLETE!');
console.log(`📊 Total Present Tense sentences: ${Object.values(tier1Data.verbs).reduce((total, verb) => total + (verb.present?.length || 0), 0)}`);
console.log(`📈 Updated sentence count: ${tier1Data.metadata.sentence_count}`);
