# Spanish Verb Conjugation Corpus Summary

## Overview
Complete manually curated Spanish verb corpus with 924 natural sentences across 44 essential verbs, organized into 4 progressive tiers. Each sentence includes proper metadata, tags, and regional variants for comprehensive Spanish learning.

## File Structure
```
data/corpus/
├── tier1-complete.json  (10 verbs, 210 sentences)
├── tier2-complete.json  (12 verbs, 252 sentences)  
├── tier3-complete.json  (12 verbs, 252 sentences)
├── tier4-complete.json  (10 verbs, 210 sentences)
└── *.backup.json        (old fragmented files - archived)
```

## Tier Breakdown

### 🎯 TIER 1: Most essential Spanish verbs - fundamental for basic communication
- **Verbs**: 10
- **Sentences**: 210
- **Verbs**: COMER, ESTAR, HABLAR, HACER, IR, PODER, QUERER, SER, TENER, VIVIR

### 🎯 TIER 2: Essential daily life verbs - reflexive verbs and common actions
- **Verbs**: 12
- **Sentences**: 252
- **Verbs**: ACOSTARSE, DAR, DECIR, DESPERTARSE, ENCONTRAR, LAVAR, LEVANTARSE, LLAMARSE, SABER, SENTARSE, VER, VESTIRSE

### 🎯 TIER 3: Important intermediate verbs - emotions, cognition, and complex actions
- **Verbs**: 12
- **Sentences**: 252
- **Verbs**: DUCHARSE, ENTENDER, IRSE, LAVARSE, PENSAR, PONER, PONERSE, QUEDARSE, SALIR, SENTIR, SENTIRSE, VENIR

### 🎯 TIER 4: Advanced verbs - specialized actions and complex constructions
- **Verbs**: 10
- **Sentences**: 210
- **Verbs**: CONOCER, CREER, DIVERTIRSE, ENCONTRARSE, GUSTAR, LLEVAR, NECESITAR, OÍR, PREOCUPARSE, TRAER

## 🎉 TOTALS: 44 verbs, 924 sentences

## Data Structure

### Metadata Structure
Each tier file includes comprehensive metadata:
```json
{
  "metadata": {
    "tier": 1,
    "description": "Most essential Spanish verbs - fundamental for basic communication",
    "verb_count": 10,
    "sentence_count": 210,
    "tenses": ["present", "preterite", "future"],
    "subjects": ["yo", "tú", "vos", "él/ella/usted", "nosotros", "vosotros", "ellos/ellas/ustedes"],
    "regions": ["universal", "argentina", "spain"]
  }
}
```

### Sentence Structure
Each sentence includes rich metadata and tags:
```json
{
  "spanish": "Hablo español con mis compañeros de trabajo.",
  "english": "I speak Spanish with my coworkers.",
  "subject": "yo",
  "region": "universal",
  "source": "workplace_communication",
  "tags": ["present", "tier:1", "regular", "region:universal", "subject:yo"]
}
```

### Verb Metadata
Each verb includes linguistic metadata:
```json
{
  "metadata": {
    "english": "to speak",
    "verb_type": "ar",
    "regularity": "regular",
    "tags": ["tier:1", "regular", "ar-verb", "communication"]
  }
}
```

## Coverage

### Tenses
- ✅ **Present tense**: All 44 verbs (308 sentences)
- ✅ **Preterite tense**: All 44 verbs (308 sentences)
- ✅ **Future tense**: All 44 verbs (308 sentences)

### Subjects
- ✅ **yo** (I)
- ✅ **tú** (you - informal)
- ✅ **vos** (you - Argentina)
- ✅ **él/ella/usted** (he/she/you formal)
- ✅ **nosotros** (we)
- ✅ **vosotros** (you all - Spain)
- ✅ **ellos/ellas/ustedes** (they/you all)

### Regional Variants
- ✅ **Universal**: Standard Spanish used globally
- ✅ **Argentina**: Vos conjugations and regional expressions
- ✅ **Spain**: Vosotros conjugations and Peninsular Spanish

## Quality Features

### ✅ Grammatical Accuracy
- Every sentence follows proper Spanish grammar rules
- Verb conjugations are correct for each tense and subject
- Regional forms (vos/vosotros) use authentic conjugations
- Reflexive pronouns properly placed and matched

### ✅ Contextual Authenticity
- All sentences reflect real-world usage patterns
- Natural contexts: work, family, travel, emotions, daily activities
- No artificial template constructions
- Culturally appropriate scenarios

### ✅ Educational Value
- Progressive difficulty across tiers
- Diverse vocabulary and scenarios
- Proper usage demonstrated in context
- Eliminates template-based fallback problems

## Tags for Deck Generation

### Available Tags
- **Tier**: `tier:1`, `tier:2`, `tier:3`, `tier:4`
- **Tense**: `present`, `preterite`, `future`
- **Region**: `region:universal`, `region:argentina`, `region:spain`
- **Subject**: `subject:yo`, `subject:tú`, `subject:vos`, etc.
- **Verb Type**: `regular`, `irregular`, `highly-irregular`
- **Verb Ending**: `ar-verb`, `er-verb`, `ir-verb`
- **Special Features**: `reflexive`, `stem-changing`, `copula`, `special-construction`

### Example Deck Filters
- **Beginner Deck**: `tier:1` + `tier:2` + `present`
- **Argentina Spanish**: `region:argentina` + `subject:vos`
- **Spain Spanish**: `region:spain` + `subject:vosotros`
- **Irregular Verbs**: `irregular` + `highly-irregular`
- **Reflexive Verbs**: `reflexive`
- **Past Tense Practice**: `preterite`

## Creation Date
November 29, 2024

## Status
✅ **Complete** - Ready for production use in Spanish learning applications

---

*This corpus provides Spanish students with authentic, high-quality learning materials that reflect how native speakers actually use these verbs in real contexts.*
