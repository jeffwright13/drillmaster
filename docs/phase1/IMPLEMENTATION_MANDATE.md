# Spanish Verb Learning System - Design & Implementation Document
## Phase 1: Anki Deck Generator

---

## Executive Summary

**Goal**: Create a browser-based tool that reads a tagged TSV verb list and generates customizable Anki decks with cloze deletion and translation cards, including support for images and future audio integration.

**Technology Stack**: HTML/CSS/JavaScript (browser-only, no server required)
**UI Framework**: Pico CSS for clean, accessible design
**Primary Output**: TSV files for Anki import
**Future Path**: Interactive practice modes, .apkg generation, conversational AI integration

---

## Phase 1 Requirements

### Core Functionality

#### 1. Verb List Management
- **Load TSV file** containing 42 verbs with tags
- **Parse tags** into structured data (key-value pairs separated by semicolons)
- **Display verb list** with filtering and sorting options
- **Validate tags** to ensure required fields are present

#### 2. Deck Generation Settings
- **Select verbs** by:
  - Tier (1-4, multi-select checkboxes)
  - Regularity (regular, irregular, highly-irregular)
  - Verb type (ar, er, ir)
  - Reflexive (true/false)
  - Individual verb selection (checkboxes)
  
- **Card type selection**:
  - Cloze deletion (Spanish sentence with verb blanked)
  - Translation ES→EN (Spanish sentence → English translation)
  - Translation EN→ES (English sentence → Spanish translation)
  - Conjugation practice (Infinitive + tense/subject → conjugated form)
  
- **Tense selection** (multi-select):
  - Present
  - Preterite
  - Future
  - Imperfect (future phase)
  - Present subjunctive (future phase)

- **Subject selection** (multi-select):
  - yo, tú, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes

#### 3. Sentence Template System
- **Pre-written templates** for each verb with contextual sentences
- **Template variables**: {verb}, {subject}, {tense}, {context}
- **Template library** organized by:
  - Tier level (simpler sentences for Tier 1)
  - Verb type (reflexive templates different from non-reflexive)
  - Multiple templates per verb for variety

Example templates:
```javascript
{
  "HABLAR": {
    "tier": 1,
    "templates": [
      {
        "spanish": "{subject} {verb} español todos los días.",
        "english": "{subject_en} speak Spanish every day.",
        "context": "daily"
      },
      {
        "spanish": "{subject} {verb} con {mi/tu/su} familia.",
        "english": "{subject_en} speak with {my/your/their} family.",
        "context": "family"
      }
    ]
  }
}
```

#### 4. Conjugation Engine
- **Conjugate verbs** based on tense and subject
- **Handle regular patterns** (-ar, -er, -ir)
- **Handle irregular verbs** with lookup tables
- **Handle stem changes** (e→ie, o→ue, e→i)
- **Handle reflexive pronouns** (me, te, se, nos, os, se)
- **Handle spelling changes** (preterite vowel changes)

Data structure:
```javascript
{
  "HABLAR": {
    "present": {
      "yo": "hablo",
      "tú": "hablas",
      // ... etc
    },
    "preterite": {
      "yo": "hablé",
      // ... etc
    }
  }
}
```

#### 5. Card Generation
- **Generate Anki-formatted cards** based on selections
- **Cloze format**: `Yo {{c1::hablo}} español. [TAB] I speak Spanish. [TAB] HABLAR [TAB] tier:1`
- **Translation format**: `Yo hablo español. [TAB] I speak Spanish. [TAB] HABLAR [TAB] tier:1`
- **Include metadata**: verb infinitive, tier, tags in additional fields
- **Support images**: Allow image filenames in output for manual Anki import

#### 6. Export Functionality
- **Generate TSV file** with proper tab separators
- **Download file** with timestamp in filename
- **Preview output** before download
- **Copy to clipboard** option
- **Export statistics**: number of cards by type, verbs included, etc.

---

## Architecture

