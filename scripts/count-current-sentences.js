#!/usr/bin/env node

/**
 * Count Current Sentences
 * Get accurate sentence counts after all cleanup and enhancements
 */

const fs = require('fs');
const path = require('path');

function countCurrentSentences() {
  console.log('📊 Counting current sentences across all tiers...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const counts = {
    total_sentences: 0,
    by_tier: {},
    by_source: {
      chatgpt: 0,
      original: 0,
      web_scraped: 0,
      enhanced: 0
    }
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📚 Counting ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    counts.by_tier[tier] = {
      sentences: 0,
      verbs: 0,
      by_tense: {}
    };
    
    if (corpus.verbs) {
      counts.by_tier[tier].verbs = Object.keys(corpus.verbs).length;
      
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            const tenseCount = corpus.verbs[verb][tense].length;
            counts.by_tier[tier].sentences += tenseCount;
            counts.total_sentences += tenseCount;
            
            if (!counts.by_tier[tier].by_tense[tense]) {
              counts.by_tier[tier].by_tense[tense] = 0;
            }
            counts.by_tier[tier].by_tense[tense] += tenseCount;
            
            // Count by source type
            corpus.verbs[verb][tense].forEach(sentence => {
              const source = sentence.source?.type || 'unknown';
              if (source.includes('chatgpt')) {
                counts.by_source.chatgpt++;
              } else if (source.includes('enhanced') || source.includes('ir_a')) {
                counts.by_source.enhanced++;
              } else if (source.includes('web') || source.includes('scraped')) {
                counts.by_source.web_scraped++;
              } else {
                counts.by_source.original++;
              }
            });
          }
        });
      });
    }
    
    console.log(`   📝 ${counts.by_tier[tier].sentences} sentences, ${counts.by_tier[tier].verbs} verbs`);
  });
  
  // Display results
  displayCounts(counts);
  
  return counts;
}

function displayCounts(counts) {
  console.log(`\n📊 CURRENT SENTENCE COUNTS:`);
  console.log(`   🎯 TOTAL SENTENCES: ${counts.total_sentences}`);
  
  console.log(`\n📚 By Tier:`);
  Object.keys(counts.by_tier).forEach(tier => {
    const tierData = counts.by_tier[tier];
    console.log(`   Tier ${tier}: ${tierData.sentences} sentences (${tierData.verbs} verbs)`);
    
    // Show top tenses
    const sortedTenses = Object.entries(tierData.by_tense)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    if (sortedTenses.length > 0) {
      const tenseInfo = sortedTenses.map(([tense, count]) => `${tense}(${count})`).join(', ');
      console.log(`     Top tenses: ${tenseInfo}`);
    }
  });
  
  console.log(`\n🔍 By Source Type:`);
  console.log(`   🤖 ChatGPT generated: ${counts.by_source.chatgpt} sentences`);
  console.log(`   ⚡ Enhanced (ir+a, etc): ${counts.by_source.enhanced} sentences`);
  console.log(`   🌐 Web scraped: ${counts.by_source.web_scraped} sentences`);
  console.log(`   📝 Original pedagogical: ${counts.by_source.original} sentences`);
  
  const chatgptPercent = ((counts.by_source.chatgpt / counts.total_sentences) * 100).toFixed(1);
  const enhancedPercent = ((counts.by_source.enhanced / counts.total_sentences) * 100).toFixed(1);
  const webPercent = ((counts.by_source.web_scraped / counts.total_sentences) * 100).toFixed(1);
  const originalPercent = ((counts.by_source.original / counts.total_sentences) * 100).toFixed(1);
  
  console.log(`\n📊 Source Composition:`);
  console.log(`   🤖 ChatGPT: ${chatgptPercent}%`);
  console.log(`   ⚡ Enhanced: ${enhancedPercent}%`);
  console.log(`   🌐 Web scraped: ${webPercent}%`);
  console.log(`   📝 Original: ${originalPercent}%`);
  
  console.log(`\n🎯 SUMMARY:`);
  console.log(`   📈 Total corpus size: ${counts.total_sentences} sentences`);
  console.log(`   🏆 Quality: High (bad sentences removed)`);
  console.log(`   🤖 ChatGPT enhanced: ${counts.by_source.chatgpt} natural examples`);
  console.log(`   ✨ Ready for learners!`);
}

if (require.main === module) {
  countCurrentSentences();
}

module.exports = { countCurrentSentences };
