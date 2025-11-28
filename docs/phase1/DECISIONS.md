# DrillMaster - Design Decisions
**Date**: November 27, 2024  
**Status**: Pre-Implementation

---

## Decisions Made

### 1. Template Variety ✅
**Decision**: **2 templates per verb for Phase 1**

**Rationale**:
- 42 verbs × 2 templates = 84 templates (manageable to create)
- Provides variety without overwhelming
- Can expand to 3 in future if needed

**Impact**: 
- Each verb/tense/subject combination generates 2 cards
- Total cards for full selection: ~1,500 (42 verbs × 3 tenses × 6 subjects × 2 templates)

---

### 2. Conjugation Data Source ✅
**Decision**: **Hybrid approach - Generate then verify**

**Process**:
1. Create Node.js script to generate conjugations.json
2. Use trusted source (SpanishDict API, verbo library, or manual lookup)
3. Manual verification of all irregular verbs
4. Commit final JSON to repository

**Rationale**:
- Saves time on regular verbs (algorithmic generation)
- Ensures accuracy on irregulars (manual verification)
- One-time effort for 42 verbs
- Avoids runtime conjugation complexity

**Action Item**: Create `scripts/generate-conjugations.js`

---

### 3. Subject Selection ✅
**Decision**: **Include all 7 subjects (added vos), vosotros and vos unchecked by default**

**Default Settings**:
```
☑ yo
☑ tú
☐ vos (unchecked - Argentina/Uruguay/Paraguay)
☑ él/ella/usted
☑ nosotros
☐ vosotros (unchecked - Spain)
☑ ellos/ellas/ustedes
```

**Rationale**:
- Most learners (especially in Americas) skip vosotros
- Vos is important for Argentina/Uruguay/Paraguay learners but opt-in
- Advanced learners or region-focused learners can opt-in
- Data should be present for completeness
- Reduces default card count by ~28% (5 subjects instead of 7)

**Conjugation Notes**:
- Vos conjugation differs from tú (e.g., vos hablás vs tú hablas)
- Must include vos conjugations in conjugations.json
- Total conjugations: 42 verbs × 3 tenses × 7 subjects = 882 forms

---

### 4. Card Ordering in Export ✅
**Decision**: **Group by verb → tense → subject**

**Example**:
```
HABLAR - Present - yo - Template 1
HABLAR - Present - yo - Template 2
HABLAR - Present - tú - Template 1
HABLAR - Present - tú - Template 2
...
HABLAR - Preterite - yo - Template 1
...
COMER - Present - yo - Template 1
...
```

**Rationale**:
- Logical progression for review
- Easy to spot errors before import
- Anki randomizes during study anyway
- Consistent, predictable structure

**Future Enhancement**: Add user-selectable ordering (random, by tense, etc.)

---

### 5. Multiple Templates Handling ✅
**Decision**: **Generate all templates automatically**

**Behavior**:
- If verb has 2 templates
- User selects Present tense, yo subject
- System generates 2 cards (one per template)

**Rationale**:
- Maximizes learning value
- Prevents repetition boredom
- User can delete unwanted cards in Anki if needed
- No additional UI complexity

**Future Enhancement**: Add "Max templates per verb" setting (1-3)

---

### 6. Settings Persistence ✅
**Decision**: **Yes, use localStorage**

**What to Persist**:
- ✅ Tier filters (checkboxes)
- ✅ Regularity filters
- ✅ Verb type filters
- ✅ Card type selections
- ✅ Tense selections
- ✅ Subject selections

**What NOT to Persist**:
- ❌ Individual verb selections (too specific to session)
- ❌ Preview state

**Rationale**:
- Improves UX for repeat users
- Trivial to implement (JSON.stringify/parse)
- No privacy concerns (all local)
- Reduces repetitive clicking

**Implementation**: Save on change, load on page load

---

### 7. Default Selections ✅
**Decision**: **Minimal but functional defaults**

