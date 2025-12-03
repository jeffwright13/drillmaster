#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 PRESENT TENSE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'language_skills', 'daily_communication', 'classroom_activity', 'clear_communication', 
  'family_dinner', 'family_talk', 'home_language', 'breakfast_routine', 'healthy_eating',
  'dining_out', 'weekly_treat', 'eating_habits', 'outdoor_eating', 'food_preference',
  'home_meals', 'neighborhood', 'housing_type', 'family_living', 'living_situation',
  'city_location', 'rural_living', 'location_reference', 'distance_reference',
  'education_routine', 'shopping_routine', 'transportation', 'leisure_activity',
  'time_reference', 'return_home', 'group_activity', 'walking', 'offering_help',
  'invitation', 'cooking_ability', 'swimming_ability', 'study_plan', 'permission',
  'play_permission', 'departure_permission', 'basic_need', 'beverage_preference',
  'academic_goal', 'work_desire', 'hunger_expression', 'rest_need', 'departure_desire',
  'play_desire', 'thirst_expression', 'temperature_feeling', 'time_availability',
  'agreement', 'luck_expression', 'financial_status', 'school_schedule', 'identity',
  'physical_description', 'profession', 'age_description', 'relationship',
  'personality_trait', 'family_relationship', 'character_trait', 'profession_plural',
  'location', 'physical_state', 'emotional_state', 'readiness_state', 'health_state',
  'activity_state', 'proximity', 'school_activity', 'physical_activity',
  'household_chore', 'inquiry', 'cooking_activity', 'fitness_activity',
  'sound_making', 'planning_activity'
];

let sentenceCount = 0;
const verbs = Object.keys(tier1Data.verbs);

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

verbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const presentSentences = verbData.present || [];
  
  // Filter for new sentences only
  const newSentences = presentSentences.filter(sentence => 
    newSentenceSources.includes(sentence.source)
  );
  
  if (newSentences.length > 0) {
    console.log(`--- ${verbName} (${newSentences.length} new sentences) ---`);
    
    newSentences.forEach((sentence, index) => {
      sentenceCount++;
      
      // Format as they appear on cards (with pronouns added)
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

console.log(`TOTAL NEW SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish sentences for:');
console.log('1. Grammar accuracy (present tense)');
console.log('2. Natural Spanish usage');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Any cultural or regional issues');
console.log('\nFlag any sentences that need correction or improvement.');
