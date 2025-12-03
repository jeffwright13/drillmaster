#!/usr/bin/env node

/**
 * Compare scraped real sentences with existing corpus
 * Identify which existing sentences are good vs. bad
 */

const fs = require('fs');
const path = require('path');

// Load scraped sentences
function loadScrapedSentences() {
  const scrapedPath = path.join(__dirname, '../data/corpus/latin-american-scraped.json');
  if (!fs.existsSync(scrapedPath)) {
    console.error('❌ No scraped data found. Run latin-america-scraper.js first.');
    return null;
  }
  
  const data = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
  return data;
}

// Load existing corpus
function loadExistingCorpus() {
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const corpus = {};
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const tier = filename.match(/tier(\d)/)[1];
        corpus[`tier${tier}`] = data;
      } catch (error) {
        console.warn(`⚠️  Could not load ${filename}: ${error.message}`);
      }
    }
  });
  
  return corpus;
}

// Quality scoring for existing sentences
function scoreExistingSentence(sentence) {
  let score = 0;
  const spanish = sentence.spanish || '';
  const english = sentence.english || '';
  
  // Length bonus
  if (spanish.length >= 20 && spanish.length <= 150) score += 10;
  if (english.length >= 15 && english.length <= 150) score += 10;
  
  // Natural language bonus
  if (/[ñáéíóúü]/i.test(spanish)) score += 5;
  
  // Penalty for obvious problems
  const problems = [
    // English problems
    /am being.*professor/i,
    /are being.*pretty/i,
    /are being.*intelligent/i,
    /it are raining/i,
    /am having.*meeting/i,
    /are having.*party/i,
    /is having.*problem/i,
    
    // Spanish problems
    /estoy siendo/i,
    /estás siendo/i,
    /está siendo/i,
    /estoy teniendo/i,
    /estás teniendo/i,
    /está teniendo/i,
    
    // Technical problems
    /javascript/i,
    /html/i,
    /css/i,
    /error/i,
    /404/i,
    /navegador/i,
    /browser/i,
    /cookies/i,
    
    // Unnatural patterns we identified
    /estoy queriendo/i,
    /estás queriendo/i,
    /está queriendo/i,
    /estoy necesitando/i,
    /estás necesitando/i,
    /está necesitando/i
  ];
  
  problems.forEach(problem => {
    if (problem.test(spanish) || problem.test(english)) {
      score -= 20;
    }
  });
  
  // Bonus for good patterns
  const goodPatterns = [
    /\b(familia|casa|trabajo|escuela|comida|agua|tiempo|día|noche)\b/i,
    /\b(méxico|colombia|venezuela|ecuador|perú|guatemala|honduras|costa rica|panamá)\b/i,
    /\b(presidente|gobierno|país|ciudad|estado|nacional)\b/i
  ];
  
  goodPatterns.forEach(pattern => {
    if (pattern.test(spanish) || pattern.test(english)) {
      score += 5;
    }
  });
  
  return score;
}

