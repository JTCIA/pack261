# Cloudflare Pages Setup Guide

## Step 1: Connect GitHub to Cloudflare Pages

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Go to **Workers & Pages** → **Pages** → **Create a project**
3. Select **Connect to Git** → **GitHub**
4. Authorize Cloudflare and select the `JTCIA/pack261` repository
5. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `20`
6. Click **Save and Deploy**

## Step 2: Connect Your Custom Domain

1. In Cloudflare Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `scoutpack261.com` and click Continue
3. Since your domain is already on Cloudflare, the DNS record will be added automatically
4. Add `www.scoutpack261.com` as well (it will redirect to the apex domain via `_redirects`)
5. SSL is automatic — Cloudflare handles it

## Step 3: Set Up Cloudflare Access (Admin Protection)

Protect `/admin/*` so only authorized leaders can access it:

1. Go to **Zero Trust** → **Access** → **Applications** → **Add an application**
2. Select **Self-hosted**
3. Configure:
   - **Application name:** Pack 261 Leader Portal
   - **Application domain:** `scoutpack261.com/admin*`
4. Create an **Access Policy:**
   - **Policy name:** Leaders Only
   - **Action:** Allow
   - **Rule:** Emails → list the email addresses of all your leaders
   - (Or use "Email domain" if all leaders share a domain)
5. Save the application

Now when anyone visits `/admin`, they'll be prompted to verify their email via a one-time passcode — no passwords to manage!

## Step 4: GitHub Secrets for PR Previews (Optional)

For preview deployments on pull requests:

1. Create a Cloudflare API token at **My Profile** → **API Tokens** → **Create Token**
   - Use the **Edit Cloudflare Workers** template
   - Scope it to your account
2. In GitHub → Settings → Secrets → Actions, add:
   - `CLOUDFLARE_API_TOKEN` — the token from above
   - `CLOUDFLARE_ACCOUNT_ID` — found in Cloudflare dashboard right sidebar

## Step 5: Configure Branch Deployments

In Cloudflare Pages → **Settings** → **Builds & deployments**:
- **Production branch:** `main`
- **Preview branches:** All other branches (for PR previews)

## Adding Content

### Announcements
Add markdown files to `src/content/announcements/` with this front matter:
```yaml
---
title: "Your Announcement Title"
date: 2025-10-01
category: event  # event | news | fundraiser | achievement | reminder
pinned: false
summary: "Brief one-line summary shown in the list view"
author: "Your Name"
---
Your content here in markdown...
```

### Documentation
Add markdown files to `src/content/docs/<section-name>/index.md` with:
```yaml
---
title: "Document Title"
description: "Brief description"
section: "Section Name"
order: 1
lastUpdated: 2025-10-01
---
```

### Calendar Events
Edit `src/pages/calendar.astro` — find the `events` array near the top and add/edit entries.
