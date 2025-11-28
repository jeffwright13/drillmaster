# Reference Repository Analysis
**Date**: November 27, 2024  
**Purpose**: Extract patterns and best practices from existing codebases

---

## Overview

Analyzed two reference repositories:
1. **apg-web**: Audio Program Generator (browser-based audio tool)
2. **hablabot**: Spanish conversation AI chatbot

---

## Key Patterns from apg-web

### 1. Architecture Pattern: Controller-Service Model

**Structure:**
```
scripts/
├── main.js                 # Entry point
├── controllers/
│   └── AppController.js    # Main application logic
├── services/
│   ├── AudioService.js
│   ├── FileService.js
│   ├── TTSService.js
│   └── ProjectCacheService.js
└── utils/
    └── [utility functions]
```

**Benefits:**
- Clear separation of concerns
- Services are reusable
- Controller orchestrates services
- Easy to test individual components

**Apply to DrillMaster:**
```
js/
├── main.js                    # Entry point
├── controllers/
│   └── AppController.js       # Orchestrates everything
├── services/
│   ├── VerbParserService.js   # Parse TSV/tags
│   ├── ConjugationService.js  # Handle conjugations
│   ├── TemplateService.js     # Manage templates
│   ├── CardGeneratorService.js # Generate cards
│   └── ExportService.js       # Export TSV/PDF
└── utils/
    ├── tagParser.js           # Tag parsing utilities
    └── storage.js             # localStorage helpers
```

---

### 2. Pico CSS Integration

**From apg-web index.html:**
```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
/>
<link rel="stylesheet" href="styles/custom.css" />
```

**Pattern:**
- Use Pico CSS from CDN (no build step)
- Override with custom.css for specific needs
- Semantic HTML works out of the box

**Key Pico Features Used:**
- `<article>` for card-like sections
- `<details>` for collapsible sections
- Form elements styled automatically
- Grid layout with `container` class
- Theme switcher (light/dark/auto)

**Apply to DrillMaster:**
- Use same CDN approach
- Leverage `<details>` for filter panels
- Use `<article>` for verb list and preview sections
- Add theme switcher (copy pattern from apg-web)

---

### 3. State Management Pattern

**From AppController.js structure:**
```javascript
class AppController {
  constructor() {
    this.state = {
      // Application state
    };
    this.services = {
      // Service instances
    };
  }
  
  initialize() {
    this.initializeServices();
    this.attachEventListeners();
    this.loadSavedState();
  }
  
  initializeServices() {
    this.services.audio = new AudioService();
    this.services.file = new FileService();
    // etc.
  }
  
  attachEventListeners() {
    // DOM event bindings
  }
}
```

**Apply to DrillMaster:**
```javascript
class AppController {
  constructor() {
    this.state = {
      verbs: [],
      selectedVerbs: new Set(),
      filters: {
        tiers: [1],
        regularity: ['all'],
        verbTypes: ['ar', 'er', 'ir'],
        reflexive: 'all'
      },
      cardSettings: {
        cardTypes: ['cloze'],
        tenses: ['present'],
        subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes']
      },
      generatedCards: []
    };
    
    this.services = {
      parser: new VerbParserService(),
      conjugator: new ConjugationService(),
      templates: new TemplateService(),
      generator: new CardGeneratorService(),
      exporter: new ExportService()
    };
  }
}
```

---

### 4. localStorage Persistence Pattern

**From ProjectCacheService.js pattern:**
```javascript
class ProjectCacheService {
  saveProject(projectData) {
    const projects = this.getProjects();
    projects.push({
      ...projectData,
      timestamp: Date.now()
    });
    localStorage.setItem('projects', JSON.stringify(projects));
  }
  
  getProjects() {
    const data = localStorage.getItem('projects');
    return data ? JSON.parse(data) : [];
  }
}
```

**Apply to DrillMaster:**
```javascript
class SettingsService {
  saveSettings(settings) {
    localStorage.setItem('drillmaster_settings', JSON.stringify({
      ...settings,
      lastUpdated: Date.now()
    }));
  }
  
  loadSettings() {
    const data = localStorage.getItem('drillmaster_settings');
    return data ? JSON.parse(data) : this.getDefaultSettings();
  }
  
  getDefaultSettings() {
    return {
      filters: { tiers: [1], /* ... */ },
      cardSettings: { /* ... */ }
    };
  }
}
```

---

### 5. File Download Pattern

