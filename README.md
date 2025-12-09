# DrillMaster - Spanish Verb Learning System

**Status**: Phase 1 Implementation Started  
**Last Updated**: November 27, 2024

---

## Overview

DrillMaster is a browser-based tool for generating customizable Anki decks to help Spanish learners master verb conjugations and conversational skills through spaced-repetition drills.

### Phase 1 Goal
Generate Anki-ready flashcards from a curated list of 42 essential Spanish verbs with multiple card types, tenses, and subjects.

---

## Quick Start

```bash
# Development server (choose one)
python3 -m http.server 8000
# or
npx http-server
# or use VS Code Live Server

# Open browser to http://localhost:8000
```

---

## Project Documents

All design and planning documents are in [`docs/phase1/`](docs/phase1/)

### Core Design
- **[IMPLEMENTATION_MANDATE.md](docs/phase1/IMPLEMENTATION_MANDATE.md)** - Original design & implementation document
- **[FEASIBILITY_ANALYSIS.md](docs/phase1/FEASIBILITY_ANALYSIS.md)** - Technical feasibility assessment
- **[DECISIONS.md](docs/phase1/DECISIONS.md)** - All 24 design decisions documented
- **[STATUS.md](docs/phase1/STATUS.md)** - Current project status

### Template Strategy
- **[TEMPLATE_SYSTEM_EXPLAINED.md](docs/phase1/TEMPLATE_SYSTEM_EXPLAINED.md)** - What templates are and how they work
- **[TEMPLATE_DECISIONS_FINAL.md](docs/phase1/TEMPLATE_DECISIONS_FINAL.md)** - Template creation strategy
- **[TENSE_SCALING_ANALYSIS.md](docs/phase1/TENSE_SCALING_ANALYSIS.md)** - How tenses scale

### Technical Reference
- **[REFERENCE_REPO_ANALYSIS.md](docs/phase1/REFERENCE_REPO_ANALYSIS.md)** - Patterns from apg-web and hablabot
- **[tag_system_v3_documentation.md](docs/phase1/tag_system_v3_documentation.md)** - Tag system specification
- **[ANSWERS_TO_QUESTIONS.md](docs/phase1/ANSWERS_TO_QUESTIONS.md)** - Initial Q&A

---

## Key Features (Phase 1)

### Card Types
- ✅ **Translation (ES→EN)**: Spanish sentence → English translation
- ✅ **Translation (EN→ES)**: English sentence → Spanish translation

### Verb Selection
- ✅ Filter by tier (1-4)
- ✅ Filter by regularity (regular, irregular, highly-irregular)
- ✅ Filter by verb type (-ar, -er, -ir)
- ✅ Filter by reflexive/non-reflexive
- ✅ Individual verb selection

### Tenses & Subjects
- ✅ **Tenses**: Present, Preterite, Future
- ✅ **Subjects**: yo, tú, vos, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes
- ✅ **Default**: 5 subjects (excluding vos and vosotros)

### Export Options
- ✅ **Anki TSV**: Download tab-separated file for Anki import
- ✅ **Conjugation Table**: ASCII/HTML table for reference
- ✅ **Copy to Clipboard**: Quick copy for any export
- ✅ **Preview**: See cards before export

---

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS**: Pico CSS v2 (CDN)
- **JavaScript**: ES6+ modules (no build tools)

### Architecture
- **Pattern**: Controller-Service model
- **State Management**: Vanilla JS with localStorage
- **Data Format**: TSV (verbs), JSON (conjugations, templates)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Data Files

### Provided
- ✅ **verb_list_refactored.tsv** - 42 essential verbs with tags

### To Generate
- ⏳ **conjugations.json** - Pre-computed conjugations (882 forms)
- ⏳ **templates.json** - Sentence templates (84 templates, 2 per verb)

---

## Project Structure (Planned)

```
drillmaster/
├── index.html                      # Main application
├── css/
│   ├── pico.min.css               # Pico CSS (CDN)
│   └── custom.css                 # Custom styles
├── js/
│   ├── main.js                    # Entry point
│   ├── controllers/
│   │   └── AppController.js       # Main orchestrator
│   ├── services/
│   │   ├── VerbParserService.js   # Parse TSV/tags
│   │   ├── ConjugationService.js  # Conjugation lookups
│   │   ├── TemplateService.js     # Template processing
│   │   ├── CardGeneratorService.js # Generate cards
│   │   ├── ExportService.js       # Export TSV/tables
│   │   ├── FilterService.js       # Verb filtering
│   │   └── SettingsService.js     # localStorage
│   └── utils/
│       ├── tagParser.js           # Tag parsing
│       ├── subjectMapper.js       # Subject mappings
│       └── validators.js          # Validation
├── data/
│   ├── verbs.tsv                  # 42 verbs (provided)
│   ├── conjugations.json          # Pre-computed conjugations
│   └── templates.json             # Sentence templates
├── scripts/
│   └── generate-conjugations.js   # Node.js script (one-time)
├── docs/
│   ├── ANKI_SETUP.md              # Anki note type setup
│   └── USER_GUIDE.md              # Usage instructions
└── README.md                      # This file
```

