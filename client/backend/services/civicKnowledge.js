"use strict";

/**
 * Static, reviewed civic guidance. The assistant NEVER invents policies or phone numbers:
 * anything an answer states as fact comes from this file or from the database.
 *
 * Before launch, have your municipal partner verify EMERGENCY_NUMBERS and the
 * "general guidance" wording for your city.
 */

const i18n = require("./civicI18n");

// National numbers in India. Edit if your deployment is elsewhere.
const EMERGENCY_NUMBERS = Object.freeze({
  unified: "112",
  police: "100",
  fire: "101",
  ambulance: "102",
});
const ALLOWED_PHONE_NUMBERS = new Set(Object.values(EMERGENCY_NUMBERS));

const GUIDANCE = {
  report_how: {
    en: "To report an issue in CitiZen: open Report Issue, choose the category, describe the problem, mark the location on the map and add photos if you can, then submit. You can follow progress any time from My Reports. Tell me what the problem is and I'll suggest the category and severity.",
    hi: "CitiZen में समस्या दर्ज करने के लिए 'Report Issue' खोलें, श्रेणी चुनें, समस्या का विवरण लिखें, मानचित्र पर स्थान चुनें और संभव हो तो फ़ोटो जोड़ें, फिर सबमिट करें। प्रगति आप कभी भी 'My Reports' में देख सकते हैं। मुझे समस्या बताइए, मैं श्रेणी और गंभीरता सुझा दूँगा।",
    kn: "CitiZen ನಲ್ಲಿ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು 'Report Issue' ತೆರೆಯಿರಿ, ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ, ನಕ್ಷೆಯಲ್ಲಿ ಸ್ಥಳವನ್ನು ಗುರುತಿಸಿ, ಸಾಧ್ಯವಾದರೆ ಫೋಟೋ ಸೇರಿಸಿ, ನಂತರ ಸಲ್ಲಿಸಿ. ಪ್ರಗತಿಯನ್ನು 'My Reports' ನಲ್ಲಿ ಯಾವಾಗಲಾದರೂ ನೋಡಬಹುದು. ಸಮಸ್ಯೆ ಏನೆಂದು ಹೇಳಿ, ನಾನು ವರ್ಗ ಮತ್ತು ತೀವ್ರತೆಯನ್ನು ಸೂಚಿಸುತ್ತೇನೆ.",
  },
  track_how: {
    en: "Open My Reports to see all your complaints with their current status, and open any report for its full activity history. You'll also get a notification whenever something changes. Or ask me: “What is the status of my complaint?”",
    hi: "अपनी सभी शिकायतें और उनकी वर्तमान स्थिति देखने के लिए My Reports खोलें, और पूरा गतिविधि इतिहास देखने के लिए किसी भी रिपोर्ट को खोलें। कोई बदलाव होने पर आपको सूचना भी मिलेगी। या मुझसे पूछें: “मेरी शिकायत की स्थिति क्या है?”",
    kn: "ನಿಮ್ಮ ಎಲ್ಲಾ ದೂರುಗಳು ಮತ್ತು ಅವುಗಳ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯನ್ನು ನೋಡಲು My Reports ತೆರೆಯಿರಿ, ಮತ್ತು ಸಂಪೂರ್ಣ ಚಟುವಟಿಕೆ ಇತಿಹಾಸಕ್ಕಾಗಿ ಯಾವುದೇ ವರದಿಯನ್ನು ತೆರೆಯಿರಿ. ಏನಾದರೂ ಬದಲಾದಾಗ ನಿಮಗೆ ಅಧಿಸೂಚನೆಯೂ ಬರುತ್ತದೆ. ಅಥವಾ ನನ್ನನ್ನು ಕೇಳಿ: “ನನ್ನ ದೂರಿನ ಸ್ಥಿತಿ ಏನು?”",
  },
  department_info: {
    en: "In CitiZen, every report is assigned to an authority officer, and the officer's name and department appear on the report once it is assigned. Which city body is responsible for each type of problem (roads, water supply, drainage, street lighting, solid waste) depends on your city, so please treat this as general guidance and confirm with your local civic body. I can check who is handling any of your complaints — just ask.",
    hi: "CitiZen में हर रिपोर्ट किसी प्राधिकरण अधिकारी को सौंपी जाती है, और सौंपे जाने के बाद अधिकारी का नाम और विभाग रिपोर्ट पर दिखता है। हर प्रकार की समस्या (सड़क, जल आपूर्ति, जल निकासी, स्ट्रीट लाइट, ठोस कचरा) के लिए कौन सा नगर निकाय ज़िम्मेदार है, यह आपके शहर पर निर्भर करता है — इसे सामान्य जानकारी मानें और अपने स्थानीय नगर निकाय से पुष्टि करें। मैं देख सकता हूँ कि आपकी कौन सी शिकायत कौन देख रहा है — बस पूछिए।",
    kn: "CitiZen ನಲ್ಲಿ ಪ್ರತಿ ವರದಿಯನ್ನು ಪ್ರಾಧಿಕಾರದ ಅಧಿಕಾರಿಗೆ ನಿಯೋಜಿಸಲಾಗುತ್ತದೆ, ಮತ್ತು ನಿಯೋಜಿಸಿದ ನಂತರ ಅಧಿಕಾರಿಯ ಹೆಸರು ಮತ್ತು ಇಲಾಖೆ ವರದಿಯಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ. ಪ್ರತಿ ರೀತಿಯ ಸಮಸ್ಯೆಗೆ (ರಸ್ತೆ, ನೀರು ಸರಬರಾಜು, ಚರಂಡಿ, ಬೀದಿ ದೀಪ, ಘನ ತ್ಯಾಜ್ಯ) ಯಾವ ನಗರ ಸಂಸ್ಥೆ ಜವಾಬ್ದಾರ ಎಂಬುದು ನಿಮ್ಮ ನಗರದ ಮೇಲೆ ಅವಲಂಬಿತ — ಇದನ್ನು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಎಂದು ಪರಿಗಣಿಸಿ ಮತ್ತು ಸ್ಥಳೀಯ ನಗರ ಸಂಸ್ಥೆಯೊಂದಿಗೆ ದೃಢಪಡಿಸಿಕೊಳ್ಳಿ. ನಿಮ್ಮ ಯಾವ ದೂರನ್ನು ಯಾರು ನೋಡಿಕೊಳ್ಳುತ್ತಿದ್ದಾರೆ ಎಂದು ನಾನು ಪರಿಶೀಲಿಸಬಲ್ಲೆ — ಕೇಳಿ.",
  },
  emergency: {
    en: `If someone is in immediate danger, call ${EMERGENCY_NUMBERS.unified} (national emergency number) right now. Police: ${EMERGENCY_NUMBERS.police} · Fire: ${EMERGENCY_NUMBERS.fire} · Ambulance: ${EMERGENCY_NUMBERS.ambulance}. Move away from the hazard (fire, gas leak, exposed live wires, flooding, collapsing structures) and warn people nearby. CitiZen is a civic reporting platform, not an emergency service, so please don't wait for a report to be answered.`,
    hi: `अगर किसी की जान को तुरंत ख़तरा है, तो अभी ${EMERGENCY_NUMBERS.unified} (राष्ट्रीय आपातकालीन नंबर) पर कॉल करें। पुलिस: ${EMERGENCY_NUMBERS.police} · फायर: ${EMERGENCY_NUMBERS.fire} · एम्बुलेंस: ${EMERGENCY_NUMBERS.ambulance}। ख़तरे (आग, गैस रिसाव, खुले करंट वाले तार, बाढ़, गिरती इमारत) से दूर हटें और आस-पास के लोगों को सावधान करें। CitiZen एक नागरिक रिपोर्टिंग प्लेटफ़ॉर्म है, आपातकालीन सेवा नहीं, इसलिए रिपोर्ट के जवाब का इंतज़ार न करें।`,
    kn: `ಯಾರಿಗಾದರೂ ತಕ್ಷಣದ ಅಪಾಯವಿದ್ದರೆ ಈಗಲೇ ${EMERGENCY_NUMBERS.unified} (ರಾಷ್ಟ್ರೀಯ ತುರ್ತು ಸಂಖ್ಯೆ) ಗೆ ಕರೆ ಮಾಡಿ. ಪೊಲೀಸ್: ${EMERGENCY_NUMBERS.police} · ಅಗ್ನಿಶಾಮಕ: ${EMERGENCY_NUMBERS.fire} · ಆಂಬ್ಯುಲೆನ್ಸ್: ${EMERGENCY_NUMBERS.ambulance}. ಅಪಾಯದಿಂದ (ಬೆಂಕಿ, ಅನಿಲ ಸೋರಿಕೆ, ತೆರೆದ ವಿದ್ಯುತ್ ತಂತಿ, ಪ್ರವಾಹ, ಕುಸಿಯುವ ಕಟ್ಟಡ) ದೂರ ಸರಿಯಿರಿ ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನವರನ್ನು ಎಚ್ಚರಿಸಿ. CitiZen ಒಂದು ನಾಗರಿಕ ವರದಿ ವೇದಿಕೆಯಾಗಿದೆ, ತುರ್ತು ಸೇವೆಯಲ್ಲ; ಆದ್ದರಿಂದ ವರದಿಗೆ ಉತ್ತರ ಬರುವವರೆಗೆ ಕಾಯಬೇಡಿ.`,
  },
  waste_segregation: {
    en: "Keep waste in separate bins at home: wet waste (food scraps, vegetable peels, flowers), dry waste (paper, plastic, metal, glass) and sanitary or hazardous items (batteries, bulbs, expired medicines — keep these separate and hand them over as your local collection rules direct). Never mix wet waste into dry. Collection timings and special drives differ by city, so check with your local body. This is general guidance, not an official notice.",
    hi: "घर पर कचरा अलग-अलग डिब्बों में रखें: गीला कचरा (बचा खाना, सब्ज़ियों के छिलके, फूल), सूखा कचरा (कागज़, प्लास्टिक, धातु, काँच) और सैनिटरी या ख़तरनाक वस्तुएँ (बैटरी, बल्ब, एक्सपायर दवाइयाँ — इन्हें अलग रखें और स्थानीय संग्रह नियमों के अनुसार सौंपें)। गीले कचरे को सूखे में कभी न मिलाएँ। संग्रह का समय और विशेष अभियान शहर के अनुसार अलग होते हैं, इसलिए अपने स्थानीय निकाय से पूछें। यह सामान्य मार्गदर्शन है, आधिकारिक सूचना नहीं।",
    kn: "ಮನೆಯಲ್ಲಿ ಕಸವನ್ನು ಪ್ರತ್ಯೇಕ ಡಬ್ಬಿಗಳಲ್ಲಿ ಇಡಿ: ಹಸಿ ಕಸ (ಆಹಾರದ ಉಳಿಕೆ, ತರಕಾರಿ ಸಿಪ್ಪೆ, ಹೂವು), ಒಣ ಕಸ (ಕಾಗದ, ಪ್ಲಾಸ್ಟಿಕ್, ಲೋಹ, ಗಾಜು) ಮತ್ತು ಸ್ಯಾನಿಟರಿ ಅಥವಾ ಅಪಾಯಕಾರಿ ವಸ್ತುಗಳು (ಬ್ಯಾಟರಿ, ಬಲ್ಬ್, ಅವಧಿ ಮುಗಿದ ಔಷಧ — ಇವನ್ನು ಬೇರೆ ಇಟ್ಟು ಸ್ಥಳೀಯ ಸಂಗ್ರಹ ನಿಯಮಗಳ ಪ್ರಕಾರ ಹಸ್ತಾಂತರಿಸಿ). ಹಸಿ ಕಸವನ್ನು ಒಣ ಕಸದೊಂದಿಗೆ ಎಂದಿಗೂ ಬೆರೆಸಬೇಡಿ. ಸಂಗ್ರಹ ಸಮಯ ಮತ್ತು ವಿಶೇಷ ಅಭಿಯಾನಗಳು ನಗರದಿಂದ ನಗರಕ್ಕೆ ಭಿನ್ನ, ಆದ್ದರಿಂದ ಸ್ಥಳೀಯ ಸಂಸ್ಥೆಯನ್ನು ಕೇಳಿ. ಇದು ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ, ಅಧಿಕೃತ ಸೂಚನೆ ಅಲ್ಲ.",
  },
  water_conservation: {
    en: "Fix dripping taps and leaking pipes quickly, turn off the tap while brushing or washing, use a bucket instead of a hose to wash vehicles, run washing machines with full loads, and reuse water where it is safe, for example for plants. If you see a leaking public pipe or continuous water wastage, report it under “Water Leakage” in CitiZen.",
    hi: "टपकते नल और लीक होते पाइप जल्दी ठीक कराएँ, ब्रश करते या बर्तन धोते समय नल बंद रखें, वाहन धोने के लिए पाइप की जगह बाल्टी का उपयोग करें, वॉशिंग मशीन पूरी भरकर चलाएँ और जहाँ सुरक्षित हो पानी दोबारा उपयोग करें, जैसे पौधों के लिए। सार्वजनिक पाइप लीक हो रहा हो या पानी लगातार बर्बाद हो रहा हो तो CitiZen में “Water Leakage” के तहत रिपोर्ट करें।",
    kn: "ತೊಟ್ಟಿಕ್ಕುವ ನಲ್ಲಿ ಮತ್ತು ಸೋರುವ ಪೈಪ್‌ಗಳನ್ನು ಬೇಗ ಸರಿಪಡಿಸಿ, ಹಲ್ಲುಜ್ಜುವಾಗ ಅಥವಾ ತೊಳೆಯುವಾಗ ನಲ್ಲಿ ಮುಚ್ಚಿ, ವಾಹನ ತೊಳೆಯಲು ಪೈಪ್ ಬದಲು ಬಕೆಟ್ ಬಳಸಿ, ವಾಷಿಂಗ್ ಮಶೀನ್ ಅನ್ನು ಪೂರ್ಣ ತುಂಬಿ ಓಡಿಸಿ, ಮತ್ತು ಸುರಕ್ಷಿತವಾದಲ್ಲಿ ನೀರನ್ನು ಮರುಬಳಸಿ, ಉದಾಹರಣೆಗೆ ಗಿಡಗಳಿಗೆ. ಸಾರ್ವಜನಿಕ ಪೈಪ್ ಸೋರುತ್ತಿದ್ದರೆ ಅಥವಾ ನೀರು ನಿರಂತರವಾಗಿ ವ್ಯರ್ಥವಾಗುತ್ತಿದ್ದರೆ CitiZen ನಲ್ಲಿ “Water Leakage” ಅಡಿಯಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
  },
  road_safety: {
    en: "Wear a helmet on two-wheelers and a seat belt in cars, follow speed limits and signals, don't use a phone while driving, give way at zebra crossings and keep footpaths clear for pedestrians. If you see a pothole or damaged road surface, report it under “Road Damage” in CitiZen.",
    hi: "दोपहिया पर हेलमेट और कार में सीट बेल्ट पहनें, गति सीमा और सिग्नल का पालन करें, गाड़ी चलाते समय फ़ोन का उपयोग न करें, ज़ेबरा क्रॉसिंग पर रास्ता दें और पैदल यात्रियों के लिए फुटपाथ खाली रखें। गड्ढा या क्षतिग्रस्त सड़क दिखे तो CitiZen में “Road Damage” के तहत रिपोर्ट करें।",
    kn: "ದ್ವಿಚಕ್ರ ವಾಹನದಲ್ಲಿ ಹೆಲ್ಮೆಟ್ ಮತ್ತು ಕಾರಿನಲ್ಲಿ ಸೀಟ್ ಬೆಲ್ಟ್ ಧರಿಸಿ, ವೇಗ ಮಿತಿ ಮತ್ತು ಸಿಗ್ನಲ್ ಪಾಲಿಸಿ, ವಾಹನ ಚಲಾಯಿಸುವಾಗ ಫೋನ್ ಬಳಸಬೇಡಿ, ಜೀಬ್ರಾ ಕ್ರಾಸಿಂಗ್‌ನಲ್ಲಿ ದಾರಿ ಬಿಡಿ ಮತ್ತು ಪಾದಚಾರಿಗಳಿಗಾಗಿ ಫುಟ್‌ಪಾತ್ ಖಾಲಿ ಇಡಿ. ಗುಂಡಿ ಅಥವಾ ಹಾನಿಗೊಂಡ ರಸ್ತೆ ಕಂಡರೆ CitiZen ನಲ್ಲಿ “Road Damage” ಅಡಿಯಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
  },
  public_hygiene: {
    en: "Use dustbins and don't litter or spit in public places, keep your surroundings and drains free of stagnant water (it breeds mosquitoes), wash hands regularly, and dispose of waste only at designated points. Report overflowing bins or dumping spots under “Garbage” in CitiZen.",
    hi: "कूड़ेदान का उपयोग करें, सार्वजनिक जगहों पर कचरा न फैलाएँ और न थूकें, अपने आस-पास और नालियों में पानी जमा न होने दें (इससे मच्छर पनपते हैं), नियमित हाथ धोएँ और कचरा केवल निर्धारित स्थानों पर डालें। भरे हुए डिब्बे या कचरा फेंकने की जगहों की CitiZen में “Garbage” के तहत रिपोर्ट करें।",
    kn: "ಕಸದ ಡಬ್ಬಿ ಬಳಸಿ, ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳಲ್ಲಿ ಕಸ ಎಸೆಯಬೇಡಿ ಅಥವಾ ಉಗುಳಬೇಡಿ, ನಿಮ್ಮ ಸುತ್ತಮುತ್ತ ಮತ್ತು ಚರಂಡಿಗಳಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿಕೊಳ್ಳಿ (ಇದು ಸೊಳ್ಳೆ ಹುಟ್ಟಿಸುತ್ತದೆ), ನಿಯಮಿತವಾಗಿ ಕೈ ತೊಳೆಯಿರಿ ಮತ್ತು ಕಸವನ್ನು ನಿಗದಿತ ಸ್ಥಳಗಳಲ್ಲಿ ಮಾತ್ರ ಹಾಕಿ. ತುಂಬಿ ಹರಿಯುವ ಡಬ್ಬಿ ಅಥವಾ ಕಸ ಸುರಿಯುವ ಸ್ಥಳಗಳನ್ನು CitiZen ನಲ್ಲಿ “Garbage” ಅಡಿಯಲ್ಲಿ ವರದಿ ಮಾಡಿ.",
  },
  civic_responsibilities: {
    en: "Good civic habits include following traffic and waste rules, saving water and electricity, keeping public spaces clean, not damaging public property, and reporting problems early with accurate location details so they can be fixed. CitiZen makes the last part easy — I can help you report an issue.",
    hi: "अच्छी नागरिक आदतों में यातायात और कचरा नियमों का पालन, पानी और बिजली की बचत, सार्वजनिक जगहों की सफ़ाई, सार्वजनिक संपत्ति को नुकसान न पहुँचाना, और समस्याओं को सही स्थान के साथ जल्दी रिपोर्ट करना शामिल है ताकि वे ठीक हो सकें। CitiZen आख़िरी काम आसान बनाता है — मैं समस्या दर्ज करने में मदद कर सकता हूँ।",
    kn: "ಉತ್ತಮ ನಾಗರಿಕ ಅಭ್ಯಾಸಗಳಲ್ಲಿ ಸಂಚಾರ ಮತ್ತು ಕಸ ನಿಯಮಗಳ ಪಾಲನೆ, ನೀರು ಮತ್ತು ವಿದ್ಯುತ್ ಉಳಿತಾಯ, ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳ ಸ್ವಚ್ಛತೆ, ಸಾರ್ವಜನಿಕ ಆಸ್ತಿಗೆ ಹಾನಿ ಮಾಡದಿರುವುದು, ಮತ್ತು ಸಮಸ್ಯೆಗಳನ್ನು ನಿಖರವಾದ ಸ್ಥಳದ ಮಾಹಿತಿಯೊಂದಿಗೆ ಬೇಗ ವರದಿ ಮಾಡುವುದು ಸೇರಿವೆ, ಇದರಿಂದ ಅವನ್ನು ಸರಿಪಡಿಸಬಹುದು. CitiZen ಕೊನೆಯ ಕೆಲಸವನ್ನು ಸುಲಭ ಮಾಡುತ್ತದೆ — ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
  },
};

