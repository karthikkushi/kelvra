# New technology building blocks (2025 to Nov 2026) for a solo web developer in India

**Read this first: how far to trust these notes.**
All lookups were done on 2026-11-11. Direct page fetches were blocked in this research session for every host tried (groq.com, console.groq.com, sarvam.ai, ai.google.dev, developers.facebook.com, developer.chrome.com). Everything below therefore comes from web-search result extracts. No official pricing page was opened and read in full.

Each finding carries one of two labels:
- **[OFFICIAL-SNIPPET]**: the search extract came from the vendor's or government's own domain. This is the closest thing to "verified from official docs" here, but it is still an extract, sometimes from a cached copy. Treat as "probably right, confirm before budgeting".
- **[NEWS/3P]**: news article, vendor blog, price tracker or comparison site. Treat as a claim.

"Not verified" means no usable source was found. Several search extracts named models and prices that could not be cross-checked (for example Groq's current line-up, OpenAI and Gemini model names); these are reported as found, with the conflict noted.

---

## 1. Voice: speech recognition, text-to-speech and speech-to-speech for Hindi, Hinglish and Indian languages

### Takeaway
Indian-language voice is now cheap enough for a consumer product: Sarvam lists speech recognition at about Rs 0.50 per minute and a full managed voice agent at Rs 3.00-3.50 per minute, and Groq-hosted Whisper is listed at $0.04 per audio hour. No source gave a trustworthy head-to-head quality test on Indian accents, so quality must be tested by the developer.

### Cited Findings

**Sarvam AI (Indian languages first)**
- [OFFICIAL-SNIPPET] Speech-to-text is Rs 30 per hour of audio, billed per second; with diarization Rs 45 per hour; speech-to-text plus translation Rs 30 per hour — [Sarvam API pricing](https://sarvam.ai/api-pricing), [Sarvam docs pricing](https://docs.sarvam.ai/api/getting-started/pricing)
- [OFFICIAL-SNIPPET] The pricing page also expresses Saaras speech-to-text as Rs 0.49 per minute on the base plan "with a free trial included"; streaming is over WebSocket; "Realtime Fast" claims under 150 ms time to first token; the REST endpoint is capped at 30 seconds per request, batch handles longer files — [Sarvam API pricing](https://www.sarvam.ai/api-pricing), [Sarvam speech-to-text](https://www.sarvam.ai/apis/speech-to-text)
- [OFFICIAL-SNIPPET] Text-to-speech: Bulbul v3 Rs 30 per 10,000 characters, Bulbul v2 Rs 15 per 10,000 characters; a newer page lists Bulbul v3 at Rs 3.00 and a "Bulbul v4 Flash" at Rs 1.00 per 1,000 characters — [Sarvam docs pricing](https://docs.sarvam.ai/api/pricing)
- [NEWS/3P] Bulbul V4 Flash was on promotion at Rs 10 per 10,000 characters through 12 November 2026, against a Rs 20 standard price (this conflicts with the Rs 1.00 per 1,000 figure above) — [Runtimewire](https://runtimewire.com/article/sarvam-bulbul-v4-flash-pricing-launch)
- [OFFICIAL-SNIPPET] Managed voice agents ("Samvaad") are billed per minute, end to end (platform, speech recognition, LLM and voice included): Rs 3.50 pay-as-you-go, Rs 3.25 Pro, Rs 3.15 Growth, Rs 3.00 Business. Telephony, phone numbers and simulated test runs are extra. Calls round up to 60-second pulses. Pay-as-you-go has Rs 0 monthly fee; Pro is Rs 9,999 per month returned as credits — [Sarvam voice agents pricing](https://docs.sarvam.ai/voice-agents/pricing)
- [OFFICIAL-SNIPPET] Sarvam 105B LLM: Rs 15 input, Rs 5 cached input, Rs 60 output per 1M tokens — [Sarvam API pricing](https://www.sarvam.ai/api-pricing)
- Free credits conflict: the pricing page says every plan starts with Rs 1,000 free credits [OFFICIAL-SNIPPET] — [Sarvam API pricing](https://sarvam.ai/api-pricing); the text-to-speech page says Rs 100 free credits on sign-up [OFFICIAL-SNIPPET] — [Sarvam text-to-speech](https://www.sarvam.ai/text-to-speech); a third-party blog also says Rs 100 — [smallest.ai](https://smallest.ai/blog/sarvam-ai-speech-to-text-pricing)

**Groq-hosted speech**
- [OFFICIAL-SNIPPET] whisper-large-v3-turbo is $0.04 per audio hour, 100 MB maximum file size, described as multilingual (99+ languages, which includes Hindi) — [Groq Whisper Large v3 Turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo), [Groq speech-to-text](https://console.groq.com/docs/speech-to-text)
- [OFFICIAL-SNIPPET] Groq's text-to-speech models are Orpheus V1 English at $22 per 1M characters and an Arabic (Saudi) variant at $40 per 1M characters, both preview. No Hindi text-to-speech model was found on Groq — [Groq models](https://console.groq.com/docs/models)
- [OFFICIAL-SNIPPET] Whisper limits shown on the models page: whisper-large-v3 200K audio-seconds per hour and 300 RPM; turbo 400K audio-seconds per hour and 400 RPM (the plan these apply to was unclear in the extract) — [Groq models](https://console.groq.com/docs/models)

**OpenAI Realtime**
- [NEWS/3P] gpt-realtime-2.1: $32 per 1M audio input tokens, $64 per 1M audio output tokens, cached audio input $0.40; text $4 in and $24 out. gpt-realtime-2.1-mini: $10 audio input, $20 audio output. A blog converts the flagship to about $0.019 per minute heard and $0.077 per minute spoken (assuming about 600 tokens per input minute and 1,200 per output minute) — [Cekura](https://www.cekura.ai/blogs/openai-realtime-api-pricing), [Forasoft](https://www.forasoft.com/blog/article/openai-realtime-api-pricing), [Layer3 Labs, updated 16 Jul 2026](https://www.layer3labs.io/guides/openai-realtime-api-pricing)

**Gemini Live API**
- [NEWS/3P] Model id gemini-3.1-flash-live-preview (launched about March 2026). Prices conflict: aggregators list $0.75 input and $4.50 output per 1M tokens; press coverage says $0.35 per hour audio input and $1.40 per hour audio output; a blog says the preview was listed free of charge as of 29 March 2026 — [getmaxim calculator](https://www.getmaxim.ai/bifrost/llm-cost-calculator/provider/gemini/model/gemini-3.1-flash-live-preview), [The Decoder](https://the-decoder.com/gemini-3-1-flash-live-is-googles-most-natural-sounding-ai-voice-model-yet/), [laozhang blog](https://blog.laozhang.ai/en/posts/gemini-3-1-flash-live-free-api)
- [OFFICIAL-SNIPPET, model unnamed in extract] Google's pricing page shows a Live API line at $0.35 text input, $2.10 audio/video input, $1.50 text output, $8.50 audio output per 1M tokens, and another at $0.50 / $3.00 / $2.00 / $12.00 for the 2.5 Flash native audio model. Some snapshots show the Live API free on the free tier, others "not available" — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [NEWS/3P] Blogs say native audio covers 24 languages including Hindi; not confirmed on an official page — [laozhang blog](https://blog.laozhang.ai/en/posts/gemini-3-1-flash-live-api)

**ElevenLabs, Deepgram, Cartesia**
- [NEWS/3P] Deepgram Nova transcription about $0.0077 per minute (another source: $0.0092 real-time); Aura-2 text-to-speech $30 per 1M characters; $200 sign-up credit — [smallest.ai on Deepgram](https://smallest.ai/blog/deepgram-pricing-plans-cost-what-you-get-in-2026)
- [NEWS/3P] ElevenLabs has a free tier; overage about $0.30 per minute (Creator) and $0.24 (Pro) for Multilingual v2, Flash about half. Latency claims range from 75 ms (vendor) to 832 ms on self-serve in a third-party benchmark — [smallest.ai on ElevenLabs](https://smallest.ai/blog/elevenlabs-pricing-plans-cost-what-you-get-in-2026), [Cekura](https://cekura.ai/blogs/elevenlabs-pricing)
- [NEWS/3P] Cartesia: about $39 per 1M characters on Startup; free-tier size conflicts (20,000 credits per month vs 1,000 characters); claimed 40-90 ms time to first audio vs 199 ms measured by a third party — [smallest.ai on Cartesia](https://smallest.ai/blog/cartesia-pricing-plans-cost-what-you-get-in-2026), [CostBench](https://www.costbench.com/compare/cartesia-vs-deepgram/)

**Bhashini, Gnani, Krutrim, open models**
- [OFFICIAL-SNIPPET] Bhashini: register on the ULCA portal, confirm email, create API keys in the profile section (each tied to an app name), and use the user ID from "My Profile" for pipeline config calls — [Bhashini API onboarding](https://bhashini.gitbook.io/bhashini-apis/pre-requisites-and-onboarding)
- [NEWS/3P] One developer article advises prototyping on Bhashini and then negotiating a production agreement or moving to a commercial API; another source says any startup can call it without a contract. These conflict — [dev.to](https://dev.to/mr_manushukla/22-scheduled-languages-one-app-what-indic-localization-actually-costs-to-ship-in-2026-12ag), [CitizenNest](https://www.citizennest.com/guide/bhashini-ondc-saarthi-multilingual-ai-guide)
- [OFFICIAL-SNIPPET] Gnani "Vachana" offers speech-to-text and text-to-speech (10 Indian languages for text-to-speech) by API key, with plug-ins for LiveKit and Pipecat; the REST speech-to-text endpoint takes audio up to 60 seconds. Launched December 2025, trained on 1M hours under the IndiaAI Mission — [Gnani docs](https://docs.gnani.ai/api/introduction/introduction), [Gnani on Hugging Face](https://huggingface.co/gnani-ai/vachana), [Gnani blog, 19 Dec 2025](https://gnani.ai/resources/blogs/gnani-ai-launches-vachana-stt-a-foundational-indic-speech-to-text-model-trained-on-one-million-hours-under-the-indiaai-mission)
- [NEWS/3P, self-reported] "Shruti" (Udgam Labs): 55M-parameter offline model for Hindi, English and Hinglish in one 29.5 MB file with a WebAssembly build that runs in a web page; authors report (October 2026) that it beats Whisper large-v3 on Hindi test sets but trails larger Hindi-only models such as IndicConformer — [Shruti model card](https://huggingface.co/udgamlabs/Shruti)

### Inferences
- Cheapest working stack for a Hinglish voice feature on the reader's current set-up: Groq Whisper turbo for recognition ($0.04 per hour is roughly $0.0007 per minute) plus Sarvam Bulbul for speech output. Groq has no Hindi voice, so text-to-speech must come from elsewhere.
- Rough Sarvam do-it-yourself cost per conversational minute: recognition Rs 0.50 plus speech output. If one minute of speech is about 800-900 characters (my assumption, not sourced), Bulbul v3 adds about Rs 2.5 per spoken minute, which is why the bundled Rs 3.00-3.50 per minute agent price is competitive.
- Integration difficulty: REST speech-to-text and text-to-speech are easy from a Vercel function (minutes of audio, simple HTTP). Real-time speech-to-speech needs a persistent WebSocket or WebRTC connection, which Vercel serverless functions do not hold well; a managed agent (Sarvam Samvaad, Bolna, Vapi) or a browser-to-provider direct connection avoids that.
- Product possibilities: (a) a voice-first Hinglish practice partner (spoken-English or interview drills) priced in rupees per session, since a 10-minute session costs roughly Rs 30-35 on the managed rate; (b) "speak your notes" tools for shopkeepers or field workers that turn Hindi voice memos into structured text, since recognition alone is about Rs 0.50 per minute or less.

### Gaps
- No independent, current benchmark of accuracy on Indian accents or code-mixed Hinglish across these providers was found. Vendor claims only.
- Krutrim: no pricing or model information found. Not verified.
- Gnani Vachana pricing: not verified (sign-up at app.vachana.ai is mentioned, no rate card found).
- Bhashini cost, rate limits and production terms: not verified.
- Sarvam free credit amount (Rs 100 vs Rs 1,000) and rate limits: conflicting or not found.
- Gemini Live current price and Hindi support: conflicting, not verified on the official page.

---

## 2. Telephony and messaging in India

### Takeaway
WhatsApp got more expensive in 2026: by multiple reports, from 1 October 2026 utility templates are charged even inside the 24-hour window and free-form service replies are free only for the first 1,000 per number per month. Phone-call bots are affordable (Plivo about Rs 0.38 per minute carriage plus Rs 3-6 per minute for the AI layer) but TRAI tightened rules on automated and synthetic-voice calls in September 2026.

### Cited Findings

**WhatsApp Business Platform**
- [OFFICIAL-SNIPPET] Meta bills per delivered template message by category and recipient country (since 1 July 2025); INR billing launched 1 January 2026 for partners and direct clients whose sold-to country is India — [Meta WhatsApp pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing.md)
- [NEWS/3P] India rates per message (conflicting): marketing Rs 0.8631 (most sources) vs about Rs 1.09 (AiSensy); utility and authentication Rs 0.115 (most sources) vs Rs 0.145 (AiSensy); 18% GST on top — [ChatMaxima, updated Jul 2026](https://chatmaxima.com/whatsapp-api-pricing/india/), [NewsBytes](https://www.newsbytesapp.com/news/science/whatsapp-business-messages-get-costlier-in-india-from-today/story), [whautomate](https://whautomate.com/whatsapp-business-api-pricing-india), [AiSensy](https://m.aisensy.com/blog/whatsapp-business-pricing/)
- [NEWS/3P] From 1 October 2026: utility templates lose the free in-window waiver, and service (free-form reply) messages become billable after 1,000 free per business phone number per month. No primary Meta announcement was retrieved — [AiSensy](https://m.aisensy.com/blog/whatsapp-pricing-update-october-2026/), [Wati](https://www.wati.io/en/blog/whatsapp-service-message-pricing/), [Free Press Journal](https://www.freepressjournal.in/tech/whatsapp-to-start-charging-for-messages-from-october-1-heres-who-all-are-impacted), [respond.io](https://respond.io/blog/whatsapp-pricing-change-2026.md), [Omdia](https://omdia.tech.informa.com/om146764/the-whatsapp-free-lunch-is-over-and-meta-is-also-coming-for-the-ai-layer)
- [NEWS/3P] Eligible Indian businesses must migrate WhatsApp Business Accounts to INR billing by 31 December 2026; one source says existing USD accounts cannot be converted (conflict) — [Monty Mobile](https://montymobile.com/blogs/whatsapp-business-api-pricing-in-india-inr-rates-gst-and-the-2026-currency-migration-deadline), [whautomate](https://whautomate.com/whatsapp-business-api-pricing-india)
- [OFFICIAL-SNIPPET] Calling API: user-initiated calls are free; business-initiated calls are billed per minute in 6-second increments only when answered, on a volume-tiered per-country rate card updated quarterly. An India calling tier with effective month 2026-08 exists, but the rate did not appear in the extract — [Meta calling pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/calling/pricing/)
- [NEWS/3P] The Calling API reached general availability in late 2025 — [RichAutomate](https://richautomate.in/blog/whatsapp-business-calling-api-india-2026-implementation-guide)
- [NEWS/3P, 2023] In-chat payments in India (cards, net banking, all UPI apps via Razorpay and PayU) and Flows were announced in September 2023, with no charge to businesses at launch — [TechCrunch](https://techcrunch.com/2023/09/19/whatsapp-india-payments-businesses/), [Meta newsroom](https://about.fb.com/news/2023/09/whatsapp-new-experiences-for-people-and-businesses/)

**Telegram**
- [OFFICIAL-SNIPPET] Telegram Stars (launched 2024) pay for digital goods and services in bots and mini apps — [Telegram blog](https://telegram.org/blog/telegram-stars)
- [NEWS/3P] Developer net payout is disputed: Telegram's estimate is "around 70%" after fees; one developer guide calculates about 46% of face value after a 30% cut plus Fragment and exchange fees. Withdrawal is via Fragment into TON — [dev.to on Stars revenue](https://dev.to/ton-adoption/monetizing-telegram-mini-apps-stars-revenue-and-ton-payments-24fk), [Merge](https://merge.rocks/blog/telegram-mini-apps-2026-monetization-guide-how-to-earn-from-telegram-mini-apps)

**Voice-call bots over Indian numbers**
- [NEWS/3P citing official rate card] Plivo India: Rs 0.38 per minute domestic, inbound and outbound, 30-second pulse, number rental Rs 200 per month (checked October 2026); number provisioning typically 24-48 hours — [Plivo India voice pricing](https://www.plivo.com/voice/pricing/in/), [Caller Digital](https://caller.digital/blog/telephony-partner-voice-ai-india-plivo-exotel-ozonetel-knowlarity-twilio-2026)
- [NEWS/3P] Exotel is described as 10-25% more expensive than Plivo per minute, with a platform fee plus per-minute plus per-number structure; no official rate found — [Caller Digital](https://caller.digital/blog/exotel-alternatives-india-2026)
- [NEWS/3P] AI layer per minute, before telephony: Bolna about $0.05-0.06 (a "Pilots" plan of 12,000 minutes at $0.06); Vapi $0.05 platform fee, about $0.07-0.12 with models; Retell $0.055 platform, $0.088-0.27 all-in; Plivo's own bundled agent $0.04; Edesy Rs 1.5 per minute bring-your-own-keys or Rs 4-6 bundled. All from vendor-authored comparisons — [Edesy](https://edesy.in/blog/vapi-retell-alternatives-india-2026), [Plivo comparison](https://www.plivo.com/compare/retell-ai-vs-plivo/), [Caller Digital pricing comparison](https://caller.digital/voice-ai-pricing-comparison)
- [OFFICIAL-SNIPPET] Sarvam's managed agent is Rs 3.00-3.50 per minute plus telephony — [Sarvam voice agents pricing](https://docs.sarvam.ai/voice-agents/pricing)

**TRAI rules**
- [NEWS/3P] September 2026 amendments bring automated and synthetic-voice calls under the anti-spam framework: undeclared ones can be treated as spam, with a levy of up to 5 paise per minute on the originating network; the 140, 1600 and 1601 series are exempt. Operators must use AI/ML to flag suspected spam; AI-flagged callers can face a 15-day outgoing ban without a consumer complaint — [Deccan Chronicle](https://www.deccanchronicle.com/amp/business/trai-tightens-anti-spam-rules-brings-ai-based-detection-automated-calls-under-framework-1988473), [Telangana Today, 18 Sep 2026](https://telanganatoday.com/trai-tightens-anti-spam-rules-brings-ai-detection-and-robocalls-under-framework), [Moneylife](https://www.moneylife.in/article/trai-tightens-spam-rules-aiflagged-callers-face-15day-outgoing-ban-without-consumer-complaint/81794.html)
- [NEWS/3P] Number series: 140 for promotional calls (checked against do-not-disturb preferences); 1600 for service and transactional calls from banking, financial services, insurance and government; 1601 (launched August 2026) for utility, courier and logistics, barred for promotion — [Telangana Today, 31 Jul 2026](https://telanganatoday.com/trai-clarifies-rules-for-1600-and-140-number-series-to-prevent-misinformation), [Moneylife](https://www.moneylife.in/article/trai-rolls-out-1601-series-for-utility-courier-and-logistics-calls-to-curb-voice-fraud/81315.html)

### Inferences
- WhatsApp's "reply for free inside 24 hours" assumption, which made chat-bot products nearly free to run, appears to have ended on 1 October 2026 beyond 1,000 service messages per number per month. A user-initiated bot with 1,000 daily users would exceed that allowance in a day. Per-message cost for service replies after the free allowance: not verified (one source says the Rs 0.115 utility rate).
- An inbound phone line (user calls the bot) is the lowest-regulatory-risk voice product: about Rs 0.38 per minute carriage plus Rs 3-3.5 per minute AI gives roughly Rs 4 per minute. Outbound AI calling now carries real suspension risk for a small sender.
- User-initiated WhatsApp voice calls being free to the business is a notable opening: a voice bot reachable by tapping "call" inside WhatsApp avoids telephony charges and DLT number-series rules, leaving only the AI cost. Whether a solo developer can obtain Calling API access easily is not verified.
- Telegram bots and mini apps remain free to run with no per-message fee, so they are the zero-budget channel; reach in India is smaller than WhatsApp and Stars payouts lose 30-54%.
- Product possibilities: (a) an inbound "missed call or call-in" Hindi helpline for a narrow niche (for example a coaching centre's fee and timetable line) at about Rs 4 per minute; (b) a Telegram mini app as the free prototype channel, moving to WhatsApp only once revenue per user covers message fees.

### Gaps
- Official India WhatsApp rate card in INR, and the exact post-October service-message rate: not verified.
- India per-minute rate for WhatsApp business-initiated calls: not verified.
- Current status and fees of WhatsApp in-chat payments and whether Flows can complete UPI checkout in 2026: not verified (sources are from 2023).
- Exotel official rates, KYC documents for an individual to rent an Indian virtual number, Twilio India availability: not verified.
- Whether TRAI has a final rule requiring disclosure that the caller is an AI: vendor blogs say it is draft only; not confirmed.
- India-specific tax or RBI treatment of Telegram Stars income: nothing found.

---

## 3. India's public digital infrastructure a small developer can actually reach

### Takeaway
Payments (UPI and UPI AutoPay through a gateway), open data (data.gov.in) and Bhashini are reachable by an individual or tiny firm; DigiLocker, Account Aggregator, ABDM and APAAR are built for registered organisations or regulated entities and involve committee review, licences or certification. A 0.4% merchant fee on UPI payments above Rs 2,000 was notified for 15 October 2026.

### Cited Findings

**UPI and UPI AutoPay**
- [NEWS/3P, many outlets] Finance ministry gazette notification dated 14 September 2026: no charge on UPI and RuPay debit payments up to Rs 2,000; 0.4% MDR on person-to-merchant UPI payments above Rs 2,000 from 15 October 2026, capped at Rs 300 for payments of Rs 75,000 or more; fixed Rs 5 for railways, telecom, insurance and fuel; person-to-person stays free; small merchants receiving up to Rs 1 lakh per month by UPI QR direct to bank are exempt. One outlet says the rate and revenue split were not formally final — [YourStory](https://yourstory.com/2026/09/govt-sets-04-fee-on-upi-merchant-payments-above-rs-2000-caps-charge-at-rs-300), [Business Today, 15 Sep 2026](https://www.businesstoday.in/personal-finance/story/upi-mdr-of-0-4-on-transactions-above-rs2000-from-october-15-what-you-need-to-know-555709-2026-09-15), [Inc42](https://inc42.com/buzz/govt-notifies-new-rules-no-mdr-for-upi-transactions-under-₹2000/), [ThePrint](https://theprint.in/economy/govt-sets-0-4-fee-on-upi-merchant-payments-above-rs-2000-caps-charge-at-rs-300/3043550/)
- [OFFICIAL-SNIPPET, vendor blog] Razorpay Subscriptions: 2% gateway fee plus 0.99% subscription fee plus GST (another Razorpay page says 0.9%); no set-up or annual fee; a 0% platform fee offer for the first 90 days for new businesses — [Razorpay blog](https://razorpay.com/blog/cheapest-payment-gateway-for-recurring-billing-e-nach-upi-autopay-and-subscription/), [Razorpay pricing explained](https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/)
- [OFFICIAL-SNIPPET] UPI AutoPay executes without PIN up to Rs 15,000, with category exceptions up to Rs 1 lakh (SIPs, insurance, IPO) — [Razorpay blog](https://razorpay.com/blog/best-payment-gateway-pricing-saas-india-tco-guide/), [PhonePe business guide](https://business.phonepe.com/articles/how-to-accept-subscription-payments-in-india-upi-auto-pay-vs-e-nach-vs-cards)
- [OFFICIAL-SNIPPET] Cashfree subscriptions: Rs 7.5 per mandate creation plus Rs 5 per UPI AutoPay debit below Rs 1,000, or Rs 15 for Rs 1,000 and above; Cashfree's UPI gateway page cites 1.95% per transaction, no set-up or maintenance fees — [Cashfree recurring payments](https://www.cashfree.com/blog/recurring-payment), [Cashfree UPI gateway](https://www.cashfree.com/upi-payment-gateway/)

**DigiLocker and API Setu**
- [OFFICIAL-SNIPPET] DigiLocker "requester" access is by application; DigiLocker "will consider your eligibility". Requester organisations must name a senior authorised representative and register with the organisation's official email domain; a registered Indian mobile number and a server located in India are mandatory; explicit user consent is required before fetching any document — [DigiLocker requester terms, June 2025](https://cf-media.api-setu.in/resources/DigiLocker-Terms-of-User-Requester-june-2025.pdf), [DigiLocker onboarding FAQ](https://www.digilocker.gov.in/assets/FAQ%20DL%20EL_onboarding.pdf), [Partners SOP](https://cf-media.api-setu.in/resources/Partners-SOP.pdf)
- [OFFICIAL-SNIPPET] API Setu sign-up asks for proof of identity, authority letter, organisation PAN, GST registration certificate and certificate of incorporation, plus a valid use case — [API Setu SOP](https://cdn.apisetu.gov.in/portal/assets/sop-apisetu-v0.pdf)
- [NEWS/3P] A guide reviewed in October 2026 says no fee schedule, lead time or sandbox is published; the approval committee meets weekly; there is no separate test environment — [Didit](https://didit.me/blog/digilocker-api/)

**Account Aggregator**
- [OFFICIAL-SNIPPET, vendor] Only an entity regulated by RBI, SEBI, IRDAI or PFRDA can be a Financial Information User. A startup without a licence must get one or partner with a regulated entity; the regulated entity is always the accountable end user of the data — [Setu blog](https://setu.co/blog/licences-for-fintechs-to-go-live-on-account-aggregator), [Setu support](https://support.setu.co/support/solutions/folders/81000297695)
- [NEWS/3P estimate] Typical technology-provider charges: Rs 5-15 per consent and Rs 5-15 per fetch, Rs 15-50 per completed application at volume — [ecorpit](https://ecorpit.com/account-aggregator-integration-fintech-builders-2026/), [HyperVerge](https://hyperverge.co/blog/best-account-aggregators/)

**ABDM / ABHA**
- [NEWS/3P] Path: register for the sandbox, build against milestones M1 (ABHA creation and verification), M2 (health information provider) and M3 (health information user), then certification. At least two milestones are needed to exit the sandbox, and a security audit is expected before production — [nirmitee](https://nirmitee.io/blog/abdm-m1-only-certificate-minimum-two-milestones-rule/), [ABDM developer forum](https://devforum.abdm.gov.in/t/know-about-milestones/3124), [ABDM sandbox notes](https://kiranma72.github.io/abdm-docs/1-basics/about_abdm_sandbox)

**APAAR, Academic Bank of Credits, DIKSHA**
- [OFFICIAL-SNIPPET] A government circular says APAAR APIs can be integrated by an institute into its existing portal for creating and verifying APAAR IDs, which points to institutions as the intended API users — [CAG circular](https://cag.gov.in/uploads/ae_circulars_office_orders/CircularsOfficeOrders-067af3e746cad26-61977106.pdf), [APAAR terms](https://apaar.education.gov.in/termsofuse)
- [OFFICIAL-SNIPPET] DIKSHA runs on Sunbird (MIT licence); content created on DIKSHA defaults to CC BY 4.0, but NCERT and other providers use other licences (CC BY-SA, CC BY-NC-SA), so each item's licence must be checked — [DIKSHA about](https://diksha.gov.in/about-us/), [Sunbird licensing spec](https://project-sunbird.atlassian.net/wiki/spaces/PRD/pages/1053491208/Licensing+and+Attribution+on+DIKSHA)

**Open data and ONDC**
- [NEWS/3P citing official help] data.gov.in: register, generate one key from "My Account", and call `https://api.data.gov.in/resource/<dataset_id>?api-key=...&format=json`. One source counts more than 6,700 datasets with APIs, another more than 80,000 APIs — [datagovindia package](https://pypi.org/project/datagovindia/0.4), [community.data.gov.in](https://community.data.gov.in/?p=113873)
- [NEWS/3P] ONDC: cost figures found relate to seller apps (Rs 0-50,000 set-up, 1-3% transaction fees) and come from vendor marketing — [Codingclave](https://codingclave.com/blog/ondc-integration-guide-india-2026)

**Bhashini**: see section 1 (self-serve key through ULCA; cost and production terms not verified).

### Inferences
- Access ladder for a solo developer: (1) open to an individual today: data.gov.in, Bhashini keys, DIKSHA open-licensed content, public rank data; (2) needs a registered business and KYC but no licence: payment gateways with UPI AutoPay; (3) needs an incorporated organisation with official domain and committee approval: DigiLocker and API Setu; (4) needs a regulated partner or certification: Account Aggregator, ABDM; (5) institution-only: APAAR and Academic Bank of Credits.
- Cashfree's flat fees matter for small tickets: a Rs 99 monthly AutoPay debit costs Rs 5 (about 5%) plus a one-time Rs 7.5; Razorpay's roughly 2.99% would be about Rs 3. For tickets below about Rs 170 the percentage model is cheaper; above it, the flat fee wins. (Arithmetic: Rs 5 / 0.0299 = Rs 167.)
- Subscriptions under Rs 2,000 stay outside the new UPI merchant fee, so low-priced consumer subscriptions are unaffected by it.
- Product possibilities: (a) a Rs 49-199 per month AutoPay micro-subscription product, which only became practical with UPI AutoPay; (b) a plain-language explorer over a specific government dataset (mandi prices, scheme eligibility) using data.gov.in plus an LLM, with zero data cost.

### Gaps
- Whether an unregistered individual (no GST, no firm) can onboard to Razorpay, Cashfree or PhonePe, and the document list: not verified.
- Whether the 0.4% UPI fee actually took effect on 15 October 2026 and how gateways pass it on: not confirmed after that date.
- PhonePe payment gateway pricing: not found.
- Fees for DigiLocker requester access through private integrators: not verified.
- Any third-party or startup API programme for APAAR or Academic Bank of Credits: none found.
- DIKSHA content API terms for third-party apps; NTA and JoSAA data access (opening and closing ranks): no source retrieved in this session. Not verified.
- data.gov.in rate limits: not found.
- ONDC buyer-app onboarding cost and process: not verified.

---

## 4. On-device and in-browser AI

### Takeaway
As of the latest sources, Chrome's built-in AI (Gemini Nano Prompt API, Summarizer, Translator, Language Detector) does not run on Chrome for Android, so it does not reach a Rs 10,000-15,000 phone. Small speech models (about 30 MB) are the realistic on-device component for such phones; browser LLMs on mid-range Android have no published benchmark and reported crashes.

### Cited Findings
- [OFFICIAL-SNIPPET] Prompt API docs (updated August 2026): Chrome for Android, iOS and ChromeOS on non-Chromebook-Plus devices are not yet supported for the APIs that use foundation models — [Chrome Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [OFFICIAL-SNIPPET] April 2026 "Intent to Ship: Prompt API": initial launch on Windows, Mac, Linux and Chromebook Plus; an Android implementation using the OS-level model is being prototyped and will ship later — [blink-dev](https://groups.google.com/a/chromium.org/g/blink-dev/c/iR6R7-nQeHI)
- [OFFICIAL-SNIPPET] Summarizer, Language Detector and Translator APIs have been in Chrome stable since version 138 (announced May 2025); the docs say Language Detector and Translator work on desktop and "do not work on mobile devices" — [Chrome built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis), [Chrome I/O 2025 update](https://developer.chrome.com/blog/ai-api-updates-io25)
- [OFFICIAL-SNIPPET] In December 2025 a Chrome product manager said most APIs are desktop-only and Android availability will be decided per API, with translator and language detector less demanding than the Prompt API — [Chrome AI dev preview group](https://groups.google.com/a/chromium.org/g/chrome-ai-dev-preview-discuss/c/HKIndTczlPM)
- [OFFICIAL-SNIPPET] Google publishes an experimental Prompt API polyfill (falls back to a cloud or other backend where the built-in model is missing) — [Prompt API polyfill](https://developer.chrome.com/docs/ai/prompt-api-polyfill?hl=en)
- [OFFICIAL-SNIPPET] Google reports Gemma 4 E2B at 52 tokens per second on a Samsung S26 Ultra (GPU backend, a flagship) with LiteRT-LM, and up to 76 tokens per second via WebGPU on an M4 Max MacBook — [Google Developers Blog](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)
- [NEWS/3P] Gemma 3n E4B is described as built for phones with about a 3 GB memory footprint; one Android user reported Gemma 4 under llama.cpp in Termux at 2-3 tokens per second — [open-llms blog](https://open-llms.pages.dev/blog/small-llms-on-edge-devices/)
- [NEWS/3P] A June 2026 post reports that on phones a page running Llama-3.2-1B through WebLLM reloaded mid-generation with no catchable error; WebGPU feature detection was not enough — [Hacker News thread mirror](https://hackernews-dynamic.seasondane.workers.dev/news/48624985)
- [NEWS/3P, self-reported] Shruti: 29.5 MB Hindi/English/Hinglish offline speech model with a single-threaded WebAssembly build needing no special server headers — [Shruti model card](https://huggingface.co/udgamlabs/Shruti)
- [NEWS/3P] Other browser speech routes: vosk-browser (WebAssembly Vosk in a Web Worker); a community project ran AI4Bharat IndicConformer as INT8 ONNX on multi-threaded WebAssembly; Collabora's Hindi fine-tune of whisper-tiny reached about 5% word error rate on FLEURS — [vosk-browser](https://gitee.com/gcyai/vosk-browser), [Collabora](https://www.collabora.com/news-and-blog/news-and-events/breaking-language-barriers-20-moving-closer-production-ready-hindi-asr.html)

### Inferences
- For the target Rs 10,000-15,000 Android phone (typically 4-6 GB RAM, low-end GPU), the honest answer is: offline speech recognition with a 30-150 MB model is plausible; a browser LLM is not dependable; Chrome's free built-in models are unavailable. Treat on-device LLMs as a desktop-only bonus.
- A 3 GB model footprint (Gemma 3n E4B) on a 4-6 GB phone leaves little headroom, consistent with the reported silent tab reloads.
- Design pattern: write to the Prompt API shape with the polyfill, so desktop Chrome users cost nothing and phone users fall back to Groq. This cuts cost only for the desktop share of users.
- Product possibilities: (a) an offline Hinglish dictation or voice-notes web app (speech model cached in the browser) that works on patchy rural data, with LLM clean-up when online; (b) a desktop Chrome extension doing private summarising or translation of web pages at zero inference cost.

### Gaps
- No measured tokens-per-second for any LLM in Chrome on a mid-range Android phone was found.
- Which Indian languages the Chrome Translator API supports (Hindi included or not): not verified.
- Whether Chrome built-in AI reached Android between August and November 2026: no evidence found either way.
- Real latency and memory of Shruti or IndicConformer on low-end phones: no independent test.

---

## 5. Agents and tool standards: MCP, ChatGPT apps, Claude connectors, agent payments

### Takeaway
Distribution exists but direct revenue does not yet: individuals can submit ChatGPT apps, and Claude has a connector directory, but no source shows a revenue share or in-app paid tiers. Agent-initiated UPI payments are live in pilot form through large partners, not as something a solo developer can self-serve with confidence.

### Cited Findings
- [NEWS/3P] OpenAI accepts ChatGPT app submissions from "any verified developer, from solo builders to large enterprises", reviewed for an app directory — [VentureBeat](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches)
- [OFFICIAL-SNIPPET, community forum] January 2026 answer on the OpenAI forum: developers cannot define pricing tiers or revenue sharing inside the Apps SDK ("no to both currently"); a later thread still requests revenue sharing — [OpenAI community](https://community.openai.com/t/chatgpt-app-monetization-apps-sdk/1372343.md), [feature request](https://community.openai.com/t/feature-request-bring-developer-revenue-sharing-to-chatgpt-apps/1397233)
- [NEWS/3P] Monetisation runs through links out to the developer's own site or app, mainly for physical goods; OpenAI says it is "exploring" digital goods. Earlier GPT creators reported no substantive revenue — [Implicator](https://www.implicator.ai/openai-turns-chatgpt-into-an-app-platform-with-distribution-it-controls/), [Dataconomy](https://dataconomy.com/2025/12/18/chatgpt-might-break-app-stores-as-we-know-it)
- [OFFICIAL-SNIPPET] Claude's directory accepts remote MCP servers, desktop extensions (MCPB) and MCP Apps; submission is through a portal in Claude.ai organisation admin settings. All tools need a title and a readOnlyHint or destructiveHint; a privacy policy URL is expected — [Claude connector submission docs](https://claude.com/docs/connectors/building/submission), [Claude directory docs](https://claude.com/docs/connectors/directory)
- Conflict on who can submit: one guide says a Team or Enterprise organisation is required — [sunpeak, May 2026](https://sunpeak.ai/blogs/claude-connector-directory-submission); coverage of a 25 September 2026 portal launch says it is open to developers on paid Claude plans and adds a GitHub-hosted plugin bundle path [NEWS/3P] — [aicatchup](https://aicatchup.com/news/claude-plugin-directory-submission-portal)
- [NEWS/3P] The official MCP Registry (registry.modelcontextprotocol.io) is separate from Claude's directory and feeds third-party listings — [jwatte](https://jwatte.com/blog/mcp-directories-listing-guide-2026.md)
- [NEWS/3P] Razorpay, NPCI and OpenAI launched an agentic payments pilot on ChatGPT in October 2025 (BigBasket and Vodafone Idea as first merchants), built on UPI Reserve Pay and UPI Circle; the assistant never sees the UPI PIN — [Business Standard](https://www.business-standard.com/companies/news/razorpay-npci-and-openai-launch-agentic-payments-on-chatgpt-125100900601_1.html), [TechCrunch](https://techcrunch.com/2025/10/09/india-pilots-ai-chatbot-led-e-commerce-with-chatgpt-gemini-claude-in-the-mix), [Inc42](https://inc42.com/features/can-razorpay-turn-chatgpt-into-indias-next-commerce-channel/)
- [NEWS/3P] Pine Labs announced an OpenAI partnership in February 2026; Cashfree announced "Cashfree Here" for accepting UPI and card payments inside ChatGPT and Claude via the Apps SDK and MCP — [Stellagent](https://stellagent.ai/insights/pine-labs-openai-agentic-commerce-india)
- [NEWS/3P] Computer-use tools from Anthropic, OpenAI and Google (Gemini in preview) are priced per token; Amazon Nova Act is $4.75 per agent hour — [Simular](https://www.simular.ai/alternatives/computer-use-apis)

### Inferences
- For a solo developer in 2026 the realistic value of these ecosystems is free distribution and lead generation, not platform payouts. Revenue must be collected on the developer's own site (for example by UPI AutoPay) after the assistant sends the user there.
- A remote MCP server is technically close to the reader's stack: it is an HTTPS endpoint that can run as a Vercel function, and the same server can be listed in several directories. Integration difficulty is low to moderate; the work is in OAuth, tool annotations and review.
- Being early matters here: India-specific connectors (data and services that global developers will not build) face little competition in the directories. This is an inference from the absence of India-specific listings in the sources, not a measured fact.
- Product possibilities: (a) an MCP server or ChatGPT app wrapping a hard-to-use Indian public dataset (for example admission cut-offs or mandi prices), discoverable inside assistants; (b) once "Cashfree Here" or similar is self-serve, a small paid service sold inside the chat.

### Gaps
- No evidence of any solo developer earning meaningful revenue from ChatGPT apps or Claude connectors.
- Whether an individual without a Team plan can submit to Claude's directory: conflicting.
- Status of consumer roll-out of UPI payments in ChatGPT, and whether a small merchant can enable it: not verified.
- Gemini extensions and Google's agent payment protocol with UPI: no source retrieved. Not verified.
- MCP adoption numbers and Claude "skills" distribution: not researched to a citable level.
- Computer-use agent per-task costs: only low-quality aggregators; not verified.

---

## 6. Cheap multimodal, and what is on Groq today

### Takeaway
Groq's catalogue changed sharply in 2026: by Groq's own deprecation page (as extracted), the Llama 3.1/3.3 models, Llama 4 Scout (the vision model) and the Compound systems were retired between March and September 2026, leaving gpt-oss-20b and gpt-oss-120b plus Whisper as production models. A current Groq vision model could not be confirmed, so image and handwriting reading should be planned on Gemini Flash-Lite or Sarvam Vision (Rs 0.50 per page).

### Cited Findings

**Groq line-up (critical for this reader)**
- [OFFICIAL-SNIPPET] Deprecations in 2026: 21 Sep, groq/compound and groq/compound-mini retired; 14 Sep, qwen/qwen3.6-27b replaced by qwen/qwen3.8-27b; 16 Aug, llama-3.1-8b-instant and llama-3.3-70b-versatile retired (replacements: openai/gpt-oss-20b, and openai/gpt-oss-120b or qwen3.6-27b); 17 Jul, qwen/qwen3-32b and meta-llama/llama-4-scout-17b-16e-instruct retired; March-April, kimi-k2-instruct-0905, llama-4-maverick and llama-guard-4-12b retired — [Groq deprecations](https://console.groq.com/docs/deprecations)
- [OFFICIAL-SNIPPET, possibly stale cache] Production models: openai/gpt-oss-120b, openai/gpt-oss-20b, whisper-large-v3, whisper-large-v3-turbo. Preview models: openai/gpt-oss-safeguard-20b, qwen/qwen3.8-27b, minimaxai/minimax-m2.7, meta-models/muse-spark-open, Orpheus text-to-speech and Prompt Guard models. The same page lists the Llama 3.1/3.3 entries as enterprise-only, which conflicts with the retirement notice — [Groq models](https://console.groq.com/docs/models)
- [OFFICIAL-SNIPPET] Preview models "are intended for evaluation purposes only", "should not be used in production" and "may be discontinued at short notice" — [Groq deprecations](https://console.groq.com/docs/deprecations)
- [NEWS/3P, October 2026] Prices: gpt-oss-120b $0.15 input and $0.60 output per 1M tokens; gpt-oss-20b $0.075 and $0.30; preview qwen3.8-27b $0.80 and $4.00; Whisper from $0.04 per hour; 50% discount for batch and for cached prompts. Trackers say only four chat models have published prices and the rest say "contact sales" — [morphllm, Oct 2026](https://www.morphllm.com/groq-pricing), [benchlm, 20 Oct 2026](https://benchlm.ai/hosts/groq), [flexprice](https://flexprice.io/pricing-index/groq)
- Rate limits conflict: Groq's rate-limit page (extract) gives gpt-oss-120b and gpt-oss-20b as 30 RPM, 1K RPD, 8K TPM, 200K TPD and describes the table as "base limits for the Developer plan" [OFFICIAL-SNIPPET] — [Groq rate limits](https://console.groq.com/docs/rate-limits); third-party sites give the same numbers as the free tier [NEWS/3P] — [developersdigest](https://www.developersdigest.tech/models/free-api/groq); the models page shows 250K TPM and 1K RPM for both [OFFICIAL-SNIPPET] — [Groq models](https://console.groq.com/docs/models)
- [NEWS/3P] A tracker reports Groq raised its top price from $0.79 to $3 per 1M tokens on 15 April 2026 and has changed pricing again since — [CostBench changelog](https://costbench.com/changelog/groq-price-increase-2026-04/)

**Reading documents, handwriting and Indian scripts**
- [NEWS/3P] Sarvam Vision price cut 67% from Rs 1.5 to Rs 0.5 per page (reported effective 1 June 2026) — [Free Press Journal](https://www.freepressjournal.in/tech/sarvam-ai-slashes-vision-api-pricing-by-67-bringing-document-digitisation-within-reach-for-indian-enterprises), [NewsBytes](https://www.newsbytesapp.com/news/science/sarvam-ai-cuts-sarvam-vision-price-by-67-to-050page/tldr)
- [OFFICIAL-SNIPPET] Sarvam Vision is a 3B-parameter document model; limits of 10 pages per PDF, 200 MB per file and 10 requests per minute on all plans — [Sarvam Vision docs](https://docs.sarvam.ai/api/getting-started/models/sarvam-vision)
- [NEWS/3P, research paper] A June 2026 Devanagari stress test of ten systems found the open Qwen3-VL-8B scored chrF++ 75.2 while GPT-5.5 scored 58.5 (level with classical EasyOCR), and that nine of ten systems "collapse" on real scans — [arXiv 2606.29213](https://arxiv.org/pdf/2606.29213)
- [NEWS/3P, research papers] GlotOCR Bench (April 2026): every model tested does well on Latin and degrades substantially on Devanagari and other mid-resource scripts. A July 2026 study found vision-language models with good prompts gave the lowest error on Devanagari archive material, with prompt design mattering a lot — [GlotOCR Bench](https://arxiv.org/html/2604.12978v1), [ComputEL 2026](https://aclanthology.org/2026.computel-1.14.pdf)
- [NEWS/3P] Sarvam Vision 2.1 (September 2026) ships a 6,909-sample benchmark across 22 Indian languages; the reviewer notes a vendor-built benchmark the vendor wins proves little — [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2026/09/sarvam-vision-2-1-review/)

**Gemini multimodal and generation**
- [OFFICIAL-SNIPPET] Gemini 3.1 Flash-Lite: free on the free tier; paid $0.25 per 1M input tokens for text, image and video, $0.50 for audio input, $1.50 per 1M output tokens (including thinking); batch $0.125 and $0.75. It does not support audio generation or the Live API — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini 3.1 Flash-Lite model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)
- [NEWS/3P] Image generation: Gemini 3.1 Flash Image ("Nano Banana 2") $0.045 at 0.5K, $0.067 at 1K, $0.101 at 2K, $0.151 at 4K per image; Flash-Lite Image (June 2026) about $0.0168 per 1K image — [developersdigest, Oct 2026](https://www.developersdigest.tech/blog/image-video-generation-api-pricing-2026), [benchlm media pricing](https://benchlm.ai/media-pricing)
- [NEWS/3P] Video generation per second: Veo 3.1 Lite $0.05 (720p) and $0.08 (1080p); Veo 3.1 Fast $0.10, $0.12 and $0.30 (720p, 1080p, 4K); Veo 3.1 standard $0.40 and $0.60 (4K); no free tier. A wan2.6 flash model is quoted near $0.025 per second at 720p — [benchlm Veo pricing](https://benchlm.ai/media-pricing/veo), [developersdigest](https://www.developersdigest.tech/blog/image-video-generation-api-pricing-2026)

### Inferences
- If the reader's code still calls llama-3.3-70b-versatile, llama-3.1-8b-instant, Llama 4 Scout or groq/compound, it is very likely already failing or about to; this should be checked in the Groq console immediately. Building anything on a Groq preview model (qwen3.8, minimax, Orpheus) repeats the same risk.
- Cost of reading a photographed page: Sarvam Vision Rs 0.50 per page. Gemini Flash-Lite cost depends on image token count, which was not found; at $0.25 per 1M input tokens it is likely a small fraction of a rupee per image, but that is an estimate.
- Handwriting in Indian scripts is still unreliable according to independent papers, so a product should keep a human correction step and not promise exact transcription.
- An 8-second clip on Veo 3.1 Lite at 720p costs 8 x $0.05 = $0.40, and a 1K image about $0.017-0.067. Image features fit a near-zero budget in small volumes; video does not.
- Product possibilities: (a) "photo of a handwritten ledger or prescription to structured text" for small shops at about Rs 0.50 per page with a confirm-and-correct screen; (b) low-cost illustrated explainers (one generated image per lesson) for vernacular learning content.

### Gaps
- Groq's current official price list and free-tier limits were not read directly; the free-vs-developer limit conflict is unresolved. Check console.groq.com/docs/models, /rate-limits and /deprecations.
- Whether any current Groq model accepts images: not verified.
- Video-understanding pricing and limits (how video input is tokenised on Gemini): not found.
- No head-to-head handwriting benchmark of Gemini vs Sarvam Vision for Hindi was found.
- Gemini free-tier request limits: Google reportedly no longer publishes per-model free limits; third-party figures conflict (15 RPM and 1,000 per day vs 30 RPM and 1,500 per day), with cuts of 50-92% reported in December 2025 — [benchlm](https://benchlm.ai/md/free-tier/google-ai-studio.md), [yingtu](https://yingtu.ai/en/blog/google-gemini-api-free-tier-limits-2026)

---

## 7. Costs: 1,000 daily users making 20 LLM calls each

### Takeaway
At published or reported list prices, 600,000 calls a month costs roughly $45-100 on the cheapest open-model hosts and roughly $350-420 on Gemini Flash-Lite or an OpenAI nano-class model, under a mid-size prompt assumption. Free tiers do not cover this volume.

### Cited Findings (prices used)
- Groq gpt-oss-20b $0.075 in / $0.30 out; gpt-oss-120b $0.15 / $0.60 per 1M tokens [NEWS/3P, Oct 2026] — [morphllm](https://www.morphllm.com/groq-pricing)
- Gemini 3.1 Flash-Lite $0.25 in / $1.50 out [OFFICIAL-SNIPPET] — [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- gpt-oss-20b on DeepInfra or OpenRouter: between $0.018 / $0.09 and $0.05 / $0.20 depending on tracker and date; $0.03 / $0.14 used below [NEWS/3P, Sep-Oct 2026] — [computeprices](https://computeprices.com/providers/deep-infra/models/gpt-oss-20b), [cloudprice](https://cloudprice.net/models/openai/gpt-oss-20b), [benchlm DeepInfra](https://benchlm.ai/hosts/deepinfra)
- OpenAI GPT-5.4 nano $0.20 in / $1.25 out [NEWS/3P] — [pricepertoken](https://pricepertoken.com/pricing-page/model/openai-gpt-5.4-nano)
- Sarvam 105B Rs 15 in / Rs 60 out [OFFICIAL-SNIPPET] — [Sarvam API pricing](https://www.sarvam.ai/api-pricing)
- Groq limits for gpt-oss-20b: 1K requests per day and 200K tokens per day (whether free or developer tier is disputed) — [Groq rate limits](https://console.groq.com/docs/rate-limits)

### Inferences (the arithmetic)
Volume: 1,000 users x 20 calls = 20,000 calls per day x 30 = 600,000 calls per month.
Assumption (mine, not sourced): a mid-size call is 1,000 input tokens and 300 output tokens. Monthly tokens = 600M input and 180M output.

| Provider and model | Input cost | Output cost | Monthly total |
|---|---|---|---|
| DeepInfra/OpenRouter gpt-oss-20b ($0.03 / $0.14) | 600 x 0.03 = $18 | 180 x 0.14 = $25.20 | about $43 |
| Groq gpt-oss-20b ($0.075 / $0.30) | 600 x 0.075 = $45 | 180 x 0.30 = $54 | $99 |
| Groq gpt-oss-120b ($0.15 / $0.60) | 600 x 0.15 = $90 | 180 x 0.60 = $108 | $198 |
| OpenAI GPT-5.4 nano ($0.20 / $1.25) | 600 x 0.20 = $120 | 180 x 1.25 = $225 | $345 |
| Gemini 3.1 Flash-Lite ($0.25 / $1.50) | 600 x 0.25 = $150 | 180 x 1.50 = $270 | $420 |
| Sarvam 105B (Rs 15 / Rs 60) | 600 x 15 = Rs 9,000 | 180 x 60 = Rs 10,800 | Rs 19,800 |

- Range: a light call (500 in, 150 out) halves every figure; a heavy call (2,000 in, 500 out) is 1,200M in and 300M out, for example Groq gpt-oss-20b = $90 + $90 = $180 and Gemini Flash-Lite = $300 + $450 = $750. So the overall range is roughly $20 to $750 per month depending on model and prompt size.
- Per user: at $99 per month for 1,000 daily users, cost is about $0.10 per daily-active user per month, so even a Rs 49 subscription from a few percent of users covers inference. (USD to INR rate not looked up; conversion left to the reader.)
- Groq's 50% cached-prompt discount would cut the input side when a long system prompt repeats; "thinking" tokens on reasoning models count as output and can raise bills (a Google forum thread reports costs rising 4x in 3 days) — [Google AI forum](https://discuss.ai.google.dev/t/gemini-api-costs-skyrocketed-overnight-x4-in-3-days/134107)
- Free tier reality check: with 200K tokens per day on gpt-oss-20b and 1,300 tokens per call, the token cap allows about 153 calls per day (200,000 / 1,300), which is about 7 users at 20 calls each; the 1,000 requests-per-day cap would allow 50 such users. The free tier supports a prototype, not 1,000 daily users.

### Gaps
- All Groq, DeepInfra, OpenRouter and OpenAI prices here are from third-party trackers, not official pages; trackers disagree by up to about 40% on the same model.
- OpenAI's cheapest current model and its output price: conflicting (GPT-5 nano at $0.05 input in one source, GPT-5.4 nano at $0.20 in another; newer model names in other sources).
- Actual token counts per call for the reader's app are unknown; the 1,000/300 assumption drives every total.
- Vercel function and Firebase costs at this volume were not researched.
