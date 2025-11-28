# Template System Explanation
**Purpose**: Clarify what "templates" mean in the DrillMaster context

---

## What Are Templates?

**Templates** are pre-written sentence patterns that show how a verb is used in natural Spanish conversation. Each template contains placeholders that get filled in with conjugated verbs, subjects, and other contextual information.

---

## Example: HABLAR (to speak)

### Template 1
```javascript
{
  "spanish": "{subject} {verb} español todos los días.",
  "english": "{subject_en} speak{s} Spanish every day.",
  "time_marker": "todos los días",
  "context": "daily routine"
}
```

**When Generated for "yo, present tense":**
- Spanish: `Yo hablo español todos los días.`
- English: `I speak Spanish every day.`

**When Generated for "tú, present tense":**
- Spanish: `Tú hablas español todos los días.`
- English: `You speak Spanish every day.`

### Template 2
```javascript
{
  "spanish": "{subject} {verb} con mi familia.",
  "english": "{subject_en} speak{s} with my family.",
  "context": "family"
}
```

**When Generated for "yo, present tense":**
- Spanish: `Yo hablo con mi familia.`
- English: `I speak with my family.`

---

## Why Multiple Templates?

### Problem: Repetition is Boring
If every card for HABLAR used the same sentence:
- `Yo hablo español.`
- `Tú hablas español.`
- `Él habla español.`
- `Nosotros hablamos español.`

This gets monotonous and doesn't show the verb's versatility.

### Solution: Multiple Contexts
With 2-3 templates per verb, you get variety:
- `Yo hablo español todos los días.` (daily routine)
- `Yo hablo con mi familia.` (family context)
- `Yo hablo por teléfono.` (communication method)

This shows the verb in different real-world situations.

---

## Template Components

### 1. Placeholders
Variables that get replaced with actual values:

| Placeholder | Gets Replaced With | Example |
|-------------|-------------------|---------|
| `{subject}` | Spanish subject pronoun | Yo, Tú, Él, Nosotros |
| `{verb}` | Conjugated verb | hablo, hablas, habla |
| `{subject_en}` | English subject | I, You, He, We |
| `{verb_en}` | English verb | speak, speaks |
| `{reflexive}` | Reflexive pronoun (if needed) | me, te, se |

### 2. Context Information
Metadata about the template:

```javascript
{
  "context": "daily routine",      // What situation is this?
  "time_marker": "todos los días", // Time expression used
  "difficulty": 1                  // Complexity level (1-3)
}
```

---

## Template Examples by Verb Type

### Regular Verb: COMER (to eat)
```javascript
[
  {
    "spanish": "{subject} {verb} en un restaurante.",
    "english": "{subject_en} eat{s} at a restaurant.",
    "context": "dining out"
  },
  {
    "spanish": "{subject} {verb} frutas y verduras.",
    "english": "{subject_en} eat{s} fruits and vegetables.",
    "context": "healthy eating"
  }
]
```

### Reflexive Verb: LLAMARSE (to be called)
```javascript
[
  {
    "spanish": "{subject} {reflexive} {verb} {name}.",
    "english": "{subject_en} {verb_en} {name}.",
    "context": "introduction",
    "note": "{name} would be replaced with common Spanish names"
  },
  {
    "spanish": "¿Cómo {reflexive} {verb} {subject}?",
    "english": "What is {subject_en} name?",
    "context": "asking name"
  }
]
```

### Irregular Verb: TENER (to have)
```javascript
[
  {
    "spanish": "{subject} {verb} una familia grande.",
    "english": "{subject_en} have/has a big family.",
    "context": "family"
  },
  {
    "spanish": "{subject} {verb} que estudiar.",
    "english": "{subject_en} have/has to study.",
    "context": "obligation (tener que)"
  },
  {
    "spanish": "{subject} {verb} hambre.",
    "english": "{subject_en} {verb_en} hungry.",
    "context": "tener + noun expressions"
  }
]
```

---

## How Templates Become Anki Cards

