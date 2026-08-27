JV Electric LLC single-page website build.

All files intentionally live in the main/root directory for GitHub + Vercel:
- index.html
- styles.css
- script.js
- favicon.svg (placeholder)
- jv-electric-hero-bg.webp

Current build includes:
- Responsive header
- Hero section with interactive 3D project cards
- Desktop trust bar
- Responsive residential services section with expandable service cards

Replace the logo, phone number, work-photo placeholders, and favicon when final assets are available.


Update v6:
- Added service search with fuzzy matching and synonyms for desktop/mobile.
- Simplified mobile service browsing and improved search results behavior.
- Added generated background image for Recent Work section.
- Changed mobile Recent Work from swipe carousel to regular stacked display.


Update v7:
- Replaced the Recent Work background with the newly provided black/yellow image.
- Converted that image to WebP in the project root.
- Kept fuzzy/synonym service search on desktop and mobile.
- Kept Recent Work as a normal four-photo mobile stack, with alternating portrait/landscape heights.


Update v8:
- Fixed duplicate X in service search by hiding browser-native search clear control.
- Fixed oversized mobile search panel caused by flex-basis sizing.
- Confirmed mobile service cards are horizontally swipeable, including filtered results.
- Replaced Recent Work background with newest uploaded black/yellow image.
- Added white Reviews section with three real-review placeholders and Google/Facebook link placeholders.


Update v9:
- Added How It Works section between Recent Work and Reviews.
- Removed flat yellow radial decoration from Reviews.
- Added subtle neutral texture and black structural accents to white sections.
- Removed Google/Facebook source chips and Customer Name placeholders from review cards.
- Kept Google and Facebook review CTA buttons.


Update v10:
- Made all How It Works cards use one consistent light style.
- Converted Reviews into the dark alternating section.
- Restored reviewer-name placeholders and removed decorative quotation marks.
- Added a new white About JV Electric section with owner/team photo placeholder, 10+ years card, family/veteran-owned, Spanish-speaking, and residential-specialist content.


Update v11:
- Fixed mobile search clear button issue by hiding browser native search cancel icon.
- Added custom dark background image for reviews.
- Restyled reviews section to dark theme.
- Refined About section layout/alignment and removed About CTA.
- Added Service Area, FAQ, Contact, and Footer sections.


Update v12:
- Service Area moved above Reviews.
- FAQ moved below Get in Touch and all questions initialize closed.
- Service Area city chips and mini-stat cards removed; map area enlarged.
- About section columns aligned to the same height, with experience card contained inside image.
- Contact form widened; Call/Email/Facebook cards removed.
- Contact uses a distinct background image asset.
- FAQ caveat paragraph removed.


Update v13:
- Flipped Service Area layout so the large map is left and copy is right.
- Removed featured/highlighted review styling and all decorative review quote marks.
- Smoothed FAQ accordion open/close animation.


Update v14 desktop wrap-up:
- Desktop-only Services heading/search restructure.
- Removed desktop services intro copy and default service count line.
- Smoothed desktop View All Services expansion.
- Removed desktop Recent Work guidance paragraph.
- Removed desktop How It Works CTA.
- Desktop section alternation set to: process white, service area dark, reviews white, about dark, contact white, FAQ dark.
- Mobile CSS/layout left unchanged.


Desktop polish v15:
- Reviews now use a clean white grid with no yellow tint.
- Google/Facebook links moved into the desktop review heading with cycle arrows.
- About copy simplified on desktop; numbered items centered and changed to 1/2/3.
- 10+ experience badge restyled without the yellow top bar.
- Service Area, About, Contact, and FAQ backgrounds differentiated.
- Contact uses a clean white grid; FAQ yellow corner glow removed.
- Mobile intentionally preserved.
