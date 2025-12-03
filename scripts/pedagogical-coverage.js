#!/usr/bin/env node

/**
 * Pedagogical Coverage Assessment
 * Evaluate coverage of each learning objective across tiers
 */

const fs = require('fs');
const path = require('path');

// Define pedagogical objectives for each tier
const TIER_OBJECTIVES = {
  1: {
    name: 'Foundations',
    tenses: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future'],
    subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'],
    key_verbs: ['SER', 'ESTAR', 'TENER', 'HACER', 'IR', 'VENIR', 'VER', 'DAR', 'SABER', 'PODER'],
    learning_goals: [
      'basic_conjugation',
      'present_tense_mastery',
      'past_tense_introduction',
      'future_expression',
      'question_formation',
      'negation'
    ]
  },
  2: {
    name: 'Daily Routines',
    tenses: ['present', 'present-progressive', 'going-to', 'preterite'],
    subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'],
    key_verbs: ['LLAMARSE', 'LEVANTARSE', 'DUCHARSE', 'SENTARSE', 'ACOSTARSE', 'DESPERTARSE', 'IRSE', 'LAVARSE', 'LAVAR', 'PONERSE', 'VESTIRSE', 'QUEDARSE'],
    learning_goals: [
      'reflexive_verbs',
      'daily_routine_vocabulary',
      'time_expressions',
      'personal_care_activities'
    ]
  },
  3: {
    name: 'Irregular Essentials',
    tenses: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect'],
    subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'],
    key_verbs: ['PONER', 'SALIR', 'TRAER', 'OÍR', 'CAER', 'CONOCER', 'CONDUCIR', 'TRADUCIR', 'DECIR', 'VALER', 'CREER', 'LEER'],
    learning_goals: [
      'irregular_conjugations',
      'stem_changing_verbs',
      'spelling_changes',
      'complex_past_tenses'
    ]
  },
  4: {
    name: 'Emotional & Cognitive',
    tenses: ['present', 'present-progressive', 'going-to', 'present-perfect'],
    subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'],
    key_verbs: ['SENTIR', 'SENTIRSE', 'PENSAR', 'ENTENDER', 'ENCONTRAR', 'ENCONTRARSE', 'LLEVAR', 'PREOCUPARSE', 'DIVERTIRSE'],
    learning_goals: [
      'emotional_expression',
      'cognitive_verbs',
      'reflexive_emotional_states',
      'complex_feelings'
    ]
  },
  5: {
    name: 'Gustar-Type Verbs',
    tenses: ['present', 'going-to', 'preterite'],
    subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes'],
    key_verbs: ['GUSTAR', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'DOLER', 'PARECER'],
    learning_goals: [
      'gustar_construction',
      'indirect_object_pronouns',
      'backwards_verbs',
      'preference_expression'
    ]
  }
};

function assessPedagogicalCoverage() {
  console.log('🎯 Assessing pedagogical coverage across all tiers...');
  
  const coverageReport = {
    overall_coverage: {},
    by_tier: {},
    gaps: [],
    strengths: [],
    recommendations: []
  };
  
  // Assess each tier
  Object.keys(TIER_OBJECTIVES).forEach(tier => {
    console.log(`\n📚 Analyzing Tier ${tier}: ${TIER_OBJECTIVES[tier].name}...`);
    
    const tierCoverage = assessTierCoverage(tier);
    coverageReport.by_tier[tier] = tierCoverage;
    
    // Identify gaps and strengths
    identifyGapsAndStrengths(tierCoverage, tier, coverageReport);
  });
  
  // Generate overall statistics
  generateOverallStatistics(coverageReport);
  
  // Generate recommendations
  generateCoverageRecommendations(coverageReport);
  
  // Display results
  displayCoverageReport(coverageReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/pedagogical-coverage-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(coverageReport, null, 2));
  console.log(`\n💾 Coverage report saved to: ${outputPath}`);
  
  return coverageReport;
}

