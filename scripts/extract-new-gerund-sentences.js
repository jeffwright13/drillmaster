#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 1 corpus
const tier1Path = path.join(__dirname, '../data/corpus/tier1-complete.json');
const tier1Data = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));

console.log('=== NEW TIER 1 PRESENT-PROGRESSIVE (GERUND) SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'family_call', 'speech_pace', 'phone_conversation', 'language_practice', 'work_discussion',
  'language_compliment', 'kitchen_chat', 'sports_discussion', 'language_learning',
  'healthy_snack', 'eating_pace', 'outdoor_meal', 'social_dining', 'casual_meal',
  'healthy_eating', 'home_dining', 'dessert_time', 'group_meal', 'current_residence',
  'independent_living', 'shared_housing', 'convenient_location', 'life_experience',
  'urban_living', 'challenging_period', 'new_home', 'good_life', 'shopping_trip',
  'speed_reference', 'return_journey', 'bike_transport', 'entertainment_outing',
  'correct_direction', 'beach_trip', 'group_travel', 'early_departure',
  'positive_experience', 'difficulty_situation', 'business_meeting', 'fortunate_situation',
  'celebration', 'achievement', 'group_discussion', 'challenging_time', 'special_moment',
  'cooking_activity', 'fitness_activity', 'study_time', 'work_project', 'planning_session',
  'work_performance', 'noise_making', 'sports_activity', 'important_task'
];

let sentenceCount = 0;
const gerundFriendlyVerbs = ['HABLAR', 'COMER', 'VIVIR', 'IR', 'TENER', 'HACER'];

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');

gerundFriendlyVerbs.forEach((verbName) => {
  const verbData = tier1Data.verbs[verbName];
  const gerundSentences = verbData['present-progressive'] || [];
  
  // Filter for new sentences only
  const newSentences = gerundSentences.filter(sentence => 
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

console.log(`TOTAL NEW GERUND SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish present-progressive (gerund) sentences for:');
console.log('1. Grammar accuracy (estar + gerund form)');
console.log('2. Natural Spanish usage (appropriate gerund contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of progressive aspect (ongoing actions)');
console.log('\nNote: Only 6 verbs included - PODER, QUERER, SER, ESTAR intentionally excluded');
console.log('as they do not naturally form gerunds in beginner Spanish.');
console.log('\nFlag any sentences that need correction or improvement.');
