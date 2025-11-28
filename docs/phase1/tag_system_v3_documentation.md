# Spanish Learning Tag System v3.0 - Future-Proof Design

## Overview
This tagging system is designed to support multiple word types (verbs, nouns, adjectives, etc.) and various study methods (translation, cloze, conjugation practice, etc.). Tags are semicolon-separated key-value pairs.

## Core Format
```
key:value;key:value;key:value
```

Multiple values for same key use colon-separated nested format:
```
verb-tense:future:irregular;verb-tense:preterite:irregular
```

---

## Universal Tags (Apply to All Word Types)

### tier (REQUIRED)
Learning priority for progressive study
- `tier:1` - Most essential (foundation)
- `tier:2` - Core daily usage
- `tier:3` - Common expansion
- `tier:4` - Complete essentials
- `tier:5` - Advanced (for future expansion)
- `tier:6` - Specialized (for future expansion)

**Values**: `1`, `2`, `3`, `4`, `5`, `6`

### word-type (REQUIRED)
Type of word being studied
- `word-type:verb` - Action/state word
- `word-type:noun` - Person/place/thing (future)
- `word-type:adjective` - Descriptive word (future)
- `word-type:adverb` - Modifier word (future)
- `word-type:pronoun` - Replacement word (future)
- `word-type:preposition` - Relationship word (future)
- `word-type:conjunction` - Connecting word (future)
- `word-type:phrase` - Multi-word expression (future)

**Values**: `verb`, `noun`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `phrase`

### frequency (OPTIONAL - Future)
Word frequency in spoken/written Spanish
- `frequency:top-100` - Most common 100 words
- `frequency:top-500` - Top 500 words
- `frequency:top-1000` - Top 1000 words
- `frequency:common` - Common but not top 1000
- `frequency:intermediate` - Less common
- `frequency:advanced` - Rare/specialized

**Values**: `top-100`, `top-500`, `top-1000`, `common`, `intermediate`, `advanced`

---

## Verb-Specific Tags

### verb-type (REQUIRED for verbs)
Verb ending classification
- `verb-type:ar` - Ends in -ar
- `verb-type:er` - Ends in -er
- `verb-type:ir` - Ends in -ir

**Values**: `ar`, `er`, `ir`

### regularity (REQUIRED for verbs)
Overall regularity status
- `regularity:regular` - Follows standard patterns
- `regularity:irregular` - Has irregular conjugations
- `regularity:highly-irregular` - Extremely irregular (must memorize)

**Values**: `regular`, `irregular`, `highly-irregular`

### stem-change (OPTIONAL)
Present tense stem change pattern
- `stem-change:e-ie` - e→ie (PENSAR→pienso)
- `stem-change:o-ue` - o→ue (PODER→puedo)
- `stem-change:e-i` - e→i (DECIR→digo)
- `stem-change:u-ue` - u→ue (JUGAR→juego - future)

**Values**: `e-ie`, `o-ue`, `e-i`, `u-ue`

### verb-tense (OPTIONAL)
Tense-specific irregularities or patterns
Format: `verb-tense:TENSE:CHARACTERISTIC`

Examples:
- `verb-tense:preterite:irregular` - Irregular conjugation in preterite
- `verb-tense:future:irregular` - Irregular in future
- `verb-tense:preterite:stem-change:e-i` - Stem change in preterite 3rd person
- `verb-tense:present-subjunctive:irregular` - Irregular in subjunctive (future)

**Common patterns**:
- `verb-tense:preterite:irregular`
- `verb-tense:future:irregular`
- `verb-tense:preterite:stem-change:e-i`
- `verb-tense:imperfect:irregular` (future - rare, only 3 verbs)

### yo-form (OPTIONAL)
Irregularity only in first-person singular
- `yo-form:irregular` - Yo form has unique irregularity
- `yo-form:zco` - Adds -zco (CONOCER→conozco)
- `yo-form:go` - Adds -go (HACER→hago, PONER→pongo)

**Values**: `irregular`, `zco`, `go`

### reflexive (OPTIONAL)
Whether verb is reflexive
- `reflexive:true` - Requires reflexive pronouns

**Values**: `true` (omit if false)

### copula (OPTIONAL)
Linking verb (SER, ESTAR)
- `copula:true`

**Values**: `true` (omit if false)

### special-construction (OPTIONAL)
Unusual grammatical constructions
- `special-construction:indirect-object` - Uses indirect objects (GUSTAR)
- `special-construction:impersonal` - Impersonal construction (future)

**Values**: `indirect-object`, `impersonal`

### spelling-change (OPTIONAL)
Minor spelling adjustments
- `spelling-change:preterite` - Spelling change in preterite
- `spelling-change:true` - Has spelling changes