function assessTierCoverage(tier) {
  const objectives = TIER_OBJECTIVES[tier];
  const filePath = path.join(__dirname, `../data/corpus/tier${tier}-complete.json`);
  
  if (!fs.existsSync(filePath)) {
    return { error: 'File not found' };
  }
  
  const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  const coverage = {
    tier: tier,
    name: objectives.name,
    total_sentences: 0,
    verb_coverage: {},
    tense_coverage: {},
    subject_coverage: {},
    learning_goal_coverage: {},
    completion_percentage: 0,
    missing_combinations: [],
    well_covered_areas: []
  };
  
  // Initialize coverage tracking
  objectives.key_verbs.forEach(verb => {
    coverage.verb_coverage[verb] = {
      total_sentences: 0,
      tenses: {},
      subjects: {},
      missing_tenses: [],
      missing_subjects: []
    };
    
    objectives.tenses.forEach(tense => {
      coverage.verb_coverage[verb].tenses[tense] = 0;
    });
    
    objectives.subjects.forEach(subject => {
      coverage.verb_coverage[verb].subjects[subject] = 0;
    });
  });
  
  objectives.tenses.forEach(tense => {
    coverage.tense_coverage[tense] = { verbs: 0, sentences: 0 };
  });
  
  objectives.subjects.forEach(subject => {
    coverage.subject_coverage[subject] = { verbs: 0, sentences: 0 };
  });
  
  // Analyze actual corpus content
  if (corpus.verbs) {
    Object.keys(corpus.verbs).forEach(verb => {
      if (objectives.key_verbs.includes(verb)) {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (objectives.tenses.includes(tense) && Array.isArray(corpus.verbs[verb][tense])) {
            const sentences = corpus.verbs[verb][tense];
            
            coverage.verb_coverage[verb].total_sentences += sentences.length;
            coverage.verb_coverage[verb].tenses[tense] = sentences.length;
            coverage.tense_coverage[tense].sentences += sentences.length;
            coverage.total_sentences += sentences.length;
            
            // Count unique subjects
            const subjectsInTense = new Set();
            sentences.forEach(sentence => {
              if (sentence.subject && objectives.subjects.includes(sentence.subject)) {
                coverage.verb_coverage[verb].subjects[sentence.subject]++;
                coverage.subject_coverage[sentence.subject].sentences++;
                subjectsInTense.add(sentence.subject);
              }
            });
            
            coverage.tense_coverage[tense].verbs++;
            subjectsInTense.forEach(subject => {
              coverage.subject_coverage[subject].verbs++;
            });
          }
        });
      }
    });
  }
  
  // Identify missing combinations
  objectives.key_verbs.forEach(verb => {
    objectives.tenses.forEach(tense => {
      if (coverage.verb_coverage[verb].tenses[tense] === 0) {
        coverage.verb_coverage[verb].missing_tenses.push(tense);
        coverage.missing_combinations.push({ verb, tense, type: 'verb_tense' });
      }
    });
    
    objectives.subjects.forEach(subject => {
      if (coverage.verb_coverage[verb].subjects[subject] === 0) {
        coverage.verb_coverage[verb].missing_subjects.push(subject);
        coverage.missing_combinations.push({ verb, subject, type: 'verb_subject' });
      }
    });
  });
  
  // Calculate completion percentage
  const totalCombinations = objectives.key_verbs.length * objectives.tenses.length;
  const completedCombinations = totalCombinations - coverage.missing_combinations.filter(c => c.type === 'verb_tense').length;
  coverage.completion_percentage = Math.round((completedCombinations / totalCombinations) * 100);
  
  // Identify well-covered areas
  objectives.key_verbs.forEach(verb => {
    const verbData = coverage.verb_coverage[verb];
    if (verbData.total_sentences >= 5 && verbData.missing_tenses.length === 0) {
      coverage.well_covered_areas.push({ type: 'verb', name: verb, sentences: verbData.total_sentences });
    }
  });
  
  return coverage;
}

function identifyGapsAndStrengths(tierCoverage, tier, report) {
  const objectives = TIER_OBJECTIVES[tier];
  
  // Identify gaps
  tierCoverage.missing_combinations.forEach(combo => {
    if (combo.type === 'verb_tense') {
      report.gaps.push({
        tier: tier,
        severity: 'HIGH',
        type: 'missing_verb_tense',
        description: `${combo.verb} in ${combo.tense} tense has no examples`,
        verb: combo.verb,
        tense: combo.tense
      });
    }
  });
  
  // Check for under-represented areas
  Object.keys(tierCoverage.verb_coverage).forEach(verb => {
    const verbData = tierCoverage.verb_coverage[verb];
    if (verbData.total_sentences < 3) {
      report.gaps.push({
        tier: tier,
        severity: 'MEDIUM',
        type: 'under_represented_verb',
        description: `${verb} has only ${verbData.total_sentences} examples (needs more)`,
        verb: verb,
        current_count: verbData.total_sentences
      });
    }
  });
  
  // Identify strengths
  tierCoverage.well_covered_areas.forEach(area => {
    report.strengths.push({
      tier: tier,
      type: area.type,
      name: area.name,
      description: `${area.name} is well covered with ${area.sentences} examples`,
      sentence_count: area.sentences
    });
  });
  
  if (tierCoverage.completion_percentage >= 90) {
    report.strengths.push({
      tier: tier,
      type: 'overall_coverage',
      name: `Tier ${tier} Coverage`,
      description: `Excellent coverage at ${tierCoverage.completion_percentage}%`,
      percentage: tierCoverage.completion_percentage
    });
  }
}