const CATEGORY_TIP = {
  "Road Damage": {
    en: "For potholes and damaged roads, choose “Road Damage”. A photo showing the size of the damage and a clear landmark helps officers find it.",
    hi: "गड्ढों और खराब सड़कों के लिए “Road Damage” चुनें। नुकसान का आकार दिखाने वाली फ़ोटो और कोई स्पष्ट लैंडमार्क अधिकारियों को जगह ढूँढने में मदद करता है।",
    kn: "ಗುಂಡಿಗಳು ಮತ್ತು ಹಾನಿಗೊಂಡ ರಸ್ತೆಗಳಿಗೆ “Road Damage” ಆಯ್ಕೆಮಾಡಿ. ಹಾನಿಯ ಗಾತ್ರ ತೋರಿಸುವ ಫೋಟೋ ಮತ್ತು ಸ್ಪಷ್ಟ ಗುರುತಿನ ಸ್ಥಳ ಅಧಿಕಾರಿಗಳಿಗೆ ಸ್ಥಳ ಹುಡುಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
  },
  Garbage: {
    en: "For piled-up garbage choose “Garbage”, and note whether it is a regular dumping spot.",
    hi: "जमा कचरे के लिए “Garbage” चुनें और बताएँ कि क्या यह नियमित डंपिंग स्थल है।",
    kn: "ಕಸ ರಾಶಿಯಾಗಿದ್ದರೆ “Garbage” ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಅದು ನಿಯಮಿತವಾಗಿ ಕಸ ಸುರಿಯುವ ಸ್ಥಳವೇ ಎಂದು ತಿಳಿಸಿ.",
  },
  Streetlight: {
    en: "For lights that aren't working choose “Streetlight”, and mention a landmark near the pole.",
    hi: "बंद लाइट के लिए “Streetlight” चुनें और खंभे के पास का कोई लैंडमार्क बताएँ।",
    kn: "ಉರಿಯದ ದೀಪಕ್ಕೆ “Streetlight” ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಕಂಬದ ಹತ್ತಿರದ ಗುರುತಿನ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ.",
  },
  "Water Leakage": {
    en: "For leaking pipes or water wastage choose “Water Leakage”, and say whether water is flowing continuously.",
    hi: "लीक होते पाइप या पानी की बर्बादी के लिए “Water Leakage” चुनें और बताएँ कि पानी लगातार बह रहा है या नहीं।",
    kn: "ಸೋರುವ ಪೈಪ್ ಅಥವಾ ನೀರಿನ ವ್ಯರ್ಥಕ್ಕೆ “Water Leakage” ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನೀರು ನಿರಂತರವಾಗಿ ಹರಿಯುತ್ತಿದೆಯೇ ಎಂದು ತಿಳಿಸಿ.",
  },
  Drainage: {
    en: "For blocked or overflowing drains and sewage choose “Drainage”, and mention if water is stagnant or entering homes.",
    hi: "जाम या उफनती नाली और सीवेज के लिए “Drainage” चुनें और बताएँ कि पानी जमा है या घरों में घुस रहा है।",
    kn: "ಕಟ್ಟಿಕೊಂಡ ಅಥವಾ ಉಕ್ಕಿ ಹರಿಯುವ ಚರಂಡಿ ಮತ್ತು ಒಳಚರಂಡಿಗೆ “Drainage” ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನೀರು ನಿಂತಿದೆಯೇ ಅಥವಾ ಮನೆಗೆ ನುಗ್ಗುತ್ತಿದೆಯೇ ಎಂದು ತಿಳಿಸಿ.",
  },
};