**Values**: `preterite`, `true`

---

## Future Noun-Specific Tags

### noun-type (for nouns)
- `noun-type:masculine` - Masculine noun
- `noun-type:feminine` - Feminine noun
- `noun-type:both` - Can be either gender

### noun-number (for nouns)
- `noun-number:singular` - Only used in singular
- `noun-number:plural` - Only used in plural
- `noun-number:both` - Has both forms (default)

### noun-irregularity (for nouns)
- `noun-irregularity:plural-irregular` - Irregular plural formation

---

## Future Study Method Tags

### study-method (OPTIONAL)
Suggested practice methods for this item
- `study-method:cloze` - Good for cloze deletion
- `study-method:translation` - Good for translation practice
- `study-method:conjugation` - Practice all conjugations
- `study-method:listening` - Audio recognition practice
- `study-method:production` - Sentence production
- `study-method:recognition` - Recognition only

**Values**: Can be comma-separated for multiple methods

### difficulty (OPTIONAL)
Subjective difficulty rating
- `difficulty:easy` - Easy to learn/remember
- `difficulty:medium` - Moderate difficulty
- `difficulty:hard` - Challenging
- `difficulty:very-hard` - Very challenging (false friends, etc.)

---

## Future Relationship Tags

### antonym (OPTIONAL)
Link to antonym
- `antonym:WORD` - Links to opposite meaning
- Example: `antonym:ABRIR` on CERRAR

### synonym (OPTIONAL)
Link to synonym
- `synonym:WORD` - Links to similar meaning

### related-word (OPTIONAL)
Links to related words
- `related-word:noun:PALABRA` - Related noun form
- `related-word:verb:HABLAR` - Related verb form
- Example on HABLADOR: `related-word:verb:HABLAR`

### confused-with (OPTIONAL)
Commonly confused words
- `confused-with:SER` on ESTAR
- `confused-with:SABER` on CONOCER

### pair (OPTIONAL)
Words that naturally pair/contrast
- `pair:IR` on VENIR (go/come)
- `pair:TRAER` on LLEVAR (bring/take)

---

## Practical Usage Examples

### Python Parsing Function
```python
def parse_tags(tag_string):
    """Parse tag string into structured dictionary."""
    tags = {}
    for tag in tag_string.split(';'):
        parts = tag.split(':', 1)
        if len(parts) == 2:
            key, value = parts
            # Handle nested values (e.g., verb-tense:preterite:irregular)
            if key in tags:
                # Multiple instances of same key
                if not isinstance(tags[key], list):
                    tags[key] = [tags[key]]
                tags[key].append(value)
            else:
                tags[key] = value
        else:
            # Legacy or boolean tag
            tags[tag] = True
    return tags

# Example usage
tags = parse_tags("tier:2;word-type:verb;verb-type:ar;regularity:irregular;stem-change:e-ie;reflexive:true")
print(tags['tier'])  # '2'
print(tags['stem-change'])  # 'e-ie'
print(tags.get('reflexive'))  # 'true'

# Multiple verb-tense tags
tags = parse_tags("verb-tense:preterite:irregular;verb-tense:future:irregular")
print(tags['verb-tense'])  # ['preterite:irregular', 'future:irregular']
```

### Query Examples
```python
# Get all Tier 1 verbs
tier1 = [w for w in words if parse_tags(w.tags).get('tier') == '1']

# Get all reflexive verbs
reflexive = [w for w in words if parse_tags(w.tags).get('reflexive') == 'true']

# Get all stem-changing e→ie verbs
e_ie_verbs = [w for w in words if parse_tags(w.tags).get('stem-change') == 'e-ie']

# Get verbs irregular in future tense
def has_future_irregular(tags_dict):
    verb_tenses = tags_dict.get('verb-tense', [])
    if isinstance(verb_tenses, str):
        verb_tenses = [verb_tenses]
    return any('future:irregular' in vt for vt in verb_tenses)

future_irregular = [w for w in words if has_future_irregular(parse_tags(w.tags))]

# Get all regular -ar verbs in Tier 1
tier1_regular_ar = [w for w in words 
                    if parse_tags(w.tags).get('tier') == '1'
                    and parse_tags(w.tags).get('verb-type') == 'ar'
                    and parse_tags(w.tags).get('regularity') == 'regular']
```

---

## Backend Code Ideas for Sentence Generation

