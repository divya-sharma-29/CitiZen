"use strict";

/** Localised labels, reply templates, suggested prompts and formatters (English, Hindi, Kannada). */

const LANGS = ["en", "hi", "kn"];
const LOCALES = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
const LANGUAGE_NAMES = { en: "English", hi: "Hindi", kn: "Kannada" };
const TIME_ZONE = "Asia/Kolkata";

const LABELS = {
  status: {
    en: { Reported: "Reported", "Under Review": "Under Review", Assigned: "Assigned", "In Progress": "In Progress", Resolved: "Resolved" },
    hi: { Reported: "दर्ज किया गया", "Under Review": "समीक्षाधीन", Assigned: "सौंपा गया", "In Progress": "प्रगति पर", Resolved: "हल हो गया" },
    kn: { Reported: "ವರದಿ ಮಾಡಲಾಗಿದೆ", "Under Review": "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ", Assigned: "ನಿಯೋಜಿಸಲಾಗಿದೆ", "In Progress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ", Resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ" },
  },
  category: {
    en: { "Road Damage": "Road Damage", Garbage: "Garbage", Streetlight: "Streetlight", "Water Leakage": "Water Leakage", Drainage: "Drainage", Other: "Other" },
    hi: { "Road Damage": "सड़क क्षति", Garbage: "कचरा", Streetlight: "स्ट्रीटलाइट", "Water Leakage": "पानी का रिसाव", Drainage: "जल निकासी", Other: "अन्य" },
    kn: { "Road Damage": "ರಸ್ತೆ ಹಾನಿ", Garbage: "ಕಸ", Streetlight: "ಬೀದಿ ದೀಪ", "Water Leakage": "ನೀರು ಸೋರಿಕೆ", Drainage: "ಚರಂಡಿ", Other: "ಇತರೆ" },
  },
  severity: {
    en: { Low: "Low", Medium: "Medium", High: "High", Critical: "Critical" },
    hi: { Low: "कम", Medium: "मध्यम", High: "उच्च", Critical: "गंभीर" },
    kn: { Low: "ಕಡಿಮೆ", Medium: "ಮಧ್ಯಮ", High: "ಹೆಚ್ಚು", Critical: "ಗಂಭೀರ" },
  },
};

function label(kind, lang, value) {
  const table = LABELS[kind];
  return (table[lang] && table[lang][value]) || table.en[value] || value || "";
}

const TEXT = {
  en: {
    welcome: "Hello! I'm CitiZen AI, your civic assistant. I can help you report issues, track complaints, understand civic services and explore what's happening in your neighbourhood. How can I help today?",
    switched: "Sure — I'll continue in English.",
    injection: "I can only help with civic topics on CitiZen — reporting issues, tracking your complaints and civic guidance. What would you like to do?",
    menu: "I'm not sure I understood that. I can help you report an issue, track your complaints, explain civic services, or share civic guidance. What would you like to do?",
    capabilities: "Here is what I can help with:\n• How to report an issue, with a suggested category and severity\n• Tracking your complaints: status, officer, last update, days pending\n• Why a complaint has its priority or is still open\n• Civic guidance: waste segregation, water conservation, road safety, hygiene and emergencies\nYou can write to me in English, Kannada or Hindi.",
    nearbyLater: "I can't search nearby issues from chat just yet. Please open the Civic Map to see reported issues around you.",
    noReports: "You haven't submitted any complaints on CitiZen yet. I can help you report an issue if you'd like.",
    askWhich: "Which complaint do you mean? Reply with its number.",
    listHeader: "You have {n} complaint(s) on CitiZen:",
    listLine: "{i}. {title} — {status} ({category})",
    listFooter: "Reply with a number for details.",
    listMore: "Showing your 5 most recent.",
    asOf: "Based on your CitiZen records as of {time}.",
    viewReport: "View report",
    empathy: "I'm sorry this has been frustrating — let's look at exactly where it stands.",
    statusLine: "Your complaint “{title}” ({category}) is currently: {status}. Reported {created}; last updated {updated}.",
    officerAssigned: "This complaint is assigned to {officer}{dept} (assigned {assignedAt}).",
    officerNone: "This complaint hasn't been assigned to an officer yet. Current status: {status}.",
    lastUpdate: "Last updated {updated} ({ago}).",
    lastActivity: "Latest activity: “{activity}”",
    pendingOpen: "It has been pending for {days} since it was reported on {created}.",
    pendingResolved: "It was resolved in {days} (on {resolved}).",
    escalationNone: "CitiZen doesn't record an escalation status for complaints, so I can't confirm whether it has been escalated.",
    reassigned: "Records show it has been reassigned {n} time(s).",
    noReassign: "No reassignments are recorded.",
    whyResolved: "This complaint is already marked Resolved ({on}).",
    stage: {
      Reported: "The complaint has been received and is waiting for review or assignment.",
      "Under Review": "The complaint is being reviewed.",
      Assigned: "The complaint has been assigned to an officer and is waiting for work to start.",
      "In Progress": "Work on it is in progress.",
      Resolved: "The complaint is marked resolved.",
    },
    whyAge: "It has been open for {days}.",
    whyAssigned: "It is assigned to {officer}.",
    whyUnassigned: "It hasn't been assigned to an officer yet.",
    whyPriority: "Its priority score is {score}/100 (severity {severity}).",
    whyStale: "No update has been recorded for {days}.",
    whyCannot: "I can't see an officer's internal reasons for a delay.",
    whyNext: "To ask for an update, you can add a comment on the report's page.",
    priorityLine: "Priority score: {score}/100 — severity {severity}, category {category}.",
    priorityBreakdown: "How it's calculated: base 50{parts} = {score}.",
    priorityPartCategory: " + {n} ({category})",
    priorityPartSeverity: " {sign} {n} ({severity} severity)",
    priorityNoBreakdown: "A higher score means a higher priority.",
    createIntro: "That sounds like a “{category}” issue.",
    createUnsure: "I'm not sure which category fits best — could you describe what you see?",
    createSeverity: "I'd suggest severity “{severity}” (based on: {reasons}).",
    createSeverityPlain: "I'd suggest severity “{severity}”.",
    createNext: "To report it, open Report Issue, choose that category and mark the exact location on the map.",
    deptCategory: "For “{category}” issues, the responsible body is usually the {body}. This is general guidance — please confirm with your local civic body.",
    emergencyReportLater: "Once everyone is safe, I can help you report the hazard on CitiZen.",
  },
  hi: {
    welcome: "नमस्ते! मैं CitiZen AI हूँ, आपका नागरिक सहायक। मैं समस्याएँ दर्ज करने, शिकायतें ट्रैक करने, नागरिक सेवाएँ समझने और आपके पड़ोस की जानकारी देखने में मदद कर सकता हूँ। आज मैं आपकी कैसे मदद करूँ?",
    switched: "ठीक है — मैं अब हिंदी में बात करूँगा।",
    injection: "मैं CitiZen पर केवल नागरिक विषयों में मदद कर सकता हूँ — समस्याएँ दर्ज करना, आपकी शिकायतें ट्रैक करना और नागरिक मार्गदर्शन। आप क्या करना चाहेंगे?",
    menu: "मैं आपकी बात ठीक से समझ नहीं पाया। मैं समस्या दर्ज करने, शिकायतें ट्रैक करने, नागरिक सेवाएँ समझाने या नागरिक मार्गदर्शन देने में मदद कर सकता हूँ। आप क्या करना चाहेंगे?",
    capabilities: "मैं इन कामों में मदद कर सकता हूँ:\n• समस्या कैसे दर्ज करें, श्रेणी और गंभीरता के सुझाव के साथ\n• आपकी शिकायतें ट्रैक करना: स्थिति, अधिकारी, अंतिम अपडेट, लंबित दिन\n• किसी शिकायत की प्राथमिकता या देरी का कारण समझाना\n• नागरिक मार्गदर्शन: कचरा पृथक्करण, जल संरक्षण, सड़क सुरक्षा, स्वच्छता और आपात स्थिति\nआप मुझसे अंग्रेज़ी, कन्नड़ या हिंदी में बात कर सकते हैं।",
    nearbyLater: "मैं अभी चैट से आस-पास की समस्याएँ नहीं खोज सकता। कृपया अपने आस-पास की रिपोर्ट देखने के लिए Civic Map खोलें।",
    noReports: "आपने अभी तक CitiZen में कोई शिकायत दर्ज नहीं की है। चाहें तो मैं समस्या दर्ज करने में मदद कर सकता हूँ।",
    askWhich: "आप किस शिकायत के बारे में पूछ रहे हैं? कृपया उसका नंबर बताएँ।",
    listHeader: "CitiZen में आपकी {n} शिकायत(ें) हैं:",
    listLine: "{i}. {title} — {status} ({category})",
    listFooter: "विवरण के लिए नंबर लिखें।",
    listMore: "आपकी 5 सबसे हाल की शिकायतें दिखाई गई हैं।",
    asOf: "यह जानकारी आपके CitiZen रिकॉर्ड के अनुसार {time} तक की है।",
    viewReport: "रिपोर्ट देखें",
    empathy: "आपको जो परेशानी हुई उसके लिए खेद है — आइए देखें कि स्थिति क्या है।",
    statusLine: "आपकी शिकायत “{title}” ({category}) की वर्तमान स्थिति: {status}। दर्ज की गई: {created}; अंतिम अपडेट: {updated}।",
    officerAssigned: "यह शिकायत {officer}{dept} को सौंपी गई है ({assignedAt})।",
    officerNone: "यह शिकायत अभी किसी अधिकारी को नहीं सौंपी गई है। वर्तमान स्थिति: {status}।",
    lastUpdate: "अंतिम अपडेट: {updated} ({ago})।",
    lastActivity: "नवीनतम गतिविधि: “{activity}”",
    pendingOpen: "{created} को रिपोर्ट किए जाने से अब तक यह {days} से लंबित है।",
    pendingResolved: "यह शिकायत {days} में हल हुई ({resolved} को)।",
    escalationNone: "CitiZen में शिकायतों की एस्केलेशन स्थिति दर्ज नहीं होती, इसलिए मैं इसकी पुष्टि नहीं कर सकता।",
    reassigned: "रिकॉर्ड के अनुसार इसे {n} बार पुनः सौंपा गया है।",
    noReassign: "कोई पुनः-असाइनमेंट दर्ज नहीं है।",
    whyResolved: "यह शिकायत पहले ही हल हो चुकी है ({on})।",
    stage: {
      Reported: "शिकायत प्राप्त हो गई है और समीक्षा या असाइनमेंट की प्रतीक्षा में है।",
      "Under Review": "शिकायत की समीक्षा चल रही है।",
      Assigned: "शिकायत एक अधिकारी को सौंपी जा चुकी है और काम शुरू होने की प्रतीक्षा में है।",
      "In Progress": "इस पर काम चल रहा है।",
      Resolved: "शिकायत हल मानी गई है।",
    },
    whyAge: "यह {days} से खुली है।",
    whyAssigned: "यह {officer} को सौंपी गई है।",
    whyUnassigned: "इसे अभी किसी अधिकारी को नहीं सौंपा गया है।",
    whyPriority: "इसका प्राथमिकता स्कोर {score}/100 है (गंभीरता: {severity})।",
    whyStale: "{days} से कोई अपडेट दर्ज नहीं हुआ।",
    whyCannot: "देरी के पीछे अधिकारी के आंतरिक कारण मुझे दिखाई नहीं देते।",
    whyNext: "अपडेट माँगने के लिए आप रिपोर्ट के पेज पर टिप्पणी जोड़ सकते हैं।",
    priorityLine: "प्राथमिकता स्कोर: {score}/100 — गंभीरता {severity}, श्रेणी {category}।",
    priorityBreakdown: "गणना: आधार 50{parts} = {score}।",
    priorityPartCategory: " + {n} ({category})",
    priorityPartSeverity: " {sign} {n} ({severity} गंभीरता)",
    priorityNoBreakdown: "ऊँचा स्कोर यानी ऊँची प्राथमिकता।",
    createIntro: "यह “{category}” श्रेणी की समस्या लगती है।",
    createUnsure: "मुझे पक्का नहीं पता कि कौन सी श्रेणी सही रहेगी — क्या आप बता सकते हैं कि आपको क्या दिख रहा है?",
    createSeverity: "मेरा सुझाव है कि गंभीरता “{severity}” रखें (आधार: {reasons})।",
    createSeverityPlain: "मेरा सुझाव है कि गंभीरता “{severity}” रखें।",
    createNext: "इसे दर्ज करने के लिए Report Issue खोलें, यही श्रेणी चुनें और मानचित्र पर सटीक स्थान चिह्नित करें।",
    deptCategory: "“{category}” की समस्याओं के लिए आम तौर पर {body} ज़िम्मेदार होता है। यह सामान्य जानकारी है — कृपया अपने स्थानीय नगर निकाय से पुष्टि करें।",
    emergencyReportLater: "सबके सुरक्षित होने के बाद मैं CitiZen पर इस ख़तरे की रिपोर्ट दर्ज करने में मदद कर सकता हूँ।",
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ! ನಾನು CitiZen AI, ನಿಮ್ಮ ನಾಗರಿಕ ಸಹಾಯಕ. ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು, ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ನಾಗರಿಕ ಸೇವೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ನಿಮ್ಮ ನೆರೆಹೊರೆಯಲ್ಲಿ ಏನಾಗುತ್ತಿದೆ ಎಂದು ತಿಳಿಯಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    switched: "ಸರಿ — ಇನ್ನು ಮುಂದೆ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತೇನೆ.",
    injection: "CitiZen ನಲ್ಲಿ ನಾನು ನಾಗರಿಕ ವಿಷಯಗಳಲ್ಲಿ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ — ಸಮಸ್ಯೆ ವರದಿ ಮಾಡುವುದು, ನಿಮ್ಮ ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಮತ್ತು ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶನ. ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
    menu: "ನಿಮ್ಮ ಮಾತು ನನಗೆ ಸರಿಯಾಗಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು, ದೂರುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ನಾಗರಿಕ ಸೇವೆಗಳನ್ನು ವಿವರಿಸಲು ಅಥವಾ ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
    capabilities: "ನಾನು ಈ ವಿಷಯಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ:\n• ಸಮಸ್ಯೆ ಹೇಗೆ ವರದಿ ಮಾಡುವುದು, ವರ್ಗ ಮತ್ತು ತೀವ್ರತೆಯ ಸಲಹೆಯೊಂದಿಗೆ\n• ನಿಮ್ಮ ದೂರುಗಳ ಟ್ರ್ಯಾಕಿಂಗ್: ಸ್ಥಿತಿ, ಅಧಿಕಾರಿ, ಕೊನೆಯ ಅಪ್ಡೇಟ್, ಬಾಕಿ ದಿನಗಳು\n• ದೂರಿನ ಆದ್ಯತೆ ಅಥವಾ ವಿಳಂಬದ ಕಾರಣ ವಿವರಣೆ\n• ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶನ: ಕಸ ವಿಂಗಡಣೆ, ನೀರು ಉಳಿತಾಯ, ರಸ್ತೆ ಸುರಕ್ಷತೆ, ಸ್ವಚ್ಛತೆ ಮತ್ತು ತುರ್ತು ಪರಿಸ್ಥಿತಿ\nನೀವು ನನ್ನೊಂದಿಗೆ ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಮಾತನಾಡಬಹುದು.",
    nearbyLater: "ಚಾಟ್‌ನಿಂದ ಹತ್ತಿರದ ಸಮಸ್ಯೆಗಳನ್ನು ಹುಡುಕಲು ನನಗೆ ಇನ್ನೂ ಸಾಧ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ಸುತ್ತಲಿನ ವರದಿಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು Civic Map ತೆರೆಯಿರಿ.",
    noReports: "ನೀವು ಇನ್ನೂ CitiZen ನಲ್ಲಿ ಯಾವುದೇ ದೂರು ಸಲ್ಲಿಸಿಲ್ಲ. ಬೇಕಾದರೆ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    askWhich: "ನೀವು ಯಾವ ದೂರಿನ ಬಗ್ಗೆ ಕೇಳುತ್ತಿದ್ದೀರಿ? ದಯವಿಟ್ಟು ಅದರ ಸಂಖ್ಯೆಯನ್ನು ತಿಳಿಸಿ.",
    listHeader: "CitiZen ನಲ್ಲಿ ನಿಮ್ಮ {n} ದೂರು(ಗಳು) ಇವೆ:",
    listLine: "{i}. {title} — {status} ({category})",
    listFooter: "ವಿವರಗಳಿಗೆ ಸಂಖ್ಯೆ ಬರೆಯಿರಿ.",
    listMore: "ನಿಮ್ಮ ಇತ್ತೀಚಿನ 5 ದೂರುಗಳನ್ನು ತೋರಿಸಲಾಗಿದೆ.",
    asOf: "ಈ ಮಾಹಿತಿ ನಿಮ್ಮ CitiZen ದಾಖಲೆಗಳ ಪ್ರಕಾರ {time} ವರೆಗಿನದು.",
    viewReport: "ವರದಿ ನೋಡಿ",
    empathy: "ನಿಮಗಾದ ಅನಾನುಕೂಲಕ್ಕೆ ವಿಷಾದಿಸುತ್ತೇನೆ — ಸ್ಥಿತಿ ಏನೆಂದು ನೋಡೋಣ.",
    statusLine: "ನಿಮ್ಮ ದೂರು “{title}” ({category}) ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: {status}. ವರದಿ ಮಾಡಿದ್ದು: {created}; ಕೊನೆಯ ಅಪ್ಡೇಟ್: {updated}.",
    officerAssigned: "ಈ ದೂರನ್ನು {officer}{dept} ಅವರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ ({assignedAt}).",
    officerNone: "ಈ ದೂರನ್ನು ಇನ್ನೂ ಯಾವ ಅಧಿಕಾರಿಗೂ ನಿಯೋಜಿಸಿಲ್ಲ. ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ: {status}.",
    lastUpdate: "ಕೊನೆಯ ಅಪ್ಡೇಟ್: {updated} ({ago}).",
    lastActivity: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ: “{activity}”",
    pendingOpen: "{created} ರಂದು ವರದಿ ಮಾಡಿದಾಗಿನಿಂದ ಬಾಕಿ ಉಳಿದ ಅವಧಿ: {days}.",
    pendingResolved: "ಈ ದೂರು ಪರಿಹಾರವಾಗಲು ತೆಗೆದುಕೊಂಡ ಅವಧಿ: {days} ({resolved}).",
    escalationNone: "CitiZen ನಲ್ಲಿ ದೂರುಗಳ ಎಸ್ಕಲೇಶನ್ ಸ್ಥಿತಿಯನ್ನು ದಾಖಲಿಸುವುದಿಲ್ಲ, ಆದ್ದರಿಂದ ಅದನ್ನು ನಾನು ಖಚಿತಪಡಿಸಲಾರೆ.",
    reassigned: "ದಾಖಲೆಗಳ ಪ್ರಕಾರ ಇದನ್ನು {n} ಬಾರಿ ಮರು-ನಿಯೋಜಿಸಲಾಗಿದೆ.",
    noReassign: "ಯಾವುದೇ ಮರು-ನಿಯೋಜನೆ ದಾಖಲಾಗಿಲ್ಲ.",
    whyResolved: "ಈ ದೂರು ಈಗಾಗಲೇ ಪರಿಹಾರವಾಗಿದೆ ({on}).",
    stage: {
      Reported: "ದೂರು ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಪರಿಶೀಲನೆ ಅಥವಾ ನಿಯೋಜನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ.",
      "Under Review": "ದೂರಿನ ಪರಿಶೀಲನೆ ನಡೆಯುತ್ತಿದೆ.",
      Assigned: "ದೂರನ್ನು ಅಧಿಕಾರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ ಮತ್ತು ಕೆಲಸ ಆರಂಭವಾಗಲು ಕಾಯುತ್ತಿದೆ.",
      "In Progress": "ಇದರ ಮೇಲೆ ಕೆಲಸ ನಡೆಯುತ್ತಿದೆ.",
      Resolved: "ದೂರು ಪರಿಹಾರವಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.",
    },
    whyAge: "ಇದು ತೆರೆದಿರುವ ಅವಧಿ: {days}.",
    whyAssigned: "ಇದನ್ನು {officer} ಅವರಿಗೆ ನಿಯೋಜಿಸಲಾಗಿದೆ.",
    whyUnassigned: "ಇದನ್ನು ಇನ್ನೂ ಯಾವ ಅಧಿಕಾರಿಗೂ ನಿಯೋಜಿಸಿಲ್ಲ.",
    whyPriority: "ಇದರ ಆದ್ಯತಾ ಸ್ಕೋರ್ {score}/100 (ತೀವ್ರತೆ: {severity}).",
    whyStale: "ಕೊನೆಯ ಅಪ್ಡೇಟ್ ಆಗಿ ಕಳೆದ ಅವಧಿ: {days}.",
    whyCannot: "ವಿಳಂಬದ ಹಿಂದಿನ ಅಧಿಕಾರಿಯ ಆಂತರಿಕ ಕಾರಣಗಳು ನನಗೆ ಕಾಣುವುದಿಲ್ಲ.",
    whyNext: "ಅಪ್ಡೇಟ್ ಕೇಳಲು ನೀವು ವರದಿಯ ಪುಟದಲ್ಲಿ ಕಾಮೆಂಟ್ ಸೇರಿಸಬಹುದು.",
    priorityLine: "ಆದ್ಯತಾ ಸ್ಕೋರ್: {score}/100 — ತೀವ್ರತೆ {severity}, ವರ್ಗ {category}.",
    priorityBreakdown: "ಲೆಕ್ಕಾಚಾರ: ಮೂಲ 50{parts} = {score}.",
    priorityPartCategory: " + {n} ({category})",
    priorityPartSeverity: " {sign} {n} ({severity} ತೀವ್ರತೆ)",
    priorityNoBreakdown: "ಹೆಚ್ಚಿನ ಸ್ಕೋರ್ ಎಂದರೆ ಹೆಚ್ಚಿನ ಆದ್ಯತೆ.",
    createIntro: "ಇದು “{category}” ವರ್ಗದ ಸಮಸ್ಯೆಯಂತೆ ಕಾಣುತ್ತಿದೆ.",
    createUnsure: "ಯಾವ ವರ್ಗ ಸರಿಯಾಗಿರುತ್ತದೆ ಎಂದು ನನಗೆ ಖಚಿತವಿಲ್ಲ — ನಿಮಗೆ ಏನು ಕಾಣುತ್ತಿದೆ ಎಂದು ವಿವರಿಸಬಹುದೇ?",
    createSeverity: "ತೀವ್ರತೆಯನ್ನು “{severity}” ಎಂದು ಇಡಲು ಸೂಚಿಸುತ್ತೇನೆ (ಆಧಾರ: {reasons}).",
    createSeverityPlain: "ತೀವ್ರತೆಯನ್ನು “{severity}” ಎಂದು ಇಡಲು ಸೂಚಿಸುತ್ತೇನೆ.",
    createNext: "ವರದಿ ಮಾಡಲು Report Issue ತೆರೆಯಿರಿ, ಈ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನಕ್ಷೆಯಲ್ಲಿ ನಿಖರವಾದ ಸ್ಥಳವನ್ನು ಗುರುತಿಸಿ.",
    deptCategory: "“{category}” ಸಮಸ್ಯೆಗಳಿಗೆ ಸಾಮಾನ್ಯವಾಗಿ {body} ಜವಾಬ್ದಾರರಾಗಿರುತ್ತಾರೆ. ಇದು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ — ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸ್ಥಳೀಯ ನಗರ ಸಂಸ್ಥೆಯೊಂದಿಗೆ ದೃಢಪಡಿಸಿಕೊಳ್ಳಿ.",
    emergencyReportLater: "ಎಲ್ಲರೂ ಸುರಕ್ಷಿತರಾದ ನಂತರ ಈ ಅಪಾಯವನ್ನು CitiZen ನಲ್ಲಿ ವರದಿ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
  },
};

const AGO = {
  en: { now: "just now", min: "{n} min ago", hour: "{n} hr ago", day1: "1 day ago", days: "{n} days ago" },
  hi: { now: "अभी-अभी", min: "{n} मिनट पहले", hour: "{n} घंटे पहले", day1: "1 दिन पहले", days: "{n} दिन पहले" },
  kn: { now: "ಇದೀಗ", min: "{n} ನಿಮಿಷಗಳ ಹಿಂದೆ", hour: "{n} ಗಂಟೆಗಳ ಹಿಂದೆ", day1: "1 ದಿನದ ಹಿಂದೆ", days: "{n} ದಿನಗಳ ಹಿಂದೆ" },
};

const DAYS = {
  en: (n) => (n === 1 ? "1 day" : `${n} days`),
  hi: (n) => `${n} दिन`,
  kn: (n) => `${n} ದಿನ`,
};

// Suggested prompts. Every prompt must be recognised by the intent detector in its own language (tested).
const PROMPTS = {
  en: {
    statusQ: "What is the status of my complaint?",
    officerQ: "Which officer is handling my complaint?",
    whyQ: "Why has my complaint not been resolved?",
    priorityQ: "Why does my complaint have this priority?",
    pendingQ: "How many days has my complaint been pending?",
    lastQ: "When was my complaint last updated?",
    reportHowQ: "How do I report an issue?",
    potholeQ: "How do I report a pothole?",
    nearbyQ: "What civic problems are reported near me?",
    servicesQ: "What civic services can you help with?",
    emergencyQ: "What is the procedure for reporting an emergency?",
  },
  hi: {
    statusQ: "मेरी शिकायत की स्थिति क्या है?",
    officerQ: "मेरी शिकायत कौन सा अधिकारी देख रहा है?",
    whyQ: "मेरी शिकायत अभी तक हल क्यों नहीं हुई?",
    priorityQ: "मेरी शिकायत की प्राथमिकता इतनी क्यों है?",
    pendingQ: "मेरी शिकायत कितने दिनों से लंबित है?",
    lastQ: "मेरी शिकायत आखिरी बार कब अपडेट हुई?",
    reportHowQ: "मैं समस्या कैसे दर्ज करूँ?",
    potholeQ: "गड्ढे की रिपोर्ट कैसे करें?",
    nearbyQ: "मेरे आस-पास कौन सी नागरिक समस्याएँ हैं?",
    servicesQ: "आप किन नागरिक सेवाओं में मदद कर सकते हैं?",
    emergencyQ: "आपात स्थिति की रिपोर्ट करने की प्रक्रिया क्या है?",
  },
  kn: {
    statusQ: "ನನ್ನ ದೂರಿನ ಸ್ಥಿತಿ ಏನು?",
    officerQ: "ನನ್ನ ದೂರನ್ನು ಯಾವ ಅಧಿಕಾರಿ ನೋಡಿಕೊಳ್ಳುತ್ತಿದ್ದಾರೆ?",
    whyQ: "ನನ್ನ ದೂರು ಇನ್ನೂ ಏಕೆ ಪರಿಹಾರವಾಗಿಲ್ಲ?",
    priorityQ: "ನನ್ನ ದೂರಿಗೆ ಈ ಆದ್ಯತೆ ಏಕೆ?",
    pendingQ: "ನನ್ನ ದೂರು ಎಷ್ಟು ದಿನಗಳಿಂದ ಬಾಕಿ ಇದೆ?",
    lastQ: "ನನ್ನ ದೂರು ಕೊನೆಯ ಬಾರಿ ಯಾವಾಗ ಅಪ್ಡೇಟ್ ಆಯಿತು?",
    reportHowQ: "ನಾನು ಸಮಸ್ಯೆಯನ್ನು ಹೇಗೆ ವರದಿ ಮಾಡಲಿ?",
    potholeQ: "ಗುಂಡಿಯನ್ನು ಹೇಗೆ ವರದಿ ಮಾಡುವುದು?",
    nearbyQ: "ನನ್ನ ಹತ್ತಿರ ಯಾವ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳು ವರದಿಯಾಗಿವೆ?",
    servicesQ: "ನೀವು ಯಾವ ನಾಗರಿಕ ಸೇವೆಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲಿರಿ?",
    emergencyQ: "ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವರದಿ ಮಾಡುವ ಕ್ರಮ ಯಾವುದು?",
  },
};

const CHIP_LABELS = {
  en: { report: "Report an issue", track: "Track my complaint", nearby: "Nearby civic issues", services: "Understand civic services" },
  hi: { report: "समस्या दर्ज करें", track: "मेरी शिकायत ट्रैक करें", nearby: "आस-पास की समस्याएँ", services: "नागरिक सेवाएँ समझें" },
  kn: { report: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ", track: "ನನ್ನ ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", nearby: "ಹತ್ತಿರದ ಸಮಸ್ಯೆಗಳು", services: "ನಾಗರಿಕ ಸೇವೆಗಳನ್ನು ತಿಳಿಯಿರಿ" },
};

const CHIP_PROMPTS = { report: "reportHowQ", track: "statusQ", nearby: "nearbyQ", services: "servicesQ" };

function safeLang(lang) {
  return LANGS.includes(lang) ? lang : "en";
}

function fmt(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_m, key) =>
    vars[key] === undefined || vars[key] === null ? "" : String(vars[key])
  );
}

