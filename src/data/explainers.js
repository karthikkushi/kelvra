// src/data/explainers.js
// Parent Explainer notes: short, calm explanations of exam terms that confuse families, each with
// "what to say tonight" lines and official sources. Same for every family, so they are written once.
// Rules: facts only from official sources (linked), dated; no marks, no comparison, no sales.
// Before launch: a teacher should check the facts and a native speaker should check the Hindi.
export const EXPLAINERS_CHECKED = "November 2026";

export const EXPLAINERS = [
  {
    id: "percentile",
    title: { en: "What is a percentile?", hi: "परसेंटाइल क्या होता है?" },
    body: {
      en: [
        "A percentile is not the same as percentage marks.",
        "In exams run by the NTA (like JEE Main, NEET-UG and CUET), a percentile tells you what share of students in that exam scored the same as or lower than your child.",
        "So a 90 percentile means your child scored the same as or higher than 90% of the students who took that exam. It does not mean 90% marks.",
      ],
      hi: [
        "परसेंटाइल और प्रतिशत अंक एक जैसे नहीं होते।",
        "NTA की परीक्षाओं (जैसे JEE Main, NEET-UG और CUET) में परसेंटाइल बताता है कि उस परीक्षा में कितने प्रतिशत छात्रों के अंक आपके बच्चे के बराबर या उससे कम थे।",
        "यानी 90 परसेंटाइल का मतलब है कि आपके बच्चे ने परीक्षा देने वाले 90% छात्रों के बराबर या उनसे बेहतर किया। इसका मतलब 90% अंक नहीं है।",
      ],
    },
    say: {
      en: ["Ask: \"Which part of the paper felt easiest, and which felt hardest?\"", "Avoid: comparing the percentile with a cousin's or a neighbour's child."],
      hi: ["पूछें: \"पेपर का कौन-सा हिस्सा सबसे आसान लगा और कौन-सा सबसे मुश्किल?\"", "न करें: परसेंटाइल की तुलना किसी रिश्तेदार या पड़ोसी के बच्चे से।"],
    },
    sources: [{ label: "National Testing Agency (NTA)", url: "https://nta.ac.in" }],
  },
  {
    id: "normalisation",
    title: { en: "Why are scores 'normalised'?", hi: "अंक 'नॉर्मलाइज़' क्यों किए जाते हैं?" },
    body: {
      en: [
        "Big exams like JEE Main are held in several shifts, and one shift's paper can be a little easier or harder than another's.",
        "To keep it fair, the NTA works out percentiles within each shift and then combines them. This is called normalisation.",
        "So raw marks from different shifts cannot be compared directly. Two students with the same marks in different shifts can get different percentiles.",
      ],
      hi: [
        "JEE Main जैसी बड़ी परीक्षाएँ कई पालियों (शिफ्ट) में होती हैं, और किसी शिफ्ट का पेपर थोड़ा आसान या मुश्किल हो सकता है।",
        "इसे बराबर रखने के लिए NTA हर शिफ्ट के अंदर परसेंटाइल निकालता है और फिर उन्हें जोड़ता है। इसे नॉर्मलाइज़ेशन कहते हैं।",
        "इसलिए अलग-अलग शिफ्ट के अंकों की सीधी तुलना नहीं हो सकती। एक जैसे अंक वाले दो छात्रों का परसेंटाइल अलग हो सकता है।",
      ],
    },
    say: {
      en: ["Say: \"Your shift doesn't decide your future. Let's focus on what you can still improve.\""],
      hi: ["कहें: \"तुम्हारी शिफ्ट से तुम्हारा भविष्य तय नहीं होता। चलो उस पर ध्यान दें जो अभी भी बेहतर हो सकता है।\""],
    },
    sources: [{ label: "JEE Main (NTA)", url: "https://jeemain.nta.nic.in" }],
  },
  {
    id: "marks-rank",
    title: { en: "Marks, percentile, rank: what's the difference?", hi: "अंक, परसेंटाइल, रैंक: क्या फ़र्क है?" },
    body: {
      en: [
        "Marks are what your child scored on the paper.",
        "Percentile shows where those marks stand compared with everyone who took the exam.",
        "Rank is the position in the final merit list. Colleges and counselling use rank, and each year's cut-offs change with the paper and the number of students.",
        "Online \"rank predictors\" are only estimates. Official ranks come only from the exam body.",
      ],
      hi: [
        "अंक वह हैं जो आपके बच्चे ने पेपर में पाए।",
        "परसेंटाइल बताता है कि परीक्षा देने वाले सभी छात्रों के मुकाबले वे अंक कहाँ हैं।",
        "रैंक अंतिम मेरिट लिस्ट में स्थान है। कॉलेज और काउंसलिंग रैंक देखते हैं, और हर साल कट-ऑफ पेपर और छात्रों की संख्या के हिसाब से बदलती है।",
        "ऑनलाइन \"रैंक प्रेडिक्टर\" सिर्फ़ अंदाज़ा होते हैं। असली रैंक सिर्फ़ परीक्षा संस्था देती है।",
      ],
    },
    say: {
      en: ["Ask: \"What are your options for each possible range?\" Plan B is a plan, not a failure."],
      hi: ["पूछें: \"हर संभावित रेंज के लिए तुम्हारे पास क्या विकल्प हैं?\" प्लान B भी एक योजना है, असफलता नहीं।"],
    },
    sources: [{ label: "National Testing Agency (NTA)", url: "https://nta.ac.in" }],
  },
  {
    id: "two-boards",
    title: { en: "Why are there two Class 10 board exams?", hi: "कक्षा 10 की दो बोर्ड परीक्षाएँ क्यों?" },
    body: {
      en: [
        "From 2026, CBSE gives Class 10 students a second board exam later in the year. It is optional and meant for improving scores.",
        "If your child takes it, the better result counts.",
        "Which subjects can be retaken, and the dates, are set in CBSE's circulars. Always check the latest circular on the CBSE website.",
      ],
      hi: [
        "2026 से CBSE कक्षा 10 के छात्रों को साल में बाद में एक दूसरी बोर्ड परीक्षा का मौका देता है। यह वैकल्पिक है और अंक सुधारने के लिए है।",
        "अगर आपका बच्चा इसे देता है, तो दोनों में से बेहतर परिणाम माना जाता है।",
        "कौन-से विषय दोबारा दिए जा सकते हैं और तारीखें क्या हैं, यह CBSE के सर्कुलर में होता है। हमेशा CBSE वेबसाइट पर ताज़ा सर्कुलर देखें।",
      ],
    },
    say: {
      en: ["Say: \"The first exam is not your only chance. Let's make a calm plan for both.\""],
      hi: ["कहें: \"पहली परीक्षा तुम्हारा इकलौता मौका नहीं है। चलो दोनों के लिए शांति से योजना बनाते हैं।\""],
    },
    sources: [{ label: "CBSE", url: "https://www.cbse.gov.in" }],
  },
  {
    id: "counselling",
    title: { en: "What happens in counselling rounds?", hi: "काउंसलिंग राउंड में क्या होता है?" },
    body: {
      en: [
        "After results, seats in colleges are given out in rounds, based on rank and the choices your child fills in.",
        "In JoSAA (for IITs, NITs and others), after a seat is offered your child can choose Freeze (accept this seat), Float (keep it, but move to a better choice at another institute if one opens), or Slide (keep it, but move to a better branch in the same institute).",
        "Medical (NEET) counselling is run separately, by the MCC and state authorities. Deadlines are strict: missing a step can cost a seat, so check the official schedule.",
      ],
      hi: [
        "परिणाम के बाद कॉलेजों में सीटें राउंड में दी जाती हैं, रैंक और आपके बच्चे द्वारा भरी गई पसंद के आधार पर।",
        "JoSAA (IIT, NIT आदि के लिए) में सीट मिलने के बाद बच्चा Freeze (यही सीट स्वीकार), Float (सीट रखें, पर किसी दूसरे संस्थान में बेहतर पसंद खुले तो वहाँ जाएँ) या Slide (सीट रखें, पर उसी संस्थान में बेहतर ब्रांच में जाएँ) चुन सकता है।",
        "मेडिकल (NEET) काउंसलिंग अलग से MCC और राज्य संस्थाएँ करती हैं। समय-सीमा सख़्त होती है: कोई कदम छूटा तो सीट जा सकती है, इसलिए आधिकारिक शेड्यूल देखें।",
      ],
    },
    say: {
      en: ["Ask: \"Shall we write down every deadline together and set reminders?\""],
      hi: ["पूछें: \"क्या हम मिलकर हर समय-सीमा लिख लें और रिमाइंडर लगा लें?\""],
    },
    sources: [
      { label: "JoSAA", url: "https://josaa.nic.in" },
      { label: "Medical Counselling Committee (MCC)", url: "https://mcc.nic.in" },
    ],
  },
  {
    id: "spaced-review",
    title: { en: "Why does my child keep revising old topics?", hi: "मेरा बच्चा पुराने टॉपिक बार-बार क्यों दोहराता है?" },
    body: {
      en: [
        "We forget most new things within days unless we come back to them.",
        "Kelvra brings each topic back just before your child would forget it. Short reviews spread over many days are remembered much better than one long night before the exam.",
        "So a few minutes on \"old\" topics is not wasted time. It is what makes them stay until exam day.",
      ],
      hi: [
        "नई चीज़ें अगर दोबारा न देखी जाएँ तो हम ज़्यादातर कुछ ही दिनों में भूल जाते हैं।",
        "Kelvra हर टॉपिक को ठीक उस समय वापस लाता है जब बच्चा उसे भूलने वाला होता है। कई दिनों में फैले छोटे रिवीज़न, परीक्षा से पहले की एक लंबी रात से कहीं बेहतर याद रहते हैं।",
        "इसलिए \"पुराने\" टॉपिक पर कुछ मिनट बर्बाद समय नहीं है। इसी से वे परीक्षा तक याद रहते हैं।",
      ],
    },
    say: {
      en: ["Say: \"I like that you're revising a little every day.\""],
      hi: ["कहें: \"मुझे अच्छा लगा कि तुम रोज़ थोड़ा-थोड़ा दोहरा रहे हो।\""],
    },
    sources: [{ label: "Dunlosky et al. 2013, \"Improving students' learning\" (research review)", url: "https://doi.org/10.1177/1529100612453266" }],
  },
  {
    id: "after-test",
    title: { en: "What to say after a disappointing test", hi: "खराब टेस्ट के बाद क्या कहें" },
    body: {
      en: [
        "After a bad test, children usually already feel worse than you do.",
        "Talking about what they learned and their plan helps more than questions about marks. Pressure and comparison make stress worse.",
        "Praise effort and good strategies (\"You worked out why you lost marks\"), not cleverness (\"You're so smart\").",
      ],
      hi: [
        "खराब टेस्ट के बाद बच्चे अक्सर आपसे ज़्यादा बुरा महसूस कर रहे होते हैं।",
        "उन्होंने क्या सीखा और आगे की योजना क्या है, इस पर बात करना अंकों के सवालों से ज़्यादा मदद करता है। दबाव और तुलना तनाव बढ़ाते हैं।",
        "मेहनत और अच्छे तरीके की तारीफ़ करें (\"तुमने समझ लिया कि अंक कहाँ कटे\"), सिर्फ़ होशियारी की नहीं (\"तुम बहुत तेज़ हो\")।",
      ],
    },
    say: {
      en: [
        "Say: \"I'm proud of how hard you're working.\"",
        "Ask: \"What's one thing you'll do differently next time? How can I help?\"",
        "Avoid: \"Why so low?\", comparisons, or talking about it in front of relatives.",
      ],
      hi: [
        "कहें: \"मुझे तुम्हारी मेहनत पर गर्व है।\"",
        "पूछें: \"अगली बार तुम एक चीज़ क्या अलग करोगे? मैं कैसे मदद करूँ?\"",
        "न करें: \"इतने कम क्यों?\", तुलना, या रिश्तेदारों के सामने इसकी बात।",
      ],
    },
    sources: [{ label: "Tele-MANAS mental health helpline: 14416 (free, 24x7)", url: "https://telemanas.mohfw.gov.in" }],
  },
  {
    id: "exam-rumours",
    title: { en: "How to check if exam news is real", hi: "परीक्षा की खबर असली है या नहीं, कैसे जाँचें" },
    body: {
      en: [
        "Before results and exams, fake news spreads fast on WhatsApp and Telegram: \"paper leaked\", \"exam postponed\", \"new pattern\".",
        "Only trust notices on the official website of the exam body. If it is not there, treat it as a rumour.",
        "Never buy or forward a \"leaked\" or \"guess\" paper. They are usually scams, and leaking exam papers is a crime under the Public Examinations Act, 2024.",
      ],
      hi: [
        "रिज़ल्ट और परीक्षा से पहले WhatsApp और Telegram पर झूठी खबरें तेज़ी से फैलती हैं: \"पेपर लीक\", \"परीक्षा टली\", \"नया पैटर्न\"।",
        "सिर्फ़ परीक्षा संस्था की आधिकारिक वेबसाइट की सूचना पर भरोसा करें। अगर वहाँ नहीं है, तो उसे अफ़वाह मानें।",
        "\"लीक\" या \"गेस\" पेपर कभी न खरीदें और न आगे भेजें। ये अक्सर धोखा होते हैं, और पेपर लीक करना सार्वजनिक परीक्षा अधिनियम, 2024 के तहत अपराध है।",
      ],
    },
    say: {
      en: ["Say: \"Let's check the official site together before we worry.\""],
      hi: ["कहें: \"चिंता करने से पहले चलो साथ में आधिकारिक साइट देख लेते हैं।\""],
    },
    sources: [
      { label: "CBSE", url: "https://www.cbse.gov.in" },
      { label: "NTA", url: "https://nta.ac.in" },
      { label: "UPSC", url: "https://upsc.gov.in" },
    ],
  },
  {
    id: "sleep",
    title: { en: "Why sleep matters more than late nights", hi: "देर रात पढ़ने से ज़्यादा नींद क्यों ज़रूरी है" },
    body: {
      en: [
        "Teenagers need about 8 to 10 hours of sleep a night.",
        "Sleep is when the brain stores what was studied that day. All-nighters before an exam usually hurt memory and focus more than they help.",
        "Regular short sleep in teenagers is also linked to low mood. Protecting sleep is part of good exam preparation.",
      ],
      hi: [
        "किशोरों को रात में लगभग 8 से 10 घंटे की नींद चाहिए।",
        "नींद के दौरान ही दिमाग़ दिन में पढ़ी चीज़ों को सहेजता है। परीक्षा से पहले पूरी रात जागना आमतौर पर याददाश्त और ध्यान को फ़ायदे से ज़्यादा नुकसान पहुँचाता है।",
        "किशोरों में लगातार कम नींद उदास मन से भी जुड़ी है। नींद की रक्षा करना अच्छी परीक्षा तैयारी का हिस्सा है।",
      ],
    },
    say: {
      en: ["Say: \"Lights off by 11 tonight. Sleep is part of studying.\""],
      hi: ["कहें: \"आज रात 11 बजे तक लाइट बंद। नींद भी पढ़ाई का हिस्सा है।\""],
    },
    sources: [{ label: "American Academy of Sleep Medicine: teen sleep recommendation", url: "https://aasm.org/resources/pdf/pressroom/teen-sleep-duration-recommendation.pdf" }],
  },
];

export const explainerById = (id) => EXPLAINERS.find((e) => e.id === id) || null;
export const explainerUrl = (id, origin = typeof window !== "undefined" ? window.location.origin : "") => `${origin}/explain/${id}`;

// Plain text for reading aloud or sharing.
export function explainerText(e, lang = "en") {
  const l = e.title[lang] ? lang : "en";
  return [e.title[l], ...e.body[l], ...(e.say[l] || [])].join(" ");
}