// Generic description of the kind of body that usually handles a category. Not a city-specific claim.
const CATEGORY_BODY = {
  "Road Damage": {
    en: "roads / public works wing of your city's civic body",
    hi: "आपके नगर निकाय का सड़क/लोक निर्माण विभाग",
    kn: "ನಿಮ್ಮ ನಗರ ಸಂಸ್ಥೆಯ ರಸ್ತೆ/ಸಾರ್ವಜನಿಕ ಕಾಮಗಾರಿ ವಿಭಾಗ",
  },
  Garbage: {
    en: "solid waste management wing of your city's civic body",
    hi: "आपके नगर निकाय का ठोस अपशिष्ट प्रबंधन विभाग",
    kn: "ನಿಮ್ಮ ನಗರ ಸಂಸ್ಥೆಯ ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣಾ ವಿಭಾಗ",
  },
  Streetlight: {
    en: "street-lighting / electricity wing",
    hi: "स्ट्रीट लाइटिंग/बिजली विभाग",
    kn: "ಬೀದಿ ದೀಪ/ವಿದ್ಯುತ್ ವಿಭಾಗ",
  },
  "Water Leakage": {
    en: "water supply and sewerage utility",
    hi: "जल आपूर्ति एवं सीवरेज विभाग",
    kn: "ನೀರು ಸರಬರಾಜು ಮತ್ತು ಒಳಚರಂಡಿ ಸಂಸ್ಥೆ",
  },
  Drainage: {
    en: "storm-water drainage / sewerage wing",
    hi: "वर्षा-जल निकासी/सीवरेज विभाग",
    kn: "ಮಳೆನೀರು ಚರಂಡಿ/ಒಳಚರಂಡಿ ವಿಭಾಗ",
  },
};

