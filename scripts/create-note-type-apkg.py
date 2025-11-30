#!/usr/bin/env python3
"""
Create an Anki .apkg file containing ONLY the DrillMaster note type definitions.
No cards are included - this just sets up the note types for later TSV import.

Usage: 
    pip install genanki
    python3 scripts/create-note-type-apkg.py
"""

import genanki
import random

# Generate a consistent model ID (based on "DrillMaster Spanish Verb Cloze")
MODEL_ID = 1607392319

# CSS styling for cards
CARD_CSS = """
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
  padding: 20px;
}

.cloze {
  font-weight: bold;
  color: blue;
}

.nightMode .cloze {
  color: lightblue;
}

hr {
  margin: 1.5em 0;
  border: none;
  border-top: 1px solid #ccc;
}

.extra {
  margin-top: 1em;
  font-size: 0.95em;
  color: #333;
}

.verb-info {
  margin-top: 1em;
  padding-top: 1em;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 0.9em;
}

.nightMode .card {
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.nightMode hr {
  border-top-color: #444;
}

.nightMode .extra {
  color: #ccc;
}

.nightMode .verb-info {
  border-top-color: #333;
  color: #999;
}
"""

# Front template (what the user sees first)
FRONT_TEMPLATE = """
{{cloze:Text}}
"""

# Back template (what shows after answering)
BACK_TEMPLATE = """
{{cloze:Text}}

<hr>

<div class="extra">
  {{Extra}}
</div>
"""

# Create the note model (note type)
drillmaster_model = genanki.Model(
    MODEL_ID,
    'DrillMaster Spanish Verb Cloze',
    fields=[
        {'name': 'Text'},
        {'name': 'Extra'},
        {'name': 'Verb'},
        {'name': 'Tags'},
    ],
    templates=[
        {
            'name': 'Cloze Card',
            'qfmt': FRONT_TEMPLATE,
            'afmt': BACK_TEMPLATE,
        },
    ],
    css=CARD_CSS,
    model_type=genanki.Model.CLOZE,
)

# Create an empty deck (required for .apkg format, but contains no cards)
deck_id = random.randrange(1 << 30, 1 << 31)
deck = genanki.Deck(
    deck_id,
    'DrillMaster Setup (Empty)'
)

# Create the package
package = genanki.Package(deck)
package.write_to_file('DrillMaster-NoteType-Setup.apkg')

print("✅ Created DrillMaster-NoteType-Setup.apkg")
print("\nThis package contains:")
print("  - DrillMaster Spanish Verb Cloze note type")
print("  - Properly configured fields and card template")
print("  - Styling for light and dark modes")
print("  - NO actual cards (empty deck)")
print("\nTo use:")
print("  1. Import this .apkg file into Anki ONCE")
print("  2. Then import your TSV files using the DrillMaster note type")
print("\n📝 File location: DrillMaster-NoteType-Setup.apkg")
