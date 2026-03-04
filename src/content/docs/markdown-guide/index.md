---
title: "Markdown Reference Guide"
description: "A complete introduction to Markdown syntax — from basic formatting to advanced techniques"
section: "References & Guides"
order: 1
lastUpdated: 2026-03-04
---

# Markdown Reference Guide

Markdown is a lightweight markup language that lets you add formatting to plain text. You write it in any text editor and it renders as formatted HTML — headings, bold text, lists, links, tables, and more. It's the format used for all documents and announcements in this leader portal.

This guide covers everything from the basics to advanced techniques, with examples throughout.

---

## Table of Contents

- [Headings](#headings)
- [Paragraphs & Line Breaks](#paragraphs--line-breaks)
- [Text Formatting](#text-formatting)
- [Blockquotes](#blockquotes)
- [Lists](#lists)
- [Links](#links)
- [Images](#images)
- [Code](#code)
- [Tables](#tables)
- [Horizontal Rules](#horizontal-rules)
- [Task Lists](#task-lists)
- [Escaping Characters](#escaping-characters)
- [HTML in Markdown](#html-in-markdown)
- [Quick Reference](#quick-reference)

---

## Headings

Create headings by starting a line with one to six `#` symbols. More `#` symbols = smaller heading.

```
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

**Renders as:**

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

> **Tip:** Always put a space between the `#` and your heading text. Leave a blank line before and after headings for best compatibility.

**Alternate syntax for H1 and H2** — underline the text with `=` or `-`:

```
My Page Title
=============

Section Header
--------------
```

---

## Paragraphs & Line Breaks

A **paragraph** is simply one or more lines of text separated by a blank line.

```
This is the first paragraph. It can span
multiple lines in the source file.

This is the second paragraph, separated by a blank line.
```

**Renders as:**

This is the first paragraph. It can span multiple lines in the source file.

This is the second paragraph, separated by a blank line.

### Hard Line Breaks

To force a line break *within* a paragraph (without starting a new paragraph), end the line with **two or more spaces** before pressing Enter, or use a backslash `\` at the end of the line.

```
Line one
Line two (after two trailing spaces above)

Line one\
Line two (after a backslash above)
```

**Renders as:**

Line one
Line two

> **Note:** Trailing spaces are invisible, which is why the backslash method is often clearer.

---

## Text Formatting

### Bold

Wrap text with `**double asterisks**` or `__double underscores__`.

```
**This text is bold**
__This text is also bold__
```

**This text is bold**

### Italic

Wrap text with `*single asterisks*` or `_single underscores_`.

```
*This text is italic*
_This text is also italic_
```

*This text is italic*

### Bold and Italic

Combine three asterisks for bold italic.

```
***This is bold and italic***
___This is also bold and italic___
**_Bold with italic inside_**
```

***This is bold and italic***

### Strikethrough

Wrap text with `~~double tildes~~`.

```
~~This text is crossed out~~
```

~~This text is crossed out~~

### Inline Code

Wrap text with `` `backticks` `` to render it as inline code (monospace font, distinct background).

```
Run `npm install` to install dependencies.
The variable is named `currentUser`.
```

Run `npm install` to install dependencies.
The variable is named `currentUser`.

To include a backtick inside inline code, use double backticks as delimiters:

```
`` Use `backticks` inside code ``
```

`` Use `backticks` inside code ``

### Combining Styles

You can combine formatting as long as the delimiters don't conflict:

```
You can write **bold and _italic_ together**.
This is ~~strikethrough with **bold inside**~~.
```

You can write **bold and _italic_ together**.
This is ~~strikethrough with **bold inside**~~.

---

## Blockquotes

Start a line with `>` to create a blockquote. Use multiple `>` symbols to nest them.

```
> This is a blockquote. It's great for callouts,
> quotes from other sources, or important notes.
```

> This is a blockquote. It's great for callouts, quotes from other sources, or important notes.

### Multi-paragraph Blockquotes

```
> First paragraph inside the blockquote.
>
> Second paragraph. The blank `>` line keeps both inside the quote.
```

> First paragraph inside the blockquote.
>
> Second paragraph. The blank `>` line keeps both inside the quote.

### Nested Blockquotes

```
> Outer blockquote.
>
> > Inner nested blockquote.
> >
> > > Doubly nested.
```

> Outer blockquote.
>
> > Inner nested blockquote.
> >
> > > Doubly nested.

### Blockquotes with Other Formatting

```
> #### A Heading Inside a Quote
>
> - Bullet point
> - Another point
>
> **Bold text** and *italics* work here too.
```

> #### A Heading Inside a Quote
>
> - Bullet point
> - Another point
>
> **Bold text** and *italics* work here too.

---

## Lists

### Unordered Lists

Use `-`, `*`, or `+` as the bullet character (your choice — be consistent).

```
- Apples
- Bananas
- Cherries
```

- Apples
- Bananas
- Cherries

### Ordered Lists

Use numbers followed by periods. The actual numbers don't matter — Markdown will render them in correct sequence.

```
1. First item
2. Second item
3. Third item
```

1. First item
2. Second item
3. Third item

You can start an ordered list at any number:

```
5. This starts at five
6. Then six
7. Then seven
```

5. This starts at five
6. Then six
7. Then seven

### Nested Lists

Indent nested items by **two or four spaces** (or one tab).

```
- Fruits
  - Apples
    - Honeycrisp
    - Fuji
  - Bananas
- Vegetables
  - Carrots
  - Broccoli
```

- Fruits
  - Apples
    - Honeycrisp
    - Fuji
  - Bananas
- Vegetables
  - Carrots
  - Broccoli

### Mixed Ordered and Unordered

```
1. Pack meeting prep
   - Reserve the room
   - Print agendas
   - Set up chairs
2. Den meeting activities
   - Prepare craft supplies
   - Review advancement requirements
```

1. Pack meeting prep
   - Reserve the room
   - Print agendas
   - Set up chairs
2. Den meeting activities
   - Prepare craft supplies
   - Review advancement requirements

### Lists with Multiple Paragraphs

Indent continuation paragraphs by four spaces to keep them inside the list item.

```
- First item with a single paragraph.

- Second item with two paragraphs.

    This second paragraph is indented four spaces
    and belongs to the same list item.

- Third item.
```

- First item with a single paragraph.

- Second item with two paragraphs.

    This second paragraph is indented four spaces and belongs to the same list item.

- Third item.

---

## Links

### Inline Links

```
[Link text](https://example.com)
[Visit our pack site](https://pack261.com)
```

[Visit our pack site](https://pack261.com)

### Links with a Title (Tooltip)

Add a title in quotes after the URL — it appears as a tooltip on hover.

```
[BSA Website](https://www.scouting.org "Official BSA site")
```

[BSA Website](https://www.scouting.org "Official BSA site")

### Reference-Style Links

Define the URL separately from the text — useful to keep long URLs from cluttering your writing.

```
Check out [Scoutbook][sb] and [my.Scouting][mys] for your official tools.

[sb]: https://scoutbook.scouting.org "Track scout advancement"
[mys]: https://my.scouting.org "Training and registration"
```

Check out [Scoutbook][sb] and [my.Scouting][mys] for your official tools.

[sb]: https://scoutbook.scouting.org "Track scout advancement"
[mys]: https://my.scouting.org "Training and registration"

### Linking to Headings

Link to a heading on the same page using its anchor — lowercase the heading text and replace spaces with hyphens.

```
[Jump to Lists section](#lists)
[Jump to Code section](#code)
```

[Jump to Lists section](#lists)

### Auto-Links

Wrap a URL or email address in angle brackets to turn it into a clickable link without custom text.

```
<https://www.scouting.org>
<cubmaster@pack261.com>
```

<https://www.scouting.org>

---

## Images

Images use the same syntax as links, with an `!` at the start. The text in brackets is the **alt text** (shown if the image fails to load, and used by screen readers).

```
![Alt text](https://example.com/image.png)
![Pack 261 logo](/logo.png "Our pack logo")
```

### Linked Images

Wrap an image in a link so clicking it navigates somewhere.

```
[![Alt text](image.png)](https://example.com)
```

### Image Size

Standard Markdown has no built-in image sizing. If you need to control dimensions, use an HTML `<img>` tag (see [HTML in Markdown](#html-in-markdown)).

---

## Code

### Inline Code

Already covered in [Text Formatting](#text-formatting) — use single backticks for short snippets.

### Fenced Code Blocks

Surround a block of code with triple backticks (` ``` `) or triple tildes (`~~~`) on their own lines. Add a language name after the opening fence for **syntax highlighting**.

````
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('Scouts'));
```
````

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('Scouts'));
```

````
```python
leaders = ['Cubmaster', 'Den Leader', 'Committee Chair']

for leader in leaders:
    print(f'Welcome, {leader}!')
```
````

```python
leaders = ['Cubmaster', 'Den Leader', 'Committee Chair']

for leader in leaders:
    print(f'Welcome, {leader}!')
```

````
```bash
# Install dependencies and start the dev server
npm install
npm run dev
```
````

```bash
# Install dependencies and start the dev server
npm install
npm run dev
```

### Common Language Identifiers

| Language | Identifier |
|---|---|
| JavaScript / TypeScript | `javascript` / `typescript` |
| Python | `python` |
| HTML | `html` |
| CSS | `css` |
| Shell / Bash | `bash` / `sh` |
| JSON | `json` |
| Markdown | `markdown` / `md` |
| SQL | `sql` |
| YAML | `yaml` |
| Plain text (no highlighting) | `text` or omit |

### Indented Code Blocks

You can also create a code block by indenting every line by **four spaces**. Fenced blocks are preferred because they support syntax highlighting and are clearer.

```
    This is a code block
    created with indentation.
    Every line is indented four spaces.
```

---

## Tables

Tables use pipes `|` to separate columns and hyphens `-` to create the header row.

```
| Name         | Role             | Email                    |
|--------------|------------------|--------------------------|
| Jane Smith   | Cubmaster        | cubmaster@pack261.com    |
| Bob Jones    | Committee Chair  | chair@pack261.com        |
| Alice Brown  | Den Leader       | den1@pack261.com         |
```

| Name | Role | Email |
|---|---|---|
| Jane Smith | Cubmaster | cubmaster@pack261.com |
| Bob Jones | Committee Chair | chair@pack261.com |
| Alice Brown | Den Leader | den1@pack261.com |

### Column Alignment

Control alignment with colons in the separator row.

```
| Left-aligned  | Center-aligned | Right-aligned |
|:--------------|:--------------:|--------------:|
| Apple         |    Banana      |        Cherry |
| Dog           |     Cat        |         Mouse |
```

| Left-aligned | Center-aligned | Right-aligned |
|:---|:---:|---:|
| Apple | Banana | Cherry |
| Dog | Cat | Mouse |

### Tips for Tables

- The pipes at the outer edges are optional but recommended for readability.
- Column widths in the source don't need to match — Markdown ignores extra spaces.
- You can use inline formatting (bold, italic, links, inline code) inside table cells.
- Tables cannot span multiple rows — for complex layouts, use HTML.

---

## Horizontal Rules

Create a horizontal dividing line with three or more hyphens `---`, asterisks `***`, or underscores `___` on their own line.

```
---

***

___
```

All three produce the same result:

---

> **Tip:** Always put a blank line before a horizontal rule so it isn't accidentally interpreted as a heading underline.

---

## Task Lists

Create interactive-looking checklists with `- [ ]` for unchecked and `- [x]` for checked items.

```
- [x] Complete Youth Protection Training
- [x] Register on my.Scouting.org
- [ ] Attend leader orientation
- [ ] Review annual program plan
- [ ] Set up Scoutbook account
```

- [x] Complete Youth Protection Training
- [x] Register on my.Scouting.org
- [ ] Attend leader orientation
- [ ] Review annual program plan
- [ ] Set up Scoutbook account

Task lists can be nested:

```
- [x] Plan Blue & Gold Banquet
  - [x] Book venue
  - [x] Order decorations
  - [ ] Finalize menu
  - [ ] Send invitations
- [ ] Prepare advancement ceremony
```

- [x] Plan Blue & Gold Banquet
  - [x] Book venue
  - [x] Order decorations
  - [ ] Finalize menu
  - [ ] Send invitations
- [ ] Prepare advancement ceremony

---

## Escaping Characters

If you want to display a character that Markdown would normally interpret as formatting (like `*`, `#`, or `` ` ``), put a backslash `\` before it.

```
\*This is not italic\*
\# This is not a heading
\[This is not a link\](https://example.com)
```

\*This is not italic\*
\# This is not a heading
\[This is not a link\](https://example.com)

### Characters That Can Be Escaped

```
\ ` * _ { } [ ] ( ) # + - . ! |
```

---

## HTML in Markdown

Most Markdown renderers allow you to drop raw HTML directly into your Markdown. This is useful when Markdown doesn't have a syntax for what you need.

### Size-Controlled Images

```html
<img src="logo.png" alt="Pack 261" width="200" />
```

### Centered Text

```html
<div style="text-align: center;">

**This content is centered.**

</div>
```

### Colored Text

```html
<span style="color: #003f87;">This text is BSA blue.</span>
```

### Details / Accordion

```html
<details>
<summary>Click to expand</summary>

Hidden content goes here. You can put **Markdown** inside details tags.

</details>
```

<details>
<summary>Click to expand</summary>

Hidden content goes here. You can put **Markdown** inside `<details>` tags.

</details>

### Subscript and Superscript

```html
H<sub>2</sub>O is water.
E = mc<sup>2</sup>
```

H<sub>2</sub>O is water.
E = mc<sup>2</sup>

### Important Notes on HTML

- Leave a blank line between HTML blocks and surrounding Markdown so they don't merge.
- Markdown formatting inside HTML block tags (like `<div>`) may not render — use HTML formatting inside HTML blocks.
- Inline HTML (like `<span>`, `<strong>`) works within regular Markdown paragraphs.

---

## Quick Reference

| Element | Syntax |
|---|---|
| Heading 1 | `# H1` |
| Heading 2 | `## H2` |
| Heading 3 | `### H3` |
| Bold | `**text**` |
| Italic | `*text*` |
| Bold + Italic | `***text***` |
| Strikethrough | `~~text~~` |
| Inline Code | `` `code` `` |
| Blockquote | `> text` |
| Ordered list | `1. item` |
| Unordered list | `- item` |
| Task (unchecked) | `- [ ] item` |
| Task (checked) | `- [x] item` |
| Link | `[text](url)` |
| Image | `![alt](url)` |
| Horizontal rule | `---` |
| Code block | ` ```lang ` |
| Table | `\| col \| col \|` |
| Line break | Two trailing spaces |
| Escape character | `\*` |

---

## Further Reading

- [CommonMark Specification](https://commonmark.org) — the standard Markdown spec this portal follows
- [GitHub Flavored Markdown](https://github.github.com/gfm/) — extensions used here (tables, task lists, strikethrough)
- [Markdown Guide](https://www.markdownguide.org) — comprehensive cheat sheets and tutorials
- [Dingus](https://daringfireball.net/projects/markdown/dingus) — online Markdown preview tool by John Gruber, Markdown's creator

---

*This guide covers CommonMark Markdown with GitHub Flavored Markdown (GFM) extensions — the dialect used throughout this portal.*