**On First Load**:
```javascript
{
  tiers: [1],                    // Tier 1 only
  regularity: ['all'],           // All regularity types
  verbTypes: ['ar', 'er', 'ir'], // All verb types
  reflexive: 'all',              // Both reflexive and non-reflexive
  cardTypes: ['cloze'],          // Cloze deletion only
  tenses: ['present'],           // Present tense only
  subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes']
}
```

**Rationale**:
- Tier 1 = beginner-friendly starting point
- Cloze = most effective card type
- Present tense = most common/useful
- 5 subjects (excluding vosotros) = balanced practice
- Results in ~100 cards (10 verbs × 5 subjects × 2 templates)

---

### 8. Error Handling Strategy ✅
**Decision**: **Fail gracefully with user-friendly messages**

**Scenarios**:
1. **No verbs selected**: Show warning, disable export
2. **No card types selected**: Show warning, disable export
3. **No tenses selected**: Show warning, disable export
4. **Missing conjugation**: Log error, skip card, show summary
5. **Missing template**: Use fallback generic template

**User Messages**:
- Clear, actionable
- No technical jargon
- Suggest fixes

**Example**: 
```
⚠️ No verbs selected
Please select at least one verb from the list below.
```

---

### 9. Preview Display ✅
**Decision**: **Show first 10 cards with pagination**

**Display Format**:
```
Card 1 of 127
─────────────────
Front: Yo {{c1::hablo}} español todos los días.
Back: I speak Spanish every day.
Verb: HABLAR
Tags: tier:1, regularity:regular, type:ar
```

**Features**:
- ◀️ Previous / Next ▶️ buttons
- Jump to card number
- Card count display
- Scrollable container

**Rationale**:
- 10 cards = enough to verify quality
- Pagination = handles large decks
- Full preview would be too slow for 1000+ cards

---

### 10. File Naming Convention ✅
**Decision**: **Descriptive with timestamp**

**Format**: `anki-spanish-verbs-{tiers}-{tenses}-{YYYYMMDD-HHMMSS}.tsv`

**Examples**:
- `anki-spanish-verbs-tier1-present-20241127-143022.tsv`
- `anki-spanish-verbs-tier1-2-present-preterite-20241127-143022.tsv`
- `anki-spanish-verbs-all-all-20241127-143022.tsv`

**Rationale**:
- Descriptive = easy to identify
- Timestamp = prevents overwrites
- Lowercase with hyphens = cross-platform safe

---

### 11. Anki Note Types ✅
**Decision**: **Three separate note types**

#### Note Type 1: Spanish Cloze
**Fields**:
1. Text (with {{c1::verb}})
2. Translation (English)
3. Verb (infinitive)
4. Tags (tier:1;regularity:regular;type:ar)

#### Note Type 2: Spanish Translation
**Fields**:
1. Front (Spanish or English)
2. Back (English or Spanish)
3. Verb (infinitive)
4. Tags

#### Note Type 3: Spanish Conjugation
**Fields**:
1. Prompt (HABLAR - Present - yo)
2. Answer (hablo)
3. Example (Yo hablo español.)
4. Tags

**Rationale**:
- Separate note types = different study modes
- Can import each card type separately
- Easier to manage in Anki
- Cleaner than one mega note type

**Deliverable**: Create Anki note type templates in docs/

---

### 12. Image Support (Phase 1) ✅
**Decision**: **Placeholder field only**

**Implementation**:
- Add `Image` field to note types
- Leave empty in Phase 1
- Users can add images manually in Anki

**Future Enhancement**:
- Image filename input in UI
- Image library integration
- AI-generated images

**Rationale**:
- Keeps Phase 1 scope manageable
- Doesn't block core functionality
- Easy to add later

---

### 13. Audio Support (Phase 1) ✅
**Decision**: **Not included in Phase 1**

**Rationale**:
- Adds significant complexity
- Requires TTS API or audio files
- Not critical for MVP
- Can be added in Phase 2

**Future Enhancement**:
- TTS integration (Web Speech API or external)
- Pre-recorded native speaker audio
- Audio field in note types

---

### 14. Validation Rules ✅
**Decision**: **Validate before export**

