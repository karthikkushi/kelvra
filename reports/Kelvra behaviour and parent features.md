# Build trust, not surveillance, into Kelvra

**Direct answer:** Kelvra can stand out by coaching *how* students study and respond, and by giving parents a calm, honest view that the **student controls**. The science backs all four chosen features, but with limits. Feedback-plus-rewrite works (**d ≈ 0.48**), but AI *scores* are shaky. If-then plans work (**d ≈ 0.65**). Recorded self-monitoring works (**d ≈ 0.40**). Confidence checks clearly help memory of corrected errors, but they are not proven to raise marks. On parents, the strongest finding is simple: parents learn most when teens *choose* to tell them, and spying makes things worse. No Indian competitor we checked offers student-controlled sharing, confidence tagging, habit or wellbeing coaching, or rubric-transparent board-answer feedback. Those are Kelvra's openings. The biggest risk is legal and ethical. India's DPDP Act treats everyone under 18 as a child and bans "tracking or behavioural monitoring" of children. The children's rules apply from about **13 May 2027**, about six months from now, and Kelvra probably cannot use the education exemption (**needs a lawyer**). India also records about **13,000 student suicides a year**. So any feature that pushes marks or ranks at parents is a safety risk as well as a product risk. Build the parent view as a disclosure channel. Build the mentor as a tutor, not a friend. Ship crisis routing before mood features.

| Question | Short answer |
|---|---|
| A. Do the four features work? | Yes, if designed right. Lead with feedback and habits, not scores. Expect behaviour gains before mark gains. |
| B. What do parents want? | Proof that time and money produce exam readiness, with no sales tricks. Teens hate covert monitoring. |
| C. Where is the gap? | Indian parent apps show attendance, tests and batch rank. Nobody covers habits, confidence or wellbeing, or lets the student choose what parents see. |
| D. Red lines? | No behavioural tracking beyond the consented study purpose. No ads to minors. No companion persona. No rank-shaming. Crisis routing to Tele-MANAS 14416. |

## Feedback and habits beat scores in all four features

The four chosen features rest on real evidence. But each has one trap that can cancel its benefit. The table gives the numbers. The prose explains what they mean for design.

| Feature | Best evidence | Effect size | Strength | Main pitfall |
|---|---|---|---|---|
| Answer-writing coach | Feedback meta-analysis, 435 studies | d = 0.48 | Strong | Over 1/3 of feedback interventions make performance *worse* |
| | Testing effect (writing answers from memory) | g ≈ 0.50 to 0.61 | Strong | None major |
| | Automated writing feedback | g = 0.36 to 0.55 | Moderate | LLM scores only fair to moderately reliable |
| | Unguarded GPT-4 in a field trial | Grades fell 17% after access was removed | Moderate (one large RCT) | AI used as a crutch |
| Confidence check | Hypercorrection effect | Replicated many times, no meta-analysis | Strong (memory) | No proof it raises marks |
| | Calibration feedback in class | Mixed, small studies | Weak to moderate | Low performers stay overconfident |
| Habit coach | If-then plans (implementation intentions) | d = 0.65 (academic d = 0.72, secondary figure) | Strong | Classroom results are mixed |
| | Self-monitoring, recorded | d ≈ 0.40 | Strong (mostly health studies) | Needs regular review |
| | WOOP / MCII with teens | 60%+ more practice questions | Weak to moderate | Small samples |
| | Habit formation time | Median 66 days, range 18 to 254 | Moderate (one study) | "One week" is too short to form a habit |
| Focus tracker | Media multitasking vs grades | r ≈ −0.25 | Moderate (correlational) | Correlation only |
| | Phone "brain drain" | Working memory only | Contested | Do not market it |
| | Pomodoro breaks | Better mood and efficiency, not more output | Contested | Later studies conflict |

### Answer-writing coach: feedback and rewrite, not a grade