### Sentence Template System
```python
class SentenceGenerator:
    """Generate practice sentences based on verb properties."""
    
    def __init__(self, verb_data):
        self.verb = verb_data['verb']
        self.tags = parse_tags(verb_data['tags'])
        self.english = verb_data['english']
    
    def generate_cloze(self, tense='present', subject='yo'):
        """Generate cloze deletion exercise."""
        # Example: "Yo {{c1::hablo}} español todos los días."
        conjugation = self.conjugate(tense, subject)
        sentence = self.get_template(tense, subject)
        return sentence.replace(conjugation, f"{{{{c1::{conjugation}}}}}")
    
    def generate_translation(self, tense='present', subject='yo'):
        """Generate translation exercise."""
        spanish = self.get_sentence(tense, subject)
        english = self.get_english_sentence(tense, subject)
        return (spanish, english)
    
    def get_difficulty_appropriate_sentence(self):
        """Generate sentence appropriate for verb's tier."""
        tier = int(self.tags.get('tier', 1))
        if tier == 1:
            # Simple present tense sentences
            return self.generate_simple_sentence()
        elif tier == 2:
            # Can use past tense
            return self.generate_past_sentence()
        # etc.
```

### Context-Aware Practice
```python
def generate_practice_set(verbs, focus='mixed'):
    """Generate practice set with specific focus."""
    
    if focus == 'stem-changing':
        # Only stem-changing verbs with examples highlighting changes
        return [v for v in verbs if 'stem-change' in parse_tags(v.tags)]
    
    elif focus == 'reflexive-routine':
        # Reflexive verbs in context of daily routine
        routine_verbs = [v for v in verbs 
                        if parse_tags(v.tags).get('reflexive') == 'true']
        return generate_routine_story(routine_verbs)
    
    elif focus == 'irregular-preterite':
        # Focus on preterite irregulars
        return [v for v in verbs if has_preterite_irregular(parse_tags(v.tags))]
```

### Contrast Pairs
```python
def generate_contrast_exercises():
    """Generate exercises contrasting commonly confused items."""
    
    contrasts = [
        ('SER', 'ESTAR', 'permanent vs temporary'),
        ('SABER', 'CONOCER', 'facts vs familiarity'),
        ('IR', 'VENIR', 'go vs come'),
        ('PONER', 'PONERSE', 'put vs put on/become'),
    ]
    
    for verb1, verb2, explanation in contrasts:
        yield generate_contrast_exercise(verb1, verb2, explanation)
```

---

## Database Schema Suggestion

```sql
CREATE TABLE vocabulary (
    id INTEGER PRIMARY KEY,
    word TEXT NOT NULL,
    word_type TEXT NOT NULL,  -- verb, noun, etc.
    english TEXT NOT NULL,
    tier INTEGER NOT NULL,
    tags TEXT NOT NULL,  -- Serialized tag string
    notes TEXT,
    created_at TIMESTAMP,
    mastery_level INTEGER DEFAULT 0
);

CREATE TABLE study_sessions (
    id INTEGER PRIMARY KEY,
    vocabulary_id INTEGER,
    session_date TIMESTAMP,
    correct BOOLEAN,
    study_method TEXT,  -- cloze, translation, conjugation
    time_spent INTEGER,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id)
);

CREATE TABLE relationships (
    id INTEGER PRIMARY KEY,
    word_id_1 INTEGER,
    word_id_2 INTEGER,
    relationship_type TEXT,  -- antonym, synonym, confused-with, pair
    FOREIGN KEY (word_id_1) REFERENCES vocabulary(id),
    FOREIGN KEY (word_id_2) REFERENCES vocabulary(id)
);
```

---

## Migration Path

### Phase 1: Verbs (Current)
- 42 essential verbs with full tagging
- Focus on tier-based learning
- Conjugation practice

### Phase 2: High-Frequency Nouns
- Add ~50-100 essential nouns
- Tag with gender, number patterns
- Integrate with verb sentences

### Phase 3: Essential Adjectives & Adverbs
- Common descriptive words
- Agreement patterns
- Comparative/superlative forms

### Phase 4: Pronouns & Prepositions
- Subject, object, reflexive pronouns
- Common prepositions
- Prepositional phrases

### Phase 5: Phrases & Expressions
- Common multi-word expressions
- Idiomatic phrases
- Conversational chunks

### Phase 6: Advanced Features
- Antonym/synonym linking
- Confused-word pairs
- Contextual sentence generation
- Spaced repetition optimization

---

## Benefits of This System

1. **Scalable**: Easy to add new word types
2. **Queryable**: Can filter by any tag combination
3. **Extensible**: New tags don't break existing code
4. **Structured**: Key-value pairs are parsable
5. **Future-Proof**: Designed for multiple study methods
6. **Interoperable**: Works with Anki, databases, custom apps
7. **Flexible**: Supports complex relationships between words
