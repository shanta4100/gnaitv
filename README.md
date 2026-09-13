GNAI TV
Official Cloudflare Pages website package for GNAI TV and gnaitv.net.
GNAI TV is a web-based media and knowledge-library project for recorded YouTube programming, channel information, public documentation, and a future approval-controlled live-broadcast experience. This repository contains a static website plus Cloudflare Pages Functions.
> **Current broadcast status:** Offline by design. The website must not claim that a live or 24/7 broadcast is active until an authorized YouTube live video ID is configured and independently verified.
Canonical deployment
|Item                    |Value                     |  |------------------------|--------------------------|  |Cloudflare Pages project|`gnaitv`                  |  |Production branch       |`main`                    |  |Pages hostname          |`https://gnaitv.pages.dev`|  |Public domain           |`https://gnaitv.net`      |  |Public `www` domain     |`https://www.gnaitv.net`  |  |Framework preset        |None                      |  |Build command           |Empty                     |  |Build output directory  |`.`                       |  |Compatibility date      |`2026-09-01`              |
Cloudflare Pages is the canonical production path. Do not route this project to B12, Vercel, 76.76.21.21, localhost, or an unrelated Worker.
Repository structure
```text  gnaitv/  ├── .github/  │   └── workflows/              # Repository automation sources  ├── assets/  │   ├── css/site.css  │   └── js/youtube-plugin.js  ├── functions/  │   └── api/  │       ├── health.js  │       ├── live.js  │       └── youtube-uploads.js  ├── .gitignore  ├── _headers  ├── channels.html  ├── config.js  ├── google-console.html  ├── index.html  ├── robots.txt  ├── sitemap.xml  ├── watch.html  ├── wrangler.toml  └── youtube-media.html  ```
The functions/ directory must remain at the repository root. Cloudflare will not detect the Pages Functions if only a nested static directory is deployed.
Website pages
|Path                  |Purpose                            |  |----------------------|-----------------------------------|  |`/`                   |Main GNAI TV landing page          |  |`/watch.html`         |Recorded YouTube viewing experience|  |`/channels.html`      |Channel directory                  |  |`/youtube-media.html` |YouTube media page                 |  |`/google-console.html`|Safe Google Console setup checklist|
The YouTube IFrame player does not consume YouTube Data API quota. The upload-list function uses the API only when the required Cloudflare variables are configured.
Pages Functions
GET /api/health
Returns deployment and configuration health information without exposing secret values. It should respond with HTTP 200 and JSON.
GET /api/youtube-uploads
Retrieves recent channel uploads using YouTube Data API v3. It uses playlistItems.list, caches successful output for 300 seconds, and does not automatically retry quota-exceeded responses.
Before configuration, it should report:
```json  {"configured": false}  ```
GET /api/live
Returns the explicitly configured broadcast state. The default is:
```json  {"live": false}  ```
The implementation does not use search.list?eventType=live, avoiding its high quota cost. It is not a linear encoder and must not simulate or falsely announce a live feed.
Cloudflare environment variables
Configure these under Cloudflare Dashboard → Workers & Pages → gnaitv → Settings → Variables and Secrets → Production.
|Variable            |Type           |Required              |Purpose                                      |  |--------------------|---------------|---------------------:|---------------------------------------------|  |`YOUTUBE_API_KEY`   |Secret         |Yes for upload listing|Restricted YouTube Data API v3 credential    |  |`YOUTUBE_CHANNEL_ID`|Plain variable |Yes for upload listing|Public YouTube channel ID beginning with `UC`|  |`CF_ACCESS_AUD`     |Secret/variable|Optional              |Future Cloudflare Access integration         |  |`CF_ACCESS_TEAM`    |Plain variable |Optional              |Future Cloudflare Access team identifier     |
Never commit secrets, place them in wrangler.toml, include them in screenshots, or paste them into issues, pull requests, chat, logs, or documentation. Redeploy after changing Production variables.
Google Console setup
	1.	Create or select the GNAI TV project in Google Cloud Console.
	2.	Enable YouTube Data API v3 only.
	3.	Create an API key and restrict it to that API.
	4.	In YouTube Studio, open Settings → Channel → Advanced settings.
	5.	Copy the public channel ID beginning with UC.
	6.	Store both values directly in Cloudflare Production variables.
Do not put either value in this README or send it through chat.
Local preview
Requirements: Node.js 20 or later, npm/npx, and Wrangler authentication for Cloudflare operations.
```bash  npx wrangler pages dev . --port 8788  ```
Test locally:
```text  http://localhost:8788/  http://localhost:8788/watch.html  http://localhost:8788/api/health  http://localhost:8788/api/live  http://localhost:8788/api/youtube-uploads  ```
Use an ignored .dev.vars only on a trusted computer when local secret testing is necessary.
Deploy with GitHub and Cloudflare Pages
	1.	Push this complete directory to shanta4100/gnaitv on branch main.
	2.	In Cloudflare, open Workers & Pages → Create or connect project.
	3.	Select shanta4100/gnaitv.
	4.	Set:
```text  Production branch: main  Framework preset: None  Build command: [leave empty]  Build output directory: .  ```
	5.	Add the Production variables.
	6.	Deploy and confirm Cloudflare detected functions/.
	7.	Add gnaitv.net and www.gnaitv.net under Custom domains.
