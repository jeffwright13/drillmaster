# Enhanced Corpus JSON Format

## Current vs. Enhanced Format

### **Current Format (Basic)**
```json
{
  "spanish": "Él tiene tres hijos pequeños en casa.",
  "english": "He has three small children at home.",
  "subject": "él",
  "region": "universal",
  "source": "family_context"
}
```

### **Enhanced Format (With Provenance & Quality)**
```json
{
  "spanish": "Él tiene tres hijos pequeños en casa.",
  "english": "He has three small children at home.",
  "subject": "él",
  "region": "universal",
  
  // PROVENANCE TRACKING
  "source": {
    "type": "web_scraping",           // web_scraping | textbook | manual_creation | ai_generated
    "origin": "eluniverso.com",      // Specific source URL/book/person
    "country": "ecuador",            // Source country
    "date_collected": "2025-12-02",  // When we got it
    "method": "latin_american_scraper_v1" // Which tool/version
  },
  
  // QUALITY METRICS
  "quality": {
    "score": 42,                     // Calculated quality score
    "authenticity": "verified",      // verified | suspected | unknown
    "linguistic_review": "pending",  // approved | pending | rejected
    "reviewer": null,                // Who reviewed it (if any)
    "review_date": null
  },
  
  // LINGUISTIC METADATA
  "linguistic": {
    "verb_form": "tiene",            // The actual conjugated form found
    "construction": "standard",      // standard | reflexive | gustar_type | irregular
    "difficulty": "beginner",        // beginner | intermediate | advanced
    "frequency": "high",             // high | medium | low (how common this verb form is)
    "register": "neutral"            // formal | neutral | informal | colloquial
  },
  
  // PEDAGOGICAL METADATA
  "pedagogy": {
    "learning_focus": ["conjugation", "vocabulary"], // What this sentence teaches
    "cultural_context": "family",    // family | work | food | travel | etc.
    "tier_appropriate": true,        // Is this appropriate for its tier?
    "complexity_score": 3            // 1-5 scale
  },
  
  // USAGE TRACKING
  "usage": {
    "times_used": 0,                 // How many times in generated decks
    "user_feedback": [],             // Array of user feedback
    "last_used": null,
    "effectiveness_score": null      // Based on user performance
  },
  
  // STANDARD FIELDS (unchanged)
  "tags": [
    "region:universal",
    "subject:él",
    "tense:present",
    "tier:1",
    "verb-type:er",
    "word-type:verb",
    "source:web_scraping",
    "country:ecuador",
    "quality:verified"
  ]
}
```

## **Benefits of Enhanced Format:**

### **1. Provenance Tracking**
- Know exactly where each sentence came from
- Track which scraping methods work best
- Identify high-quality sources for future scraping

### **2. Quality Management**
- Score and rank sentences automatically
- Flag sentences needing human review
- Track which sentences users find helpful

### **3. Linguistic Analysis**
- Categorize by difficulty and register
- Identify gaps in coverage
- Ensure pedagogical appropriateness

### **4. Source Diversity**
- **Web scraping**: Real news, blogs, social media
- **Textbook extraction**: Your Spanish school's BASICO text
- **Manual creation**: Human-written examples
- **AI assistance**: ChatGPT-suggested improvements

### **5. Continuous Improvement**
- Track sentence effectiveness
- Get user feedback
- Iteratively improve corpus quality

## **Migration Strategy:**

1. **Gradual enhancement**: Add new fields to new sentences
2. **Backward compatibility**: Keep existing format working
3. **Batch updates**: Enhance existing sentences over time
4. **Quality gates**: Require minimum metadata for new additions

## **Implementation Priority:**

1. **High**: `source.type`, `source.origin`, `quality.score`
2. **Medium**: `linguistic.verb_form`, `linguistic.construction`
3. **Low**: `usage.times_used`, `pedagogy.complexity_score`