**Checks**:
1. ✅ At least 1 verb selected
2. ✅ At least 1 card type selected
3. ✅ At least 1 tense selected
4. ✅ At least 1 subject selected
5. ✅ All selected verbs have conjugations
6. ✅ All selected verbs have templates

**On Failure**:
- Show error message
- Highlight missing selections
- Disable export button
- Suggest fix

---

### 15. Browser Support ✅
**Decision**: **Modern browsers only (2020+)**

**Supported**:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Not Supported**:
- ❌ Internet Explorer
- ❌ Older mobile browsers

**Rationale**:
- ES6 modules, arrow functions, classes
- Modern CSS (grid, flexbox)
- No transpilation needed
- Covers 95%+ of users

---

### 16. Testing Strategy ✅
**Decision**: **Manual testing for Phase 1**

**Test Plan**:
1. **Unit Testing**: Manual verification of each function
2. **Integration Testing**: Test full workflow
3. **Anki Import Testing**: Validate TSV imports correctly
4. **Cross-browser Testing**: Test in Chrome, Firefox, Safari

**Future Enhancement**: Automated tests (Jest, Playwright)

**Rationale**:
- Phase 1 scope is small enough for manual testing
- Automated tests add setup overhead
- Can add in Phase 2 if needed

---

### 17. Documentation Deliverables ✅
**Decision**: **Three documentation files**

**Files**:
1. **README.md**: Quick start, features, usage
2. **docs/USER_GUIDE.md**: Detailed usage instructions
3. **docs/ANKI_SETUP.md**: Anki note type setup, import instructions

**Rationale**:
- Separate concerns
- Easy to navigate
- Can be expanded later

---

### 18. Development Environment ✅
**Decision**: **No build tools for Phase 1**

**Setup**:
```bash
# Option 1: Python simple server
python3 -m http.server 8000

# Option 2: VS Code Live Server extension
# Just open index.html

# Option 3: Node.js http-server
npx http-server
```

**Rationale**:
- No build step = faster iteration
- No dependencies to manage
- Easy for contributors
- Can add build tools in Phase 2 if needed (bundling, minification)

---

### 19. Code Style ✅
**Decision**: **ES6+ with classes**

**Conventions**:
- Classes for major components (PascalCase)
- Functions for utilities (camelCase)
- Constants in UPPER_SNAKE_CASE
- 2-space indentation
- Single quotes for strings
- Semicolons required

**Example**:
```javascript
class VerbParser {
  static parseTSV(content) {
    const lines = content.split('\n');
    return lines.map(line => this.parseLine(line));
  }
}
```

---

### 20. Git Workflow ✅
**Decision**: **Simple main branch workflow**

**Branches**:
- `main`: Stable, working code
- Feature branches as needed

**Commits**:
- Descriptive messages
- One logical change per commit
- Commit often

**Rationale**:
- Solo developer (initially)
- Simple is better
- Can adopt Git Flow later if team grows

---

### 21. Conjugation Table Export ✅
**Decision**: **Add conjugation table export feature (PDF/Word/ASCII)**

**Feature**: Export a formatted table of conjugated verbs based on UI selections

**Formats**:
1. **ASCII/Text**: Plain text table (immediate, Phase 1)
2. **HTML**: Styled table for printing (Phase 1)
3. **PDF**: Professional document (Phase 2, requires library)
4. **Word/DOCX**: Microsoft Word format (Phase 2, requires library)

