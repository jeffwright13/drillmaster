#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 PRESENT-PERFECT SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'director_meeting', 'daily_performance', 'family_communication', 'public_speaking', 'topic_discussion',
  'clear_expression', 'extensive_conversation', 'language_practice', 'overeating', 'restaurant_experience',
  'healthy_diet', 'pizza_consumption', 'shared_meals', 'good_eating', 'spanish_dish',
  'dessert_experience', 'international_experience', 'life_assessment', 'independent_living', 'lifelong_residence',
  'challenging_times', 'rich_experience', 'rural_experience', 'good_life', 'medical_visits',
  'education_experience', 'shopping_experience', 'air_travel', 'cinema_visits', 'distant_travel',
  'group_travel', 'early_departure', 'work_completion', 'problem_resolution', 'attendance_success',
  'study_opportunity', 'rest_achievement', 'assistance_success', 'departure_success', 'victory_achievement',
  'communication_desire', 'visit_desire', 'academic_desire', 'helpful_desire', 'travel_desire',
  'rest_desire', 'celebration_desire', 'participation_desire', 'fortune_experience', 'difficulty_experience',
  'success_experience', 'time_availability', 'meeting_experience', 'correctness_validation', 'group_fortune',
  'party_experience', 'educational_identity', 'kindness_recognition', 'teaching_experience', 'excellence_recognition',
  'friendship_history', 'patience_appreciation', 'courage_recognition', 'goodness_assessment', 'busy_period',
  'illness_period', 'happiness_period', 'presence_confirmation', 'work_period', 'wellness_period',
  'study_period', 'travel_period', 'homework_completion', 'work_quality', 'cooking_completion',
  'fitness_activity', 'planning_completion', 'inquiry_completion', 'noise_creation', 'sports_participation'
];

let sentenceCount = 0;
const verbs = Object.keys(tier1Data.verbs);

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

verbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const presentPerfectSentences = verbData['present-perfect'] || [];
  
  // Filter for new sentences only
  const newSentences = presentPerfectSentences.filter(sentence => 
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

console.log(`TOTAL NEW PRESENT-PERFECT SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish present-perfect sentences for:');
console.log('1. Grammar accuracy (haber conjugation + past participle)');
console.log('2. Natural Spanish usage (appropriate present-perfect contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of present-perfect aspect (past actions with present relevance)');
console.log('\nKey past participles to check:');
console.log('- HABLAR: hablado (regular)');
console.log('- COMER: comido (regular)');
console.log('- VIVIR: vivido (regular)');
console.log('- IR: ido (regular)');
console.log('- PODER: podido (regular)');
console.log('- QUERER: querido (regular)');
console.log('- TENER: tenido (regular)');
console.log('- SER: sido (regular)');
console.log('- ESTAR: estado (regular)');
console.log('- HACER: hecho (irregular - important!)');
console.log('\nHaber conjugations: he, has, ha, hemos, habéis, han');
console.log('\nFlag any sentences that need correction or improvement.');