Do not reconnect the obsolete astro-blog-starter-template repository.
Deploy directly with Wrangler
```bash  npx wrangler login  export CLOUDFLARE_ACCOUNT_ID=0aadfbb756f43c0e0e991f55f3556a7b  npx wrangler pages deploy . --project-name=gnaitv --branch=main  ```
The final . is important: it deploys the current directory, including the static pages, _headers, and functions/. The account identifier belongs in the local shell, not wrangler.toml.
DNS and custom domains
The authoritative nameservers should remain:
```text  aria.ns.cloudflare.com  vicente.ns.cloudflare.com  ```
	●	Add gnaitv.net and www.gnaitv.net through Pages Custom domains.
	●	Allow Cloudflare to create or instruct the required proxied DNS records.
	●	Do not create placeholder A records.
	●	Do not point either hostname to 76.76.21.21.
	●	Do not attach unrelated Worker routes.
Email-routing MX, SPF, DKIM, and DMARC records are separate from website hosting. Modify them only during a deliberate email configuration review.
Post-deployment verification
Open after every production deployment:
```text  https://gnaitv.pages.dev/  https://gnaitv.pages.dev/watch.html  https://gnaitv.pages.dev/api/health  https://gnaitv.pages.dev/api/live  https://gnaitv.pages.dev/api/youtube-uploads   https://gnaitv.net/  https://gnaitv.net/watch.html  https://gnaitv.net/api/health  https://gnaitv.net/api/live  https://gnaitv.net/api/youtube-uploads  ```
Expected results:
	●	Home and watch pages return HTML with HTTP 200.
	●	/api/health returns JSON.
	●	/api/live returns {"live":false} until authorized live video configuration exists.
	●	/api/youtube-uploads returns configured:false before configuration and upload metadata afterward.
	●	YouTube embeds load without exposing an API key in page source.
```bash  curl -i https://gnaitv.net/api/health  curl -i https://gnaitv.net/api/live  curl -i https://gnaitv.net/api/youtube-uploads  curl -I https://gnaitv.net/watch.html  ```
Security controls
The root _headers file applies browser security protections where supported by Cloudflare Pages, including Content Security Policy, MIME-sniffing protection, clickjacking protection, Referrer Policy, and Permissions Policy.
Rules:
	●	Never commit .env, .dev.vars, API keys, tokens, passwords, or authentication codes.
	●	Use Cloudflare Access for any future private administration portal.
	●	Do not implement custom browser-side JWT authentication.
	●	Do not upload or execute Python DNS automation as a Pages asset.
	●	Do not create automated DNS records pointing to localhost or placeholders.
	●	Do not claim third-party affiliation without written authorization.
	●	Only embed or distribute media for which GNAI TV has permission.
Editorial and broadcasting policy
Approved inputs include public RSS feeds, public government alerts, public NASA/NOAA/USGS datasets, official announcements, public press releases, and approved internal updates.
```text  Public source scan  → source verification  → confidence assessment  → draft script  → editorial review  → founder approval  → scheduled publication  ```
Publish only when founder approval, editorial approval, and compliance review have passed.
Prohibited behavior includes private-frequency interception, unauthorized satellite collection, fabricated breaking-news claims, mass unsolicited media outreach, bypassing source restrictions, and autonomous public publishing without human approval.
Troubleshooting
Cloudflare deploys only the README
The GitHub repository does not yet contain the website package. Upload the extracted repository contents so index.html, assets/, and functions/ exist at the root.
Astro starter appears
Cloudflare is connected to astro-blog-starter-template. Disconnect that source and connect shanta4100/gnaitv.
API routes return a custom 404 page
The root functions/ directory was absent from the deployed source, or the wrong output directory was selected. Set the output directory to ..
YouTube uploads report configured:false
Add YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID to the Production environment, then redeploy.
The player shows offline
This is expected until a real authorized YouTube live video ID exists. Recorded videos can still be displayed through the YouTube plugin.
The custom domain does not open
Confirm the Pages custom domain is active, DNS targets gnaitv.pages.dev, records are proxied, and no conflicting A, AAAA, or Worker route remains.
Contribution workflow
	1.	Create a feature branch from main.
	2.	Make the smallest necessary change.
	3.	Verify static pages and Pages Functions locally.
	4.	Confirm that no credentials or private data were added.
	5.	Open a draft pull request.
	6.	Require human review before merging.
	7.	Verify the Cloudflare preview deployment.
	8.	Merge only after checks and review gates pass.
Recommended branches:
```text  feature/<short-description>  fix/<short-description>  docs/<short-description>  agent/<workflow-name>  ```
Project status
|Component                     |Status                                  |  |------------------------------|----------------------------------------|  |Static website package        |Available                               |  |Cloudflare Pages configuration|Available                               |  |Pages Functions               |Available                               |  |YouTube recorded-video embed  |Available                               |  |Upload-list API               |Requires Cloudflare variables           |  |Live broadcast                |Offline until verified live video ID    |  |Automated public publishing   |Disabled                                |  |Private administration portal |Not implemented                         |  |Custom domain                 |Requires deployment and DNS verification|
Ownership and licensing
GNAI TV, GNAIAAAC LLC, SHANTA ECON ECOSYSTEM OS, SSGPT6 Creator OS, and associated names may be trademarks or project identifiers of their respective owner. Repository visibility does not grant rights to third-party media, brands, APIs, or services.
Unless a separate license file is added, no open-source license is granted. All rights are reserved by the project owner.
Support boundary
This repository provides web software and Cloudflare Pages Functions. It does not itself provide a television broadcast license, spectrum authorization, satellite or RF transmission, a linear encoder, third-party streaming rights, or automatic regulatory approval. Those capabilities require separate contracts, licenses, verified accounts, technical infrastructure, and human authorization.