**Phase 1 Implementation**:
```javascript
// ASCII Table Example
HABLAR (to speak) - Present Tense
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subject         Spanish      English
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
yo              hablo        I speak
tú              hablas       you speak
él/ella/usted   habla        he/she speaks
nosotros        hablamos     we speak
ellos/ustedes   hablan       they speak
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**UI Location**: Add "Export Table" button in Preview & Export section

**Rationale**:
- Useful for reference/study sheets
- Complements Anki cards
- Easy to print or share
- ASCII table is trivial to implement
- PDF can be added later with jsPDF library

**Phase 1 Deliverable**: ASCII text table with copy/download options

---

### 22. Tag System Integration ✅
**Decision**: **Use tag_system_v3_documentation.md as specification**

**Key Tag Categories**:
1. **Universal**: tier, word-type
2. **Verb-Specific**: verb-type, regularity, stem-change
3. **Tense-Specific**: verb-tense (can have multiple values)
4. **Special**: reflexive, copula, yo-form, special-construction

**Parsing Strategy**:
```javascript
// Handle multiple verb-tense tags
"verb-tense:preterite:irregular;verb-tense:future:irregular"
// Results in: tags['verb-tense'] = ['preterite:irregular', 'future:irregular']
```

**Filter Implementation**:
- Tier filter: Match exact tier value
- Regularity filter: Match regularity value
- Verb type filter: Match verb-type value
- Reflexive filter: Check for reflexive:true tag
- Stem change filter: Check for stem-change tag (future enhancement)

**Rationale**:
- Tag system is already well-designed
- Supports future expansion (nouns, adjectives, etc.)
- Structured key-value pairs are easy to parse
- Multiple verb-tense values handled correctly

---

## Deferred Decisions (Future Phases)

### Phase 2 Considerations
- [ ] .apkg file generation library
- [ ] AI sentence generation API
- [ ] Audio integration approach
- [ ] Image library source
- [ ] Progress tracking database (IndexedDB vs localStorage)

### Phase 3 Considerations
- [ ] Spaced repetition algorithm choice
- [ ] Statistics visualization library
- [ ] Study session data structure

### Phase 4 Considerations
- [ ] Conversational AI API (OpenAI, Anthropic, local)
- [ ] Chat interface framework
- [ ] Voice input/output

---

### 23. Template Creation Strategy ✅
**Decision**: **Hybrid approach with high-frequency verb bonuses**

**Confirmed Decisions**:
1. **Creation Approach**: Hybrid (I draft Tier 1-2, you draft Tier 3-4)
2. **Template Count**: 2 per verb baseline, 3-4 for high-frequency verbs
3. **Complexity**: Templates match verb tier
4. **English Style**: Mix of literal and natural translations
5. **High-Frequency Bonus**: 10 verbs get extra templates

**Total Templates**: 94 (instead of 84)
- Tier 1: 30 templates (10 verbs, 3 each)
- Tier 2: 20 templates (10 verbs, 2 each)
- Tier 3: 24 templates (12 verbs, 2 each)
- Tier 4: 20 templates (10 verbs, 2 each)

**High-Frequency Verbs** (3-4 templates each):
- SER, ESTAR (4 each)
- TENER, HACER, IR (3 each)
- HABLAR, COMER, VIVIR (3 each - model verbs)
- LLAMARSE, LEVANTARSE (3 each)

**Rationale**:
- Hybrid leverages both our expertise
- High-frequency verbs deserve more variety
- Model verbs need comprehensive examples
- Tier-matched complexity ensures appropriate difficulty

**See**: TEMPLATE_DECISIONS_FINAL.md for full details

---

### 24. Tense Scaling Strategy ✅
**Decision**: **Templates are tense-agnostic, scale easily**

**Key Insight**: Same templates work across all tenses!

**Phase 1**: Present, Preterite, Future (3 tenses)
- 94 templates work for all 3 tenses
- 882 conjugations needed
- Effort: Already planned

**Phase 1.5**: Add Imperfect (optional)
- Same templates work
- +294 conjugations
- Effort: +2-3 hours

**Template Design**:
- 70% tense-agnostic (no time markers)
- 30% with optional time markers
- All templates work across all tenses

**Impact**: Minimal - templates scale naturally to any number of tenses

**See**: TENSE_SCALING_ANALYSIS.md for full analysis

---

## Summary

**Total Decisions Made**: 24  
**Deferred to Future Phases**: 10  
**Status**: ✅ Ready for implementation

All critical design decisions have been made. The project has clear direction and can proceed to implementation.

**Template Creation**: Ready to start (I'll draft Tier 1 first)
**Next Step**: Create project structure and begin template drafting.