**From FileService.js pattern:**
```javascript
class FileService {
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
```

**Apply to DrillMaster:**
```javascript
class ExportService {
  exportTSV(cards) {
    const tsvContent = this.formatAsTSV(cards);
    const filename = this.generateFilename(cards);
    this.downloadFile(tsvContent, filename, 'text/tab-separated-values');
  }
  
  exportPDF(conjugationTable) {
    // Future: PDF generation
  }
  
  copyToClipboard(content) {
    navigator.clipboard.writeText(content);
  }
}
```

---

### 6. Theme Switcher Pattern

**From apg-web:**
```html
<select id="theme-select" aria-label="Theme selector">
  <option value="auto">Auto</option>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>
```

```javascript
// Theme handling
document.getElementById('theme-select').addEventListener('change', (e) => {
  const theme = e.target.value;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'auto';
document.documentElement.setAttribute('data-theme', savedTheme);
```

**Apply to DrillMaster:** Copy this pattern exactly

---

### 7. Collapsible Sections Pattern

**From apg-web:**
```html
<section id="recent-projects-section">
  <article>
    <details id="recent-projects-details">
      <summary style="cursor: pointer;">
        <h2 style="margin: 0; display: inline;">
          Recent Projects 
          <span id="projects-count" style="opacity: 0.7; font-size: 0.875rem;">
            (5)
          </span>
        </h2>
      </summary>
      <div style="margin-top: 1rem;">
        <!-- Content here -->
      </div>
    </details>
  </article>
</section>
```

**Apply to DrillMaster:**
- Filter panel: Collapsible by default (open)
- Preview panel: Collapsible (closed until cards generated)
- Statistics: Collapsible (open when cards generated)

---

## Key Patterns from hablabot

### 1. Vocabulary Management Pattern

**From vocabulary/manager.js:**
```javascript
class VocabularyManager {
  constructor() {
    this.vocabularyList = [];
    this.filteredList = [];
    this.currentFilters = {
      search: '',
      category: '',
      difficulty: '',
      masteryLevel: ''
    };
  }
  
  applyFilters() {
    this.filteredList = this.vocabularyList.filter(item => {
      // Apply all active filters
      return this.matchesFilters(item);
    });
    
    if (this.onVocabularyUpdate) {
      this.onVocabularyUpdate(this.filteredList);
    }
  }
  
  matchesFilters(item) {
    // Filter logic
  }
}
```

**Apply to DrillMaster:**
```javascript
class VerbFilterService {
  constructor() {
    this.allVerbs = [];
    this.filteredVerbs = [];
    this.filters = {
      tiers: [],
      regularity: [],
      verbTypes: [],
      reflexive: 'all',
      search: ''
    };
  }
  
  applyFilters() {
    this.filteredVerbs = this.allVerbs.filter(verb => {
      return this.matchesTierFilter(verb) &&
             this.matchesRegularityFilter(verb) &&
             this.matchesVerbTypeFilter(verb) &&
             this.matchesReflexiveFilter(verb) &&
             this.matchesSearchFilter(verb);
    });
    
    return this.filteredVerbs;
  }
  
  matchesTierFilter(verb) {
    if (this.filters.tiers.length === 0) return true;
    return this.filters.tiers.includes(verb.tags.tier);
  }
  
  // ... other filter methods
}
```

---

### 2. Tag Parsing Pattern

**From hablabot's approach:**
```javascript
// Parse tags into structured data
parseTags(tagString) {
  const tags = {};
  tagString.split(';').forEach(tag => {
    const [key, value] = tag.split(':');
    if (value) {
      tags[key] = value;
    }
  });
  return tags;
}
```

**Apply to DrillMaster (Enhanced):**
```javascript
class TagParser {
  static parse(tagString) {
    const tags = {};
    
    tagString.split(';').forEach(tag => {
      const parts = tag.split(':');
      const key = parts[0];
      const value = parts.slice(1).join(':'); // Handle nested colons
      
      // Handle multiple values for same key
      if (tags[key]) {
        if (!Array.isArray(tags[key])) {
          tags[key] = [tags[key]];
        }
        tags[key].push(value);
      } else {
        tags[key] = value;
      }
    });
    
    return tags;
  }
  
  static hasTag(tags, key, value = null) {
    if (!tags[key]) return false;
    if (value === null) return true;
    
    if (Array.isArray(tags[key])) {
      return tags[key].some(v => v.includes(value));
    }
    return tags[key].includes(value);
  }
}
```

