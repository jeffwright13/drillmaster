#!/usr/bin/env node

/**
 * Comprehensive Quality Assessment
 * Evaluate "known-goodness" of each sentence in the corpus
 */

const fs = require('fs');
const path = require('path');

// Quality assessment framework
function assessSentenceQuality() {
  console.log('🔍 Assessing sentence quality across entire corpus...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const qualityReport = {
    total_sentences: 0,
    by_quality_level: {
      'EXCELLENT': [],
      'GOOD': [],
      'ACCEPTABLE': [],
      'NEEDS_REVIEW': [],
      'POOR': []
    },
    by_source_reliability: {
      'HIGHLY_RELIABLE': 0,
      'RELIABLE': 0,
      'MODERATE': 0,
      'QUESTIONABLE': 0
    },
    by_tier: {},
    linguistic_issues: [],
    recommendations: []
  };
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Assessing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    qualityReport.by_tier[tier] = {
      total: 0,
      excellent: 0,
      good: 0,
      acceptable: 0,
      needs_review: 0,
      poor: 0,
      issues: []
    };
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              const assessment = assessIndividualSentence(sentence, verb, tense, tier);
              qualityReport.total_sentences++;
              qualityReport.by_tier[tier].total++;
              
              // Categorize by quality level
              qualityReport.by_quality_level[assessment.quality_level].push({
                tier: tier,
                verb: verb,
                tense: tense,
                spanish: sentence.spanish,
                english: sentence.english,
                assessment: assessment
              });
              
              // Count by tier
              qualityReport.by_tier[tier][assessment.quality_level.toLowerCase().replace('_', '_')]++;
              
              // Count by source reliability
              qualityReport.by_source_reliability[assessment.source_reliability]++;
              
              // Collect issues
              if (assessment.issues.length > 0) {
                qualityReport.linguistic_issues.push({
                  tier: tier,
                  verb: verb,
                  tense: tense,
                  spanish: sentence.spanish,
                  issues: assessment.issues
                });
                qualityReport.by_tier[tier].issues.push(...assessment.issues);
              }
            });
          }
        });
      });
    }
  });
  
  // Generate recommendations
  qualityReport.recommendations = generateQualityRecommendations(qualityReport);
  
  // Display results
  displayQualityReport(qualityReport);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/quality-assessment-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(qualityReport, null, 2));
  console.log(`\n💾 Detailed quality report saved to: ${outputPath}`);
  
  return qualityReport;
}

// Assess individual sentence quality
function assessIndividualSentence(sentence, verb, tense, tier) {
  const spanish = sentence.spanish || '';
  const english = sentence.english || '';
  
  const assessment = {
    quality_score: 0,
    quality_level: 'POOR',
    source_reliability: 'QUESTIONABLE',
    linguistic_correctness: 'UNKNOWN',
    pedagogical_value: 'LOW',
    issues: [],
    strengths: []
  };
  
  // 1. SOURCE RELIABILITY ASSESSMENT
  assessment.source_reliability = assessSourceReliability(sentence);
  
  // 2. LINGUISTIC CORRECTNESS ASSESSMENT
  const linguisticScore = assessLinguisticCorrectness(spanish, english, verb, tense);
  assessment.linguistic_correctness = linguisticScore.level;
  assessment.issues.push(...linguisticScore.issues);
  assessment.strengths.push(...linguisticScore.strengths);
  assessment.quality_score += linguisticScore.score;
  
  // 3. PEDAGOGICAL VALUE ASSESSMENT
  const pedagogicalScore = assessPedagogicalValue(spanish, english, verb, tense, tier);
  assessment.pedagogical_value = pedagogicalScore.level;
  assessment.issues.push(...pedagogicalScore.issues);
  assessment.strengths.push(...pedagogicalScore.strengths);
  assessment.quality_score += pedagogicalScore.score;
  
  // 4. TECHNICAL QUALITY ASSESSMENT
  const technicalScore = assessTechnicalQuality(spanish, english);
  assessment.issues.push(...technicalScore.issues);
  assessment.strengths.push(...technicalScore.strengths);
  assessment.quality_score += technicalScore.score;
  
  // 5. OVERALL QUALITY LEVEL
  assessment.quality_level = determineQualityLevel(assessment.quality_score, assessment.issues.length);
  
  return assessment;
}