function generateOverallStatistics(report) {
  report.overall_coverage = {
    total_tiers: Object.keys(TIER_OBJECTIVES).length,
    total_sentences: 0,
    average_completion: 0,
    best_tier: null,
    worst_tier: null,
    total_gaps: report.gaps.length,
    critical_gaps: report.gaps.filter(g => g.severity === 'HIGH').length
  };
  
  let totalCompletion = 0;
  let bestPercentage = 0;
  let worstPercentage = 100;
  
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    if (tierData.completion_percentage !== undefined) {
      report.overall_coverage.total_sentences += tierData.total_sentences;
      totalCompletion += tierData.completion_percentage;
      
      if (tierData.completion_percentage > bestPercentage) {
        bestPercentage = tierData.completion_percentage;
        report.overall_coverage.best_tier = { tier, percentage: bestPercentage };
      }
      
      if (tierData.completion_percentage < worstPercentage) {
        worstPercentage = tierData.completion_percentage;
        report.overall_coverage.worst_tier = { tier, percentage: worstPercentage };
      }
    }
  });
  
  report.overall_coverage.average_completion = Math.round(totalCompletion / Object.keys(report.by_tier).length);
}

function generateCoverageRecommendations(report) {
  // High priority: Critical gaps
  const criticalGaps = report.gaps.filter(g => g.severity === 'HIGH');
  if (criticalGaps.length > 0) {
    report.recommendations.push({
      priority: 'HIGH',
      action: 'FILL_CRITICAL_GAPS',
      description: `Fill ${criticalGaps.length} critical gaps (missing verb-tense combinations)`,
      details: criticalGaps.slice(0, 5).map(g => `${g.verb} + ${g.tense}`)
    });
  }
  
  // Medium priority: Under-represented verbs
  const underRepresented = report.gaps.filter(g => g.type === 'under_represented_verb');
  if (underRepresented.length > 0) {
    report.recommendations.push({
      priority: 'MEDIUM',
      action: 'EXPAND_VERB_COVERAGE',
      description: `Add more examples for ${underRepresented.length} under-represented verbs`,
      details: underRepresented.slice(0, 5).map(g => `${g.verb} (${g.current_count} examples)`)
    });
  }
  
  // Tier-specific recommendations
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    if (tierData.completion_percentage < 80) {
      report.recommendations.push({
        priority: 'MEDIUM',
        action: 'IMPROVE_TIER_COVERAGE',
        description: `Tier ${tier} needs improvement (${tierData.completion_percentage}% complete)`,
        tier: tier,
        missing_count: tierData.missing_combinations.length
      });
    }
  });
}

function displayCoverageReport(report) {
  console.log(`\n🎯 PEDAGOGICAL COVERAGE REPORT:`);
  console.log(`   📊 Total sentences: ${report.overall_coverage.total_sentences}`);
  console.log(`   📈 Average completion: ${report.overall_coverage.average_completion}%`);
  console.log(`   🏆 Best tier: Tier ${report.overall_coverage.best_tier?.tier} (${report.overall_coverage.best_tier?.percentage}%)`);
  console.log(`   ⚠️ Worst tier: Tier ${report.overall_coverage.worst_tier?.tier} (${report.overall_coverage.worst_tier?.percentage}%)`);
  
  console.log(`\n📚 Coverage by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    console.log(`   Tier ${tier} (${tierData.name}): ${tierData.completion_percentage}% complete`);
    console.log(`     📝 ${tierData.total_sentences} sentences`);
    console.log(`     ❌ ${tierData.missing_combinations.length} missing combinations`);
    
    if (tierData.well_covered_areas.length > 0) {
      console.log(`     ✅ Well covered: ${tierData.well_covered_areas.map(a => a.name).join(', ')}`);
    }
  });
  
  if (report.gaps.length > 0) {
    console.log(`\n🚨 CRITICAL GAPS (${report.overall_coverage.critical_gaps} high priority):`);
    report.gaps.filter(g => g.severity === 'HIGH').slice(0, 10).forEach((gap, i) => {
      console.log(`   ${i+1}. ${gap.description}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS:`);
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i+1}. [${rec.priority}] ${rec.action}: ${rec.description}`);
      if (rec.details) {
        console.log(`      Examples: ${rec.details.join(', ')}`);
      }
    });
  }
  
  console.log(`\n🌟 STRENGTHS:`);
  const topStrengths = report.strengths.slice(0, 5);
  topStrengths.forEach((strength, i) => {
    console.log(`   ${i+1}. ${strength.description}`);
  });
}

if (require.main === module) {
  assessPedagogicalCoverage();
}

module.exports = { assessPedagogicalCoverage };