function t(lang, key, vars) {
  const table = TEXT[safeLang(lang)];
  const value = table[key] !== undefined ? table[key] : TEXT.en[key];
  return typeof value === "string" ? fmt(value, vars) : value;
}

function prompt(lang, key) {
  return (PROMPTS[safeLang(lang)] || PROMPTS.en)[key] || PROMPTS.en[key];
}

function chip(lang, key) {
  return { label: CHIP_LABELS[safeLang(lang)][key], prompt: prompt(lang, CHIP_PROMPTS[key]) };
}

function chipFromPrompt(lang, promptKey, labelText) {
  return { label: labelText || prompt(lang, promptKey), prompt: prompt(lang, promptKey) };
}

function defaultChips(lang) {
  return ["report", "track", "nearby", "services"].map((key) => chip(lang, key));
}

function formatDate(date, lang) {
  return new Intl.DateTimeFormat(LOCALES[safeLang(lang)], {
    day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE,
  }).format(new Date(date));
}

function formatDateTime(date, lang) {
  return new Intl.DateTimeFormat(LOCALES[safeLang(lang)], {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE,
  }).format(new Date(date));
}

function daysText(n, lang) {
  return DAYS[safeLang(lang)](n);
}

function ago(from, to, lang) {
  const table = AGO[safeLang(lang)];
  const minutes = Math.floor(Math.max(0, new Date(to) - new Date(from)) / 60000);

  if (minutes < 1) return table.now;
  if (minutes < 60) return fmt(table.min, { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return fmt(table.hour, { n: hours });
  const days = Math.floor(hours / 24);
  return days === 1 ? table.day1 : fmt(table.days, { n: days });
}

module.exports = {
  LANGS, LANGUAGE_NAMES, PROMPTS, label, t, fmt, prompt, chip, chipFromPrompt,
  defaultChips, formatDate, formatDateTime, daysText, ago, safeLang,
};
