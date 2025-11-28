# Template System - Final Decisions
**Date**: November 27, 2024  
**Status**: Confirmed and Ready

---

## Confirmed Decisions

### 1. Creation Approach ✅
**Decision**: **Option 3 - Hybrid**

**Implementation**:
- **You draft**: Tier 3-4 verbs (22 verbs × 2 = 44 templates)
- **I draft**: Tier 1-2 verbs (20 verbs × 2 = 40 templates)
- **Both review**: Cross-check each other's work

**Workflow**:
1. I draft Tier 1-2 templates first (foundation verbs)
2. You review and approve/modify
3. You draft Tier 3-4 templates (specialized verbs)
4. I review for consistency and format
5. Final review together

**Benefits**:
- Leverages your Spanish expertise for advanced verbs
- I handle the foundational/common verbs
- Quality control through mutual review
- Faster than either approach alone

---

### 2. Template Count ✅
**Decision**: **2 templates per verb for Phase 1**

**Total**: 84 templates (42 verbs × 2)

**Distribution**:
- Tier 1: 10 verbs × 2 = 20 templates
- Tier 2: 10 verbs × 2 = 20 templates
- Tier 3: 12 verbs × 2 = 24 templates
- Tier 4: 10 verbs × 2 = 20 templates

**Rationale**:
- Provides variety without overwhelming
- Manageable to create and review
- Can expand to 3 templates in Phase 2

---

### 3. Complexity Level ✅
**Decision**: **Templates match verb tier**

**Guidelines**:

#### Tier 1 (Beginner)
- Simple subject + verb + object
- Present tense focus
- Common, everyday contexts
- No subordinate clauses

**Example (HABLAR)**:
```
✅ "Yo hablo español."
✅ "Yo hablo con mi amigo."
❌ "Yo hablo español porque me gusta viajar." (too complex)
```

#### Tier 2 (Elementary)
- Can add time expressions
- Simple connectors (y, pero)
- Basic subordinate clauses OK
- Reflexive verbs OK, but simple structures only
- Daily routine contexts

**Example (LEVANTARSE)**:
```
✅ "Yo me levanto a las 7."
✅ "Yo me levanto temprano todos los días."
✅ "Yo me levanto y desayuno." (simple connector)
```

#### Tier 3 (Intermediate)
- Multiple clauses allowed
- Idiomatic expressions
- Varied contexts (emotions, opinions)
- More complex structures
- Reflexive verbs OK, with more complex structures
- Copula verbs OK (ser, estar, parecer)

**Example (PENSAR)**:
```
✅ "Yo pienso que es importante."
✅ "Yo pienso en mi familia cuando estoy solo."
✅ "Yo pienso estudiar medicina." (pensar + infinitive)
```

**Example (ESTAR)**:
```
✅ "Yo estoy bien."
✅ "Yo estoy en la escuela."
✅ "Yo estoy enfermo." (estar + adjective)
```

**Example (VESTIRESE)**:
```
✅ "Porque tu te vestes con ropa sucia?" (reflexive + subordinate clause)
```

#### Tier 4 (Upper Intermediate)
- Advanced structures
- Specialized/professional contexts
- Nuanced meanings
- Complex idioms

**Example (LLEVAR)**:
```
✅ "Yo llevo una chaqueta negra." (wear)
✅ "Yo llevo el proyecto desde enero." (manage/lead)
✅ "Yo llevo tres años viviendo aquí." (have been for time)
```

---

### 4. English Translations ✅
**Decision**: **Mix of both (literal + natural)**

**Strategy**: Prioritize natural, but show literal when pedagogically useful

**Examples**:

#### Natural (Preferred)
```
Spanish: "Tengo hambre."
English: "I'm hungry." (not "I have hunger")

Spanish: "Hace frío."
English: "It's cold." (not "It makes cold")
```

#### Literal (When Useful)
```
Spanish: "Tengo que estudiar."
English: "I have to study." (shows "tener que" structure)

Spanish: "Me llamo Juan."
English: "I call myself Juan." (shows reflexive construction)
Then add: "(My name is Juan)" as note
```