### File Structure
```
spanish-verb-anki/
├── index.html              # Main application
├── css/
│   ├── pico.min.css       # Pico CSS framework
│   └── custom.css         # Custom styles
├── js/
│   ├── main.js            # Application entry point
│   ├── parser.js          # TSV and tag parsing
│   ├── conjugator.js      # Verb conjugation engine
│   ├── templates.js       # Sentence templates
│   ├── generator.js       # Card generation logic
│   ├── exporter.js        # TSV export functionality
│   └── ui.js              # UI interactions and state management
├── data/
│   ├── verbs.tsv          # The 42-verb list
│   ├── conjugations.json  # Pre-computed conjugations
│   └── templates.json     # Sentence templates
└── README.md              # Usage instructions
```

### Data Flow
```
1. Load verbs.tsv → Parse into objects → Display in UI
2. User selects filters → Filter verb list → Update display
3. User selects card types/tenses → Generate cards → Preview
4. User clicks export → Format as TSV → Download file
```

### Key JavaScript Modules

#### parser.js
```javascript
class VerbParser {
  static parseTSV(tsvContent) {
    // Parse TSV file into array of verb objects
  }
  
  static parseTags(tagString) {
    // Parse semicolon-separated key:value tags
    // Returns: { tier: '1', 'word-type': 'verb', ... }
  }
  
  static validateVerb(verbObject) {
    // Ensure required tags present
  }
}
```

#### conjugator.js
```javascript
class Conjugator {
  constructor(conjugationsData) {
    // Load pre-computed conjugations
  }
  
  conjugate(infinitive, tense, subject) {
    // Return conjugated form
    // Handle regular patterns if not in lookup
  }
  
  getReflexivePronoun(subject) {
    // Return me, te, se, nos, os, se
  }
  
  isIrregular(infinitive, tense) {
    // Check if verb is irregular in tense
  }
}
```

#### templates.js
```javascript
class TemplateEngine {
  constructor(templatesData) {
    // Load sentence templates
  }
  
  getSentence(verb, tense, subject, templateIndex = 0) {
    // Return { spanish, english } with substitutions
  }
  
  substituteVariables(template, verb, tense, subject) {
    // Replace {verb}, {subject}, etc.
  }
  
  getTemplateCount(verb) {
    // Return number of available templates
  }
}
```

#### generator.js
```javascript
class CardGenerator {
  constructor(conjugator, templateEngine) {
    this.conjugator = conjugator;
    this.templates = templateEngine;
  }
  
  generateClozeCard(verb, tense, subject, templateIndex) {
    // Return Anki cloze card object
  }
  
  generateTranslationCard(verb, tense, subject, direction, templateIndex) {
    // direction: 'es-en' or 'en-es'
  }
  
  generateConjugationCard(verb, tense, subject) {
    // Infinitive + tense/subject → conjugated form
  }
  
  generateBatch(verbs, settings) {
    // Generate all selected cards
  }
}
```

#### exporter.js
```javascript
class AnkiExporter {
  static formatClozeCard(card) {
    // Format as TSV line for Anki cloze note type
  }
  
  static formatTranslationCard(card) {
    // Format as TSV line for Anki basic note type
  }
  
  static generateTSV(cards) {
    // Combine all cards into TSV format
  }
  
  static download(content, filename) {
    // Trigger browser download
  }
  
  static copyToClipboard(content) {
    // Copy to clipboard
  }
}
```

#### ui.js
```javascript
class UIManager {
  constructor() {
    this.verbs = [];
    this.selectedVerbs = new Set();
    this.settings = this.getDefaultSettings();
  }
  
  loadVerbs(tsvContent) {
    // Parse and display verbs
  }
  
  applyFilters() {
    // Filter verb display based on tier, regularity, etc.
  }
  
  toggleVerbSelection(verbId) {
    // Add/remove verb from selected set
  }
  
  updatePreview() {
    // Show preview of generated cards
  }
  
  exportCards() {
    // Generate and download TSV
  }
}
```

---

## UI Design (Pico CSS)

### Layout Sections

#### 1. Header
- App title: "Spanish Verb Anki Deck Generator"
- Brief description
- Load TSV button (for custom verb lists)

