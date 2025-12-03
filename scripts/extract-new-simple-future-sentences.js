#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 SIMPLE FUTURE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'boss_meeting', 'language_progress', 'conference_presentation', 'phone_conversation', 'post_class_discussion',
  'medical_consultation', 'public_speaking', 'language_commitment', 'dinner_plan', 'meal_invitation',
  'diet_commitment', 'dining_plan', 'group_meal', 'good_meal_promise', 'spanish_cuisine',
  'early_dinner', 'relocation_plan', 'independence_future', 'convenient_housing', 'shared_living',
  'life_improvement', 'longevity_wish', 'adventure_prediction', 'happiness_prediction', 'medical_appointment',
  'travel_method', 'shopping_plan', 'early_departure', 'vacation_plan', 'companion_travel',
  'group_travel', 'car_travel', 'future_assistance', 'capability_confidence', 'attendance_possibility',
  'study_opportunity', 'departure_possibility', 'rest_opportunity', 'play_opportunity', 'victory_possibility',
  'coffee_desire', 'visit_prediction', 'academic_motivation', 'rest_desire', 'celebration_anticipation',
  'interesting_show', 'time_need', 'participation_interest', 'scheduled_meeting', 'luck_prediction',
  'success_prediction', 'time_availability', 'party_plan', 'correctness_prediction', 'trouble_warning',
  'family_planning', 'career_goal', 'happiness_prediction', 'profession_plan', 'parenthood_future',
  'friendship_prediction', 'importance_prediction', 'excellence_prediction', 'fame_prediction', 'location_plan',
  'fatigue_prediction', 'readiness_prediction', 'presence_confirmation', 'busy_schedule', 'wellness_assurance',
  'happiness_assurance', 'togetherness_prediction', 'homework_plan', 'fitness_plan', 'cooking_plan',
  'travel_plan', 'party_organization', 'work_confidence', 'sports_plan', 'planning_activity'
];

let sentenceCount = 0;
const verbs = Object.keys(tier1Data.verbs);

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

verbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const futureSentences = verbData['future'] || [];
  
  // Filter for new sentences only
  const newSentences = futureSentences.filter(sentence => 
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

console.log(`TOTAL NEW SIMPLE FUTURE SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish simple future sentences for:');
console.log('1. Grammar accuracy (future endings + irregular stems)');
console.log('2. Natural Spanish usage (appropriate future contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of simple future (predictions, plans, promises)');
console.log('\nKey irregular stems to check:');
console.log('- TENER: tendr- (tendré, tendrás, tendrá, tendremos, tendréis, tendrán)');
console.log('- HACER: har- (haré, harás, hará, haremos, haréis, harán)');
console.log('- PODER: podr- (podré, podrás, podrá, podremos, podréis, podrán)');
console.log('- QUERER: querr- (querré, querrás, querrá, querremos, querréis, querrán)');
console.log('- Regular verbs: HABLAR (hablaré), COMER (comeré), VIVIR (viviré), IR (iré), SER (seré), ESTAR (estaré)');
console.log('\nFuture endings: -é, -ás, -á, -emos, -éis, -án');
console.log('\nFlag any sentences that need correction or improvement.');