#### Guidelines
- Use natural English for common expressions
- Use literal when it helps understand Spanish structure
- Add notes in parentheses when needed
- Consistency within each verb's templates

---

### 5. High-Frequency Verbs ✅
**Decision**: **Yes, extra templates for high-frequency verbs**

**High-Frequency Verbs** (get 3-4 templates instead of 2):

#### Tier 1 (All get extra templates)
1. **SER** (4 templates) - Most essential
2. **ESTAR** (4 templates) - Most essential
3. **TENER** (3 templates) - Very common
4. **HACER** (3 templates) - Very common
5. **IR** (3 templates) - Very common
6. **HABLAR** (3 templates) - Model regular verb
7. **COMER** (3 templates) - Model regular verb
8. **VIVIR** (3 templates) - Model regular verb

#### Tier 2
9. **LLAMARSE** (3 templates) - Essential identity verb
10. **LEVANTARSE** (3 templates) - Daily routine

**Total Extra Templates**: 
- 8 verbs × 1 extra = 8 additional templates
- 2 verbs × 1 extra = 2 additional templates
- **New Total**: 94 templates (instead of 84)

**Rationale**:
- These verbs appear most frequently in conversation
- More variety = better learning
- Model verbs (HABLAR, COMER, VIVIR) need extra examples
- SER/ESTAR deserve special attention (most confusing pair)

---

## Template Creation Workload

### My Responsibility (Tier 1-2)
**Verbs**: 20 verbs
**Templates**: 
- 10 high-frequency verbs × 3 = 30 templates
- 10 regular verbs × 2 = 20 templates
- **Total**: 50 templates

**Estimated Time**: 10-15 hours
- Research natural usage
- Write Spanish sentences
- Write English translations
- Format as JSON
- Self-review

### Your Responsibility (Tier 3-4)
**Verbs**: 22 verbs
**Templates**: 
- 22 verbs × 2 = 44 templates

**Estimated Time**: 8-12 hours
- Write sentence ideas
- Provide context notes
- I'll format and refine

### Mutual Review
**Estimated Time**: 3-5 hours each
- Review each other's work
- Suggest improvements
- Finalize

**Total Project Time**: 30-40 hours combined

---

## Template Format (JSON Structure)

```json
{
  "HABLAR": {
    "infinitive": "hablar",
    "english": "to speak",
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
      },
      {
        "id": "hablar_03",
        "spanish": "{subject} {verb} por teléfono.",
        "english": "{subject_en} speak{s} on the phone.",
        "context": "communication",
        "time_marker": null,
        "difficulty": 1,
        "notes": "Common communication method"
      }
    ]
  }
}
```

---

## Next Steps

### Immediate (This Week)
1. ✅ Decisions confirmed
2. ⏳ I draft Tier 1 templates (10 verbs, 30 templates)
3. ⏳ You review my Tier 1 drafts

### Week 2
4. ⏳ I draft Tier 2 templates (10 verbs, 20 templates)
5. ⏳ You review my Tier 2 drafts
6. ⏳ You start Tier 3 templates (12 verbs, 24 templates)

### Week 3
7. ⏳ You finish Tier 3 templates
8. ⏳ You draft Tier 4 templates (10 verbs, 20 templates)
9. ⏳ I review your Tier 3-4 drafts

### Week 4
10. ⏳ Final review and adjustments
11. ⏳ Format all templates as JSON
12. ⏳ Validate template structure

**Target**: Complete all 94 templates in 3-4 weeks

---

## Summary

- ✅ Hybrid approach (I do Tier 1-2, you do Tier 3-4)
- ✅ 2 templates per verb (94 total with high-freq bonuses)
- ✅ Templates match verb tier complexity
- ✅ Mix of literal and natural English
- ✅ Extra templates for 10 high-frequency verbs

**Status**: Ready to start template creation!

**Next Action**: I'll draft Tier 1 templates for your review.