const TOPIC_TO_GUIDANCE = {
  waste_segregation: "waste_segregation",
  water_conservation: "water_conservation",
  road_safety: "road_safety",
  public_hygiene: "public_hygiene",
  civic_responsibilities: "civic_responsibilities",
};

function pickLang(table, lang) {
  return table[i18n.safeLang(lang)] || table.en;
}

function guidance(topic, lang) {
  const entry = GUIDANCE[topic];
  return entry ? pickLang(entry, lang) : "";
}

function categoryTip(category, lang) {
  const entry = CATEGORY_TIP[category];
  return entry ? pickLang(entry, lang) : "";
}

function departmentAnswer(category, lang) {
  const base = guidance("department_info", lang);
  const body = CATEGORY_BODY[category];
  if (!body) return base;
  return `${i18n.t(lang, "deptCategory", {
    category: i18n.label("category", lang, category),
    body: pickLang(body, lang),
  })}\n\n${base}`;
}

// Compact English digest given to the language model as grounding.
function digest() {
  return [
    `Reporting: ${GUIDANCE.report_how.en}`,
    `Tracking: ${GUIDANCE.track_how.en}`,
    `Departments: ${GUIDANCE.department_info.en}`,
    `Emergencies: ${GUIDANCE.emergency.en}`,
    `Waste: ${GUIDANCE.waste_segregation.en}`,
    `Water: ${GUIDANCE.water_conservation.en}`,
    `Road safety: ${GUIDANCE.road_safety.en}`,
    `Hygiene: ${GUIDANCE.public_hygiene.en}`,
  ].join("\n");
}

// Contextual chips for the page the citizen is currently on.
function pageSuggestions(path, lang) {
  const p = typeof path === "string" ? path : "";
  const c = (key) => i18n.chipFromPrompt(lang, key);

  if (p.startsWith("/reports/")) return [c("officerQ"), c("whyQ"), c("priorityQ"), c("pendingQ")];
  if (p === "/report") return [c("reportHowQ"), c("potholeQ"), c("emergencyQ")];
  if (p === "/my-reports") return [c("statusQ"), c("pendingQ"), c("lastQ")];
  if (p === "/notifications") return [c("statusQ"), c("lastQ")];
  if (p === "/civic-map") return [c("nearbyQ"), c("reportHowQ")];
  return i18n.defaultChips(lang);
}

module.exports = {
  EMERGENCY_NUMBERS,
  ALLOWED_PHONE_NUMBERS,
  TOPIC_TO_GUIDANCE,
  guidance,
  categoryTip,
  departmentAnswer,
  digest,
  pageSuggestions,
};
