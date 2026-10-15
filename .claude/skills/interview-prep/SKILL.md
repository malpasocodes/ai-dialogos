---
name: interview-prep
description: Researches an upcoming AI-Dialogos podcast guest and writes a set of interview questions organized around three themes the user chooses. Use when the user gives a guest name (usually with a LinkedIn URL) and wants interview questions, interview prep, or a question set for the podcast. Asks the user for the three themes before researching, then saves the result to docs/interviews/<guest-slug>.md.
argument-hint: "<guest name> <linkedin url>"
---

You prepare interview question sets for the AI-Dialogos podcast (companion to the
**AI Essentials for Leaders** book series — themes: AI strategy, governance, and
leadership for executives). Input: a guest **name** (required) and usually a
**LinkedIn URL**. Output: a markdown prep file at `docs/interviews/<guest-slug>.md`.

Arguments passed: `$ARGUMENTS`

## Workflow

1. **Get inputs.** Parse the guest name and LinkedIn URL from the arguments or the
   request. If the name is missing, ask for it. If the LinkedIn URL is missing, ask
   once; proceed without it if the user doesn't have one. Strip tracking query
   strings (e.g. `?isSelfProfile=false`) from the URL.

2. **Ask for three themes — then stop.** Before doing any research, ask the user in
   plain text: "What three themes should I investigate for <name>?" End your turn
   and wait for the reply. Do not fetch, search, or query anything first.
   - If the themes were already given in the request, skip this step.
   - If the user gives more or fewer than three, confirm how to proceed before
     continuing (e.g. merge two, or add one they pick).

3. **Check what's already known.**
   - Read-only query of the guests table (never write to it from this skill):
     ```bash
     node --input-type=module -e "
     import 'dotenv/config'; import postgres from 'postgres';
     const sql = postgres(process.env.DATABASE_URL);
     console.log(JSON.stringify(await sql\`SELECT id, name, bio, short_bio, episode_title, episode_url FROM guests WHERE lower(name) = lower('GUEST NAME')\`, null, 2));
     await sql.end();"
     ```
     An existing bio is useful context; an existing episode title means the
     episode may already be recorded — mention that to the user.
   - Slug the name (lowercase, hyphens, ASCII: `Matt Sigelman` → `matt-sigelman`).
     If `docs/interviews/<slug>.md` already exists, ask whether to overwrite it or
     write a dated version (`<slug>-YYYY-MM-DD.md`).

4. **Research.**
   - **Background:** WebFetch the LinkedIn URL first. LinkedIn often blocks
     anonymous fetches — on a login wall or empty content, fall back to
     WebSearch: name + affiliation, their organization's bio page, books, recent
     talks, interviews, and op-eds. Capture current role, career arc, books
     (exact titles), and notable public positions.
   - **Per theme:** run targeted searches for what the guest has *themselves*
     said or written on each theme — articles, reports, talks, other podcast
     appearances, social posts. Read the sources; don't rely on search snippets
     for anything you cite. Note specific claims, data points, or arguments a
     question can build on, and any tension or evolution in their views.
   - Keep the show's audience in mind: senior leaders deciding how to adopt and
     govern AI. Favor questions that draw out practical judgment and concrete
     examples over definitions.

5. **Accuracy rules — this is a real person.** Every fact in the research brief and
   every *Why ask* note must trace to a source you actually read, cited by number.
   Never invent quotes, statistics, positions, credentials, or book titles. Only
   put words in quotation marks if they appear verbatim in a source. If a theme
   turns up little of the guest's own material, say so in that section and write
   more open-ended questions rather than pretending to a position they haven't
   taken.

6. **Write the file** `docs/interviews/<slug>.md` (create `docs/interviews/` if
   needed) with this structure:

   ```markdown
   # Interview prep: <Guest Name>

   - **LinkedIn:** <url>
   - **Prepared:** YYYY-MM-DD
   - **Themes:** 1. <theme> · 2. <theme> · 3. <theme>

   ## Research brief
   <Current role, career arc, books and talks, notable public positions — a short
   paragraph or 4–8 bullets, each with [n] citations.>

   ## Opener
   **Q.** <warm-up question — easy, personal, sets up the themes>
   - *Why ask:* <one line> [n]

   ## Theme 1: <theme>
   <One or two sentences on what the guest has said about this theme, or a note
   that little is on record.>

   **Q1.** <question>
   - *Follow-up:* <probe>
   - *Follow-up:* <optional second probe>
   - *Why ask:* <one line tying it to something they said or did> [n]

   <4–6 questions per theme>

   ## Theme 2: <theme>
   ...

   ## Theme 3: <theme>
   ...

   ## Closer
   **Q.** <closing question — e.g. the one thing leaders should do next, or where
   listeners can follow their work>

   ## Sources
   1. <Title> — <publisher/site>, <date if known>. <url>
   2. ...
   ```

   Questions should be open-ended (no yes/no), one idea each, and in a
   conversational voice the host can read aloud. Order questions within a theme
   from broad to specific. Markdown is fine here — these are prep notes, not
   published content (unlike guest bios, which must be plain text).

7. **Report back.** Give the file path, the three themes, the question count per
   theme, the strongest two or three questions, and any gaps (e.g. "LinkedIn was
   blocked — background is from their company bio", "little on record for theme
   3, questions are exploratory"). Don't commit the file; the user decides that.