---

## Design Decisions Summary

### Key Decisions
1. **Templates**: 2 per verb for Phase 1 (84 total)
2. **Conjugations**: Hybrid generation + manual verification
3. **Subjects**: 7 total (yo, tú, vos, él/ella/usted, nosotros, vosotros, ellos/ellas/ustedes)
4. **Defaults**: vos and vosotros unchecked by default
5. **Card Ordering**: Group by verb → tense → subject
6. **Settings**: Persist in localStorage
7. **Export**: TSV for Anki + ASCII/HTML tables for reference
8. **Tag System**: Use tag_system_v3_documentation.md specification
9. **Architecture**: Controller-Service pattern from apg-web
10. **Theme**: Light/Dark/Auto switcher

See [DECISIONS.md](DECISIONS.md) for all 22 decisions.

---

## Development Roadmap

### Phase 1A: Foundation (Week 1)
- [ ] Set up project structure
- [ ] Integrate Pico CSS
- [ ] Implement TSV parser
- [ ] Display verb list

### Phase 1B: Data Generation (Week 1-2)
- [ ] Generate conjugations.json
- [ ] Create templates.json
- [ ] Validate data

### Phase 1C: Core Logic (Week 2)
- [ ] Conjugation service
- [ ] Template engine
- [ ] Test with sample data

### Phase 1D: Card Generation (Week 3)
- [ ] Implement all card types
- [ ] Add preview functionality

### Phase 1E: UI & Filters (Week 3-4)
- [ ] Filter panel
- [ ] Verb selection
- [ ] Settings persistence

### Phase 1F: Export (Week 4)
- [ ] TSV export
- [ ] Table export
- [ ] Copy to clipboard

### Phase 1G: Testing & Polish (Week 5)
- [ ] Test all combinations
- [ ] Validate Anki import
- [ ] Documentation
- [ ] Edge case handling

**Estimated Timeline**: 8-10 weeks (moderate pace)

---

## Success Criteria (Phase 1)

### Minimum Viable Product
User can:
1. ✅ Load the 42-verb list
2. ✅ Filter by tier (select Tier 1 only)
3. ✅ Select all Tier 1 verbs (10 verbs)
4. ✅ Choose cloze deletion cards
5. ✅ Choose present tense only
6. ✅ Choose 3-5 subjects
7. ✅ Generate preview
8. ✅ Export TSV file
9. ✅ Import into Anki successfully
10. ✅ Study cards in Anki

**Expected Output**: 60 cards (10 verbs × 3 subjects × 2 templates)

---

## Pending Decisions

Before starting implementation, need to decide:

1. **Template Creation Approach**:
   - Option A: You provide sentence ideas, I format
   - Option B: I draft templates, you review
   - Option C: Hybrid approach

2. **Template Complexity**: Should match verb tier?

3. **Timeline**: When to start? What pace?

4. **Native Speaker Review**: Available for template validation?

---

## Getting Started (Future)

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Optional: Node.js (for conjugation generation script)

### Development Setup
```bash
# No build tools required!
# Option 1: Python simple server
python3 -m http.server 8000

# Option 2: VS Code Live Server extension
# Just open index.html

# Option 3: Node.js http-server
npx http-server
```

### Usage (Future)
1. Open `index.html` in browser
2. Verbs load automatically
3. Apply filters
4. Select verbs
5. Choose card settings
6. Preview cards
7. Export TSV
8. Import into Anki

---

## Future Phases

### Phase 2: Enhanced Features
- .apkg file generation
- AI-generated sentences
- Audio integration (TTS)
- Image associations
- Progress tracking

### Phase 3: Interactive Practice
- Browser-based flashcard practice
- Immediate feedback
- Spaced repetition algorithm
- Statistics dashboard

### Phase 4: Conversational AI
- Chat interface for practice
- Context-aware verb usage
- Corrections and explanations
- Conversational scenarios

---

## Contributing

Currently in pre-implementation phase. Design documents are complete and ready for development.

---

## License

TBD

---

## Contact

TBD

---

## Acknowledgments

- **Pico CSS**: Clean, semantic CSS framework
- **apg-web**: Architecture patterns
- **hablabot**: Vocabulary management patterns
- **Anki**: Spaced repetition platform

---

**Status**: ✅ Design phase complete. Ready to start implementation when you are!

**Next Step**: Decide on template creation approach and timeline.