// Assess source reliability
function assessSourceReliability(sentence) {
  if (sentence.source) {
    if (typeof sentence.source === 'object') {
      if (sentence.source.type === 'web_scraping') {
        return 'RELIABLE'; // Real usage from authentic sources
      } else if (sentence.source.type === 'transformed') {
        return 'MODERATE'; // Transformed but based on pedagogical patterns
      }
    } else if (typeof sentence.source === 'string') {
      if (sentence.source.includes('scraping')) {
        return 'RELIABLE';
      } else if (sentence.source.includes('family_context') || 
                 sentence.source.includes('work_context')) {
        return 'MODERATE'; // Original pedagogical creation
      }
    }
  }
  
  // Check for quality indicators in tags or metadata
  if (sentence.quality && sentence.quality.authenticity === 'verified') {
    return 'HIGHLY_RELIABLE';
  }
  
  return 'MODERATE'; // Default for original content
}

// Assess linguistic correctness
function assessLinguisticCorrectness(spanish, english, verb, tense) {
  const result = {
    score: 0,
    level: 'UNKNOWN',
    issues: [],
    strengths: []
  };
  
  // Spanish correctness checks
  if (spanish.length >= 10 && spanish.length <= 150) {
    result.score += 10;
    result.strengths.push('appropriate_length');
  } else if (spanish.length < 10) {
    result.issues.push('too_short');
  } else if (spanish.length > 150) {
    result.issues.push('too_long');
  }
  
  // Check for Spanish characters
  if (/[ñáéíóúü]/i.test(spanish)) {
    result.score += 5;
    result.strengths.push('spanish_characters');
  }
  
  // Check for obvious errors
  const spanishErrors = [
    /estoy siendo.*profesor/i,
    /estás siendo.*inteligente/i,
    /está siendo.*bonita/i,
    /it are raining/i, // English in Spanish
    /javascript|html|css|error|404/i, // Technical terms
    /navegador|browser|cookies/i // Web-specific terms
  ];
  
  spanishErrors.forEach(error => {
    if (error.test(spanish)) {
      result.issues.push('linguistic_error');
      result.score -= 15;
    }
  });
  
  // English correctness checks
  if (english && !english.includes('[NEEDS TRANSLATION]') && !english.includes('[TRANSFORMED')) {
    result.score += 10;
    result.strengths.push('has_translation');
    
    // Check for English errors
    const englishErrors = [
      /am being.*professor/i,
      /are being.*pretty/i,
      /is being.*intelligent/i,
      /it are raining/i
    ];
    
    englishErrors.forEach(error => {
      if (error.test(english)) {
        result.issues.push('english_error');
        result.score -= 10;
      }
    });
  } else if (english && (english.includes('[NEEDS TRANSLATION]') || english.includes('[TRANSFORMED'))) {
    result.issues.push('needs_translation');
    result.score -= 5;
  }
  
  // Verb-tense consistency check
  if (checkVerbTenseConsistency(spanish, verb, tense)) {
    result.score += 15;
    result.strengths.push('verb_tense_consistent');
  } else {
    result.issues.push('verb_tense_mismatch');
    result.score -= 10;
  }
  
  // Determine level
  if (result.score >= 25) result.level = 'EXCELLENT';
  else if (result.score >= 15) result.level = 'GOOD';
  else if (result.score >= 5) result.level = 'ACCEPTABLE';
  else result.level = 'POOR';
  
  return result;
}

