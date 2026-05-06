# LinkTopics Daily SEO Playbook

This playbook is for publishing one niche-relevant article every day on `www.linktopics.me`.

It is built around search intent that matches what LinkTopics actually solves:

- removing promoted posts from LinkedIn
- hiding liked/reacted posts
- hiding shared/reshared posts
- hiding suggested/recommended posts
- cleaning a noisy LinkedIn feed
- improving focus for recruiters, sales teams, founders, and marketers

## Important note

If you want exact "most searched" keywords by volume, use:

- Google Search Console
- Google Trends
- Ahrefs / Semrush / Ubersuggest

This document defines the editorial structure and title patterns so the site stays on-brand and niche-correct. Exact volume ranking can be plugged into the same structure later.

## Core keyword clusters

Use these as recurring clusters for titles, slugs, and internal links:

1. `remove linkedin ads`
2. `hide promoted posts linkedin`
3. `remove liked by posts linkedin`
4. `hide reacted posts linkedin`
5. `remove shared posts linkedin`
6. `hide reshared posts linkedin`
7. `remove suggested posts linkedin`
8. `remove recommended posts linkedin`
9. `linkedin feed cleaner`
10. `clean linkedin feed`
11. `linkedin productivity`
12. `linkedin focus mode`
13. `linkedin feed for recruiters`
14. `linkedin feed for sales`
15. `linkedin feed for marketers`
16. `linkedin feed for founders`
17. `linkedin premium feed cleanup`
18. `remove job posts linkedin feed`
19. `stop linkedin distractions`
20. `linkedin chrome extension`

## Best title formulas

Rotate these formats:

- `How to remove [keyword] on LinkedIn`
- `Why LinkedIn shows [keyword] and how to hide it`
- `Best way to stop seeing [keyword] on LinkedIn`
- `[Keyword] on LinkedIn: what it means and how to remove it`
- `LinkedIn feed cleaner for [persona]`
- `How [persona] can use a cleaner LinkedIn feed`
- `LinkTopics vs [alternative]`
- `Is LinkedIn Premium enough to remove [problem]?`
- `Why your LinkedIn feed feels noisy`
- `How to make LinkedIn less distracting`

## Persona rotation

Keep the blog narrow but varied by rotating personas:

- recruiters
- sales reps
- founders
- marketers
- consultants
- job seekers
- HR teams

## Weekly publishing mix

Use a simple 7-day loop:

1. ads / promoted
2. liked / reacted
3. shared / reshared
4. suggested / recommended
5. persona article
6. comparison article
7. strategic / thought-leadership article

## Internal linking rules

Every article should link to at least:

- one feature article
- one comparison article
- one persona article
- the homepage

Suggested cornerstone URLs:

- `/blog/how-to-remove-promoted-posts-on-linkedin`
- `/blog/how-to-remove-liked-by-posts-on-linkedin`
- `/blog/why-linkedin-shows-suggested-posts`
- `/blog/why-you-keep-seeing-shared-and-reshared-post`
- `/`

## Good daily title examples

- `How to remove liked posts on LinkedIn in 2026`
- `Why LinkedIn keeps showing reacted posts in your feed`
- `How to hide shared posts on LinkedIn without muting people`
- `How recruiters can clean up a noisy LinkedIn feed`
- `LinkedIn feed cleaner for sales teams`
- `How to remove recommended posts on LinkedIn`
- `LinkedIn Chrome extension to hide promoted posts`
- `LinkTopics vs generic ad blockers for LinkedIn`
- `Why LinkedIn Premium does not clean your feed`
- `How to remove job posts from your LinkedIn feed`

## Content quality guardrails

Every post should:

- target one main keyword
- include the exact keyword in the title
- include the keyword in the intro paragraph
- explain the problem in plain language first
- mention LinkTopics as the practical solution only after the problem is clear
- avoid generic SEO filler
- stay tightly related to LinkedIn feed noise, filtering, attention, or workflow impact

## Operational workflow

1. Add new drafts to `src/scheduled` using a dated folder name.
2. Keep at least 14-30 posts queued ahead.
3. The `Daily Blog Publisher` workflow now publishes:
   first, posts scheduled exactly for today;
   otherwise, the oldest overdue scheduled post.
4. Review `public/sitemap.xml` after publication.
5. Add internal links from newer posts to older cornerstone posts.