// Analyze and compare
function analyzeCorpusQuality() {
  console.log('🔍 Analyzing corpus quality: Scraped vs. Existing');
  
  const scrapedData = loadScrapedSentences();
  const existingCorpus = loadExistingCorpus();
  
  if (!scrapedData) return;
  
  console.log(`\n📊 SCRAPED DATA SUMMARY:`);
  console.log(`   🌎 Countries: ${scrapedData.metadata.countries.length}`);
  console.log(`   📝 Total sentences: ${scrapedData.metadata.total_unique_sentences}`);
  console.log(`   🔤 Verbs found: ${scrapedData.metadata.verbs_found}`);
  
  // Analyze scraped sentences
  console.log(`\n✨ SCRAPED SENTENCES (Real Latin American Spanish):`);
  let scrapedCount = 0;
  Object.keys(scrapedData.verbs).slice(0, 10).forEach(verb => {
    console.log(`\n🔤 ${verb}:`);
    Object.keys(scrapedData.verbs[verb]).forEach(tense => {
      scrapedData.verbs[verb][tense].slice(0, 3).forEach(sentence => {
        if (sentence.source && sentence.source.includes('scraping')) {
          console.log(`   ✅ [${tense}] ${sentence.spanish}`);
          scrapedCount++;
        }
      });
    });
  });
  
  // Analyze existing corpus
  console.log(`\n\n📋 EXISTING CORPUS ANALYSIS:`);
  
  const analysis = {
    good: [],
    bad: [],
    total: 0
  };
  
  Object.keys(existingCorpus).forEach(tier => {
    console.log(`\n📚 ${tier.toUpperCase()}:`);
    
    if (existingCorpus[tier].verbs) {
      Object.keys(existingCorpus[tier].verbs).slice(0, 5).forEach(verb => {
        Object.keys(existingCorpus[tier].verbs[verb]).forEach(tense => {
          if (Array.isArray(existingCorpus[tier].verbs[verb][tense])) {
            existingCorpus[tier].verbs[verb][tense].slice(0, 2).forEach(sentence => {
              const score = scoreExistingSentence(sentence);
              analysis.total++;
              
              if (score >= 10) {
                analysis.good.push({
                  verb,
                  tense,
                  spanish: sentence.spanish,
                  english: sentence.english,
                  score
                });
                console.log(`   ✅ [${score}] ${sentence.spanish}`);
              } else {
                analysis.bad.push({
                  verb,
                  tense,
                  spanish: sentence.spanish,
                  english: sentence.english,
                  score
                });
                console.log(`   ❌ [${score}] ${sentence.spanish}`);
                console.log(`      EN: ${sentence.english}`);
              }
            });
          }
        });
      });
    }
  });
  
  // Summary
  console.log(`\n📊 QUALITY ANALYSIS SUMMARY:`);
  console.log(`   📝 Total existing sentences analyzed: ${analysis.total}`);
  console.log(`   ✅ Good sentences: ${analysis.good.length} (${Math.round(analysis.good.length/analysis.total*100)}%)`);
  console.log(`   ❌ Bad sentences: ${analysis.bad.length} (${Math.round(analysis.bad.length/analysis.total*100)}%)`);
  console.log(`   🌟 Scraped sentences: ${scrapedCount} (all authentic)`);
  
  // Recommendations
  console.log(`\n🎯 RECOMMENDATIONS:`);
  
  if (analysis.bad.length > analysis.good.length) {
    console.log(`   🔄 REPLACE CORPUS: ${analysis.bad.length} bad sentences need replacement`);
    console.log(`   ✨ Use scraped sentences as foundation`);
    console.log(`   📝 Keep ${analysis.good.length} good existing sentences`);
  } else {
    console.log(`   🔧 SELECTIVE REPLACEMENT: Replace ${analysis.bad.length} worst sentences`);
    console.log(`   ✅ Keep ${analysis.good.length} good existing sentences`);
    console.log(`   ➕ Add scraped sentences to expand coverage`);
  }
  
  // Show worst examples
  console.log(`\n💀 WORST EXISTING SENTENCES (need immediate replacement):`);
  analysis.bad
    .sort((a, b) => a.score - b.score)
    .slice(0, 10)
    .forEach((sentence, i) => {
      console.log(`   ${i+1}. [${sentence.score}] ${sentence.spanish}`);
      console.log(`      EN: ${sentence.english}`);
    });
  
  // Show best scraped examples
  console.log(`\n🌟 BEST SCRAPED SENTENCES (authentic Latin American):`);
  const scrapedExamples = [];
  Object.keys(scrapedData.verbs).forEach(verb => {
    Object.keys(scrapedData.verbs[verb]).forEach(tense => {
      scrapedData.verbs[verb][tense].forEach(sentence => {
        if (sentence.source && sentence.source.includes('scraping') && 
            sentence.quality_score && sentence.quality_score > 20) {
          scrapedExamples.push({
            verb,
            tense,
            spanish: sentence.spanish,
            score: sentence.quality_score,
            country: sentence.country
          });
        }
      });
    });
  });
  
  scrapedExamples
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .forEach((sentence, i) => {
      console.log(`   ${i+1}. [${sentence.score}] ${sentence.spanish} (${sentence.country})`);
    });
  
  // Save analysis
  const outputPath = path.join(__dirname, '../data/corpus/quality-analysis.json');
  const results = {
    analysis_date: new Date().toISOString(),
    scraped_summary: scrapedData.metadata,
    existing_analysis: {
      total: analysis.total,
      good: analysis.good.length,
      bad: analysis.bad.length,
      good_percentage: Math.round(analysis.good.length/analysis.total*100),
      bad_percentage: Math.round(analysis.bad.length/analysis.total*100)
    },
    worst_sentences: analysis.bad.sort((a, b) => a.score - b.score).slice(0, 20),
    best_scraped: scrapedExamples.sort((a, b) => b.score - a.score).slice(0, 20),
    recommendation: analysis.bad.length > analysis.good.length ? 'REPLACE_CORPUS' : 'SELECTIVE_REPLACEMENT'
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed analysis saved to: ${outputPath}`);
  console.log(`✨ Analysis complete!`);
}

if (require.main === module) {
  analyzeCorpusQuality();
}

module.exports = { analyzeCorpusQuality };
