#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 GOING-TO FUTURE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'school_meeting', 'public_speaking', 'future_presentation', 'phone_call_plan', 'delayed_conversation',
  'encouragement', 'language_practice', 'dinner_plan', 'meal_invitation', 'diet_plan',
  'dining_out_plan', 'group_meal_plan', 'good_meal_promise', 'spanish_cuisine', 'relocation_plan',
  'independence_plan', 'convenient_housing', 'shared_living_plan', 'life_improvement', 'longevity_wish',
  'exciting_experience', 'medical_appointment', 'travel_method', 'early_departure', 'companion_travel',
  'holiday_plan', 'morning_schedule', 'group_travel_plan', 'future_assistance', 'capability_assurance',
  'attendance_possibility', 'study_opportunity', 'departure_possibility', 'rest_opportunity',
  'future_desire', 'invitation_prediction', 'career_aspiration', 'rest_need_prediction',
  'celebration_anticipation', 'interesting_show', 'time_need_prediction', 'scheduled_meeting',
  'luck_prediction', 'pregnancy_announcement', 'time_availability', 'party_plan', 'success_prediction',
  'trouble_warning', 'career_goal', 'happiness_prediction', 'profession_plan', 'parenthood_announcement',
  'friendship_prediction', 'importance_prediction', 'excellence_prediction', 'location_plan',
  'fatigue_prediction', 'readiness_prediction', 'presence_confirmation', 'busy_schedule',
  'wellness_assurance', 'happiness_assurance', 'homework_plan', 'fitness_plan', 'cooking_plan',
  'travel_plan', 'party_organization', 'work_encouragement', 'sports_plan'
];

let sentenceCount = 0;
const verbs = Object.keys(tier1Data.verbs);

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

verbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const goingToSentences = verbData['going-to'] || [];
  
  // Filter for new sentences only
  const newSentences = goingToSentences.filter(sentence => 
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

console.log(`TOTAL NEW GOING-TO FUTURE SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish going-to future sentences for:');
console.log('1. Grammar accuracy (ir conjugation + a + infinitive)');
console.log('2. Natural Spanish usage (appropriate future contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of near future aspect (planned/intended actions)');
console.log('\nAll 10 verbs included - this construction works naturally with all verbs.');
console.log('\nFlag any sentences that need correction or improvement.');
