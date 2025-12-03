#!/usr/bin/env node

/**
 * Analyze Future Construction Coverage
 * Based on ChatGPT's high-ROI ranking of Spanish future forms
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's High-ROI Future Constructions (in priority order)
const FUTURE_CONSTRUCTIONS = {
  1: {
    name: 'ir + a + infinitive',
    patterns: [/\b(voy|vas|va|vamos|van)\s+a\s+\w+/gi],
    description: 'Going to (most common conversational future)',
    examples: ['Voy a llamar', 'Va a llover', 'Vamos a comprar']
  },
  2: {
    name: 'Present tense (future meaning)',
    patterns: [/\b(sale|llega|empieza|termina|viene|vamos)\b.*\b(mañana|próximo|siguiente|después)\b/gi],
    description: 'Scheduled actions in near future',
    examples: ['El camión sale mañana', 'Mi cita es el lunes', 'Nos vemos el miércoles']
  },
  3: {
    name: 'Simple Future (-é/-ás/-á/-emos/-án)',
    patterns: [/\b\w+(ré|rás|rá|remos|rán)\b/gi],
    description: 'Formal future, promises, predictions',
    examples: ['Te ayudaré', 'Comenzará', 'Estará en casa']
  },
  4: {
    name: 'Estar a punto de + infinitive',
    patterns: [/\b(estoy|estás|está|estamos|están)\s+a\s+punto\s+de\s+\w+/gi],
    description: 'About to (imminent action)',
    examples: ['Estoy a punto de salir', 'Está a punto de llover']
  },
  5: {
    name: 'Pensar + infinitive',
    patterns: [/\b(pienso|piensas|piensa|pensamos|piensan)\s+\w+/gi],
    description: 'Planning to / intending to',
    examples: ['Pienso estudiar', '¿Piensas viajar?']
  },
  6: {
    name: 'Estar por + infinitive',
    patterns: [/\b(estoy|estás|está|estamos|están)\s+por\s+\w+/gi],
    description: 'About to / yet to / on verge of',
    examples: ['Estoy por llamarlo', 'Está por terminarse']
  },
  7: {
    name: 'Querer + infinitive (future)',
    patterns: [/\b(quiero|quieres|quiere|queremos|quieren)\s+\w+/gi],
    description: 'Want to (future intention)',
    examples: ['Quiero tomar un descanso', '¿Quieres salir?']
  },
  8: {
    name: 'Tener que / Deber (obligation future)',
    patterns: [/\b(tengo|tienes|tiene|tenemos|tienen)\s+que\s+\w+/gi, /\b(debo|debes|debe|debemos|deben)\s+\w+/gi],
    description: 'Obligations in future',
    examples: ['Tengo que trabajar', 'Debe terminar']
  }
};

function analyzeFutureConstructions() {
  console.log('🔮 Analyzing Spanish future construction coverage...');
  console.log('📊 Based on ChatGPT\'s high-ROI ranking\n');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const analysis = {
    total_sentences: 0,
    constructions_found: {},
    by_tier: {},
    missing_constructions: [],
    recommendations: []
  };
  
  // Initialize tracking
  Object.keys(FUTURE_CONSTRUCTIONS).forEach(priority => {
    const construction = FUTURE_CONSTRUCTIONS[priority];
    analysis.constructions_found[construction.name] = {
      priority: parseInt(priority),
      count: 0,
      examples: [],
      tiers: []
    };
  });
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`🔍 Analyzing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    analysis.by_tier[tier] = {
      total_sentences: 0,
      constructions_found: {},
      coverage_score: 0
    };
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              analysis.total_sentences++;
              analysis.by_tier[tier].total_sentences++;
              
              const spanish = sentence.spanish || '';
              
              // Check each future construction
              Object.keys(FUTURE_CONSTRUCTIONS).forEach(priority => {
                const construction = FUTURE_CONSTRUCTIONS[priority];
                
                construction.patterns.forEach(pattern => {
                  if (pattern.test(spanish)) {
                    analysis.constructions_found[construction.name].count++;
                    analysis.constructions_found[construction.name].examples.push({
                      spanish: spanish,
                      english: sentence.english,
                      tier: tier,
                      verb: verb,
                      tense: tense
                    });
                    
                    if (!analysis.constructions_found[construction.name].tiers.includes(tier)) {
                      analysis.constructions_found[construction.name].tiers.push(tier);
                    }
                    
                    if (!analysis.by_tier[tier].constructions_found[construction.name]) {
                      analysis.by_tier[tier].constructions_found[construction.name] = 0;
                    }
                    analysis.by_tier[tier].constructions_found[construction.name]++;
                  }
                });
              });
            });
          }
        });
      });
    }
    
    // Calculate coverage score for tier (weighted by priority)
    let tierScore = 0;
    Object.keys(analysis.by_tier[tier].constructions_found).forEach(constructionName => {
      const construction = Object.values(FUTURE_CONSTRUCTIONS).find(c => c.name === constructionName);
      if (construction) {
        const priority = Object.keys(FUTURE_CONSTRUCTIONS).find(p => FUTURE_CONSTRUCTIONS[p].name === constructionName);
        const weight = 9 - parseInt(priority); // Higher priority = higher weight
        tierScore += weight * (analysis.by_tier[tier].constructions_found[constructionName] > 0 ? 1 : 0);
      }
    });
    analysis.by_tier[tier].coverage_score = tierScore;
  });
  
  // Identify missing constructions
  Object.keys(FUTURE_CONSTRUCTIONS).forEach(priority => {
    const construction = FUTURE_CONSTRUCTIONS[priority];
    if (analysis.constructions_found[construction.name].count === 0) {
      analysis.missing_constructions.push({
        priority: parseInt(priority),
        name: construction.name,
        description: construction.description,
        examples: construction.examples
      });
    }
  });
  
  // Generate recommendations
  generateRecommendations(analysis);
  
  // Display results
  displayAnalysis(analysis);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/future-constructions-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Analysis saved to: ${outputPath}`);
  
  return analysis;
}

function generateRecommendations(analysis) {
  analysis.recommendations = [];
  
  // High priority missing constructions
  const highPriorityMissing = analysis.missing_constructions.filter(c => c.priority <= 4);
  if (highPriorityMissing.length > 0) {
    analysis.recommendations.push({
      priority: 'HIGH',
      action: 'ADD_HIGH_ROI_CONSTRUCTIONS',
      description: `Add ${highPriorityMissing.length} high-priority future constructions`,
      constructions: highPriorityMissing.map(c => c.name)
    });
  }
  
  // Medium priority missing constructions
  const mediumPriorityMissing = analysis.missing_constructions.filter(c => c.priority > 4 && c.priority <= 6);
  if (mediumPriorityMissing.length > 0) {
    analysis.recommendations.push({
      priority: 'MEDIUM',
      action: 'ADD_MEDIUM_ROI_CONSTRUCTIONS',
      description: `Add ${mediumPriorityMissing.length} medium-priority future constructions`,
      constructions: mediumPriorityMissing.map(c => c.name)
    });
  }
  
  // Expand existing constructions
  const lowCoverage = Object.keys(analysis.constructions_found).filter(name => {
    const construction = analysis.constructions_found[name];
    return construction.count > 0 && construction.count < 3;
  });
  
  if (lowCoverage.length > 0) {
    analysis.recommendations.push({
      priority: 'MEDIUM',
      action: 'EXPAND_EXISTING_CONSTRUCTIONS',
      description: `Add more examples for ${lowCoverage.length} under-represented constructions`,
      constructions: lowCoverage
    });
  }
}

function displayAnalysis(analysis) {
  console.log(`\n🔮 FUTURE CONSTRUCTIONS ANALYSIS:`);
  console.log(`   📝 Total sentences analyzed: ${analysis.total_sentences}`);
  
  console.log(`\n🏆 COVERAGE BY PRIORITY (ChatGPT's ROI ranking):`);
  
  Object.keys(FUTURE_CONSTRUCTIONS).forEach(priority => {
    const construction = FUTURE_CONSTRUCTIONS[priority];
    const found = analysis.constructions_found[construction.name];
    const status = found.count > 0 ? '✅' : '❌';
    const coverage = found.count > 0 ? `${found.count} examples` : 'MISSING';
    
    console.log(`   ${priority}. ${status} ${construction.name}: ${coverage}`);
    console.log(`      ${construction.description}`);
    
    if (found.count > 0) {
      console.log(`      Tiers: ${found.tiers.join(', ')}`);
      if (found.examples.length > 0) {
        const example = found.examples[0];
        console.log(`      Example: "${example.spanish}"`);
      }
    } else {
      console.log(`      Suggested: ${construction.examples[0]}`);
    }
    console.log('');
  });
  
  console.log(`📚 COVERAGE BY TIER:`);
  Object.keys(analysis.by_tier).forEach(tier => {
    const tierData = analysis.by_tier[tier];
    console.log(`   Tier ${tier}: Score ${tierData.coverage_score}/36`);
    
    const tierConstructions = Object.keys(tierData.constructions_found);
    if (tierConstructions.length > 0) {
      console.log(`     Found: ${tierConstructions.join(', ')}`);
    } else {
      console.log(`     No future constructions found`);
    }
  });
  
  if (analysis.missing_constructions.length > 0) {
    console.log(`\n🚨 MISSING HIGH-ROI CONSTRUCTIONS:`);
    analysis.missing_constructions.forEach(missing => {
      console.log(`   ${missing.priority}. ${missing.name} - ${missing.description}`);
      console.log(`      Example needed: ${missing.examples[0]}`);
    });
  }
  
  if (analysis.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS:`);
    analysis.recommendations.forEach((rec, i) => {
      console.log(`   ${i+1}. [${rec.priority}] ${rec.action}: ${rec.description}`);
      if (rec.constructions) {
        console.log(`      Focus on: ${rec.constructions.slice(0, 3).join(', ')}`);
      }
    });
  }
  
  console.log(`\n🎯 NEXT STEPS:`);
  const criticalMissing = analysis.missing_constructions.filter(c => c.priority <= 4);
  if (criticalMissing.length > 0) {
    console.log(`   🔥 URGENT: Add ${criticalMissing.length} high-ROI constructions`);
    console.log(`   📝 Priority: ${criticalMissing.map(c => c.name).join(', ')}`);
  } else {
    console.log(`   ✅ Good coverage of high-priority constructions!`);
  }
}

if (require.main === module) {
  analyzeFutureConstructions();
}

module.exports = { analyzeFutureConstructions };