### Step 1: User Selects
- Verb: HABLAR
- Tense: Present
- Subject: yo
- Card Type: Cloze deletion

### Step 2: System Processes Each Template

**Template 1:**
```
Spanish: Yo hablo español todos los días.
English: I speak Spanish every day.
```

**Generated Cloze Card:**
```
Front: Yo {{c1::hablo}} español todos los días.
Back: I speak Spanish every day.
Extra: HABLAR (present, yo)
```

**Template 2:**
```
Spanish: Yo hablo con mi familia.
English: I speak with my family.
```

**Generated Cloze Card:**
```
Front: Yo {{c1::hablo}} con mi familia.
Back: I speak with my family.
Extra: HABLAR (present, yo)
```

### Result
User gets **2 cards** for the same verb/tense/subject combination, but with different contexts.

---

## Template Creation Guidelines

### Tier 1 (Beginner)
- **Simple sentences**: Subject + verb + basic object
- **Common contexts**: daily routine, family, basic needs
- **No complex grammar**: Avoid subordinate clauses

**Example (HABLAR):**
```
✅ "Yo hablo español."
✅ "Yo hablo con mi amigo."
❌ "Yo hablo español porque me gusta viajar." (too complex)
```

### Tier 2 (Elementary)
- **Slightly longer**: Can add time expressions
- **More contexts**: work, hobbies, past events
- **Simple connectors**: y, pero, porque (basic)

**Example (DECIR):**
```
✅ "Yo digo la verdad."
✅ "Yo digo 'hola' a mis amigos."
✅ "Yo digo que sí." (simple subordinate clause OK)
```

### Tier 3 (Intermediate)
- **Complex sentences**: Multiple clauses allowed
- **Idiomatic usage**: Common expressions
- **Varied contexts**: emotions, opinions, hypotheticals

**Example (PENSAR):**
```
✅ "Yo pienso que es importante."
✅ "Yo pienso en mi familia."
✅ "Yo pienso estudiar medicina." (pensar + infinitive)
```

### Tier 4 (Upper Intermediate)
- **Advanced structures**: Subjunctive triggers, complex idioms
- **Specialized contexts**: Professional, academic
- **Nuanced meanings**: Multiple verb meanings

**Example (LLEVAR):**
```
✅ "Yo llevo una chaqueta." (wear)
✅ "Yo llevo el libro a clase." (carry)
✅ "Yo llevo tres años aquí." (have been for time)
```

---

## Template Variety Strategies

### 1. Different Objects
```javascript
// COMER
"Yo como pizza."
"Yo como en casa."
"Yo como con mis amigos."
```

### 2. Different Time Expressions
```javascript
// HABLAR
"Yo hablo español todos los días." (every day)
"Yo hablo español ahora." (now)
"Yo hablo español en clase." (in class)
```

### 3. Different Contexts
```javascript
// HACER
"Yo hago la tarea." (homework)
"Yo hago ejercicio." (exercise)
"Yo hago preguntas." (questions)
```

### 4. Different Constructions
```javascript
// TENER
"Yo tengo un perro." (possession)
"Yo tengo hambre." (tener + noun expression)
"Yo tengo que estudiar." (obligation)
```

---

## Special Cases

### Reflexive Verbs
Templates must include `{reflexive}` placeholder:

```javascript
{
  "spanish": "{subject} {reflexive} {verb} a las 7.",
  "english": "{subject_en} wake{s} up at 7.",
  "verb": "DESPERTARSE"
}
```

**Generated:**
- yo: `Yo me despierto a las 7.`
- tú: `Tú te despiertas a las 7.`
- él: `Él se despierta a las 7.`

### Verbs with Special Constructions (GUSTAR)
```javascript
{
  "spanish": "A {indirect_object} {verb} {noun}.",
  "english": "{subject_en} like{s} {noun}.",
  "verb": "GUSTAR",
  "note": "Reverse construction"
}
```

**Generated:**
- yo: `A mí me gusta el español.` (I like Spanish)
- tú: `A ti te gusta el español.` (You like Spanish)