#### 2. Filter Panel (Left Sidebar)
```html
<aside>
  <h3>Filters</h3>
  
  <fieldset>
    <legend>Learning Tier</legend>
    <label><input type="checkbox" checked> Tier 1 (10)</label>
    <label><input type="checkbox"> Tier 2 (10)</label>
    <label><input type="checkbox"> Tier 3 (12)</label>
    <label><input type="checkbox"> Tier 4 (10)</label>
  </fieldset>
  
  <fieldset>
    <legend>Regularity</legend>
    <label><input type="checkbox" checked> Regular</label>
    <label><input type="checkbox" checked> Irregular</label>
    <label><input type="checkbox" checked> Highly Irregular</label>
  </fieldset>
  
  <fieldset>
    <legend>Verb Type</legend>
    <label><input type="checkbox" checked> -ar verbs</label>
    <label><input type="checkbox" checked> -er verbs</label>
    <label><input type="checkbox" checked> -ir verbs</label>
  </fieldset>
  
  <fieldset>
    <legend>Special</legend>
    <label><input type="checkbox"> Reflexive only</label>
    <label><input type="checkbox"> Non-reflexive only</label>
  </fieldset>
</aside>
```

#### 3. Verb List (Center)
- Table with columns: [✓] Verb | English | Tier | Tags
- Clickable rows to select/deselect
- "Select All" / "Clear All" buttons
- Count: "15 verbs selected"

#### 4. Card Settings (Right Panel)
```html
<section>
  <h3>Card Settings</h3>
  
  <fieldset>
    <legend>Card Types</legend>
    <label><input type="checkbox" checked> Cloze Deletion</label>
    <label><input type="checkbox"> Translation (ES→EN)</label>
    <label><input type="checkbox"> Translation (EN→ES)</label>
    <label><input type="checkbox"> Conjugation Practice</label>
  </fieldset>
  
  <fieldset>
    <legend>Tenses</legend>
    <label><input type="checkbox" checked> Present</label>
    <label><input type="checkbox"> Preterite</label>
    <label><input type="checkbox"> Future</label>
  </fieldset>
  
  <fieldset>
    <legend>Subjects</legend>
    <label><input type="checkbox" checked> yo</label>
    <label><input type="checkbox" checked> tú</label>
    <label><input type="checkbox"> él/ella/usted</label>
    <label><input type="checkbox"> nosotros</label>
    <label><input type="checkbox"> vosotros</label>
    <label><input type="checkbox"> ellos/ellas/ustedes</label>
  </fieldset>
  
  <button onclick="generatePreview()">Preview Cards</button>
</section>
```

#### 5. Preview & Export (Bottom)
- Card count: "127 cards will be generated"
- Preview first 5-10 cards in scrollable box
- Export buttons:
  - "Download TSV"
  - "Copy to Clipboard"
- Statistics: Cards by type, verbs included

---

## Data Files

### verbs.tsv
Use the refactored verb list with key-value pair tags

### conjugations.json
Pre-computed conjugations for all 42 verbs in present, preterite, future:
```json
{
  "HABLAR": {
    "infinitive": "hablar",
    "english": "to speak",
    "present": {
      "yo": "hablo",
      "tú": "hablas",
      "él/ella/usted": "habla",
      "nosotros": "hablamos",
      "vosotros": "habláis",
      "ellos/ellas/ustedes": "hablan"
    },
    "preterite": {
      "yo": "hablé",
      "tú": "hablaste",
      "él/ella/usted": "habló",
      "nosotros": "hablamos",
      "vosotros": "hablasteis",
      "ellos/ellas/ustedes": "hablaron"
    },
    "future": {
      "yo": "hablaré",
      "tú": "hablarás",
      "él/ella/usted": "hablará",
      "nosotros": "hablaremos",
      "vosotros": "hablaréis",
      "ellos/ellas/ustedes": "hablarán"
    }
  }
}
```

### templates.json
Sentence templates organized by verb:
```json
{
  "HABLAR": [
    {
      "spanish": "{subject} {verb} español todos los días.",
      "english": "{subject_en} speak{s} Spanish every day.",
      "time_marker": "todos los días",
      "difficulty": 1
    },
    {
      "spanish": "{subject} {verb} con mi familia.",
      "english": "{subject_en} speak{s} with my family.",
      "time_marker": null,
      "difficulty": 1
    }
  ],
  "LLAMARSE": [
    {
      "spanish": "{subject} {reflexive} {verb} {name}.",
      "english": "{subject_en} {verb_en} {name}.",
      "context": "identity",
      "difficulty": 2
    }
  ]
}
```