---

### 3. IndexedDB Pattern (Future Use)

**From hablabot/storage/database.js:**
```javascript
class Database {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HablaBot', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('vocabulary')) {
          const store = db.createObjectStore('vocabulary', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('spanish', 'spanish', { unique: true });
        }
      };
    });
  }
}
```

**Apply to DrillMaster (Phase 2+):**
- Store user's custom verbs
- Track study progress
- Save generated decks
- Store custom templates

**Phase 1:** Use localStorage only (simpler)

---

### 4. Spaced Repetition Pattern (Future)

**From hablabot/vocabulary/spaced-repetition.js:**
```javascript
class SpacedRepetition {
  calculateNextReview(item, correct) {
    const easeFactor = correct ? 
      Math.min(item.easeFactor + 0.1, 2.5) :
      Math.max(item.easeFactor - 0.2, 1.3);
    
    const interval = correct ?
      Math.ceil(item.interval * easeFactor) :
      1;
    
    return {
      easeFactor,
      interval,
      nextReview: Date.now() + (interval * 24 * 60 * 60 * 1000)
    };
  }
}
```

**Apply to DrillMaster (Phase 3):**
- Track card performance
- Suggest review sessions
- Prioritize difficult verbs
- Adaptive deck generation

---

## Recommended Architecture for DrillMaster

### File Structure (Based on Both Repos)
```
drillmaster/
├── index.html
├── css/
│   ├── pico.min.css (CDN)
│   └── custom.css
├── js/
│   ├── main.js                      # Entry point
│   ├── controllers/
│   │   └── AppController.js         # Main orchestrator
│   ├── services/
│   │   ├── VerbParserService.js     # Parse TSV/tags
│   │   ├── ConjugationService.js    # Load/query conjugations
│   │   ├── TemplateService.js       # Load/process templates
│   │   ├── CardGeneratorService.js  # Generate Anki cards
│   │   ├── ExportService.js         # Export TSV/PDF/clipboard
│   │   ├── FilterService.js         # Verb filtering logic
│   │   └── SettingsService.js       # localStorage persistence
│   └── utils/
│       ├── tagParser.js             # Tag parsing utilities
│       ├── subjectMapper.js         # Subject pronoun mappings
│       └── validators.js            # Input validation
├── data/
│   ├── verbs.tsv                    # 42 verbs (provided)
│   ├── conjugations.json            # Pre-computed conjugations
│   └── templates.json               # Sentence templates
├── scripts/
│   └── generate-conjugations.js     # Node.js script (one-time use)
├── docs/
│   ├── ANKI_SETUP.md
│   └── USER_GUIDE.md
└── README.md
```

---

## Code Patterns to Adopt

### 1. ES6 Modules (like apg-web)
```javascript
// main.js
import { AppController } from './controllers/AppController.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.initialize();
});
```

```html
<!-- index.html -->
<script type="module" src="js/main.js"></script>
```

### 2. Service Initialization Pattern
```javascript
class AppController {
  async initialize() {
    try {
      await this.loadData();
      this.initializeServices();
      this.attachEventListeners();
      this.loadSavedSettings();
      this.render();
    } catch (error) {
      this.handleError(error);
    }
  }
  
  async loadData() {
    const [verbs, conjugations, templates] = await Promise.all([
      fetch('data/verbs.tsv').then(r => r.text()),
      fetch('data/conjugations.json').then(r => r.json()),
      fetch('data/templates.json').then(r => r.json())
    ]);
    
    this.data = { verbs, conjugations, templates };
  }
}
```

### 3. Event Delegation Pattern
```javascript
attachEventListeners() {
  // Filter changes
  document.getElementById('filters-panel').addEventListener('change', (e) => {
    this.handleFilterChange(e);
  });
  
  // Verb selection
  document.getElementById('verb-list').addEventListener('click', (e) => {
    if (e.target.matches('.verb-checkbox')) {
      this.handleVerbToggle(e);
    }
  });
  
  // Export buttons
  document.getElementById('export-buttons').addEventListener('click', (e) => {
    if (e.target.matches('.export-btn')) {
      this.handleExport(e.target.dataset.format);
    }
  });
}
```

