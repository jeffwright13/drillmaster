#!/usr/bin/env node

/**
 * Analyze what we actually scraped vs. what we need
 * Show coverage by tier, verb, tense, subject
 */

const fs = require('fs');
const path = require('path');

// Load scraped data
function loadScrapedData() {
  const scrapedPath = path.join(__dirname, '../data/corpus/latin-american-scraped.json');
  return JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
}

// Load verb list with tiers
function loadVerbList() {
  const verbsPath = path.join(__dirname, '../data/verbs.tsv');
  const content = fs.readFileSync(verbsPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const [verb, english, tags] = line.split('\t');
    const tier = tags.match(/tier:(\d)/)?.[1] || '1';
    return { 
      verb: verb.toUpperCase(), 
      english, 
      tier: parseInt(tier)
    };
  });
}

// Load tier configurations
function loadTierConfigs() {
  return {
    1: { name: 'Foundations', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'] },
    2: { name: 'Daily Routines', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite'] },
    3: { name: 'Irregular Essentials', tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect'] },
    4: { name: 'Emotional & Cognitive', tenseOrder: ['present', 'present-progressive', 'going-to', 'present-perfect'] },
    5: { name: 'Gustar-Type Verbs', tenseOrder: ['present', 'going-to', 'preterite'] }
  };
}

function analyzeScrapedCoverage() {
  console.log('🔍 Analyzing scraped sentence coverage...\n');
  
  const scrapedData = loadScrapedData();
  const verbList = loadVerbList();
  const tierConfigs = loadTierConfigs();
  
  // Organize verbs by tier
  const verbsByTier = {};
  verbList.forEach(verb => {
    if (!verbsByTier[verb.tier]) {
      verbsByTier[verb.tier] = [];
    }
    verbsByTier[verb.tier].push(verb);
  });
  
  console.log('📊 SCRAPED DATA OVERVIEW:');
  console.log(`   🌎 Countries: ${scrapedData.metadata.countries.length}`);
  console.log(`   📡 Sources attempted: ${scrapedData.metadata.sources_attempted}`);
  console.log(`   ✅ Sources successful: ${scrapedData.metadata.sources_successful}`);
  console.log(`   📝 Total sentences: ${scrapedData.metadata.total_unique_sentences}`);
  console.log(`   🔤 Verbs found: ${scrapedData.metadata.verbs_found}`);
  
  // Analyze coverage by tier
  console.log('\n📚 COVERAGE BY TIER:');
  
  const coverageStats = {
    totalVerbs: verbList.length,
    scrapedVerbs: Object.keys(scrapedData.verbs).length,
    byTier: {}
  };
  
  for (let tier = 1; tier <= 5; tier++) {
    const tierVerbs = verbsByTier[tier] || [];
    const scrapedInTier = tierVerbs.filter(verb => scrapedData.verbs[verb.verb]);
    const missingInTier = tierVerbs.filter(verb => !scrapedData.verbs[verb.verb]);
    
    coverageStats.byTier[tier] = {
      total: tierVerbs.length,
      scraped: scrapedInTier.length,
      missing: missingInTier.length,
      percentage: Math.round((scrapedInTier.length / tierVerbs.length) * 100)
    };
    
    console.log(`\n   Tier ${tier} (${tierConfigs[tier].name}):`);
    console.log(`     📝 Total verbs: ${tierVerbs.length}`);
    console.log(`     ✅ Scraped: ${scrapedInTier.length} (${coverageStats.byTier[tier].percentage}%)`);
    console.log(`     ❌ Missing: ${missingInTier.length}`);
    
    if (scrapedInTier.length > 0) {
      console.log(`     🔤 Scraped verbs: ${scrapedInTier.map(v => v.verb).join(', ')}`);
    }
    
    if (missingInTier.length > 0) {
      console.log(`     🚫 Missing verbs: ${missingInTier.map(v => v.verb).join(', ')}`);
    }
  }
  
  // Analyze tense coverage
  console.log('\n📅 TENSE COVERAGE:');
  const tenseStats = {};
  
  Object.keys(scrapedData.verbs).forEach(verb => {
    Object.keys(scrapedData.verbs[verb]).forEach(tense => {
      if (!tenseStats[tense]) {
        tenseStats[tense] = { verbs: 0, sentences: 0 };
      }
      tenseStats[tense].verbs++;
      tenseStats[tense].sentences += scrapedData.verbs[verb][tense].length;
    });
  });
  
  Object.keys(tenseStats).sort().forEach(tense => {
    console.log(`   ${tense}: ${tenseStats[tense].verbs} verbs, ${tenseStats[tense].sentences} sentences`);
  });
  
  // Analyze subject coverage
  console.log('\n👥 SUBJECT COVERAGE:');
  const subjectStats = {};
  
  Object.keys(scrapedData.verbs).forEach(verb => {
    Object.keys(scrapedData.verbs[verb]).forEach(tense => {
      scrapedData.verbs[verb][tense].forEach(sentence => {
        const subject = sentence.subject;
        if (!subjectStats[subject]) {
          subjectStats[subject] = 0;
        }
        subjectStats[subject]++;
      });
    });
  });
  
  Object.keys(subjectStats).sort().forEach(subject => {
    console.log(`   ${subject}: ${subjectStats[subject]} sentences`);
  });
  
  // Show detailed examples by verb
  console.log('\n📋 DETAILED SCRAPED EXAMPLES:');
  
  Object.keys(scrapedData.verbs).sort().forEach(verb => {
    console.log(`\n🔤 ${verb}:`);
    
    Object.keys(scrapedData.verbs[verb]).forEach(tense => {
      console.log(`   📅 ${tense} (${scrapedData.verbs[verb][tense].length} sentences):`);
      
      scrapedData.verbs[verb][tense].slice(0, 3).forEach(sentence => {
        const country = sentence.country || 'unknown';
        const score = sentence.quality_score || 'N/A';
        console.log(`     ✅ [${score}] ${sentence.spanish} (${country})`);
      });
      
      if (scrapedData.verbs[verb][tense].length > 3) {
        console.log(`     ... and ${scrapedData.verbs[verb][tense].length - 3} more`);
      }
    });
  });
  
  // Summary and recommendations
  console.log('\n🎯 SUMMARY & RECOMMENDATIONS:');
  console.log(`   📊 Overall coverage: ${coverageStats.scrapedVerbs}/${coverageStats.totalVerbs} verbs (${Math.round((coverageStats.scrapedVerbs/coverageStats.totalVerbs)*100)}%)`);
  
  // Find gaps
  const missingVerbs = verbList.filter(verb => !scrapedData.verbs[verb.verb]);
  const wellCoveredVerbs = Object.keys(scrapedData.verbs).filter(verb => {
    const tenseCount = Object.keys(scrapedData.verbs[verb]).length;
    return tenseCount >= 3; // Has at least 3 tenses
  });
  
  console.log(`   ✅ Well-covered verbs: ${wellCoveredVerbs.length}`);
  console.log(`   ❌ Missing verbs: ${missingVerbs.length}`);
  
  if (missingVerbs.length > 0) {
    console.log(`\n🚫 MISSING VERBS (need more scraping):`)
    missingVerbs.forEach(verb => {
      console.log(`   - ${verb.verb} (Tier ${verb.tier}): ${verb.english}`);
    });
  }
  
  console.log(`\n💡 NEXT STEPS:`);
  if (missingVerbs.length > 10) {
    console.log(`   🔄 Need more scraping for ${missingVerbs.length} missing verbs`);
    console.log(`   🎯 Focus on: ${missingVerbs.slice(0, 5).map(v => v.verb).join(', ')}, etc.`);
  } else {
    console.log(`   ✅ Good coverage! Can proceed with integration`);
    console.log(`   📝 Add all ${Object.keys(scrapedData.verbs).length} scraped verbs to corpus`);
  }
  
  // Save analysis
  const outputPath = path.join(__dirname, '../data/corpus/scraped-coverage-analysis.json');
  const results = {
    analysis_date: new Date().toISOString(),
    coverage_stats: coverageStats,
    tense_stats: tenseStats,
    subject_stats: subjectStats,
    missing_verbs: missingVerbs.map(v => ({ verb: v.verb, tier: v.tier, english: v.english })),
    well_covered_verbs: wellCoveredVerbs,
    recommendation: missingVerbs.length > 10 ? 'NEED_MORE_SCRAPING' : 'READY_FOR_INTEGRATION'
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed analysis saved to: ${outputPath}`);
  console.log(`✨ Coverage analysis complete!`);
}

if (require.main === module) {
  analyzeScrapedCoverage();
}

module.exports = { analyzeScrapedCoverage };
