# Anki Import Guide

This guide shows you how to import DrillMaster-generated flashcards into Anki.

## Prerequisites

- Anki Desktop installed (download from https://apps.ankiweb.net/)
- TSV file exported from DrillMaster

## Safety First: Create a Test Profile (Recommended)

To avoid any conflicts with your existing Anki data:

1. Open Anki
2. Click **File** → **Switch Profile**
3. Click **Add**
4. Name it `DrillMaster Test` (or similar)
5. Click **OK**

This creates a completely separate profile where you can safely test the import without affecting your existing cards.

**To switch back to your main profile later:** File → Switch Profile → select your original profile

## Step 1: Set Up Note Type

You have two options:

### Option A: Import Pre-configured Note Type (Easiest)

1. Use the `DrillMaster-NoteType-Setup.apkg` file from the `data/` folder
2. In Anki, click **File** → **Import...**
3. Select the `DrillMaster-NoteType-Setup.apkg` file
4. Click **Import**
5. Done! Skip to Step 2.

This creates the note type automatically with all the correct settings.

### Option B: Create Note Type Manually

If you prefer to create it by hand:

1. Open Anki
2. Click **Tools** → **Manage Note Types**
3. Click **Add**
4. Select **Add: Basic** and click **OK**
5. Name it `Spanish Verb Cloze` and click **OK**
6. Select your new `Spanish Verb Cloze` note type and click **Fields...**

### Configure Fields:

Add these fields in order (use **Add** button):
1. `Text` (already exists, rename from "Front")
2. `Extra` (rename from "Back")
3. `Verb`
4. `Tags`

When done, you should have 4 fields. Click **Save** and close the Fields window.

### Configure Card Template:

1. With `Spanish Verb Cloze` still selected, click **Cards...**
2. Replace the **Front Template** with:

```html
{{cloze:Text}}
```

3. Replace the **Back Template** with:

```html
{{cloze:Text}}

<hr>

{{Extra}}

<div style="margin-top: 1em; color: #666; font-size: 0.9em;">
  <strong>Verb:</strong> {{Verb}}
</div>
```

4. Replace the **Styling** with:

```css
.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}

.cloze {
  font-weight: bold;
  color: blue;
}

.nightMode .cloze {
  color: lightblue;
}

hr {
  margin: 1em 0;
  border: none;
  border-top: 1px solid #ccc;
}
```

5. Click **Save** and close the Cards window
6. Click **Close** on the Note Types window

## Step 2: Create a Deck (Optional)

1. In the main Anki window, click **Create Deck** at the bottom
2. Name it something like `Spanish Verbs - DrillMaster`
3. Click **OK**

## Step 3: Import the TSV File

1. Click **File** → **Import...**
2. Navigate to your DrillMaster TSV file and select it
3. Configure the import settings:

### Import Settings:

- **Type**: `Spanish Verb Cloze` (the note type you just created)
- **Deck**: Select your Spanish Verbs deck (or Default)
- **Fields separated by**: `Tab`
- **Allow HTML in fields**: ✓ (checked)

### Field Mapping:

Map the columns to fields:
- Column 1 → `Text`
- Column 2 → `Extra`
- Column 3 → `Verb`
- Column 4 → `Tags`

4. Click **Import**

## Step 4: Verify Import

1. Click on your deck to open it
2. Click **Browse** to see all cards
3. Select a card and verify:
   - Front shows the cloze deletion (e.g., "yo {{c1::hablo}} español")
   - Back shows the answer revealed
   - Extra info appears below
   - Verb name is shown at bottom

## Step 5: Study!

1. Return to the main Anki window
2. Click on your deck
3. Click **Study Now**

## Troubleshooting

### Cards are blank or malformed
- Make sure you selected the correct Note Type during import
- Verify field mapping matches the order above
- Check that "Allow HTML in fields" is enabled

### Cloze deletions don't work
- Ensure your Note Type is configured with `{{cloze:Text}}` in the template
- Verify the TSV file contains `{{c1::...}}` syntax

### Tags aren't imported
- Tags in the TSV are informational only
- To add Anki tags, select cards in Browser and use **Edit** → **Add Tags**

## Tips

- **Study Settings**: Adjust new cards/day in deck options (click gear icon)
- **Filtered Decks**: Create custom study sessions by verb tier or tense
- **Mobile Sync**: Sync to AnkiWeb to study on mobile devices
- **Conjugation Tables**: Use the HTML table export as a reference sheet

## Card Format Details

DrillMaster generates cloze deletion cards with this structure:

**Front:**
```
yo {{c1::hablo}} español todos los días. (present)
```

**Back:**
```
yo hablo español todos los días. (present)
---
to speak - present tense
Verb: HABLAR (to speak)
```

The `{{c1::...}}` syntax creates the cloze deletion (hidden word that you need to recall).

## Next Steps

Once you're comfortable with the basic import:
1. Try different verb combinations
2. Experiment with filtering by tier or regularity
3. Export conjugation tables as study aids
4. Create multiple decks for different tenses or verb groups

---

**Need Help?**
- Anki Manual: https://docs.ankiweb.net/
- DrillMaster Issues: https://github.com/jeffwright13/drillmaster/issues