### 4. Error Handling Pattern
```javascript
handleError(error) {
  console.error('Application error:', error);
  
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = this.getUserFriendlyError(error);
  errorMessage.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

getUserFriendlyError(error) {
  if (error.message.includes('fetch')) {
    return 'Failed to load data files. Please check your connection.';
  }
  if (error.message.includes('parse')) {
    return 'Failed to parse data. Please check file format.';
  }
  return 'An unexpected error occurred. Please refresh the page.';
}
```

---

## UI Patterns to Adopt

### 1. Loading States (from apg-web)
```html
<button id="generate-btn" aria-busy="false">
  Generate Cards
</button>
```

```javascript
showLoading(button) {
  button.setAttribute('aria-busy', 'true');
  button.disabled = true;
}

hideLoading(button) {
  button.setAttribute('aria-busy', 'false');
  button.disabled = false;
}
```

### 2. Dynamic Counts (from apg-web)
```html
<h2>
  Verb List 
  <span id="verb-count" style="opacity: 0.7; font-size: 0.875rem;">
    (0 selected)
  </span>
</h2>
```

```javascript
updateVerbCount() {
  const count = this.state.selectedVerbs.size;
  document.getElementById('verb-count').textContent = 
    `(${count} selected)`;
}
```

### 3. Preview Panel (from apg-web pattern)
```html
<section id="preview-section">
  <article>
    <details id="preview-details">
      <summary>
        <h2>Preview <span id="card-count">(0 cards)</span></h2>
      </summary>
      <div id="preview-content">
        <!-- Cards rendered here -->
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button id="prev-card">◀ Previous</button>
        <span id="card-position">Card 1 of 100</span>
        <button id="next-card">Next ▶</button>
      </div>
    </details>
  </article>
</section>
```

---

## Performance Patterns

### 1. Lazy Loading (from apg-web)
```javascript
// Don't load all data at once
async loadDataOnDemand() {
  // Load verbs immediately
  this.verbs = await this.loadVerbs();
  
  // Load conjugations when needed
  this.conjugations = null;
  
  // Load templates when needed
  this.templates = null;
}

async ensureConjugationsLoaded() {
  if (!this.conjugations) {
    this.conjugations = await fetch('data/conjugations.json')
      .then(r => r.json());
  }
  return this.conjugations;
}
```

### 2. Debouncing (from hablabot)
```javascript
// Debounce search input
let searchTimeout;
document.getElementById('search-input').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    this.handleSearch(e.target.value);
  }, 300);
});
```

---

## Testing Patterns (from apg-web)

### Structure
```
tests/
├── services/
│   ├── VerbParserService.test.js
│   ├── ConjugationService.test.js
│   └── CardGeneratorService.test.js
└── utils/
    └── tagParser.test.js
```

### Example Test
```javascript
// tagParser.test.js
import { TagParser } from '../js/utils/tagParser.js';

describe('TagParser', () => {
  test('parses simple tags', () => {
    const result = TagParser.parse('tier:1;word-type:verb');
    expect(result).toEqual({
      tier: '1',
      'word-type': 'verb'
    });
  });
  
  test('handles multiple verb-tense tags', () => {
    const result = TagParser.parse(
      'verb-tense:preterite:irregular;verb-tense:future:irregular'
    );
    expect(result['verb-tense']).toEqual([
      'preterite:irregular',
      'future:irregular'
    ]);
  });
});
```

---

## Summary of Adopted Patterns

| Pattern | Source | Apply to DrillMaster |
|---------|--------|---------------------|
| Controller-Service architecture | apg-web | ✅ Core structure |
| Pico CSS integration | apg-web | ✅ UI framework |
| localStorage persistence | apg-web | ✅ Settings |
| File download | apg-web | ✅ TSV export |
| Theme switcher | apg-web | ✅ User preference |
| Collapsible sections | apg-web | ✅ UI organization |
| Vocabulary filtering | hablabot | ✅ Verb filtering |
| Tag parsing | hablabot | ✅ Enhanced version |
| IndexedDB | hablabot | ⏭️ Phase 2+ |
| Spaced repetition | hablabot | ⏭️ Phase 3 |
| ES6 modules | Both | ✅ Code organization |
| Error handling | Both | ✅ User experience |
| Loading states | apg-web | ✅ UX feedback |

---

## Next Steps

1. **Set up project structure** following the recommended architecture
2. **Copy Pico CSS integration** from apg-web
3. **Implement AppController** as main orchestrator
4. **Create service classes** following patterns above
5. **Add theme switcher** (copy from apg-web)
6. **Implement localStorage** for settings persistence

**Ready to start coding with these proven patterns!** 🚀
