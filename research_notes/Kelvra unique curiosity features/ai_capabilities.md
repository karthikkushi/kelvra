# AI capabilities for curiosity-sparking study features (2024–2026): a scan for Kelvra

> Researched 5 Nov 2026 for Kelvra: a React 19 + Vite PWA with Firebase Auth/Firestore and a Vercel serverless proxy (`api/groq.js`) to Groq `openai/gpt-oss-120b` plus a preview vision model ([README](/home/user/kelvra/README.md); [api/groq.js](/home/user/kelvra/api/groq.js)).
> **Method caveat:** this sandbox blocked direct page fetches to sarvam.ai, groq.com, ai.google.dev, openai.com, elevenlabs.io and huggingface.co (hosts not on the network allowlist). Official prices and specs below therefore come from search-engine summaries of those pages plus third-party price trackers. Treat every price as approximate at the date shown and re-check the official page before budgeting. INR↔USD conversions assume about ₹88 per US$ (my assumption, not sourced).

## 1. AI audio: "podcast of your notes", two-voice dialogue, and TTS with Indian voices

### Takeaway
Turning notes into a podcast is now a proven format. NotebookLM already does it in Hindi and Marathi, and ElevenLabs GenFM does it in Hindi, so audio alone will not set Kelvra apart. What has changed is that Kelvra can now make two-voice episodes in Indian languages cheaply, roughly ₹4–15 for a 5-minute episode, using either Gemini Flash TTS (two speakers in one call, Hindi generally available) or Sarvam Bulbul (Indian voices, billed in INR). Groq's own TTS (Orpheus) has no Indian languages, so any audio feature means adding a second vendor.

