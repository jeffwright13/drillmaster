#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 PRETERITE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'family_conversation', 'presentation_success', 'long_phone_call', 'medical_consultation', 'classroom_practice',
  'clear_communication', 'planning_discussion', 'late_conversation', 'dinner_memory', 'party_overeating',
  'italian_dining', 'light_eating', 'family_meal', 'good_appetite', 'spanish_cuisine',
  'dessert_time', 'past_residence', 'amazing_experience', 'independence_milestone', 'family_arrangement',
  'happy_memories', 'international_experience', 'coastal_living', 'adventure_experience', 'medical_visit',
  'education_journey', 'shopping_trip', 'train_travel', 'entertainment_outing', 'kindness_appreciation',
  'beach_trip', 'group_travel', 'project_completion', 'problem_solving', 'party_attendance',
  'family_assistance', 'early_departure', 'rest_opportunity', 'movie_viewing', 'group_study',
  'communication_attempt', 'frustrated_intention', 'career_aspiration', 'helpful_intention', 'extended_visit',
  'conversation_request', 'concert_desire', 'celebration_desire', 'business_meeting', 'exam_fortune',
  'childbirth', 'car_trouble', 'memorable_celebration', 'correct_judgment', 'rest_time',
  'achievement', 'past_identity', 'intelligence_compliment', 'educational_relationship', 'competition_victory',
  'school_relationship', 'kindness_memory', 'excellence_recognition', 'friendship_memory', 'home_day',
  'busy_period', 'illness_period', 'travel_experience', 'punctual_preparation', 'wellness_state',
  'happiness_state', 'past_presence', 'homework_completion', 'work_accomplishment', 'cooking_task',
  'fitness_activity', 'summer_planning', 'inquiry_action', 'noise_incident', 'sports_activity'
];

let sentenceCount = 0;
const verbs = Object.keys(tier1Data.verbs);

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

verbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const preteriteSentences = verbData['preterite'] || [];
  
  // Filter for new sentences only
  const newSentences = preteriteSentences.filter(sentence => 
    newSentenceSources.includes(sentence.source)
  );
  
  if (newSentences.length > 0) {
    console.log(`--- ${verbName} (${newSentences.length} new sentences) ---`);
    
    newSentences.forEach((sentence, index) => {
      sentenceCount++;
      
      // Format as they appear on cards (with pronouns added if needed)
      const spanishPronouns = {
        'yo': 'Yo',
        'tú': 'Tú', 
        'él': 'Él',
        'ella': 'Ella',
        'usted': 'Usted',
        'nosotros': 'Nosotros',
        'ellos': 'Ellos',
        'ustedes': 'Ustedes',
        'vos': 'Vos',
        'vosotros': 'Vosotros'
      };
      
      const pronoun = spanishPronouns[sentence.subject] || sentence.subject;
      
      // Only add pronoun if sentence doesn't already start with it
      let spanishWithPronoun;
      if (sentence.spanish.toLowerCase().startsWith(pronoun.toLowerCase())) {
        spanishWithPronoun = sentence.spanish;
      } else {
        const firstChar = sentence.spanish.charAt(0).toLowerCase();
        const restOfSentence = sentence.spanish.slice(1);
        spanishWithPronoun = `${pronoun} ${firstChar}${restOfSentence}`;
      }
      
      // Clean English (remove disambiguation hints for ES→EN cards)
      const cleanEnglish = sentence.english
        .replace(/\s*\(informal\)/gi, '')
        .replace(/\s*\(formal\)/gi, '')
        .replace(/\s*\(vos\)/gi, '')
        .replace(/You all/g, 'You')
        .replace(/you all/g, 'you')
        .trim();
      
      console.log(`${sentenceCount}. ES→EN: "${spanishWithPronoun}" → "${cleanEnglish}"`);
      console.log(`    EN→ES: "${sentence.english}" → "${spanishWithPronoun}"`);
      console.log('');
    });
    
    console.log('');
  }
});

console.log(`TOTAL NEW PRETERITE SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish preterite sentences for:');
console.log('1. Grammar accuracy (correct preterite conjugations, especially irregulars)');
console.log('2. Natural Spanish usage (appropriate completed past contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of preterite aspect (completed actions in the past)');
console.log('\nKey irregular verbs to check:');
console.log('- IR: fui, fuiste, fue, fuimos, fuisteis, fueron');
console.log('- SER: fui, fuiste, fue, fuimos, fuisteis, fueron (same as IR)');
console.log('- TENER: tuve, tuviste, tuvo, tuvimos, tuvisteis, tuvieron');
console.log('- HACER: hice, hiciste, hizo, hicimos, hicisteis, hicieron');
console.log('- ESTAR: estuve, estuviste, estuvo, estuvimos, estuvisteis, estuvieron');
console.log('- PODER: pude, pudiste, pudo, pudimos, pudisteis, pudieron');
console.log('- QUERER: quise, quisiste, quiso, quisimos, quisisteis, quisieron');
console.log('\nFlag any sentences that need correction or improvement.');