---

## Implementation Phases

### Phase 1A: Core Infrastructure (Week 1)
- [ ] Set up HTML structure with Pico CSS
- [ ] Implement TSV parser
- [ ] Implement tag parser with key-value pairs
- [ ] Display verb list in table
- [ ] Create conjugations.json for all 42 verbs (can be generated programmatically)

### Phase 1B: Conjugation & Templates (Week 2)
- [ ] Implement conjugator.js
- [ ] Create templates.json with 2-3 templates per verb
- [ ] Implement template engine with variable substitution
- [ ] Handle reflexive pronouns
- [ ] Test conjugations against known correct forms

### Phase 1C: Card Generation (Week 3)
- [ ] Implement cloze card generation
- [ ] Implement translation card generation (both directions)
- [ ] Implement conjugation drill cards
- [ ] Add card preview functionality
- [ ] Test with sample selections

### Phase 1D: UI & Export (Week 4)
- [ ] Implement filter panel with live filtering
- [ ] Implement verb selection (individual + batch)
- [ ] Implement card settings panel
- [ ] Implement TSV export with download
- [ ] Implement copy-to-clipboard
- [ ] Add statistics display

### Phase 1E: Polish & Testing (Week 5)
- [ ] Test with all tier combinations
- [ ] Validate TSV imports into Anki
- [ ] Create Anki note type templates (documentation)
- [ ] Write user documentation
- [ ] Handle edge cases (no verbs selected, etc.)
- [ ] Add localStorage for settings persistence

---

## Future Phases (Post Phase 1)

### Phase 2: Enhanced Features
- .apkg file generation (requires library like genanki.js)
- AI-generated sentences via API calls
- Audio file integration (TTS or pre-recorded)
- Image association system
- Progress tracking (localStorage/IndexedDB)

### Phase 3: Interactive Practice
- Browser-based flashcard practice
- Immediate feedback on answers
- Spaced repetition algorithm
- Statistics dashboard
- Study session history

### Phase 4: Conversational AI (hablabot integration)
- Chat interface for practice
- Context-aware verb usage
- Correction and explanation
- Conversational scenarios

---

## Technical Considerations

### Browser Compatibility
- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Use ES6+ features (modules, arrow functions, classes)
- No transpilation needed for modern browsers
- Fallbacks for older browsers not required

### Performance
- All processing client-side
- No server calls required (except future AI features)
- TSV parsing should handle 100+ verbs easily
- Card generation should be near-instant (<1 second for 500 cards)

### Data Validation
- Validate TSV format on load
- Validate required tags present
- Validate conjugations exist for selected tenses
- Warn user if selections result in 0 cards

### Error Handling
- Graceful degradation if conjugation missing
- User-friendly error messages
- Console logging for debugging
- Validation before export

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- High contrast mode compatible

---

## Reference Codebases

### /Users/jeff/coding/apg-web
**Key aspects to reference:**
- Browser-side architecture patterns
- TTS implementation (for future audio)
- UX patterns and user flow
- File handling and export mechanisms
- State management approach

### /Users/jeff/coding/hablabot
**Key aspects to reference:**
- Conversational AI integration patterns
- Spanish language handling
- User interaction patterns
- Any verb conjugation logic present

---

## Anki Integration Notes

### Required Note Types

#### Cloze Note Type
Fields:
1. Text (with {{c1::word}})
2. Extra (English translation)
3. Verb (infinitive)
4. Tags (tier, regularity, etc.)

Card Template:
```
Front: {{cloze:Text}}
Back: {{cloze:Text}}<br>{{Extra}}
```

#### Basic (Translation) Note Type
Fields:
1. Front (Spanish or English)
2. Back (English or Spanish)
3. Verb (infinitive)
4. Tags

Card Template:
```
Front: {{Front}}
Back: {{Back}}
```