Feedback helps on average, **d = 0.48** across 435 studies, but results vary hugely ([Wisniewski et al. 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456)). An older review found that **over one-third of feedback interventions lowered performance**, mostly when feedback pointed at the person rather than the task ([Kluger & DeNisi 1996](https://doi.org/10.1037/0033-2909.119.2.254), not re-verified in this round). So the coach should never say "you are weak at writing". It should say what was good on one rubric point, name the one biggest gap, and ask for a rewrite now. Writing answers from memory is itself strong practice, with **g ≈ 0.50 to 0.61** ([Rowland 2014](https://doi.org/10.1037/a0037559); [Adesope et al. 2017](https://doi.org/10.3102/0034654316689306)).

AI feedback is roughly as useful as human feedback for practice. A 41-study review found **no significant difference** between them (secondary figure, not checked against full text) ([ASCD summary of Kaliisa et al. 2025](https://ascd.org/el/articles/how-effective-is-ai-in-giving-writing-feedback)). AI matched trained humans best on **criteria-based feedback** ([Hechinger Report on Steiss et al. 2024](https://hechingerreport.org/proof-points-writing-ai-feedback/)). That supports tying every comment to a CBSE, ICSE, state-board or UPSC marking scheme. But AI *scores* are unreliable. GPT-4o showed only "fair" agreement with humans on argumentative essays, and run-to-run consistency was poor in some studies ([arXiv 2409.13120](https://web3.arxiv.org/abs/2409.13120); [Shermis 2024](https://arxiv.org/abs/2408.09540v1)). ChatGPT feedback on its own showed non-significant effects in one meta-analysis (secondary figure) ([Scherer, Graham & Busse](https://asu.elsevierpure.com/en/publications/can-algorithm-based-feedback-help-students-to-write-better-a-meta/)). So show **score bands and rubric levels, not decimals**, and say the score is approximate. Kelvra must also run its own check of AI marks against Indian teacher marks. No such validation exists for any Indian tool.

The biggest danger is the crutch. In a Turkish trial with about 1,000 students, free GPT-4 access raised practice scores, but **grades fell 17%** once access was removed. A hint-only tutor largely avoided the harm ([Bastani et al. 2025, PNAS](https://econpapers.repec.org/RePEc:nas:journl:v:122:y:2025:p:e2422633122)). The rule for Kelvra: **the AI never writes the student's answer**. Show the model answer only *after* the student's attempt and self-rating.

### Confidence check: a memory tool first, a marks tool maybe

When a student is sure and wrong, and then sees the correction, they remember the fix *better* than a low-confidence error. This "hypercorrection effect" is well replicated ([Butterfield & Metcalfe 2006](https://core.ac.uk/download/357328401.pdf); [PMC4084803](https://pmc.ncbi.nlm.nih.gov/articles/PMC4084803)). That justifies a one-tap **Guess / Unsure / Sure** before each answer. When "Sure" is wrong, show the fix boldly, ask the student to restate it, and add the item to the mistake notebook for an early re-test.

Do not promise higher marks. Calibration improved *and* exam scores rose only when students got feedback on both their scores and their judgments ([Callender et al. 2016](https://link.springer.com/doi/10.1007/s11409-015-9142-6)). In another study, calibration improved for low performers but **exam scores did not** ([Miller & Geraci 2011](https://link.springer.com/doi/10.1007/s11409-011-9083-7)). Low performers stay overconfident the longest ([Univ. Kentucky](https://scholars.uky.edu/en/publications/improving-metacognition-in-the-classroom-through-instruction-trai/)). So feedback must be specific: "You said Sure on 20 questions and got 13 right." Never label a teen "overconfident". Talk about the questions, not the person. Effect sizes from the 2022 "Calibrating calibration" meta-analysis could not be retrieved (**unverified**).

### Habit coach: if-then plans, recorded progress, forgiving streaks

Spacing beats cramming robustly ([Cepeda et al. 2006](https://doi.org/10.1037/0033-2909.132.3.354)). If-then plans ("When I sit at my desk at 7 pm, I will do 10 recall questions") have a **d = 0.65** effect on goal attainment ([Gollwitzer & Sheeran 2006](https://doi.org/10.1016/S0065-2601(06)38002-1)). The academic subgroup figure of d = 0.72 is from a secondary source ([e-mentor](https://www.e-mentor.edu.pl/eng/article/index/number/72/id/1323)). Classroom tests are more mixed ([ASEE paper](https://peer.asee.org/an-introductory-study-of-the-impact-of-implementation-intentions-on-assignment-completion-rates-with-an-emphasis-on-engineering-technology-students.pdf)). With exam-prep teens, a 30-minute WOOP exercise led to **more than 60% more practice questions**, though in a small sample and measuring practice, not scores ([Duckworth et al. 2011](https://www.socmot.uni-konstanz.de/sites/default/files/duckworth_self-regulation_11.pdf)).

Self-monitoring improves goal attainment by **d ≈ 0.40**. It works better when progress is **written down** and **reported** ([Harkin et al. 2016](https://eprints.whiterose.ac.uk/87431)). That supports a weekly review screen. Habits take a **median of 66 days** to become automatic, and missing one day did not matter ([Lally et al. 2010](https://doi.org/10.1002/ejsp.674), not re-verified). So frame the weekly experiment as one step in a two-month build. Streaks motivate, but once broken, effort drops, and **highlighting the broken streak makes it worse** ([INSEAD Knowledge on Silverman & Barasch 2023](https://knowledge.insead.edu/marketing/consumer-streaks-are-motivating-key-keeping-them-alive)). Use "5 of the last 7 days" instead of fragile day-streaks. If you keep streaks, add a repair option and never shame a break.

### Focus tracker: self-monitoring works, scare claims do not

Media multitasking correlates with lower achievement at about **r ≈ −0.25** (correlational, secondary report) ([CEEOL](https://www.ceeol.com/search/article-detail?id=1336948)). Switching tasks has real costs ([Monsell 2003](https://doi.org/10.1016/S1364-6613(03)00028-7)). The claim that a phone merely being nearby drains your brain is **contested**. Six meta-analyses found an effect on working memory only, with poor statistical power ([Parry 2024](https://research.vu.nl/en/publications/does-the-mere-presence-of-a-smartphone-impact-cognitive-performan/)). Do not market "lose IQ points". Pomodoro breaks gave better mood and efficiency in one Dutch study ([Biwer et al. 2023](https://pubmed.ncbi.nlm.nih.gov/36859717/)), but a 2025 study found faster fatigue ([PMC12292963](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292963/)). Offer 25/5, 50/10 and free mode, and let students compare their own data. Tab-leave tracking needs a tag ("looked something up" / "phone" / "break"), because many Indian students study *on* the phone. There is **no RCT evidence** that focus-tracking apps raise grades. Keep focus data **private to the student by default**.

## Parents want honest proof; teens reject spying

### Indian parents worry about value, distraction and outcomes

There is **no rigorous Indian survey** on what parents want in an edtech dashboard. Kelvra should run its own interviews. The signals we have point three ways. First, trust is broken. Parents told the BBC that promised mentors and progress tracking from BYJU'S never came ([The News Minute](https://www.thenewsminute.com/atom/bbc-report-questions-byju-s-meteoric-rise-india-158499)). Some ended up in debt from loan-financed courses ([Scroll.in](https://scroll.in/article/1039797/worst-decision-of-my-life-byjus-accused-of-driving-parents-into-debt-with-predatory-practices)). NCPCR summoned BYJU'S CEO over sales practices ([Inc42](https://inc42.com/buzz/child-rights-panel-summons-byjus-ceo-for-alleged-malpractices)). Second, parents accept screen time *for study*. In a 2020 LocalCircles survey, **49%** of class 9–12 parents wanted online classes longer than the proposed 3-hour cap (self-selected panel) ([LocalCircles](https://m-www.localcircles.com/a/press/page/online-classes-screen-time-survey)). Third, they fear distraction, with reason. In rural India, among ages 14–16, about **57%** used a smartphone for study versus about **76%** for social media ([ThePrint on ASER 2024](https://theprint.in/india/education/in-rural-india-82-2-teens-aged-14-16-know-how-to-use-smartphone-but-only-57-use-it-for-studies/2467560)).

The core parent question is probably: "Is my money and my child's time producing exam readiness?" An honest answer, with no upsell, can turn post-BYJU'S distrust into Kelvra's advantage.

### Pressure is already near its limit

Student suicides in India hit **13,892 in 2023**, the highest in ten years ([Careers360 on NCRB](https://news.careers360.com/ncrb-report-2023-over-13800-student-suicide-deaths-highest-in-10-years-national-crime-records-bureau-maharashtra-up-tn)). In a Karnataka study of 570 entrance-exam students, **87%** reported high parental pressure and **86%** high academic stress (cross-sectional) ([Manipal](https://researcher.manipal.edu/en/publications/academic-stress-perceived-parental-pressure-and-anxiety-related-t/)). A path model links parental pressure to stress, then depression, then suicidal thoughts (dissertation, cross-sectional) ([Sarma 2014](https://keep.lib.asu.edu/items/152980)). In 2025 the Supreme Court issued binding mental-health guidelines for schools, colleges and coaching centres ([LiveLaw](https://www.livelaw.in/amp/supreme-court/in-neet-aspirants-death-case-supreme-court-issues-guidelines-to-protect-mental-health-of-students-in-colleges-coaching-centres-298795)). The implication is blunt: **pushing scores, ranks or "behind schedule" alerts to parents can feed the exact chain that harms students.**

### The science says: build a disclosure tool, not a monitor

The strongest finding is old and replicated. Parents know what is going on mainly because the teen **chooses to tell them**, not because they watch ([Stattin & Kerr 2000](https://zendy.io/title/10.1111/1467-8624.00210); [PMC review](https://pmc.ncbi.nlm.nih.gov/articles/PMC2682426)). In 215 parent–teen pairs, more use of monitoring apps went with **more** online risk and worse relationships, not less (correlational) ([Ghosh et al. 2018](https://stars.library.ucf.edu/scopus2015/7882)). In 736 teen reviews of parental-control apps, **76% gave 1 star**. Teens called them invasive and harmful to the relationship ([Ghosh et al. CHI 2018](https://epublications.marquette.edu/mscs_fac/618)). Of the features in 75 such apps, **89% served parental control and only 11% helped teens self-regulate** ([Wisniewski et al. 2017](https://stars.library.ucf.edu/scopus2015/7430)).

What parents *should* do is also clear. Talking about goals, plans and strategies ("academic socialisation") has the strongest link to achievement in adolescence. Direct homework help shows null or negative links ([Hill & Tyson 2009](https://www.gse.harvard.edu/ideas/usable-knowledge/09/10/parental-involvement-puzzle)). Autonomy support helps, and psychological control (guilt, pressure) harms. This holds in China too, though autonomy effects are smaller there. Rules and structure are fine ([Wang et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17883450)). Praising effort beats praising intelligence after failure, though replications are mixed ([Mueller & Dweck 1998](https://www.columbia.edu/cu/psychology/courses/3615/Readings/Mueller_Dweck.pdf)). For India, the bridge is **agreed structure**: the student co-creates the plan, and parents see progress against it. Parents get structure. Teens keep control over method. Note that **no Indian study** tests teen attitudes to parental monitoring apps. Indian family norms may raise tolerance, but that is **unverified**.

### Consent-based parent view: the design

Google's Family Link shows the tension. Google let children end supervision at 13, then reversed this in January 2026 after parent backlash ([Al Jazeera](https://www.aljazeera.com/economy/2026/1/14/child-rights-org-says-google-undermines-parental-control-of-child-accounts)). Some 18-year-olds then could not switch supervision off because of bugs ([Android Authority](https://www.androidauthority.com/google-family-link-bug-3663231/)). Kelvra needs clear rules by age.

| Design rule | 14–17 (DPDP "child") | 18–24 (adult) |
|---|---|---|
| Parent link | Required, with verifiable parental consent | Only if the student invites it |
| What is shared by default | Weekly effort summary: consistency, focus sessions, topics revised, mistakes fixed | Nothing |
| Test scores | Opt-in by student, shown as a trend, never a rank | Opt-in |
| Student sees what parent sees | Always ("Preview as parent") | Always |
| Raw logs, chat, mood, screenshots, location | Never | Never |
| Alerts to parent | No "low score" or "missed session" alerts. Calm weekly digest only | Same |
| Parent actions | Send encouragement. Read 1–2 conversation prompts. No task-assigning or nag buttons | Same |
| Student voice | Can add a note ("Tough week, need Sunday off") or pause during exam week | Can pause or end any time |
| Age change | At 18, student re-chooses all settings | — |

Deliver the digest by WhatsApp in Indian languages. This fits how Indian parents communicate, but its impact is **untested**. Note one legal tension: for minors, a parent link is likely *required*, yet sending detailed behaviour data may clash with DPDP s.9(3). Coarse, purpose-limited summaries are the safer pattern (**needs a lawyer**) ([LiveLaw on DPDP](https://www.livelaw.in/articles/dpdp-child-data-rules-demand-edtech-platforms-555317)).

## Rivals sell surveillance and upsell; the gaps are wide

Indian parent apps are **activity and score dashboards**. The PW Parent App shows attendance, lectures, DPP and test stats, **batch rank**, upcoming tests and payment management. It even says: "No need to depend on your child for updates" ([App Store](https://apps.apple.com/us/app/pw-parent-app/id6478144871)). That is the opposite of the disclosure model. BYJU'S Parent Connect offered "suggested actions" per subject, but its listing looks stale or removed ([AppFollow](https://apps.appfollow.io/ios/byju-s-parent-connect/1223316815?country=in); [chrome-stats](https://chrome-stats.com/d/com.byjus.parentappv2)). Embibe promises parents can "keep an eye on everything" ([Embibe](https://www.embibe.com/in-en/parent/)).

Globally, Socratic AI tutoring is now **free**. ChatGPT Study Mode and Gemini Guided Learning both launched in mid-2025 ([TechCrunch](https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/)). So "an AI mentor that asks questions" no longer sets Kelvra apart. Its defensible layer is exam-specific memory: spaced repetition, the mistake notebook, the plan, marking schemes, confidence data and the family layer.

| Gap | Who comes closest | Kelvra's opening |
|---|---|---|
| Student-controlled, two-way parent view | PW, BYJU'S, Embibe: one-way, score and rank | Student chooses, sees everything shared, can add notes |
| "Why, not just what" for parents | BYJU'S "suggested actions" (looks discontinued) | Plain-language causes and how a parent can help, in Hindi or regional languages |
| Confidence-tagged answering | Amplifire, corporate and medical only, **patented analytics** ([Amplifire](https://amplifire.com/?p=2584); [BioSpace](https://www.biospace.com/amplifire-secures-patent-for-analytics-regarding-the-confidence-of-learners)) | First consumer exam app with "confidently wrong" targeting. Check the patent scope |
| Board-exam descriptive answer feedback for students | Eklavvya, B2B only ([Eklavvya](https://www.eklavvya.com/ai-grading-coaching-institute/)). CBSE says it does not use AI to mark ([Business Today](https://www.businesstoday.in/amp/india/story/ai-was-not-used-cbse-defends-digital-marking-amid-class-12-result-row-531878-2026-05-17)) | Photo upload that shows which marking-scheme points were earned or missed, with honest uncertainty |
| UPSC answer evaluation | PrepAiro and others, **no published accuracy** ([PrepAiro](https://prepairo.ai/upsc/features/mains-evaluation/)) | Publish agreement with human examiners, track weaknesses over time |
| Syllabus viva / explain-aloud | Only job-interview apps ([TalkDrill list](https://www.talkdrill.com/blog/compare/best-apps-for-interview-practice-english/)) | Explain a concept aloud in English, Hindi or Hinglish |
| Focus tool that knows the plan | Forest, Opal, one sec block apps but ignore syllabus ([Opal blog](https://opal.so/blog/opal-vs-forest)) | Focus session tied to a plan item or mistake review |
| Anxiety-safe habits | Duolingo streak guilt ([UX Collective](https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7)); ClassDojo criticised as "datafication of discipline" ([Manolev et al.](https://informahealthcare.com/doi/full/10.1080/17439884.2018.1558237)) | Forgiving consistency, no leaderboards, no guilt copy |
| Wellbeing inside the study plan | Separate apps (LISSUN, Solh) or offline Kota counsellors ([education21](https://education21.in/lissun-adds-tech-platform-to-support-mental-health-of-students-during-exam-prep/)) | Plan load adapts to sleep and stress, with safe escalation |
| Trust promise | BYJU'S sales scandal left a deficit ([Context](https://www.context.news/socioeconomic-inclusion/indian-tech-firm-byjus-hauled-in-by-watchdog-over-context-expose)) | "No sales calls, no loans, cancel anytime" |

**Caveat:** this scan was limited. Unacademy, Vedantu, Allen digital, Testbook, Adda247, Doubtnut, Cerego, Area9 and Anki were **not checked**. They could partly cover the parent-report, confidence or focus gaps. Verify before claiming "first in India".

## Wellbeing must be light, evidence-based and legally careful

### What wellbeing features have evidence

The best-supported option is a short online "**stress can fuel you + abilities can grow**" module. Six double-blind randomised studies with over 4,000 teens found a 30-minute self-run module lowered negative stress appraisals and cortisol and improved some wellbeing measures. It helped most for students who started with negative mindsets ([NICHD summary of Yeager et al. 2022, Nature](https://www.nichd.nih.gov/newsroom/news/070622-teen-stress)). Growth mindset alone has tiny effects, about **d ≈ 0.08** on achievement, larger for at-risk students, and still debated ([Sisk et al. 2018](https://doi.org/10.1177/0956797617739704), not re-verified). Writing about exam worries for 10 minutes before a big test helped anxious ninth graders ([ScienceDaily on Ramirez & Beilock 2011](https://www.sciencedaily.com/releases/2011/01/110113141605.htm)). But replication is mixed and it may not help low-anxiety students ([Myers et al. 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8192598)), so keep it optional. Teens aged 13–18 need **8 to 10 hours of sleep**, and regular short sleep is linked to self-harm and suicidal thoughts ([AASM](https://aasm.org/resources/pdf/pressroom/teen-sleep-duration-recommendation.pdf)). Sleep problems are the top complaint on Tele-MANAS, at 14% of calls ([Deccan Herald](https://www.deccanherald.com/amp/story/india%2Fdisturbed-sleep-mood-top-list-of-complaints-on-indias-mental-health-helpline-3228979)). Mood check-ins are reasonable, but they create a **duty to respond** to crisis signals, and their possible harms (rumination) are an open question.

### AI mentor risk: do not become a companion

Between 2024 and 2026, regulators treated emotionally engaging chatbots as a child-safety risk. Character.AI banned open-ended chat for under-18s from 25 November 2025 and settled teen-suicide lawsuits in January 2026 ([Axios](https://www.axios.com/2026/01/07/google-character-ai-lawsuits-teen-suicides)). The FTC opened a study of seven companion-bot firms in September 2025 ([DLA Piper](https://www.dlapiper.com/en/insights/publications/2025/09/ftc-ai-chatbots)). California's SB 243, in force from 1 January 2026, requires AI disclosure and suicide protocols (**verify against enacted text**) ([California Lawyers Assn](https://calawyers.org/privacy-law/regulatory-focus-on-ai-companion-character-chatbots/)). OpenAI added age prediction, an under-18 default when age is unclear, and parent alerts for acute distress ([OpenAI](https://openai.com/pl-PL/index/introducing-parental-controls/)). The APA warns about unhealthy attachment and teens not questioning a bot ([APA advisory](https://apa.org/topics/artificial-intelligence-machine-learning/health-advisory-ai-adolescent-well-being)). The lesson: Kelvra's mentor should be a **tutor and coach**. It should not be a friend with feelings or a persona that remembers personal life details. Parent distress alerts are risky in India, where the family can be the stressor. Use tiers: show helplines at once, offer a warm handoff to Tele-MANAS, and alert a parent only for imminent risk, under a published policy.

### DPDP Act 2023 and Rules 2025: what applies

| Point | What it says | Certainty |
|---|---|---|
| Who is a child | Anyone under 18 (s.2(f)) | Clear |
| Parental consent | Verifiable consent from an identifiable adult. A tick-box is not enough. DigiLocker token or existing reliable ID are options (Rule 10) ([Nishant Munjal](https://nishantmunjal.com/dpdp-childrens-data-verifiable-parental-consent-india/)) | Clear in principle; method is flexible |
| Banned for children | Tracking, behavioural monitoring, targeted ads (s.9(3)). Anything harmful to wellbeing (s.9(2), never exempt) ([Tsaaro](https://tsaaro.com/blogs/safeguarding-minors-online-understanding-parental-consent-obligations-and-behavioural-monitoring-restrictions-under-the-dpdpa-and-dpdp-rules)) | Clear |
| Does adaptive learning count as "behavioural monitoring"? | Unresolved | **Needs a lawyer** |
| Education exemption | Covers "educational institutions" only. Practitioners advise edtech apps **not** to rely on it ([S.S. Rana](https://ssrana.in/articles/schools-coaching-centres-platforms-processing-childrens-data-are-you-compliant/)) | **Contested; needs a lawyer** |
| Rules notified | 13 or 14 November 2025, G.S.R. 846(E) ([PwC India](https://www.pwc.in/research-insights/news_alert/regulatory-insights/meity-notifies-digital-personal-data-protection-rules-2025.html)) | Gazette text not read |
| Children's duties start | About **13 May 2027** (18 months). A January 2026 proposal to shorten this was **not notified** as of September 2026 ([MirvoLegal](https://www.mirvolegal.com/insights/dpdp-rules-2025-compliance-timeline/)) | Moderate; an October 2026 order is **unverified** |
| Old consents | Unclear if consent taken before May 2027 stays valid. Plan to re-verify ([JurisEagle](https://juriseagle.com/insights/dpdp-children-data-educational-institutions)) | **Open** |
| Breach notice | Detailed report to the Board within 72 hours (Rule 7) | From summaries; confirm |
| Penalty, children's rules | Up to ₹200 crore | **Not confirmed** from a fetched source |
| Age check | Checking whether a user is a child is an exempt purpose. Minimal data for an age gate needs no parental consent | From summaries; confirm |

Other Indian rules shape the product. The Supreme Court's 2025 *Sukdeb Saha* guidelines reportedly require prominent helplines, referral protocols, and **no segregation of students by performance or public shaming** ([Vision IAS](https://visionias.in/current-affairs/news-today/2025-07-26/social-issues/supreme-court-issues-guidelines-to-address-student-suicides-mental-health-in-educational-institutions)). Whether they reach a pure app is **untested**. The 2024 MoE coaching guidelines bar misleading rank promises (model rules, state adoption needed) ([Careers360](https://news.careers360.com/cannot-enrol-students-below-16-years-no-misleading-promises-moe-guidelines-for-coaching-centres)). Tele-MANAS is **14416** or **1-800-891-4416**, 24x7, in about 20 languages ([Drishti IAS](https://www.drishtiias.com/pdf/1791634745.pdf)).

## Eight unique features beyond the four, ranked

Ranking weighs four things: love from students, love from parents, evidence strength, and how clearly no rival offers it. "Evidence" means evidence for the underlying principle. **None of these has been tested as a product in India.**

| Rank | Feature | What it is | Why students love it | Why parents love it | Evidence strength |
|---|---|---|---|---|---|
| 1 | **Student-controlled weekly family digest** | Student picks what to share. "Preview as parent" shows exactly what goes out. WhatsApp digest in the parent's language, effort-first, with 1–2 conversation prompts. Student can add a note or pause in exam week | No spying. They control the story. Fewer "what did you study?" interrogations | Honest weekly picture without fighting. Tells them *how* to help | **Strong** for the principle ([Stattin & Kerr](https://zendy.io/title/10.1111/1467-8624.00210); [Hill & Tyson](https://www.gse.harvard.edu/ideas/usable-knowledge/09/10/parental-involvement-puzzle)). Digest format untested |
| 2 | **"Bad test day" debrief + parent script** | After a mock, a 3-minute student debrief: what went wrong (concept, careless, time, nerves), one fix. Parent gets an optional script: "Ask what they learned. Praise the effort. Don't compare." | Turns a bad result into a plan, not a fight | Parents get words for the hardest moment | **Moderate**: psychological control harms ([Wang et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17883450)); process praise helps, replication mixed ([Mueller & Dweck](https://www.columbia.edu/cu/psychology/courses/3615/Readings/Mueller_Dweck.pdf)) |
| 3 | **Mistake-pattern "why" report** | Mistake notebook rolls up into "3 recurring mistakes this week and the fix plan" (units, a concept gap, rushing). Shareable with mentor or parent if the student chooses | Sees *why* they lose marks, not just that they do | Gets causes, not raw stats. Replaces rank talk | **Moderate**: retrieval plus feedback ([Rowland 2014](https://doi.org/10.1037/a0037559)). No rival found offering this |
| 4 | **Pre-mock stress reappraisal** | One 20–30 minute "stress can fuel you + abilities grow" module, then a 30-second reminder before each mock. Optional 10-minute worry-writing before big exams | Feels calmer, less frozen | Sees the app cares about wellbeing, not just marks | **Strong to moderate**: six RCTs, N > 4,000 ([Yeager et al. 2022](https://www.nichd.nih.gov/newsroom/news/070622-teen-stress)); worry-writing mixed |
| 5 | **Sleep- and load-aware today plan** | Today plan adapts to a quick "slept / stress" tap. No late-night streaks. Wind-down nudge. Never rewards all-nighters | Plan feels human, not a whip | Visible proof the app protects sleep and health | **Moderate**: sleep guidance ([AASM](https://aasm.org/resources/pdf/pressroom/teen-sleep-duration-recommendation.pdf)). No evidence on adaptive plans themselves |
| 6 | **Explain-aloud viva practice** | Student explains a concept aloud in English, Hindi or Hinglish. AI checks correctness and structure, then asks one follow-up. Covers board practical vivas | Builds speaking confidence, fun, useful for vivas and interviews | Can hear progress in their child's own words | **Moderate** for self-explanation ([Dunlosky et al. 2013](https://doi.org/10.1177/1529100612453266)). **No evidence** for speech metrics like filler-word counts. No syllabus-linked rival found |
| 7 | **Family study pact** | Student co-creates the weekly plan. Parent commits to one support action (e.g. "no marks questions on exam week", "quiet room 7–9 pm"). Both see the pact | Parents commit too, which feels fair | Gets the structure they want, without nagging | **Moderate**: autonomy support plus structure ([Vasquez et al. 2016](https://link.springer.com/doi/10.1007/s10648-015-9329-z); [Wang et al. 2007](https://pubmed.ncbi.nlm.nih.gov/17883450)); reciprocity from HCI design work ([Wisniewski et al. 2017](https://htirlab.github.io/papers/parental_control.pdf)) |
| 8 | **Negative-marking decision trainer** | Optional mode for JEE/NEET-style tests. Uses confidence data to show: "Your 'Unsure' answers are right 38% of the time. Here, skipping beats guessing." | Directly protects marks in real exams | Clear, exam-specific skill they understand | **Weak**: inference only from calibration work. No study found. Test it with A/B data |

A ninth idea is a public **trust pledge**: no sales calls, no loans, no fake "readiness %", cancel anytime. It is not a feature, but it may be the cheapest differentiator with Indian parents after the BYJU'S episode ([Inc42](https://inc42.com/buzz/byjus-buying-phone-numbers-students-parents-threatening-ncpcr-chief)). That is an inference, not a tested claim.

## Red lines and must-haves checklist

| Never (red lines) | Why |
|---|---|
| Ads or targeted ads to under-18s. Never use chat or mood data for ads | DPDP s.9(3) |
| Tracking or profiling minors beyond the consented study purpose. No engagement scoring or growth loops on minors' data | DPDP s.9(2)–(3) (**lawyer to confirm scope**) |
| Romantic, sexual or "friend with feelings" persona. Never claim to be human | Character.AI precedent, SB 243, APA |
| Diagnosis, therapy claims, medication advice | APA advisory |
| Rank-shaming, public leaderboards, batch rank to parents, "guaranteed rank" claims | *Sukdeb Saha*; MoE 2024 guidelines; pressure research |
| "Low score" or "missed session" push alerts to parents | Pressure-to-stress pathway |
| Raw logs, chat history, screenshots, location or mood shared with parents | Disclosure research; DPDP minimisation |
| Rewarding all-nighters or late-night streaks. Guilt notifications. Shaming broken streaks | AASM; streak research |
| AI writing the student's answer | Bastani crutch effect |
| Precise AI marks presented as exact | Weak LLM scoring reliability |
| Processing minors' data without verifiable parental consent once Rule 10 applies | DPDP Rule 10, about 13 May 2027 |

| Must-have | Detail |
|---|---|
| Age gate | Under-18 mode by default when age is unclear |
| Verifiable parental consent | DigiLocker token or equivalent. Standalone plain notice. Easy withdrawal. Grievance contact. Build now, re-verify old consents |
| Visible "I'm an AI" label | Plus break and "talk to a person" reminders |
| Crisis protocol | Detect self-harm signals, stop tutoring, show **Tele-MANAS 14416 / 1-800-891-4416** and 112. Human-reviewed rules. Published parent-alert policy (imminent risk only). Red-team before launch |
| Crisis routing before mood features | No mood check-in ships without it |
| Student sees everything parents see | "Preview as parent" |
| Clean 18th birthday | Student re-chooses all sharing |
| Effort-first parent view | Scores opt-in, trend only |
| Score honesty | Bands, not decimals. Validate AI marks against Indian teacher marks before claiming accuracy |
| Data hygiene | Minimise, encrypt, keep access logs 1+ year, 72-hour breach report, delete when purpose ends |
| Legal review before May 2027 | (1) Is adaptive learning "behavioural monitoring"? (2) Does any exemption apply? Watch the Gazette for timeline changes |
| Patent check | Amplifire's confidence-analytics patent scope |
| Own evidence | A/B tests and mock-score tracking. Most effects here are untested in India |

## Conclusion

The research changes the question. It is not "what can we show parents?" but "what will students *choose* to share?" Honest data only flows when students trust the app, and honest data is the only thing that makes a parent view worth paying for. That makes student control a business need, not just an ethical choice. It is also the legally safer path under DPDP s.9(3). Rivals cannot copy it easily, because their parent apps are built on the opposite idea.

The second shift is in what counts as a win. The evidence supports better behaviour first (more practice, more spacing, fewer confident errors, steadier sleep) and better marks second and less certainly. Kelvra should promise and measure behaviour change honestly, and prove the mark gains with its own data. The most urgent gaps are three open checks: no Indian parent or teen user research exists, no AI answer scores have been validated against Indian teachers, and the DPDP "behavioural monitoring" question needs a lawyer before May 2027.