### Cited Findings
**Who already turns notes into audio**
- Google NotebookLM Audio Overviews (two AI hosts discussing your sources) expanded to 50+ languages on 29 Apr 2025, including Hindi and Marathi. Google credits Gemini's native audio for this, and users pick the language with the "Output Language" setting — [Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-audio-overviews-50-languages/); [Business Today](https://www.businesstoday.in/tech-today/news/story/google-expands-audio-overviews-in-notebooklm-to-50-languages-including-hindi-marathi-474184-2025-04-30). Bizzbuzz lists the Indian languages in that rollout as Hindi, Marathi, Maithili, Konkani and Urdu — [Bizzbuzz](https://www.bizzbuzz.news/technology/google-expands-audio-overviews-in-notebooklms-check-all-the-details-1360382).
- NotebookLM also has an interactive mode where a listener can "jump into the conversation" and ask the hosts questions (availability "may vary"). It also makes flashcards and practice quizzes "based exclusively on the sources you upload" (quizzes come with hints and a scorecard) and mind maps — [Google for Education](https://edu.google.com/intl/ALL_uk/ai-notebooklm/); [AVID Open Access](https://avidopenaccess.org/resource/the-continued-evolution-of-notebooklm/).
- ElevenLabs GenFM launched in late Nov 2024 in the ElevenReader iOS app. It turns text, documents or YouTube videos into a multi-speaker AI podcast in 32 languages, Hindi included — [AlternativeTo](https://alternativeto.net/news/2024/11/elevenlabs-introduces-genfm-for-ai-podcast-creation-from-various-sources-in-32-languages); [Neowin](https://www.neowin.net/news/elevenreader-gets-genfm-which-creates-a-podcast-about-your-content/).
- Google Illuminate makes audio discussions of research papers. It focuses on arXiv and is tuned for computer science. 2024 coverage described it as an English-only experimental demo with no downloads or subtitles — [Analytics Vidhya](https://www.analyticsvidhya.com/blog/2024/12/create-podcasts-using-google-illuminate/); [Gigazine](https://gigazine.net/gsc_news/en/20240911-google-illuminate).
- Open source:
  - Podcastfy (Python package, CLI and web UI) turns text, websites, PDFs, YouTube videos and images into multilingual audio conversations. Its mirrors disagree on the license (CC BY-NC-SA 4.0 or Apache 2.0), which matters for commercial use — [Podcastfy mirror](https://github.com/TypesetIO/podcastfy); [BestHub roundup](https://besthub.dev/articles/top-open-source-notebooklm-alternatives-ai-powered-docs-podcasts-research-tools-f43af6cb6c88).
  - Open Notebook (lfnovo/open-notebook) is a self-hosted NotebookLM alternative. It supports OpenAI, Anthropic, Gemini, Vertex, OpenRouter and Ollama, and it uses Podcastfy to make podcasts — [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Flfnovo%2Fopen-notebook).
- PhysicsWallah added ElevenLabs TTS to its "Ask AI" doubt tool so it can speak answers. It cites two reasons: about 52% of its students prefer audio-first learning, and Hinglish speakers needed natural-sounding output — [ElevenLabs case study (Hindi page)](https://elevenlabs.io/hi/blog/physicswallah).
- Kelvra already reads text aloud with the browser's built-in `speechSynthesis` — [src/utils/voice.js](/home/user/kelvra/src/utils/voice.js).

**Two-voice dialogue in a single call**
- Google's Gemini-TTS can produce single-speaker or multi-speaker speech and lists Hindi (hi-IN) as GA — [Google Cloud docs](https://cloud.google.com/text-to-speech/docs/gemini-tts).
- A third-party guide adds three points:
  - the multi-speaker setting supports at most 2 speakers;
  - Gemini 2.5 Flash TTS costs $0.50 per 1M input tokens and $10 per 1M output tokens;
  - Gemini 3.1 Flash TTS is now the recommended model for new projects.
  
  Source: [invideo](https://invideo.io/blog/gemini-tts-ai-voice/).

**Evidence on Indian-voice TTS quality**
- Josh Talks ran a blind listening study of Sarvam Bulbul v3 against ElevenLabs and Cartesia Sonic-3 (11 languages, reportedly 500+ annotators). Bulbul v3 was rated best for 8 kHz telephony audio and skipped or mispronounced fewer words. Sarvam acknowledged that ElevenLabs v3 (alpha) led on full-band audio quality — [Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3); [YourStory](https://yourstory.com/ai-story/sarvam-ai-bulbul-v3). Sarvam also claims the lowest character error rate on numbers, named entities and code-mixed text, but that is its own benchmark — [Sarvam blog](https://www.sarvam.ai/blogs/bulbul-v3).
- A separate large pairwise-preference study tested 7 TTS systems across 10 Indian languages. Gemini 2.5 Pro TTS ranked first (Elo about 1129). ElevenLabs v3 (about 1056) and Cartesia Sonic 3 (about 1051) came next and were statistically tied. Bulbul v3 beta was tested but did not come first — [Moonlight review of "Preferences of a Voice-First Nation"](https://www.themoonlight.io/review/preferences-of-a-voice-first-nation-large-scale-pairwise-evaluation-and-preference-analysis-for-tts-in-indian-languages).
- OpenAI gpt-4o-mini-tts: a vendor blog calls its voice list English-centric and recommends another provider for Hindi. I found no official Hindi benchmark — [edesy](https://edesy.in/ai-voice-assistant/blog/ai-voice-assistant-pricing-guide).
- Open models:
  - AI4Bharat Indic Parler-TTS covers 20 Indian languages plus English. It was fine-tuned on about 1,806 hours of speech, and you control the voice style with a text description. Most listings give its license as Apache 2.0, but the government AIKosh portal lists MIT, and the model is gated — [AIKosh](https://aikosh.indiaai.gov.in/home/models/details/ai4bharat_indic_parler_tts_text_to_speech_model.html); [DEV.co](https://dev.co/ai/llms/indic-parler-tts); [arXiv 2505.18609](https://arxiv.org/html/2505.18609v2).
  - AI4Bharat IndicF5 TTS covers 11 Indian languages (about 1,417 hours) and is MIT-licensed according to AIKosh — [AIKosh IndicF5](https://aikosh.indiaai.gov.in/home/models/details/aibharat_indicf5.html).

**TTS prices (section 9 has the consolidated table)**
- **Sarvam Bulbul v3:** ₹30 per 10K characters pay-as-you-go (reported 17 Sep 2026), with lower rates on higher credit tiers — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/); [Sarvam TTS page](https://www.sarvam.ai/text-to-speech).
- **Sarvam Bulbul V4 Flash:** list price ₹20 per 10K characters, with a launch price of ₹10 per 10K until 12 Nov 2026. Sarvam markets it as responding in under 250 ms — [Analytics Insight](https://www.analyticsinsight.net/artificial-intelligence/sarvam-ai-bulbul-v4-flash-real-time-voice-model-for-indian-languages); [ArtRealm](https://artrealmai.com/article/sarvam-bulbul-v4-flash-indian-tts-api).
- **Sarvam free credit:** new accounts get ₹100 — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/).
- **Google Cloud TTS Chirp 3 HD:** US$30 per 1M characters, with the first 1M characters free each month. Older voice tiers cost US$16 per 1M — [Google pricing](https://cloud.google.com/text-to-speech/pricing); [DIYAI](https://diyai.io/ai-tools/audio-generation/google-cloud-text-to-speech-pricing/).
- **ElevenLabs:**
  - Flash/Turbo v2.5: about $0.04–0.05 per 1K characters, 32 languages.
  - Eleven v3: about $0.08–0.10 per 1K characters, 70+ languages, capped at 5,000 characters per request.
  - One tracker, checked 1 Nov 2026, also lists Eleven v4 at $0.08 per 1K.
  
  Sources: [Stork](https://www.stork.ai/blog/fr/elevenlabs-api-key-and-pricing-2026); [Puter](https://developer.puter.com/tutorials/elevenlabs-api-pricing/); [AIReiter](https://aireiter.com/blog/elevenlabs-eleven-v3-api-guide).
- **OpenAI gpt-4o-mini-tts:** about $0.015 per minute of audio ($0.60 per 1M text-input tokens and $12 per 1M audio-output tokens) — [Eden AI](https://www.edenai.co/expert-models/openai-gpt-4o-mini-tts); [BestHub](https://besthub.dev/articles/openai-unveils-new-stt-and-tts-models-gpt-4o-transcribe-gpt-4o-mini-transcribe-and-gpt-4o-mini-tts-performance-pricing-and-demo-e42b467daaf5).
- **Groq TTS:** Orpheus V1 English costs $22 per 1M characters and Orpheus Arabic (Saudi) $40 per 1M (late-2026 trackers). An older-looking listing shows $50 per 1M at about 140 characters per second. I found no Indian-language voices — [CloudZero](https://www.cloudzero.com/blog/groq-pricing/); [Maximem](https://www.maximem.ai/blog/groq-api-pricing-2026); [Glamdring](https://www.glamdringresearch.com/post/groq-api-pricing).
- **Azure Neural TTS:** about $15–16 per 1M characters, and Neural HD about $22 per 1M (one tracker says it was cut from $30 in Mar 2026). The free F0 tier is reportedly 500K characters a month, but sources conflict — [TextToLab](https://texttolab.com/blog/azure-text-to-speech-pricing); [PerkStack](https://perkstack.co/blog/cheapest-azure-tts-api); [SpeechActors](https://speechactors.com/article/microsoft-azure-pricing-and-plans).
- **Bhashini (government APIs):** secondary sources say the APIs are free once you register. One developer guide says Bhashini's own docs limit API use to proof-of-concept and send production users to a paid arrangement — [DEV Community](https://dev.to/mr_manushukla/22-scheduled-languages-one-app-what-indic-localization-actually-costs-to-ship-in-2026-12ag); [CDO Magazine](https://www.cdomagazine.tech/aiml/indian-govt-ai-translation-platform-bhashini-gears-up-for-monetization).

### Inferences
- **Cost of one 5-minute two-voice episode.** My assumptions: about 750 spoken words, roughly 4,000–4,500 characters, about 300 seconds of audio.
  - Bulbul v3: about ₹12–13.5.
  - Bulbul V4 Flash: about ₹8–9 (₹4–4.5 at the launch price).
  - Gemini Flash TTS: about $0.075–0.10, or ₹7–9 (assuming 25–32 audio tokens per second).
  - Chirp 3 HD: about $0.12–0.14. The 1M free characters a month cover roughly 220+ episodes.
  - ElevenLabs Flash: about $0.16–0.23. Eleven v3: about $0.32–0.45.
  - Writing the script on Groq costs almost nothing.
  
  Cache each episode per set of notes, for example in Firebase Storage, so cost grows with the number of notes, not the number of plays.
- **Best fit for Kelvra.** Use Gemini 2.5/3.1 Flash TTS for two-host Hindi/English dialogue in one call: it is the cheapest good-quality option, and its model family ranked top in the independent Indian-language preference study. Use Sarvam Bulbul as the Indian-vendor option for more Indian languages and INR billing. Neither has been tested on Hinglish written in Roman script, so run a listening test with about 20 real student scripts.
- **Standing out from NotebookLM.** Possible angles:
  - exam-format episodes of 3–5 minutes tagged to the syllabus;
  - "pause and answer" recall prompts where the student's spoken answer is graded (this ties into Kelvra's answer coach);
  - a Hinglish speaking style;
  - Tamil, Telugu and Bengali episodes;
  - "ask the hosts" questions through Kelvra's mentor chat.
- **Free fallback.** Kelvra's existing browser `speechSynthesis` uses voices on the device, and their quality and Indian-language coverage vary by device. It can stay as the free tier, with cloud TTS as the premium one.
- **Teen safety.**
  - Label all generated audio as AI (section 10).
  - Never accept voice samples uploaded by users (that is voice cloning), and never use sound-alikes of celebrities or teachers.
  - Base scripts on the student's own notes and run a fact-check pass, because AI hosts sound confident even when they are wrong.

### Gaps
- I could not fetch the official pricing pages (sandbox allowlist). NotebookLM's current free-tier limits for Audio Overviews and interactive mode are unverified; one secondary claim of "3 per day" could not be traced to a source.
- I found no independent test of TTS quality for Hinglish written in Roman script, for Gemini, Sarvam or ElevenLabs.
- Which Indian locales Chirp 3 HD supports, and which Indian languages Gemini-TTS supports besides Hindi, was not confirmed.
- The Indic Parler-TTS license conflict (Apache 2.0 or MIT) is unresolved. No source confirmed whether IndicF5 can clone voices.
- Google Illuminate's status in 2026 (separate product, merged into NotebookLM, or retired) was not found.

## 2. Real-time voice tutors and Hinglish / Indic speech recognition

### Takeaway
There are two workable designs.

1. **Turn-based "push-to-talk" chain:** speech-to-text with Groq Whisper or Sarvam Saaras, then gpt-oss on Groq, then Sarvam Bulbul or Gemini TTS. It fits Kelvra's current Vercel + Groq setup, works in any PWA, and fixes the fact that browser speech recognition fails in iOS home-screen apps.
2. **True real-time speech-to-speech:** Gemini Live, or OpenAI gpt-realtime and its mini version. It replies in about 0.3–0.8 s, but you depend on vendor sockets, models change often, and Indian-language coverage is unverified.

Cost per conversational minute is similar for the chain, Gemini Live and OpenAI mini (about ₹1–1.5). OpenAI's main realtime model costs about 3–4 times more. For Hinglish, the evidence favours Sarvam Saaras v3 (it has a dedicated code-mix mode, and Sarvam's speech recognition ranked first or second in most languages in the Voice of India benchmark) and ElevenLabs Scribe v2. Plain Whisper large-v3 gets worse on code-mixed and noisy Indian speech.

### Cited Findings
**Real-time speech-to-speech APIs**
- **OpenAI Realtime.** Third-party copies of OpenAI's pricing list:
  - gpt-realtime (also called -2 or -2.1): $32 per 1M audio-input tokens ($0.40 cached) and $64 per 1M audio-output tokens.
  - The mini model: $10 per 1M in ($0.30 cached) and $20 per 1M out.
  - The student's audio is about 600 tokens per minute and the assistant's about 1,200 tokens per minute. That works out to about $0.019 per minute in and $0.077 per minute out on the main model, and about $0.006 and $0.024 on mini.
  - One estimate puts a conversation at about $0.05 per minute on the main model and about $0.016 per minute on mini. Real bills are higher because earlier context is processed again on every turn.
  - Sources disagree on model names and dates ("verified 9 Jul 2026" versus "2.1 rates added 26 Sep 2026").
  
  Sources: [AIReiter](https://aireiter.com/blog/openai-realtime-api-pricing); [eesel](https://www.eesel.ai/blog/gpt-realtime-mini-pricing); [Layer3Labs](https://www.layer3labs.io/guides/openai-realtime-api-pricing); [Forasoft](https://www.forasoft.com/blog/article/openai-realtime-api-pricing). The same third-party sources list realtime translation at about $0.034 per minute and streaming transcription (gpt-realtime-whisper) at about $0.017 per minute.
- **Gemini Live API.** A developer page that read Google's pricing page on 20 Oct 2026 lists:
  - audio input: $3 per 1M tokens (about $0.005 per minute);
  - audio output: $12 per 1M tokens (about $0.018 per minute);
  - image and video input: $1 per 1M tokens (about $0.002 per minute);
  - text: $0.75 per 1M in and $4.50 per 1M out;
  - audio counted at 25 tokens per second.
  
  One blog says the older preview models (Gemini 3.1 Flash Live Preview and the 2.5 Flash Native Audio preview) shut down in the Developer API on 17 Nov 2026. Sources: [TokenKarma](https://tokenkarma.app/blog/gemini-live-api-pricing-voice-agents-2026/); [Cekura](https://www.cekura.ai/blogs/gemini-live-api-pricing); [AIReiter](https://aireiter.com/es/blog/gemini-3-8-live-api-pricing).
- **Gemini Live models and languages.** Google's Vertex docs say the Live API supports 24 languages. They list gemini-live-2.5-flash-native-audio as GA, and a newer gemini-3.8-live as GA and recommended, with "seamless multilingual switching" — [Vertex AI Live API docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/live-api).
- **Response speed.** Codebridge's phone-agent benchmark measured the median time from the caller's last word to the first sound of the reply. A chain of Deepgram Flux, Groq and ElevenLabs came first at 706.8 ms, Gemini 3.1 Flash Live came next at 786.4 ms, and OpenAI Realtime models were further behind. It warns that how you measure changes the numbers by 300–1,700 ms — [Codebridge](https://www.codebridge.tech/articles/voice-ai-phone-agents-latency-benchmark). A single-author benchmark instead reported 95th-percentile times of about 281 ms (OpenAI Realtime) and about 295 ms (LiveKit + Gemini Live) — [DEV Community](https://dev.to/kenimo49/i-benchmarked-5-voice-ai-stacks-only-2-stayed-under-300ms-2bka). These two sources conflict.
- **Sarvam Voice Agents (formerly Samvaad).**
  - You can build, test and deploy calling agents on your own phone numbers, from ₹3 per minute.
  - They support 11 Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia and Assamese) plus English.
  - They were reportedly opened to all developers and small businesses after 350M real conversations.
  - Sarvam announced WhatsApp agents combining voice and chat in Sep 2025.
  
  Sources: [Sarvam docs](https://docs.sarvam.ai/voice-agents/introduction); [AlphaSignal](https://alphasignal.ai/news/sarvam-ai-opens-samvaad-to-developers-after-350m-real-conversations); [Sarvam on X](https://x.com/SarvamAI/status/1963548479500030279).

**Speech-to-text prices**
- **Groq Whisper:** large-v3 costs $0.111 per hour of audio and large-v3-turbo $0.04 per hour. Each request is billed for at least 10 seconds, and files can be up to 100 MB — [Groq docs: large-v3](https://console.groq.com/docs/model/whisper-large-v3); [Groq docs: turbo](https://console.groq.com/docs/model/whisper-large-v3-turbo).
- **Sarvam Saaras:** ₹30 per hour (about ₹0.49–0.5 per minute), or ₹45 per hour with speaker labels (diarization) — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/); [UsagePricing](https://www.usagepricing.com/blueprint/sarvam-ai).

**Quality of Hinglish and Indian-language speech recognition**
- **Saaras v3 features.** It covers 22 Indian languages, detects the language automatically, gives word timestamps and identifies speakers — [Republic World](https://www.republicworld.com/tech/sarvam-launches-saaras-v3-strengthens-lead-in-22-indian-language-speech-recognition); [explainx](https://explainx.ai/blog/sarvam-ai-capabilities-api-models-guide-2026).
- **Saaras v3 output modes.**
  - `codemix` keeps English words in Latin script and Indian words in native script, for example "मुझे flight बुक करनी है।".
  - The other modes are transcribe, translate (into English), verbatim and translit (Roman script).
  - The older Saarika v2.5 supports only basic transcription, and one doc snippet already mentions `saaras:v4`.
  
  Source: [Sarvam docs: output modes](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/how-to/select-output-mode.md).
- **Voice of India benchmark** (Josh Talks + AI4Bharat, paper Apr 2026). It uses 536 hours of unscripted phone speech from 36,691 speakers in 15 languages and 139 regional clusters, and tests 14 systems. It finds that public benchmarks like FLEURS overstate real-world accuracy. Launch coverage says Sarvam's speech recognition ("Sarvam Audio") ranked first or second in most languages, with error rates of 20–30% for Bhojpuri against under 10% for standard Hindi — [arXiv 2604.19151](https://arxiv.org/pdf/2604.19151); [CXOToday](https://cxotoday.com/media-coverage/global-speech-ai-struggles-to-understand-india-new-national-benchmark-voice-of-india-reveals/).
- **ElevenLabs Scribe v2 report.** A later draft report on a Josh Talks domain gives Scribe v2 error rates (OI-WER) from 5.9% for Hindi to 19.6% for Telugu, and says only Saaras v3 and Gemini 3 Pro match it on Hindi — [Josh Talks report](https://elevenlabsreport.ai.joshtalks.com/). The OI-WER metric accepts valid spelling variants, such as "doctor" written in Latin or in Devanagari — [Voice of India blog](https://voiceofindiablogs.ai.joshtalks.com/).
- **Hindi–English code-switching test.** On CS-FLEURS, Trelis measured word error rates under one protocol: Tara 8.37, ElevenLabs Scribe v2 7.57 and Sarvam Saaras v3 16.47. It scored against Devanagari references, which can penalise code-mix output — [Trelis Tara model card](https://huggingface.co/Trelis/tara).
- **Other benchmarks:**
  - HiACC (a Hinglish corpus of adults and children): standard Whisper and Wav2Vec2 models trained on single-language data underperform by about 42% WER on its test set — [HiACC (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12329218/).
  - Deepgram, a vendor, reports Hinglish error rates from 26.97% to 69.53% across models on the same audio — [Deepgram](https://deepgram.com/blog/hinglish-voice-ai-speech-recognition).
  - Vaani (Hindi): background speech was hardest, Google Chirp 3 did best, and Whisper large-v3 was much worse — [Vaani arXiv](https://arxiv.org/pdf/2606.21408).
  - Older baseline: across Vistaar's 59 benchmarks, AI4Bharat's IndicWhisper had the lowest error rate on 39 — [arXiv 2305.15386](https://arxiv.org/abs/2305.15386).

**Products and browser limits**
- **ChatGPT** has a camera "video call" mode — [Wonder Tools](https://wondertools.substack.com/p/turn-ai-into-your-personal-tutor).
- **PhysicsWallah's AI Guru** reportedly handled 3M+ voice queries in one month (company claim, Jun 2026) — [Business Today](https://www.businesstoday.in/technology/story/why-physicswallah-believes-it-can-beat-openai-google-in-indias-ai-tutor-race-534212-2026-06-01).
- **Safari speech recognition.** Safari added Web Speech recognition in iOS 14.5, using Apple's cloud service. A later note from the same author says it does NOT work in home-screen (standalone) PWAs — [firt.dev](https://firt.dev/ios-14.5/).
- **Kelvra today.** Kelvra's spoken answers use the browser's `SpeechRecognition`/`webkitSpeechRecognition` — [src/pages/AnswerPage.jsx](/home/user/kelvra/src/pages/AnswerPage.jsx).

### Inferences
- **Cost of a 10-minute tutoring session.** I assume about 5 minutes of student speech and about 5 minutes of AI speech. Realtime figures leave out reprocessed context and may also bill for silence, so per-minute costs land around ₹1–1.5 except for the last two rows.

  | Setup | Approx. cost per 10-min session |
  |---|---|
  | Groq Whisper-turbo + gpt-oss on Groq + Gemini Flash TTS | about ₹7 |
  | Sarvam Saaras + Bulbul V4 Flash | ₹11–12 |
  | Sarvam Saaras + Bulbul v3 | ₹15–16 |
  | Gemini Live | about $0.12 (about ₹10) |
  | OpenAI realtime-mini | about $0.15 (about ₹13) |
  | OpenAI main realtime model | about $0.48 (about ₹42) |
  | Sarvam Voice Agents | about ₹30 |

- **The push-to-talk chain fits Kelvra best.** The flow is: record with MediaRecorder, upload to `/api`, then speech-to-text, LLM and TTS. It reuses Kelvra's proxy, sign-in check and per-student limits, works in every PWA, and removes the iOS standalone speech-recognition gap. I estimate 1–2 s per turn (not measured), which is fine for a viva or examiner format where people take turns anyway.
- **Full real-time needs a different setup.** Interruptions and backchannel need the browser to connect straight to OpenAI or Google over WebRTC/WebSocket, using short-lived tokens issued by Kelvra's server, because a Vercel function cannot hold a long-lived socket (check each vendor's current ephemeral-token docs). Frequent model churn, such as the preview shutdowns on 17 Nov 2026, is a real maintenance cost for a small team.
- **Hinglish speech-to-text bake-off.** Compare Saaras v3 `codemix` with Groq Whisper (large-v3 and turbo) on 30–50 recorded student answers. Groq is about 3–8 times cheaper per hour, but every benchmark found shows Whisper-family models getting worse on code-mixed, noisy, accented Indian speech.
- **Teen safety.**
  - Voice recordings of minors are personal data, so DPDP parental consent applies (section 10).
  - Keep audio only long enough to transcribe it, then delete it.
  - Say clearly that the tutor is an AI, and cap session length.
  - Add an escalation path for distress or self-harm signals, given the exam-stress context.

### Gaps
- No independent Hinglish error rate was found for Whisper large-v3 or turbo as hosted by Groq, and no Saarika or Saaras numbers on a dataset of student speech.
- It is unconfirmed whether Tamil, Telugu, Bengali and Marathi are among Gemini Live's 24 languages, and how good OpenAI Realtime is in Hindi or Hinglish.
- Official docs were not checked for whether realtime APIs bill silent streamed audio, or how much reprocessed context adds to the bill.
- ElevenLabs Scribe v2 pricing was not retrieved.

## 3. Visual explanations: diagrams, explainer animations/video, mnemonic images

### Takeaway
The practical sweet spot is visuals drawn by code in the browser (Mermaid, SVG or canvas) from LLM output. They cost almost nothing extra on a text model, they come out the same every time, they can be edited, and they show Indian scripts correctly because the browser's own fonts draw the text.

AI-generated video (Veo 3.1 Fast at about $0.10 per second; the Sora 2 API was reportedly shut down in Sep 2026) costs about $3 for a 30-second clip, so it only suits a pre-made shared library, not videos made per student. Pipelines where an LLM writes Manim animation code work in research (93.8% of videos rendered) but need a Python/LaTeX/ffmpeg render server and still have layout glitches. AI images for mnemonics are cheap ($0.005–0.04 each), but Devanagari text inside generated images is unreliable, so put any text on top in HTML.

### Cited Findings
**Who already does it**
- **NotebookLM Video Overviews.**
  - The narrated slide-style "Explainer" format expanded to 80 languages in Aug 2025, including Hindi, Marathi, Tamil, Telugu, Gujarati, Kannada and Malayalam — [Google blog](https://blog.google/technology/google-labs/notebook-lm-audio-video-overviews-more-languages-longer-content/); [TechRadar](https://www.techradar.com/ai-platforms-assistants/gemini/google-notebooklm-goes-global-with-multilingual-ai-video-summaries-of-your-notes).
  - A 60-second vertical "Short" format began rolling out on 30 Jun 2026 to Google AI Ultra and Pro subscribers. It is English first, with no date for other languages. A longer "Cinematic" format runs about 1–3 minutes — [eesel](https://www.eesel.ai/blog/notebooklm-short-video-overviews).
  - Google's help page still lists only Explainer and Brief — [NotebookLM Help](https://support.google.com/notebooklm/answer/16454555).
  - One commentator says Short turns "studying into doom scrolling" — [Pillitteri](https://pasqualepillitteri.it/en/news/6883/notebooklm-short-video-overviews-en).
- **Gemini Guided Learning** (Aug 2025) adds images, diagrams, videos and interactive quizzes to tutoring — [TechCrunch](https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/).
- **Google Learn Your Way** (Google Research/Labs, Sep 2025) turns a textbook chapter into personalised rewrites, mind maps, lecture-style slides and quizzes. In a randomised trial with 60 Chicago-area students aged 15–18:
  - users scored 77% against 68% for a PDF reader right after studying;
  - they scored 11% higher on a memory test 3–5 days later;
  - 93% wanted to use it again, against 67% for the PDF reader.
  
  The trial covered one chapter, and it is unclear which feature drove the gains — [Google blog](https://blog.google/products-and-platforms/products/education/learn-your-way/); [paper (PDF)](https://services.google.com/fh/files/misc/ai_augmented_textbook.pdf); [Maginative](https://www.maginative.com/article/learn-your-way-googles-new-ai-transforms-static-textbooks-into-interactive-personalized-lessons/).

**Visuals drawn by code**
- **TheoremExplainAgent** (ACL 2025): one agent plans the storyboard and narration, and another writes Manim scripts, producing theorem videos over 5 minutes long. The o3-mini version rendered successfully 93.8% of the time (overall score 0.77) on 240 STEM theorems, but most videos had minor layout problems. "Success" means the video rendered, not that it was flawless — [arXiv 2502.19400](https://arxiv.org/abs/2502.19400).
- **MermaidSeqBench** (IBM, NeurIPS 2025 workshop) is the first benchmark for turning plain language into Mermaid (sequence diagrams only, 132 samples), graded by an LLM judge. It reports large differences between models, but I did not retrieve per-model syntax-error rates — [arXiv 2511.14967](https://arxiv.org/abs/2511.14967).

**Cost of AI-generated video**
- **Veo 3.1 Fast** (Gemini API, prices read 11 Sep 2026):
  - $0.10 per second at 720p, after a cut from $0.15 on 7 Apr 2026;
  - $0.12 per second at 1080p and $0.30 at 4K;
  - audio is included.
  
  A cheaper Veo 3.1 Lite exists at $0.03–0.05 per second (sources conflict) — [invideo](https://invideo.io/blog/ai-video-model-pricing); [Skila/DEV](https://dev.to/skilaai/google-just-made-ai-video-50-cheaper-openai-killed-sora-heres-the-new-pricing-math-1ag4); [Skila Veo Lite](https://news.skila.ai/article/veo-3-1-lite-ai-video-pricing-comparison-2026).
- **Sora 2 API:** $0.10 per second at 720p. Sora 2 Pro costs $0.30 per second at 720p and $0.70 at 1080p. One source says the Sora API was being shut down on 24 Sep 2026 — [Skila/DEV](https://dev.to/skilaai/google-just-made-ai-video-50-cheaper-openai-killed-sora-heres-the-new-pricing-math-1ag4); [OpenRouter](https://openrouter.ai/compare/google/veo-3.1-fast/openai/sora-2-pro).

**AI images for mnemonics**
- **Approximate price per image** (third-party, 2026):
  - GPT Image 1 Mini: about $0.005 at low quality to about $0.036 at high quality.
  - Imagen 4 Fast: about $0.02. Imagen 4 Standard: about $0.04.
  - Gemini 2.5 Flash Image: about $0.039.
  - Gemini 3.1 Flash Image ("Nano Banana 2"): about $0.04–0.08, depending on resolution and host.
  
  Sources: [IntuitionLabs](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai); [PricePerToken](https://pricepertoken.com/imagen-pricing); [TokenCost](https://tokencost.app/models/gemini-3-1-flash-image); [MeowApps](https://meowapps.com/ai-image-model-comparison/).
- **Devanagari text inside generated images.** gpt-image-2 (ChatGPT Images 2.0) reportedly writes legible Hindi on billboards and packaging, but longer text adds errors and accuracy is not guaranteed. Qwen-Image is reported to handle vowel signs (matras) and joined letters (conjuncts). I found no benchmark of Gemini image models on Indian scripts — [Logicity](https://logicity.in/en/blog/chatgpt-images-2-0-handles-hindi-text-and-code-prompts); [Framia](https://framia.converge.ai/page/en-US/news/gpt-image-2-multilingual-text-rendering); [DEV Community](https://dev.to/alanwest/openai-just-shipped-an-image-model-that-thinks-before-it-draws-free-tier-gets-it-day-one-576n); [C# Corner](https://www.c-sharpcorner.com/article/qwen-image-finally-an-ai-that-actually-understands-text-in-images).
- **Kelvra today.** Kelvra's Groq proxy has only a text model and an image-reading model, with no image generation — [api/groq.js](/home/user/kelvra/api/groq.js).

### Inferences
- **Explanations made per student.** Draw the visuals in the browser from structured LLM output:
  - Mermaid for flows and hierarchies;
  - SVG or canvas for geometry and physics;
  - step lists that animate in sync with TTS.
  
  The extra cost is a few thousand Groq tokens. Labels in any Indian script display correctly, and failures are easy to catch: a Mermaid parse error can trigger an automatic retry.
- **AI-generated video.** A 30-second Veo 3.1 Fast clip costs about $3 (about ₹260). That only makes sense for a curated, reused library, for example the top 100 "wow" phenomena. Generated video can also show physically impossible things.
- **Manim** needs a server with Python, LaTeX and ffmpeg, which does not fit Vercel serverless. It is only feasible as an offline batch job for a fixed library.
- **Mnemonic images.**
  - Generate the scene without text and add Hindi or Tamil captions on top in HTML.
  - Use GPT Image 1 Mini (low quality) or Imagen 4 Fast to keep costs down.
  - This needs a second vendor plus image moderation suitable for teens.
  - Under India's 2026 IT Rules, AI images and videos should carry a visible "AI-generated" label (section 10).

### Gaps
- No data on how reliably gpt-oss-120b (Kelvra's model) writes Mermaid or SVG. MermaidSeqBench's per-model results were not retrieved.
- No learning-outcome evidence specifically for AI-generated mnemonic images.
- Free-tier access for Veo, Imagen and Gemini image models is unclear: third-party sources say image and video models are paid-only on the Gemini API, but they conflict.
- How long Veo and Sora take to generate a clip was not found.

## 4. Interactive simulations and mini-games generated from notes ("learn by doing")

### Takeaway
General assistants can already build interactive widgets: Gemini Canvas makes quizzes and ready-to-embed HTML simulations. None of them link to Indian syllabi or to a student's own notes and mastery data. A safe, workable version for Kelvra is a set of tested templates whose content the LLM fills in, run in a sandboxed iframe, rather than letting the LLM write any code it likes.

The best evidence that interactive, multi-format versions of material help is Google's Learn Your Way trial. It is small (60 students), and it does not show which part of the tool made the difference.

### Cited Findings
- **Gemini Canvas.** It can build interactive quizzes from uploaded notes (multiple choice, true/false, and fill-in-the-blank with instant feedback). It can also produce ready-to-embed HTML simulations — [MSPowerUser](https://mspoweruser.com/googles-gemini-app-introduces-canvas-quizzes-for-interactive-learning); [Glow Connect](https://glowconnect.org.uk/personalise-learning-with-quizzes-available-through-canvas-in-gemini/); [Google Skills course](https://www.skills.google/course_templates/1468?locale=ja).
  - A Jan 2026 tutorial describes a study flow: set a goal, make a study guide, build interactive prototypes of the concepts, take a quiz, then listen to an audio overview — [Lilys](https://lilys.ai/notes/en/gemini-canvas-20260128/teach-yourself-apis-gemini-canvas).
  - In a third-party example, a user built a 3D solar system in Canvas — [TaxHeal](https://www.taxheal.com/?p=110764).
- **ChatGPT Study Mode** (29 Jul 2025, on every plan including Free) uses Socratic questioning. **Gemini Guided Learning** (6 Aug 2025) adds interactive quizzes, images and video — [TechCrunch](https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/); [Pearson](https://pearson.com/international-schools/international-schools-blog/2026/02/what-is-gemini_s-guided-learning-and-chatgpts-study-mode-.html).
- **Learn Your Way's** interactive, multi-format version beat a PDF reader in a small randomised trial (details in section 3) — [Google blog](https://blog.google/products-and-platforms/products/education/learn-your-way/).
- **Kelvra's current security headers** already stop other sites from embedding Kelvra (`X-Frame-Options: DENY`) and allow camera and microphone only for Kelvra's own origin (`Permissions-Policy: camera=(self), microphone=(self)`) — [vercel.json](/home/user/kelvra/vercel.json).

### Inferences
- **Keeping generated widgets safe:**
  - Run LLM-written HTML/JS only inside `<iframe sandbox="allow-scripts" srcdoc=…>`, and **never** add `allow-same-origin`. That way the widget cannot read Kelvra's Firebase tokens or local storage.
  - Add a strict CSP inside the srcdoc that blocks network calls.
  - Talk to the widget only through `postMessage`.
  
  This is standard web-security practice; check the implementation.
- **Reliability.** Instead of fully free-form code, keep a library of about 20–40 hand-checked simulation templates and let the LLM pick one and fill in the parameters, labels and challenge questions from the student's notes. Examples: projectile motion, circuits, titration curves, supply–demand, Punnett squares, history timelines. Keep free-form generation as an "explore" mode with an "experimental" badge.
- **Curiosity hooks:**
  - "Predict, then run": the student guesses the outcome before running the simulation.
  - "Break it" challenges.
  - The next template unlocks when the student masters the quiz.
- **Feasibility.** It runs on the current text-only stack. The main costs are checking quality and writing templates. The main teaching risk is physics or chemistry mistakes in generated widgets.

### Gaps
- No evidence on learning outcomes from LLM-generated simulations specifically.
- No data on how reliably gpt-oss-120b writes HTML/JS.
- I did not verify whether Indian teens use Claude Artifacts or Gemini Canvas, or how much.

## 5. Roleplay and debate: historical figures, "be the examiner", AI debate opponents

### Takeaway
Roleplay sparks the most curiosity but carries the most risk for 14–17-year-olds:

- Character.AI ended open-ended chats for under-18s in Nov 2025.
- California now regulates companion chatbots used by minors: SB 243 from Jan 2026, and SB 1119 ("Adam's Law"), signed Sep 2026.
- India's IT Rules, in force since 20 Feb 2026, require labels on synthetic audio and video.

There is little evidence that historical-figure chatbots improve learning, and educators warn about made-up "quotes" delivered in a trusted voice. Safer high-value versions are:

- an AI examiner or interviewer (a role, not a real person);
- debating the AI on syllabus topics;
- an "interview the record" format where the AI narrates with citations instead of speaking as a real person in the first person or in their voice.

### Cited Findings
- **Character.AI.** From 25 Nov 2025 it barred under-18 users from open-ended chats with its characters, with a two-hour daily limit that shrank until then. It added age-assurance tools, funded an independent nonprofit "AI Safety Lab", and moved minors to creative tools such as videos and stories. Coverage links the change to lawsuits, including the suicide of a 14-year-old who had become emotionally attached to a chatbot — [CO/AI](https://getcoai.com/news/character-ai-bans-users-under-18-from-open-ended-chats-amid-safety-lawsuits); [WJLA](https://wjla.com/news/nation-world/characterai-to-block-kids-from-interacting-with-chatbots-amid-safety-concerns); [MediaNama](https://www.medianama.com/2025/10/223-character-ai-teen-chats-ai-safety-lab/); [Law360/MLex](https://www.law360.com/mlex/technology/articles/2405162/character-ai-to-introduce-age-assurance-block-under-18s-from-general-chat).
- **US scrutiny.** The FTC opened an inquiry into chatbot safety (Sep 2025) covering Character.AI, OpenAI and others, and Senators Hawley and Blumenthal introduced a bill to ban AI companions for minors — [WJLA](https://wjla.com/news/nation-world/characterai-to-block-kids-from-interacting-with-chatbots-amid-safety-concerns).
- **California SB 243** (signed 13 Oct 2025, in force 1 Jan 2026) covers "companion chatbots" and excludes customer-service and technical bots. It requires:
  - telling users they are talking to an AI;
  - reminders every 3 hours for users known to be minors;
  - procedures to stop suicide or self-harm content and refer users to crisis services.
  
  Sources: [Tech.co](https://tech.co/news/landmark-california-bill-regulate-ai-chatbots); [Decrypt](https://decrypt.co/344068/california-ai-companion-chatbots-regulation).
- **California SB 1119 ("Adam's Law",** signed 10 Sep 2026) bars chatbots from:
  - claiming a special understanding of a child;
  - pushing purchases as necessary to keep the relationship going;
  - encouraging children to get around parental controls or hide their use.
  
  It reportedly also requires age verification, risk assessments and parental controls — [ZwillGen](https://www.zwillgen.com/artificial-intelligence/adams-law-california-raises-the-bar-for-child-chatbot-protections/). OpenAI backed SB 1119 and pointed to its parental controls, age prediction, Teen Safety Blueprint and Under-18 Principles — [Unite.AI](https://www.unite.ai/openai-backs-california-bill-on-youth-safety-rules-for-companion-chatbots/).
- **Historical-figure chatbots.** One educator argues that putting information "in the mouths of historical figures" for students who cannot yet judge it is a serious problem, and asks what happens when a made-up claim arrives "in the voice of George Washington." A 2023 investigation found a GPT-3 app imitating historical figures made factual errors and had figures "express regret" for atrocities — [Engaged Education](https://engagededucation.substack.com/p/just-say-no-to-historical-figure); [Bunk History](https://www.bunkhistory.org/resources/ai-chatbot-mimics-anyone-in-history-but-gets-a-lot-wrong-experts-say). Research so far is mostly prototypes and small studies that report engagement, not measured learning gains — [Immersive Learning Research](https://publications.immersivelrn.org/index.php/academic/article/view/213); [arXiv 2511.06078 (review)](https://arxiv.org/pdf/2511.06078).
- **India's IT Amendment Rules 2026** (notified 10 Feb, in force 20 Feb 2026) define "synthetically generated information": audio or visual content made by computer so that it appears real. They require prominent labels (visible marks on images and video, spoken disclosures on audio) and 3-hour takedowns for certain harmful content — [Business Today](https://www.businesstoday.in/technology/story/govt-tightens-rules-on-ai-generated-content-mandates-labels-and-faster-takedowns-515505-2026-02-10); [Freshfields](https://technologyquotient.freshfields.com/post/102mjwn/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026).
- **Kelvra today.** Kelvra already has an answer-writing coach that marks against rubric points, plus an AI tutor, a mentor and a mistake notebook — [README](/home/user/kelvra/README.md).

### Inferences
- **Roles by risk:**
  - Low risk: "examiner/interviewer", "debate opponent", and "confused junior student you must teach". These are roles, not real people.
  - High risk: speaking in the first person as real historical or living people, especially with synthetic voices or images. That adds impersonation, deepfake-labelling duties and made-up quotes.
- **If Kelvra does history encounters,** use a "time-travelling reporter interviewing the record" format:
  - the AI narrates in the third person;
  - it quotes only cited passages it has looked up, and shows the sources inline;
  - it is labelled "AI simulation" and is text-first, with no cloned or sound-alike voice;
  - it refuses off-syllabus or emotional, companion-style turns.
- **Debate Arena.**
  - Use curated motions from the syllabus (UPSC GS and essay, CLAT, group discussions and interviews).
  - The AI makes the strongest case for each side in turn and scores the student's structure, evidence and logical fallacies.
  - Avoid open-ended political or religious debates for under-18s, and never steer students towards personal beliefs.
- **Safeguards by default.** Apply SB 243-style protections even though Indian law does not require them:
  - tell users they are talking to an AI;
  - session caps and reminders;
  - no relationship-building language;
  - a crisis-response procedure;
  - parental visibility for under-18 accounts.

### Gaps
- No rigorous evidence (randomised trials) that roleplay with historical figures, or debating an AI, improves exam results for Indian students.
- I found no Indian law specifically protecting minors from chatbots beyond DPDP and the IT Rules. Whether the IT Rules labelling duties apply to content a study app generates needs legal confirmation.

## 6. Camera / AR: point the phone at a textbook page or real object

### Takeaway
Pointing the camera at something and asking about it is now free and common:

- Google Lens answers questions about diagrams in Indian languages.
- Gemini Live's camera mode is free on Android and iOS.
- ChatGPT has a video mode.

So Kelvra's edge has to be what happens after the photo: linking it to the student's notes, an automatic quiz, the knowledge map, and audio in the student's own language.

- Taking a photo works in any PWA.
- Continuous live-video tutoring is possible through Gemini Live (about $0.002 per minute of video input, plus audio), but it adds a vendor and complexity.
- True AR, with 3D labels fixed to real objects, needs native ARKit or ARCore. I found no evidence of WebXR on iOS.
- Kelvra's current image-reading path depends on a Groq preview model.

### Cited Findings
- **Gemini Live camera and screen sharing** became free for all Android users in Apr 2025 and rolled out to iOS from Google I/O 2025. Google says Gemini Live does not store camera or screen-sharing data without explicit consent. Tom's Guide demonstrates the prompt "explain how to solve this math problem" — [9to5Google](https://9to5google.com/2025/04/16/gemini-live-camera-free/); [Tom's Guide](https://tomsguide.com/ai/google-gemini/gemini-live-is-free-for-iphone-users-heres-how-to-share-your-screen-and-camera).
- **Google Lens in India** (Nov 2025): students can ask questions about diagrams and visuals directly in Lens, in several Indian languages — [Business Today](https://www.businesstoday.in/technology/news/story/google-showcases-9-ai-learning-tools-to-transform-how-students-study-501407-2025-11-10). Lens has given step-by-step maths help from a photo since 2020 — [CRN India](https://www.crn.in/?p=40248).
- **ChatGPT** has a camera "video call" mode — [Wonder Tools](https://wondertools.substack.com/p/turn-ai-into-your-personal-tutor).
- **Gemini Live API** charges about $1 per 1M tokens for image and video input, roughly $0.002 per minute of video — [TokenKarma](https://tokenkarma.app/blog/gemini-live-api-pricing-voice-agents-2026/).
- **iOS PWA limits:**
  - A long-running WebKit bug blocked camera access (getUserMedia/WebRTC) in home-screen web apps. That is historical, and the current status is unverified — [WebKit Bugzilla 185448](https://bugs.webkit.org/show_bug.cgi?id=185448).
  - Apple removed standalone PWA mode for EU users from iOS 17.4, and every iOS browser must use WebKit — [MagicBell](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide).
  - I found no source showing WebXR support on iOS.
- **Kelvra's image-reading model** is the Groq preview `qwen/qwen3.8-27b`. The code describes it as "the only Groq model that reads images (Oct 2026)", and the README warns Groq "may retire [it] at short notice" — [api/groq.js](/home/user/kelvra/api/groq.js); [README](/home/user/kelvra/README.md).

### Inferences
- **Taking a photo** (`<input type="file" accept="image/*" capture>` or a still from getUserMedia) works everywhere in a PWA and already matches Kelvra's photo and handwriting pipeline. Live, continuous video tutoring adds a second vendor (Gemini Live) and the real-time complexity described in section 2.
- **"AR" in a PWA** should mean 2D overlays: draw labels and arrows on the captured photo using coordinates returned by the model ("label the parts of this flower diagram"). Labels anchored to real objects in 3D need native ARKit or ARCore.
- **Where Kelvra adds value.** Lens and Gemini already explain a photo for free, so Kelvra's value is the follow-through:
  - link the photo to the student's notes and syllabus;
  - generate 3 recall questions;
  - add the concept to the knowledge map;
  - offer the explanation as audio in the student's language.
- **Dependency risk.** Image reading relies on a preview Groq model, so keep a fallback image-reading provider (for example Gemini Flash) ready.
- **Safety.**
  - Photos may show faces, home interiors or other students' work.
  - Process them and then discard them, and strip EXIF location data.
  - Never train on uploads, and warn students not to photograph people.

### Gaps
- The 2026 status of camera and speech in iOS home-screen PWAs is unverified and needs testing on real devices.
- No accuracy data on Groq's preview vision model, or any other, for locating parts (bounding boxes) in Indian textbook diagrams.

## 7. Personal knowledge graphs / concept maps ("what you know vs don't know")

### Takeaway
LLMs can pull usable concept maps out of text. One study scored an F1 of about 0.83 against maps made by teachers, and a review of 28 studies finds promise but flags problems with validity and with languages other than English. NotebookLM already has mind maps grounded in your sources.

What is rare is a map of the student's own notes, coloured by how well they actually know each concept: a "fog of war" over the parts they have not mastered yet, which then suggests what to study next. Kelvra can build this cheaply on top of its existing quizzes, spaced-repetition deck and mistake notebook. The main limit is DPDP: profiling and behavioural monitoring of under-18s are restricted. There are exemptions for education, but it is unclear whether they cover an edtech app, so Kelvra needs legal review and must use the data only for learning.

### Cited Findings
- **Review of 28 studies.** A systematic review of LLM-generated concept maps found methods ranging from human-in-the-loop systems to prompt-engineered LLMs. Studies validated maps with precision, recall and semantic similarity, or with expert and learner review. It calls LLM maps promising for "scalable, adaptive, and pedagogically relevant" visualisation, but flags problems with validity, interpretability, multilingual use and classroom integration — [Stanford SCALE repository (Zhai review)](https://scale.stanford.edu/ai/repository/generative-large-language-models-knowledge-representation-systematic-review-concept); [Moonlight summary](https://www.themoonlight.io/review/generative-large-language-models-for-knowledge-representation-a-systematic-review-of-concept-map-generation).
- **Han & Choi (BEA 2025).** GPT-4o-mini pulled concepts and relationships out of texts in 10 subjects. In a user study of 14 people, concept maps cut perceived mental effort by 31.5%, even though participants spent 22.6% more time — [Emory NLP](https://emorynlp.github.io/papers/2025-bea-han/); [ACL Anthology](https://preview.aclanthology.org/setup/2025.bea-1.58).
- **E-book concept maps.** A framework built from e-books compared GPT concepts with teacher concepts: precision 0.80, recall 0.86, F1 0.83. It often mixed side concepts in with core ones. This is a secondary, auto-translated summary — [Scrapbox summary](https://scrapbox.io/nishio-en/A%20Framework%20for%20Constructing%20Concept%20Maps%20from%20E-Books%20Using%20Large%20Language%20Models%3A%20Challenges%20and%20Future%20Directions).
- **NotebookLM Mind Maps** show how the topics in your sources connect, and clicking a node shows the source text behind it — [AVID Open Access](https://avidopenaccess.org/resource/the-continued-evolution-of-notebooklm/); [ScriptByAI](https://www.scriptbyai.com/google-notebooklm). Learn Your Way also includes mind maps — [Maginative](https://www.maginative.com/article/learn-your-way-googles-new-ai-transforms-static-textbooks-into-interactive-personalized-lessons/).
- **Data Kelvra already has.** Kelvra keeps every wrong quiz answer by topic in a mistake notebook, runs a spaced-repetition review deck (simplified SM-2), records confidence ratings, and lets the mentor read quiz scores and weak topics — [README](/home/user/kelvra/README.md).
- **India's DPDP Rules** (notified Nov 2025):
  - consent from a verified parent is required before processing data of anyone under 18;
  - most obligations phase in over 18 months, so around mid-2027;
  - commentary says tracking, behavioural monitoring and targeted advertising aimed at children are banned;
  - there are exemptions for educational institutions' own teaching activities, but their scope for third-party edtech is unclear.
  
  Sources: [Biometric Update](https://www.biometricupdate.com/202511/india-notifies-its-sweeping-digital-personal-data-protection-rules); [ORF](https://www.orfonline.org/expert-speak/dpdp-rules-and-the-future-of-child-data-safety); [K&S Partners](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/); [The Week](https://www.theweek.in/theweek/business/2025/12/20/indias-dpdp-rules-2025-a-deep-dive-into-the-new-data-privacy-law.html).

### Inferences
- **How to build it.**
  1. On each upload, gpt-oss-120b extracts JSON triples (concept, relation, concept) plus syllabus tags.
  2. Merge them into one graph per student in Firestore.
  3. Colour each node using evidence Kelvra already has (quiz results, mistake notebook, SM-2 due/lapse data, confidence ratings, answer-coach bands): mastered, shaky, untested or never seen.
  4. Draw the graph with a browser-side graph library.
  
  It only costs text tokens.
- **Curiosity hooks:**
  - a "fog of war" over untested areas;
  - LLM-generated "bridge" links between subjects as curiosity prompts, for example logarithms ↔ pH ↔ decibels;
  - one-tap "explain this link" micro-lessons;
  - a weekly "your map grew" recap.
- **Quality control.**
  - Let students edit and delete nodes.
  - Mark links the LLM inferred differently from links that come from the notes.
  - Show the source snippet for each node, as NotebookLM does.
- **DPDP.** A mastery map arguably counts as educational "tracking". Keep it strictly for the student's own learning: no ads, no selling data, and no profiling across apps. Get parental consent for under-18 accounts, let users export and delete their data, and get a legal opinion on whether the education exemption covers Kelvra.

### Gaps
- No study evaluates LLM concept maps built from students' own messy notes against learning outcomes.
- The quality of concept extraction in Hindi, Tamil and other Indian languages has not been measured.

## 8. Indian AI ecosystem: Sarvam, Krutrim, BharatGen, AI4Bharat, Bhashini

### Takeaway
Sarvam is the most practical Indian vendor for a small team:

- pay-as-you-go APIs billed in INR, with ₹100 free credit;
- Bulbul TTS at ₹30 per 10K characters (V4 Flash ₹20 per 10K);
- Saaras v3 speech-to-text at ₹30 per hour, with a code-mix mode;
- Voice Agents from ₹3 per minute;
- open-weight Sarvam 30B and 105B models under Apache 2.0.

The others:

- **AI4Bharat** offers free open models you can host yourself (Indic Parler-TTS, IndicF5, IndicConformer and IndicTrans2, under MIT or Apache licenses according to listings).
- **Bhashini** is free to register for, but is reportedly proof-of-concept only unless you have a paid arrangement.
- **BharatGen's Param2 17B** is open for research, but commercial use needs a separate arrangement.
- **Krutrim** looks unreliable to depend on.

### Cited Findings
**Sarvam AI**
- **Speech:** Saaras v3 speech-to-text (22 languages; code-mix, translate and transliteration modes) and Bulbul v3 TTS. Reports say Bulbul V4 was revealed at Sarvam's Epoch event (30 Jul 2026), and the docs already mention Saaras v4 and Bulbul v4 — [Republic World](https://www.republicworld.com/tech/sarvam-launches-saaras-v3-strengthens-lead-in-22-indian-language-speech-recognition); [explainx Epoch recap](https://explainx.ai/blog/sarvam-epoch-2026-announcements-bengaluru); [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/how-to/select-output-mode.md).
- **Language models:** Sarvam 30B and 105B were unveiled in Feb 2026 (India AI Impact Summit), and their weights were released under Apache 2.0 on Hugging Face and AIKosh in early Mar 2026. The 105B model is a mixture-of-experts model with about 10B parameters active at a time and a 128K context window — [Artificial Analysis](https://artificialanalysis.ai/articles/sarvam-105b-Sarvam-30b-everything-you-need-to-know).
- **Indus:** Sarvam launched the "Indus" consumer chat app on 20 Feb 2026 — [TechCrunch](https://techcrunch.com/2026/02/20/indias-sarvam-launches-indus-ai-chat-app-as-competition-heats-up/).
- **105B API pricing:** one source says 105B was free on Sarvam's API at launch, and per-token pricing was reported later (unconfirmed) — [explainx](https://explainx.ai/blog/sarvam-ai-capabilities-api-models-guide-2026); [UsagePricing](https://www.usagepricing.com/blueprint/sarvam-ai).
- **Prices and free credit** (see section 9): TTS ₹30 per 10K characters, speech-to-text ₹30 per hour, Voice Agents from ₹3 per minute, ₹100 free credit — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/); [Sarvam docs](https://docs.sarvam.ai/voice-agents/introduction).

**AI4Bharat (IIT Madras): open models**
- AIKosh lists these as MIT-licensed:
  - IndicConformer speech recognition (for example a 115M-parameter Indo-Aryan model);
  - IndicTrans2 translation (200M distilled and 1.1B versions);
  - IndicF5 TTS.
  
  The IndicTrans2 paper says its models and data were released under permissive licenses, unlike Meta's NLLB, which is non-commercial (CC-BY-NC) — [AIKosh IndicConformer](https://aikosh.indiaai.gov.in/home/models/details/indic_conformer_model_for_asr.html); [AIKosh IndicTrans2](https://aikosh.indiaai.gov.in/home/models/details/indic_trans2.html); [IndicTrans2 paper](https://arxiv.org/pdf/2305.16307.pdf).
- Indic Parler-TTS is covered in section 1.
- AI4Bharat and Josh Talks run the "Voice of India" evaluation platform, covering voice, language, vision and agents — [LetsDataScience](https://letsdatascience.com/news/ai4bharat-josh-talks-launch-voice-of-india-22587ebc).

**BharatGen (led by IIT Bombay, under the IndiaAI Mission)**
- **Param2 17B,** a multilingual mixture-of-experts model for 22 Indian languages, launched at the India AI Impact Summit (Feb 2026) — [Business Today](https://www.businesstoday.in/amp/technology/news/story/bharatgen-to-launch-17-billion-parameter-multilingual-ai-model-at-india-ai-impact-summit-515923-2026-02-12); [Voice&Data](https://www.voicendata.com/artificialintelligence/bharatgen-launches-17b-ai-model-in-22-indian-languages-11100173).
- **Param-1** is a 2.9B Hindi–English model — [AITopics (Param-1 paper)](https://aitopics.org/doc/arxivorg:E117C5D3).
- **Access and terms:** a June 2026 blog says the models are on Hugging Face but commercial use needs a separate arrangement, and independent benchmarks are limited — [JustBeingResourceful](https://justbeingresourceful.com/2026/06/19/bharatgen-iit-bombays-ai-that-thinks-in-indias-own-languages-2026/).

**Bhashini (MeitY)**
- Secondary sources say you get free API credentials by registering at bhashini.gov.in. One developer guide quotes Bhashini's docs as limiting API use to proof-of-concept, with production use through a paid arrangement. Bhashini has signalled that it plans to charge, and the code of its ULCA platform is MIT-licensed — [DEV Community](https://dev.to/mr_manushukla/22-scheduled-languages-one-app-what-indic-localization-actually-costs-to-ship-in-2026-12ag); [CDO Magazine](https://www.cdomagazine.tech/aiml/indian-govt-ai-translation-platform-bhashini-gears-up-for-monetization); [ULCA GitHub](https://github.com/bhashini-dibd/ulca).

**Indian edtech using these tools**
- **PhysicsWallah** uses ElevenLabs TTS in "Ask AI". Its AI Guru (part of the Alakh AI suite) claims:
  - 100M+ questions solved;
  - 2M+ answer sheets graded;
  - 3M+ voice queries in one month;
  - about 4.5M doubts a month, per a Mar 2026 NSE filing.
  
  It works with Microsoft Research on step-by-step problem solving and plans a full one-to-one AI tutor later in 2026 — [Business Today](https://www.businesstoday.in/technology/story/why-physicswallah-believes-it-can-beat-openai-google-in-indias-ai-tutor-race-534212-2026-06-01); [NSE filing](https://nsearchives.nseindia.com/corporate/NEAPSPW_23032026203839_Intimation_Press_Release_Vishwas_Diwas_Final_Signed.pdf); [Microsoft Research](https://www.microsoft.com/en-us/research/?p=1128279); [ElevenLabs](https://elevenlabs.io/hi/blog/physicswallah).

### Inferences
- **A practical stack for Kelvra.** Keep Groq for text. For Indian-language speech, add either Sarvam (Saaras speech-to-text and Bulbul TTS) or Google (Gemini TTS or Live, which had the best-rated multi-speaker Hindi). Decide after a one-week listening and accuracy bake-off.
- **Sarvam's advantages.** INR billing and an Indian company may make buying and data-location discussions easier. Check Sarvam's terms on keeping and training on minors' audio first.
- **AI4Bharat** open models set a credible cost floor if volume grows, since Kelvra could host them itself on a GPU. Self-hosting needs ML-ops skills a small team may not have.
- **Bhashini and BharatGen** should not be production dependencies without a signed arrangement.

### Gaps
- Sarvam's terms on keeping customer audio, training on it, and minors' data were not retrieved. Sarvam's LLM API pricing is unverified.
- **Krutrim:** I found no reliable 2026 source on its API pricing or status. One search summary said its consumer assistant was withdrawn in Apr 2026, but I could not trace or verify the source.
- Bhashini's production pricing and SLAs are unknown. A search summary said private companies use Bhashini-like names; this is unverified, so check domains carefully.
- Param2's commercial terms and its quality on Indian-language benchmarks are unverified.

## 9. Costs, latency and free tiers (consolidated, dated)

### Takeaway
Indicative unit costs, all approximate as of late 2026:

| Item | Approx. cost |
|---|---|
| TTS | ₹1,000–3,000 per 1M characters with Sarvam, about $30 per 1M with Google Chirp 3 HD, $40–100 per 1M with ElevenLabs |
| Speech-to-text | $0.04–0.11 per hour on Groq Whisper; ₹30 per hour on Sarvam |
| Real-time voice | about ₹0.5–4 per conversational minute |
| Images | $0.005–0.08 each |
| Video | about $0.10 per second |

Text on Groq stays the cheap backbone. Audio and video need caching, per-user limits, and probably a paid tier.

### Cited Findings
**Text-to-speech**

| Service | Indian-language support (as found) | Price (date reported) | Free tier | Latency notes | Sources |
|---|---|---|---|---|---|
| Sarvam Bulbul v3 | Indian voices; study covered 11 languages | ₹30 per 10K characters, which is ₹3,000 per 1M, about US$34 (17 Sep 2026) | ₹100 credit for new accounts | — | [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/); [Sarvam](https://www.sarvam.ai/text-to-speech) |
| Sarvam Bulbul V4 Flash | Indian voices | ₹20 per 10K list; ₹10 per 10K launch price until 12 Nov 2026 | same credit | "under 250 ms" (vendor claim) | [Analytics Insight](https://www.analyticsinsight.net/artificial-intelligence/sarvam-ai-bulbul-v4-flash-real-time-voice-model-for-indian-languages); [ArtRealm](https://artrealmai.com/article/sarvam-bulbul-v4-flash-indian-tts-api) |
| Google Gemini 2.5 Flash TTS (3.1 Flash recommended) | Hindi GA; up to 2 speakers | $0.50 per 1M input tokens; $10 per 1M audio-output tokens (2026 guide) | unclear | — | [invideo](https://invideo.io/blog/gemini-tts-ai-voice/); [Google docs](https://cloud.google.com/text-to-speech/docs/gemini-tts) |
| Google Cloud Chirp 3 HD | Indian locales not confirmed | $30 per 1M characters (older tiers $16) | 1M characters a month | — | [Google pricing](https://cloud.google.com/text-to-speech/pricing); [DIYAI](https://diyai.io/ai-tools/audio-generation/google-cloud-text-to-speech-pricing/) |
| Azure Neural / Neural HD | not confirmed | about $15–16 per 1M; HD about $22 per 1M (2026) | F0 about 500K characters a month (sources conflict) | — | [TextToLab](https://texttolab.com/blog/azure-text-to-speech-pricing); [PerkStack](https://perkstack.co/blog/cheapest-azure-tts-api) |
| ElevenLabs Flash v2.5 / Eleven v3 | 32 / 70+ languages; Hindi via GenFM | about $40–50 per 1M / about $80–100 per 1M (trackers, Nov 2026) | not retrieved | Flash about 75 ms (third-party) | [Stork](https://www.stork.ai/blog/fr/elevenlabs-api-key-and-pricing-2026); [Puter](https://developer.puter.com/tutorials/elevenlabs-api-pricing/); [Apiframe](https://apiframe.ai/guides/elevenlabs-api-guide) |
| OpenAI gpt-4o-mini-tts | English-centric (a vendor's view) | about $0.015 per minute | — | — | [Eden AI](https://www.edenai.co/expert-models/openai-gpt-4o-mini-tts) |
| Groq Orpheus | English and Arabic only | $22 per 1M (English); $40 per 1M (Arabic) (Oct 2026) | — | — | [CloudZero](https://www.cloudzero.com/blog/groq-pricing/); [Maximem](https://www.maximem.ai/blog/groq-api-pricing-2026) |
| AI4Bharat Indic Parler-TTS / IndicF5 | 20 Indian languages + English / 11 | open weights (you pay for your own GPU) | free | — | [AIKosh](https://aikosh.indiaai.gov.in/home/models/details/ai4bharat_indic_parler_tts_text_to_speech_model.html); [AIKosh IndicF5](https://aikosh.indiaai.gov.in/home/models/details/aibharat_indicf5.html) |
| Bhashini | Indian languages | free registration; reportedly proof-of-concept only | — | — | [DEV Community](https://dev.to/mr_manushukla/22-scheduled-languages-one-app-what-indic-localization-actually-costs-to-ship-in-2026-12ag) |

**Speech-to-text**

| Service | Price | Notes | Sources |
|---|---|---|---|
| Groq Whisper large-v3 | $0.111 per hour (about $0.0019 per minute) | at least 10 s billed per request; up to 100 MB | [Groq docs](https://console.groq.com/docs/model/whisper-large-v3) |
| Groq Whisper large-v3-turbo | $0.04 per hour (about $0.0007 per minute) | same limits | [Groq docs](https://console.groq.com/docs/model/whisper-large-v3-turbo) |
| Sarvam Saaras v3 | ₹30 per hour (about ₹0.5 per minute, about $0.34 per hour); ₹45 per hour with speaker labels | 22 languages; `codemix` mode | [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/); [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/how-to/select-output-mode.md) |
| OpenAI gpt-realtime-whisper (streaming) | about $0.017 per minute (third-party) | — | [AIReiter](https://aireiter.com/blog/openai-realtime-api-pricing) |
| Browser Web Speech API | free | does not work in iOS home-screen PWAs | [firt.dev](https://firt.dev/ios-14.5/) |

**Real-time speech-to-speech**

| Service | Price | Latency evidence | Sources |
|---|---|---|---|
| OpenAI gpt-realtime (-2/-2.1) | $32 per 1M audio in / $64 per 1M audio out, which is about $0.019 per minute in and $0.077 per minute out | ranked behind Gemini Live and a Groq-based chain (Codebridge) | [AIReiter](https://aireiter.com/blog/openai-realtime-api-pricing); [Codebridge](https://www.codebridge.tech/articles/voice-ai-phone-agents-latency-benchmark) |
| OpenAI gpt-realtime-mini | $10 / $20 per 1M, which is about $0.006 / $0.024 per minute | — | [eesel](https://www.eesel.ai/blog/gpt-realtime-mini-pricing) |
| Gemini Live (gemini-3.8-live per Vertex docs) | audio in $3 per 1M (about $0.005 per minute); audio out $12 per 1M (about $0.018 per minute); video in about $0.002 per minute (read 20 Oct 2026) | 3.1 Flash Live median 786 ms (Codebridge) | [TokenKarma](https://tokenkarma.app/blog/gemini-live-api-pricing-voice-agents-2026/); [Vertex docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/live-api) |
| Sarvam Voice Agents | from ₹3 per minute | — | [Sarvam docs](https://docs.sarvam.ai/voice-agents/introduction) |
| Chain: Deepgram Flux + Groq + ElevenLabs | sum of parts | median 706.8 ms, fastest in that test | [Codebridge](https://www.codebridge.tech/articles/voice-ai-phone-agents-latency-benchmark) |

**Images and video**

| Service | Price | Sources |
|---|---|---|
| GPT Image 1 Mini | about $0.005 (low) to $0.036 (high) per image | [IntuitionLabs](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai) |
| Imagen 4 Fast / Standard | about $0.02 / $0.04 per image | [PricePerToken](https://pricepertoken.com/imagen-pricing) |
| Gemini 2.5 Flash Image / 3.1 Flash Image | about $0.039 / $0.04–0.08 per image | [IntuitionLabs](https://intuitionlabs.ai/articles/ai-image-generation-pricing-google-openai); [TokenCost](https://tokencost.app/models/gemini-3-1-flash-image) |
| Veo 3.1 Fast | $0.10 per second at 720p (from 7 Apr 2026); $0.12 at 1080p; $0.30 at 4K | [invideo](https://invideo.io/blog/ai-video-model-pricing); [Skila/DEV](https://dev.to/skilaai/google-just-made-ai-video-50-cheaper-openai-killed-sora-heres-the-new-pricing-math-1ag4) |
| Sora 2 / Sora 2 Pro | $0.10 per second / $0.30–0.70 per second; API reportedly shut down 24 Sep 2026 | [Skila/DEV](https://dev.to/skilaai/google-just-made-ai-video-50-cheaper-openai-killed-sora-heres-the-new-pricing-math-1ag4); [OpenRouter](https://openrouter.ai/compare/google/veo-3.1-fast/openai/sora-2-pro) |

**Free tiers**
- **Gemini API:** third-party guides say the free tier covers Flash, Flash-Lite and some audio models but not image or video models. Rate limits vary by source; one gives 10 requests per minute and 250 per day for Gemini 2.5 Flash as of Jan 2026. Guides also conflict on whether Pro models are still free — [Apidog](https://apidog.com/blog/gemini-api-free-tier/); [CostBench](https://www.costbench.com/software/llm-api-providers/google-gemini-api/free-plan/).
- **Google Cloud credit:** one guide says the $300 credit does not cover Gemini API use for accounts opened after 2 Mar 2026 — [Apidog](https://apidog.com/blog/gemini-api-free-tier/).
- **Sarvam:** ₹100 credit — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/).
- **Chirp 3 HD:** 1M characters a month — [Google pricing](https://cloud.google.com/text-to-speech/pricing).
- **Kelvra's current limits:** 120 AI calls per student per day and 15 per minute, counted in Upstash Redis — [api/_limits.js](/home/user/kelvra/api/_limits.js); [.env.example](/home/user/kelvra/.env.example).

### Inferences
- **Worked examples:**

  | Unit | Approx. cost |
  |---|---|
  | 5-minute two-voice episode | ₹4–13 (Sarvam or Gemini); $0.12–0.45 (Chirp or ElevenLabs) |
  | 10-minute voice viva | ₹7–16 (chain); about ₹10–13 (Gemini Live or OpenAI mini); about ₹42 (OpenAI main model) |
  | Mnemonic image | ₹0.4–7 |
  | 30-second Veo clip | about ₹260 |

- **Budget heuristic.** At about ₹10 per heavy audio session, 1,000 students each doing one session a day costs about ₹3 lakh a month. Audio needs its own budget separate from the 120-calls-a-day text limit, plus caching of reusable outputs (episodes, reels) and probably a premium tier.
- **Long jobs on Vercel.** Generating a 5-minute episode in one serverless call may hit Vercel's function time limit (check the current plan limits). Synthesise each speaker turn as its own request, in parallel, driven by the browser, then stitch the audio together on the client.

### Gaps
- The official pricing pages for Sarvam, Groq, Google AI (ai.google.dev), OpenAI, ElevenLabs and Hugging Face could not be fetched (the sandbox network allowlist blocked these hosts). Every figure above comes from search summaries or third-party trackers and needs re-checking.
- Groq's token price for gpt-oss-120b was not retrieved.
- Free-tier limits for Gemini TTS and Live were not found.
- ElevenLabs speech-to-text pricing was not found.
- TTS and speech-to-text response times from India-region clients were not measured.

## 10. Teen safety and Indian rules that cut across all features

### Takeaway
Two Indian rule sets shape the design:

- **DPDP Rules:** consent from a verified parent for anyone under 18, phased in by about mid-2027, plus limits on tracking, behavioural monitoring and targeted ads aimed at children.
- **IT Amendment Rules 2026:** labels on synthetic audio and video, and takedown deadlines.

California SB 243 and SB 1119, and Character.AI's under-18 restrictions, are useful best-practice benchmarks.

Sensible defaults:

- no voice cloning;
- no voices or likenesses of real people;
- AI labels on every generated clip and image;
- roleplay limited to study tasks, with session caps;
- crisis-safe responses;
- sandboxes for generated code;
- short retention of minors' voice and photos.

### Cited Findings
- **DPDP Rules (notified Nov 2025):**
  - consent from a verified parent for anyone under 18;
  - 18-month phase-in for most obligations;
  - commentary says tracking, behavioural monitoring and targeted advertising aimed at children are banned;
  - there are education-related exemptions, but their scope for third-party edtech is debated.
  
  Sources: [Biometric Update](https://www.biometricupdate.com/202511/india-notifies-its-sweeping-digital-personal-data-protection-rules); [ORF](https://www.orfonline.org/expert-speak/dpdp-rules-and-the-future-of-child-data-safety); [K&S Partners](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/).
- **Verifying parental consent:** the Rules allow methods such as DigiLocker tokens, document checks or consent managers — [K&S Partners](https://ksandk.com/data-protection-and-data-privacy/childrens-data-protection-under-indias-dpdp-rules/).
- **IT Amendment Rules 2026** (in force 20 Feb 2026):
  - "synthetically generated information" covers audio and visual content made by computer so that it appears real;
  - visible labels are required on visual content and spoken disclosures on audio;
  - large platforms must collect users' declarations about whether content is synthetic;
  - takedowns within 3 hours are required for certain harmful content.
  
  Sources: [Business Today](https://www.businesstoday.in/technology/story/govt-tightens-rules-on-ai-generated-content-mandates-labels-and-faster-takedowns-515505-2026-02-10); [Freshfields](https://technologyquotient.freshfields.com/post/102mjwn/india-targets-deepfakes-and-ai-generated-content-key-changes-under-meitys-2026); [Mondaq](https://www.mondaq.com/india/social-media/1745278/indias-new-deepfake-regulation-meity-notifies-amendments-to-information-technology-rules-2021). A further draft dated 21 Apr 2026 would require labels shown on screen throughout playback; whether it was finalised is unverified — [Mondaq](https://mondaq.com/india/new-technology/1760554/it-rules-2026-deepfake-regulation-three-hour-takedowns-and-ai-labelling-obligations).
- **Companion-chatbot benchmarks:** Character.AI's under-18 restrictions, California SB 243 and SB 1119, and OpenAI's teen protections (details and sources in section 5) — [CO/AI](https://getcoai.com/news/character-ai-bans-users-under-18-from-open-ended-chats-amid-safety-lawsuits); [Tech.co](https://tech.co/news/landmark-california-bill-regulate-ai-chatbots); [ZwillGen](https://www.zwillgen.com/artificial-intelligence/adams-law-california-raises-the-bar-for-child-chatbot-protections/); [Unite.AI](https://www.unite.ai/openai-backs-california-bill-on-youth-safety-rules-for-companion-chatbots/).
- **Camera data:** Google says Gemini Live does not store camera or screen-sharing data without explicit consent — [Tom's Guide](https://tomsguide.com/ai/google-gemini/gemini-live-is-free-for-iphone-users-heres-how-to-share-your-screen-and-camera).
- **Voice cloning tools:** ElevenLabs plans and open Indian TTS models (such as IndicF5) make realistic Indian voices easy to produce (sections 1 and 8). I did not confirm the voice-cloning features themselves from a source.

### Inferences
- **Hallucination.**
  - Base everything on the student's notes or syllabus, and show source snippets.
  - Never present the AI as the teacher of record.
  - Score with rubrics, and give marks as ranges, as Kelvra's answer coach already does.
- **Impersonation and deepfakes.**
  - No voices or likenesses of real people, and no uploads of the student's own voice for cloning.
  - Open every generated audio clip with a spoken "AI-generated" disclosure, and give generated images a visible badge.
  - Keep provenance metadata.
- **Companion dynamics.**
  - No persistent "AI friend" persona and no romantic or emotional engagement.
  - Session caps and reminders for minors.
  - Route distress signals to Indian mental-health helplines (verify the numbers before shipping).
  - Show parents the feature use of under-18 accounts.
- **Data.**
  - Parental consent for under-18s by mid-2027.
  - Short retention for audio and photos.
  - Data-processing agreements with each vendor.
  - Avoid vendor tiers whose terms allow training on inputs (verify per vendor and plan).
- **Generated code** runs in a sandboxed iframe (section 4).
- **Moderation** of debate topics and image prompts suitable for 14–17-year-olds.

### Gaps
- Whether IT Rules labelling duties legally apply to Kelvra's in-app generated content was not established.
- The scope of the DPDP education exemption for Kelvra is unclear.
- Penalty amounts for breaches involving children's data were reported in draft-era coverage (up to ₹200 crore) and need checking against the final Act.
- Vendor terms on training with user inputs (Gemini free and paid tiers, Groq, Sarvam, ElevenLabs) were not retrieved.

## 11. Uniqueness check: what Indian students already get free

### Takeaway
Many Indian students aged 18+ already get premium AI for free:

- Gemini and NotebookLM through Jio's 18-month AI Pro and Google's student offers;
- ChatGPT Go through a 12-month promotion;
- ChatGPT Study Mode and Gemini Guided Learning, which are free;
- PhysicsWallah's AI Guru, which runs at very large scale.

So generic AI summaries, podcasts, tutors and photo explanations are table stakes. Kelvra can stand out with experiences that are exam-specific, in Hinglish or regional languages, grounded in the student's own notes and aware of their mastery. Under-18s are shut out of several 18+ offers, so they are a less-served group, and also the group with the heaviest safety and consent duties.

### Cited Findings
- **Google AI Pro for college students (2025):** a free year for Indian college students aged 18+, to be claimed by 15 Sep 2025. It included Gemini 2.5 Pro, Deep Research and premium NotebookLM — [CareerIndia](https://www.careerindia.com/news/google-ai-pro-plan-worth-19-500-free-for-indian-students-full-year-gemini-2-5-pro-access-details-051713.html).
- **Google AI Plus for college students (2026):** a later offer gives college students a free year of Google AI Plus, normally ₹399 a month in India — [ETV Bharat](https://www.etvbharat.com/en/technology/google-launches-one-year-free-ai-plus-plan-for-indian-and-global-college-students-enn26082002492).
- **Reliance Jio:** 18 months of Google AI Pro (valued at ₹35,100) on eligible plans, first for ages 18–25 and reportedly widened later — [Engadget](https://engadget.com/ai/google-brings-free-gemini-access-to-indias-largest-carrier-130627625.html); [91mobiles](https://www.91mobiles.com/hub/reliance-jio-free-18-month-google-gemini-pro-subscription).
- **OpenAI:** ChatGPT Go free for 12 months for users in India. One guide says the free period runs to Nov 2026 — [Deccan Herald](https://www.deccanherald.com/amp/story/technology%2Fartificial-intelligence%2Fopenai-chatgpt-go-now-available-free-in-india-step-by-step-guide-on-how-to-get-it-3785747); [Digit](https://www.digit.in/features/general/free-chatgpt-go-gemini-pro-perplexity-pro-for-india-generosity-or-desperation.html).
- **Free tutoring modes:** ChatGPT Study Mode (free plans included) and Gemini Guided Learning — [TechCrunch](https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/).
- **NotebookLM** audio and video overviews, mind maps, flashcards and quizzes (sections 1, 3 and 7); Google Lens and Gemini Live camera help for free (section 6); PhysicsWallah's AI Guru at large scale (section 8).

### Inferences
- **Already commoditised:** summaries, flashcards, quizzes, generic tutor chat, notes-to-podcast, photo explanations, and mind maps drawn from your sources.
- **Still rare:**
  - a Hinglish voice viva or examiner based on the student's own notes and exam rubrics;
  - a personal knowledge map coloured by mastery;
  - interactive simulations tied to the syllabus;
  - short animated "concept reels" in regional languages (NotebookLM Short is English-first and paid-tier);
  - debate and group-discussion sparring;
  - "teach the AI".
- **Under-18s (14–17)** are excluded from several 18+ offers (Google's student offer; Jio initially 18–25). Kelvra can serve them, but only with stronger consent and safety design.

### Gaps
- Not verified: age rules for 14–17-year-olds using NotebookLM or Gemini in India, and whether the ChatGPT Go promotion continues after Nov 2026.

## 12. Ranked "only-possible-now" feature ideas for Kelvra (with feasibility)

### Takeaway
The top picks combine three things:

1. Indian-language speech that only became good and cheap in 2025–26.
2. Data Kelvra already has (notes, quizzes, mistakes, SM-2, the answer coach).
3. Low risk for teens.

That points to a Hinglish voice viva, a mastery "fog-of-war" knowledge map, and exam-format audio episodes. Animated concept reels and interactive simulations are strong next steps for curiosity. Roleplay as real historical figures ranks last because of made-up content, impersonation and the safety of minors.

### Cited Findings
- **Indian-language speech is now good enough and cheap:**
  - Saaras v3 has a code-mix mode, and Sarvam's speech recognition ranked first or second in most languages in Voice of India — [Sarvam docs](https://docs.sarvam.ai/api-reference-docs/api-guides-tutorials/speech-to-text/how-to/select-output-mode.md); [CXOToday](https://cxotoday.com/media-coverage/global-speech-ai-struggles-to-understand-india-new-national-benchmark-voice-of-india-reveals/).
  - Gemini TTS ranks top for Indian-language preference and does two speakers — [Moonlight review](https://www.themoonlight.io/review/preferences-of-a-voice-first-nation-large-scale-pairwise-evaluation-and-preference-analysis-for-tts-in-indian-languages); [Google Cloud docs](https://cloud.google.com/text-to-speech/docs/gemini-tts).
  - Groq Whisper costs $0.04–0.111 per hour — [Groq docs](https://console.groq.com/docs/model/whisper-large-v3-turbo).
  - Bulbul costs ₹10–30 per 10K characters — [Convo360](https://convo360.ai/blog/sarvam-ai-pricing-india/).
- **Interactive, multi-format material helped teens** in a small randomised trial (Learn Your Way, ages 15–18) — [Google blog](https://blog.google/products-and-platforms/products/education/learn-your-way/).
- **Commoditisation by free incumbents** (section 11) and **constraints on roleplay for minors** (section 5) — [TechCrunch](https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/); [CO/AI](https://getcoai.com/news/character-ai-bans-users-under-18-from-open-ended-chats-amid-safety-lawsuits).
- **Kelvra already has** an answer coach with rubric bands and spoken answers, a mistake notebook, an SM-2 review deck, confidence checks, a mentor that reads progress, and a photo and handwriting pipeline — [README](/home/user/kelvra/README.md).

### Inferences
How I ranked them (my judgement): curiosity and delight × how unique it is against free incumbents × how feasible it is for 1–3 developers on the current React PWA + Vercel + Groq stack × unit cost × risk for teens.

Effort is a rough guess for one experienced developer: **S** = about 1–2 weeks, **M** = about 3–6 weeks, **L** = 6+ weeks.

| # | Feature | Effort | Unit cost | Safety risk |
|---|---|---|---|---|
| 1 | Viva Mode: "Face the examiner" | M | about ₹0.7–1.6 per minute | Low–medium |
| 2 | Fog-of-war knowledge map | M | text tokens only | Medium (DPDP) |
| 3 | Exam-mode audio episodes ("Kelvra Radio") | S–M | about ₹4–13 per cached 5-min episode | Low |
| 4 | Concept reels | M | about ₹1–3 per reel | Low |
| 5 | Make-it-playable simulations | M–L | text tokens only | Medium |
| 6 | Teach-the-AI ("confused junior") | S | text tokens (+ section 2 voice costs) | Low |
| 7 | Debate Arena / GD-PI sparring | S–M | text tokens | Medium |
| 8 | Snap-to-map camera | S | about one vision call | Low–medium |
| 9 | Red-pen overlay on handwritten answers | M | one vision call per page | Low |
| 10 | Mnemonic image studio | S–M | $0.005–0.04 per image | Medium |
| 11 | "Interview the record" history/science encounters | M | text tokens | High |

1. **Viva Mode: "Face the examiner" (Hinglish, Hindi, Tamil, Telugu, Bengali and more).**
   - **What it is.** A spoken oral exam on the student's own notes. The AI examiner asks viva or interview-style questions, listens to the answer (code-mix allowed), follows up Socratically, and scores against Kelvra's answer-coach rubric with marks given as a range.
   - **Why now.** Indian code-mix speech recognition (Saaras `codemix`) and natural Indian-language TTS only became good and cheap in 2025–26.
   - **Stack.** Push-to-talk with MediaRecorder, then `/api/voice`, then Groq Whisper-turbo or Saaras, then gpt-oss-120b, then Bulbul V4 Flash or Gemini Flash TTS. Real-time Gemini Live can come later for premium users.
   - **PWA.** Works everywhere, and fixes the iOS standalone speech-recognition gap.
   - **Safety.** It is a role, not a person. Delete audio after transcription, get parental consent for under-18s, and add distress escalation.
2. **"Fog-of-war" knowledge map of your own notes.**
   - **What it is.** An LLM-extracted concept graph per student, coloured by real mastery from quizzes, mistakes, SM-2 and confidence data.
   - **Hooks.** Fog over untested areas, cross-subject "bridge" links as curiosity prompts, and tap-to-learn micro-lessons.
   - **Why now.** Cheap, reliable structured extraction from LLMs (F1 about 0.83 in one study).
   - **Cost.** Text tokens only; the graph is drawn in the browser.
   - **Safety.** Get a DPDP legal check on profiling minors, use it only for learning, and allow export and deletion.
3. **Exam-mode audio episodes ("Kelvra Radio").**
   - **What it is.** 3–5 minute two-host episodes from the student's notes in Hinglish or a regional language. They include "pause and answer" recall prompts (the spoken answer is graded) and a "doubt" button that hands off to the mentor.
   - **Why now.** Two-speaker TTS in one call (Gemini) and Indian voices (Bulbul).
   - **Stack.** Groq writes the script; TTS is Gemini Flash TTS or Bulbul.
   - **Cost.** About ₹4–13 per cached episode.
   - **Uniqueness.** Medium, because NotebookLM does Hindi audio, so the exam format and recall loop are the differentiator.
   - **Safety.** Spoken AI disclosure, fact-check pass, no cloned voices.
4. **Concept reels: 30–60 s swipeable animated explainers.**
   - **What it is.** The LLM writes a script and a timed sequence of SVG or Mermaid scenes. The browser plays them as vertical "reels" with TTS narration and captions in any Indian script. Each reel ends with a one-question curiosity hook ("why are sunsets red?").
   - **Why now.** NotebookLM's Short format shows demand but is English-first and for paid tiers.
   - **Cost.** TTS only, about ₹1–3 per reel; cache popular ones.
   - **Effort.** Mostly animation engineering.
   - **Safety.** Low risk.
5. **Make-it-playable simulations.**
   - **What it is.** The LLM picks one of about 20–40 checked templates (physics, chemistry, economics, biology) and fills it from the notes, with "predict, then run" challenges. Free-form generation is available as an experimental mode.
   - **Why now.** LLMs can now write and fill in working interactive widgets; Gemini Canvas shows it is feasible.
   - **Effort.** Mainly writing and checking templates.
   - **Cost.** Text tokens only.
   - **Safety.** Sandboxed iframe without `allow-same-origin`, and a CSP with no network access.
6. **Teach-the-AI ("confused junior" mode).**
   - **What it is.** The AI plays a confused classmate. The student explains a concept by voice or text, and the AI asks naive follow-ups that expose gaps, which then feed the knowledge map.
   - **Effort.** Small: a variant of the existing Socratic tutor.
   - **Cost.** Text tokens, plus optional voice at section 2 costs.
   - **Evidence.** Not researched here (gap).
   - **Safety.** Low, because the persona is fictional and short-lived.
7. **Debate Arena / GD-PI sparring.**
   - **What it is.** Curated syllabus motions (UPSC essay and ethics, CLAT, group discussions and interviews). The AI argues the other side, then scores structure, evidence and fallacies. Voice is optional, reusing feature 1.
   - **Cost.** Text tokens.
   - **Safety.** Curated topics only; for under-18s, avoid political and religious topics; make the strongest case for both sides.
8. **Snap-to-map camera.**
   - **What it is.** Photograph a textbook page, diagram or object, and get an explanation in your language, 3 recall questions, AI-drawn labels on the photo, and the concept added to your map.
   - **Why now.** Vision models can now read pages and diagrams well enough.
   - **Effort.** Small, since it reuses the existing photo pipeline.
   - **Cost.** About one vision call.
   - **Uniqueness.** Low on its own (Lens and Gemini do it for free); the follow-through is the value.
   - **Risks.** The vision model is a Groq preview; strip EXIF and do not store photos of people.
9. **Red-pen overlay on handwritten answers.**
   - **What it is.** A vision model marks mistakes directly on the photo of a handwritten answer (boxes and margin notes), linked to the answer-coach rubric.
   - **Effort.** Medium; how accurately models can locate the errors is unverified.
   - **Competitor.** PhysicsWallah grades answer sheets at scale.
   - **Cost.** One vision call per page.
10. **Mnemonic image studio.**
    - **What it is.** The LLM writes a vivid memory scene; a cheap image model draws it (GPT Image 1 Mini or Imagen 4 Fast); captions are added as an HTML overlay; the result is saved into flashcards.
    - **Cost.** $0.005–0.04 per image.
    - **Needs.** A second vendor and image moderation.
    - **Safety.** No real people; visible AI badge (IT Rules 2026).
11. **"Interview the record" history and science encounters.**
    - **What it is.** A third-person "time-travelling reporter" format that answers only from cited passages, is text-first and clearly labelled, never imitates a real person's voice or face, has session caps and makes no companion-style replies.
    - **Curiosity.** The highest of any idea.
    - **Risk.** The highest too (made-up content in a trusted voice, impersonation, the minors' chatbot climate), so build it last and behind strict design.

### Gaps
- No user research with Indian students aged 14–24 on which of these ideas actually spark curiosity; the ranking is analytical.
- Cost estimates assume speaking rates (about 150 words, or 850–900 characters, per minute) and token rates that were not checked against official docs. No hands-on quality tests were run for Hinglish TTS or speech-to-text, gpt-oss-120b's code or diagram output, or Groq's preview vision model.
- The evidence base for teach-the-AI, debate and mnemonic images was not researched in this scan.
- The legal questions (DPDP profiling of minors, IT Rules labelling, vendor training terms) need professional review before launch.