#### Conjugation Note Type
Fields:
1. Prompt (Infinitive + tense + subject)
2. Answer (conjugated form)
3. Example (sentence using the form)
4. Tags

Card Template:
```
Front: {{Prompt}}
Back: {{Answer}}<br><br>{{Example}}
```

### Import Instructions for User
1. Open Anki
2. File → Import
3. Select downloaded TSV file
4. Choose appropriate Note Type
5. Map fields correctly
6. Import

---

## Testing Checklist

### Unit Tests (Manual for Phase 1)
- [ ] Parse TSV correctly
- [ ] Parse all tag formats
- [ ] Conjugate all regular -ar verbs correctly
- [ ] Conjugate all regular -er verbs correctly
- [ ] Conjugate all regular -ir verbs correctly
- [ ] Handle all irregular verbs correctly
- [ ] Handle all stem changes correctly
- [ ] Handle all reflexive verbs correctly
- [ ] Generate cloze cards with correct format
- [ ] Generate translation cards correctly
- [ ] Export TSV with proper escaping

### Integration Tests
- [ ] Filter verbs by tier
- [ ] Filter verbs by regularity
- [ ] Filter verbs by type
- [ ] Select all / clear all works
- [ ] Card preview updates correctly
- [ ] Export produces valid TSV
- [ ] Import into Anki successfully
- [ ] Cards display correctly in Anki

### User Acceptance Tests
- [ ] UI is intuitive
- [ ] Filter controls are clear
- [ ] Preview shows representative cards
- [ ] Export is fast (<2 seconds)
- [ ] File downloads with good filename
- [ ] Instructions are clear

---

## Success Criteria for Phase 1

1. ✅ User can load verb list
2. ✅ User can filter by tier, regularity, type
3. ✅ User can select verbs individually or in batch
4. ✅ User can choose card types and tenses
5. ✅ App generates accurate Anki-formatted cards
6. ✅ User can preview cards before export
7. ✅ User can download TSV file
8. ✅ TSV imports cleanly into Anki
9. ✅ Cards are pedagogically sound (progressive difficulty)
10. ✅ UI is clean, fast, and intuitive

---

## Open Questions / Decisions Needed

1. **Template variety**: How many templates per verb? (Suggest 2-3 for Phase 1)

2. **Conjugation fallback**: If conjugation missing, generate algorithmically or show error? (Suggest error for Phase 1, since all 42 will be pre-computed)

3. **Card ordering**: Should exported cards be:
   - Grouped by verb?
   - Grouped by tense?
   - Mixed randomly?
   - User selectable?

4. **Settings persistence**: Save user's filter/card preferences in localStorage?

5. **Multiple templates**: Should user be able to:
   - Get all templates (multiple cards per verb)?
   - Choose specific template index?
   - Random selection?

6. **Vosotros inclusion**: Include by default or make it opt-in? (Many learners skip vosotros)

---

## Development Environment Setup

```bash
# No build tools required for Phase 1
# Simply open index.html in browser

# Recommended: Use VS Code with Live Server extension
# or simple Python server:
python3 -m http.server 8000

# Navigate to: http://localhost:8000
```

---

## File Delivery to Windsurf

Provide Windsurf with:
1. This design document
2. `/Users/jeff/coding/apg-web` (reference for patterns)
3. `/Users/jeff/coding/hablabot` (reference for ideas)
4. The 42-verb TSV file with key-value tags
5. Example Anki TSV output format

---

## Questions for Implementation Session

When starting with Windsurf, clarify:

1. Should we generate conjugations.json programmatically or hand-craft it?
2. How many sentence templates per verb for Phase 1?
3. Should we include all 6 subjects or make vosotros optional?
4. Default settings: what should be checked by default?
5. Card ordering preference in export?
6. Should we add any image placeholders in Phase 1?

---

## Success = Phase 1 Complete When:

**User can generate a complete Anki deck of their Tier 1 verbs (10 verbs) with cloze deletion cards for present tense, all subjects, export as TSV, import into Anki, and successfully study the cards.**

Estimated timeline: 4-5 weeks part-time development
Lines of code: ~2000-3000 (including data files)
Complexity: Medium (straightforward logic, some linguistic edge cases)