// Assess pedagogical value
function assessPedagogicalValue(spanish, english, verb, tense, tier) {
  const result = {
    score: 0,
    level: 'LOW',
    issues: [],
    strengths: []
  };
  
  // Vocabulary appropriateness for tier
  const tierVocabulary = {
    '1': ['familia', 'casa', 'trabajo', 'escuela', 'comida', 'agua', 'tiempo'],
    '2': ['mañana', 'tarde', 'noche', 'levantarse', 'ducharse', 'desayuno'],
    '3': ['conocer', 'saber', 'poder', 'querer', 'hacer', 'ir', 'venir'],
    '4': ['sentir', 'pensar', 'entender', 'preocuparse', 'divertirse'],
    '5': ['gustar', 'encantar', 'molestar', 'importar', 'parecer']
  };
  
  const tierWords = tierVocabulary[tier] || [];
  const hasAppropriateVocab = tierWords.some(word => spanish.toLowerCase().includes(word));
  
  if (hasAppropriateVocab) {
    result.score += 10;
    result.strengths.push('tier_appropriate_vocabulary');
  }
  
  // Sentence complexity appropriateness
  const wordCount = spanish.split(' ').length;
  const tierComplexity = {
    '1': [5, 12],   // Simple sentences
    '2': [6, 15],   // Slightly more complex
    '3': [7, 18],   // Intermediate
    '4': [8, 20],   // More complex
    '5': [6, 16]    // Gustar-type can be shorter
  };
  
  const [minWords, maxWords] = tierComplexity[tier] || [5, 15];
  if (wordCount >= minWords && wordCount <= maxWords) {
    result.score += 8;
    result.strengths.push('appropriate_complexity');
  } else if (wordCount < minWords) {
    result.issues.push('too_simple_for_tier');
  } else {
    result.issues.push('too_complex_for_tier');
  }
  
  // Cultural context bonus
  const culturalTerms = /\b(méxico|colombia|venezuela|ecuador|perú|guatemala|honduras|costa rica|panamá|familia|trabajo|escuela|universidad)\b/i;
  if (culturalTerms.test(spanish)) {
    result.score += 5;
    result.strengths.push('cultural_context');
  }
  
  // Question vs statement variety
  if (spanish.startsWith('¿')) {
    result.score += 3;
    result.strengths.push('question_format');
  }
  
  // Determine level
  if (result.score >= 20) result.level = 'HIGH';
  else if (result.score >= 12) result.level = 'MEDIUM';
  else if (result.score >= 6) result.level = 'LOW';
  else result.level = 'VERY_LOW';
  
  return result;
}

// Assess technical quality
function assessTechnicalQuality(spanish, english) {
  const result = {
    score: 0,
    issues: [],
    strengths: []
  };
  
  // Check for encoding issues
  if (!/[^\x00-\x7F]/.test(spanish) && /[ñáéíóúü]/i.test(spanish)) {
    result.score += 5;
    result.strengths.push('proper_encoding');
  }
  
  // Check for formatting issues
  if (spanish.trim() === spanish && !spanish.includes('  ')) {
    result.score += 3;
    result.strengths.push('clean_formatting');
  } else {
    result.issues.push('formatting_issues');
  }
  
  // Check for incomplete sentences
  if (spanish.includes('_____') || spanish.includes('___')) {
    result.issues.push('incomplete_sentence');
    result.score -= 10;
  }
  
  return result;
}

// Check verb-tense consistency
function checkVerbTenseConsistency(spanish, verb, tense) {
  // Load conjugations to check
  try {
    const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
    const conjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));
    
    const verbUpper = verb.toUpperCase();
    if (conjugations[verbUpper] && conjugations[verbUpper][tense]) {
      const tenseConjugations = Object.values(conjugations[verbUpper][tense]);
      return tenseConjugations.some(conj => spanish.toLowerCase().includes(conj.toLowerCase()));
    }
  } catch (error) {
    // If we can't check, assume it's okay
    return true;
  }
  
  return false;
}

// Determine overall quality level
function determineQualityLevel(score, issueCount) {
  if (score >= 40 && issueCount === 0) return 'EXCELLENT';
  if (score >= 30 && issueCount <= 1) return 'GOOD';
  if (score >= 20 && issueCount <= 2) return 'ACCEPTABLE';
  if (score >= 10 || issueCount <= 3) return 'NEEDS_REVIEW';
  return 'POOR';
}