### Copula Verbs (SER/ESTAR)
```javascript
// SER (permanent)
{
  "spanish": "{subject} {verb} {adjective}.",
  "english": "{subject_en} {verb_en} {adjective}.",
  "context": "characteristics"
}

// ESTAR (temporary)
{
  "spanish": "{subject} {verb} {adjective}.",
  "english": "{subject_en} {verb_en} {adjective}.",
  "context": "states"
}
```

**Generated:**
- yo: `Yo soy alto.` (permanent)
- tú: `Tú eres bien.` (temporary)

---

## Template Data Structure

### Full Template Object
```javascript
{
  "verb": "HABLAR",
  "tier": 1,
  "templates": [
    {
      "id": "hablar_01",
      "spanish": "{subject} {verb} español todos los días.",
      "english": "{subject_en} speak{s} Spanish every day.",
      "context": "daily routine",
      "time_marker": "todos los días",
      "difficulty": 1,
      "notes": "Simple present tense, daily habit"
    },
    {
      "id": "hablar_02",
      "spanish": "{subject} {verb} con mi familia.",
      "english": "{subject_en} speak{s} with my family.",
      "context": "family",
      "time_marker": null,
      "difficulty": 1,
      "notes": "Basic communication context"
    }
  ]
}
```

---

## Your Role in Template Creation

### Option 1: You Provide Templates
You write the sentence patterns for each verb, and I'll structure them into the JSON format.

**Example Input:**
```
HABLAR:
1. I speak Spanish every day.
2. I speak with my family.
3. I speak on the phone.

COMER:
1. I eat at a restaurant.
2. I eat fruits and vegetables.
```

I'll convert to:
```javascript
{
  "HABLAR": [
    { "spanish": "...", "english": "..." },
    { "spanish": "...", "english": "..." }
  ]
}
```

### Option 2: I Draft Templates
I create initial templates based on:
- Common usage patterns
- Tier-appropriate complexity
- Natural Spanish contexts

You review and approve/modify.

### Option 3: Hybrid Approach
- I draft templates for high-frequency verbs (Tier 1-2)
- You provide templates for specialized verbs (Tier 3-4)
- We iterate together

---

## Recommendation for Phase 1

**Start with 2 templates per verb** (84 total templates for 42 verbs)

### Why 2?
- ✅ Provides variety without overwhelming
- ✅ Manageable to create/review
- ✅ Shows verb in different contexts
- ✅ Can expand to 3 later if needed

### Template Creation Process
1. **Week 1**: Create templates for Tier 1 verbs (10 verbs × 2 = 20 templates)
2. **Week 2**: Create templates for Tier 2 verbs (10 verbs × 2 = 20 templates)
3. **Week 3**: Create templates for Tier 3 verbs (12 verbs × 2 = 24 templates)
4. **Week 4**: Create templates for Tier 4 verbs (10 verbs × 2 = 20 templates)

**Total**: 84 templates over 4 weeks = ~21 templates per week = ~3 templates per day

---

## Questions for You

1. **Creation Approach**: Which option do you prefer?
   - Option 1: You provide sentence ideas
   - Option 2: I draft, you review
   - Option 3: Hybrid

2. **Template Count**: Confirm 2 templates per verb for Phase 1?

3. **Complexity Level**: Should templates match verb tier?
   - Tier 1 verbs → simple sentences only
   - Tier 4 verbs → can use complex structures

4. **English Translations**: Should they be:
   - Literal (word-for-word)
   - Natural (how a native speaker would say it)
   - Mix of both

5. **Special Verbs**: Do you want extra templates for high-frequency verbs like SER, ESTAR, TENER, HACER?

---

## Summary

**Templates = Sentence patterns that show verbs in natural contexts**

- Each verb gets 2-3 templates
- Templates have placeholders for subjects, verbs, etc.
- System fills in placeholders based on user selections
- Result: Multiple Anki cards per verb/tense/subject combo
- Benefit: Variety, context, natural usage examples

**Next Step**: Decide on template creation approach and start drafting!