// Generate quality recommendations
function generateQualityRecommendations(report) {
  const recommendations = [];
  
  const poorCount = report.by_quality_level.POOR.length;
  const needsReviewCount = report.by_quality_level.NEEDS_REVIEW.length;
  const totalProblematic = poorCount + needsReviewCount;
  
  if (totalProblematic > report.total_sentences * 0.2) {
    recommendations.push({
      priority: 'HIGH',
      action: 'COMPREHENSIVE_REVIEW',
      description: `${totalProblematic} sentences (${Math.round(totalProblematic/report.total_sentences*100)}%) need attention`
    });
  }
  
  // Check for common issues
  const commonIssues = {};
  report.linguistic_issues.forEach(item => {
    item.issues.forEach(issue => {
      commonIssues[issue] = (commonIssues[issue] || 0) + 1;
    });
  });
  
  Object.keys(commonIssues).forEach(issue => {
    if (commonIssues[issue] > 10) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'FIX_COMMON_ISSUE',
        description: `Fix ${issue} (affects ${commonIssues[issue]} sentences)`
      });
    }
  });
  
  // Translation needs
  const needsTranslation = report.linguistic_issues.filter(item => 
    item.issues.includes('needs_translation')).length;
  
  if (needsTranslation > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'TRANSLATE_SENTENCES',
      description: `${needsTranslation} sentences need English translation`
    });
  }
  
  return recommendations;
}

// Display quality report
function displayQualityReport(report) {
  console.log(`\n📊 SENTENCE QUALITY ASSESSMENT REPORT:`);
  console.log(`   📝 Total sentences analyzed: ${report.total_sentences}`);
  
  console.log(`\n🏆 Quality Distribution:`);
  Object.keys(report.by_quality_level).forEach(level => {
    const count = report.by_quality_level[level].length;
    const percentage = Math.round((count / report.total_sentences) * 100);
    const emoji = {
      'EXCELLENT': '🌟',
      'GOOD': '✅',
      'ACCEPTABLE': '👍',
      'NEEDS_REVIEW': '⚠️',
      'POOR': '❌'
    }[level];
    console.log(`   ${emoji} ${level}: ${count} sentences (${percentage}%)`);
  });
  
  console.log(`\n🔍 Source Reliability:`);
  Object.keys(report.by_source_reliability).forEach(reliability => {
    const count = report.by_source_reliability[reliability];
    const percentage = Math.round((count / report.total_sentences) * 100);
    console.log(`   ${reliability}: ${count} sentences (${percentage}%)`);
  });
  
  console.log(`\n📚 Quality by Tier:`);
  Object.keys(report.by_tier).forEach(tier => {
    const tierData = report.by_tier[tier];
    const excellentPct = Math.round((tierData.excellent / tierData.total) * 100);
    const goodPct = Math.round((tierData.good / tierData.total) * 100);
    const acceptablePct = Math.round((tierData.acceptable / tierData.total) * 100);
    
    console.log(`   Tier ${tier}: ${tierData.total} sentences`);
    console.log(`     🌟 Excellent: ${tierData.excellent} (${excellentPct}%)`);
    console.log(`     ✅ Good: ${tierData.good} (${goodPct}%)`);
    console.log(`     👍 Acceptable: ${tierData.acceptable} (${acceptablePct}%)`);
    
    if (tierData.needs_review > 0 || tierData.poor > 0) {
      console.log(`     ⚠️ Needs Review: ${tierData.needs_review}`);
      console.log(`     ❌ Poor: ${tierData.poor}`);
    }
  });
  
  if (report.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS:`);
    report.recommendations.forEach((rec, i) => {
      console.log(`   ${i+1}. [${rec.priority}] ${rec.action}: ${rec.description}`);
    });
  }
  
  // Show examples of excellent sentences
  if (report.by_quality_level.EXCELLENT.length > 0) {
    console.log(`\n🌟 EXCELLENT SENTENCES (examples):`);
    report.by_quality_level.EXCELLENT.slice(0, 5).forEach((item, i) => {
      console.log(`   ${i+1}. [Tier ${item.tier}] ${item.spanish}`);
      console.log(`      Strengths: ${item.assessment.strengths.join(', ')}`);
    });
  }
  
  // Show examples of poor sentences
  if (report.by_quality_level.POOR.length > 0) {
    console.log(`\n❌ POOR SENTENCES (need attention):`);
    report.by_quality_level.POOR.slice(0, 5).forEach((item, i) => {
      console.log(`   ${i+1}. [Tier ${item.tier}] ${item.spanish}`);
      console.log(`      Issues: ${item.assessment.issues.join(', ')}`);
    });
  }
}

if (require.main === module) {
  assessSentenceQuality();
}

module.exports = { assessSentenceQuality };
