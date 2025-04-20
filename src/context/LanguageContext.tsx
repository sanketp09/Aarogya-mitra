import React, { createContext, useState, useContext, useEffect } from 'react';

// Define available languages
export type LanguageType = 'english' | 'hindi' | 'marathi';

// Define translations interface
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Context props interface
interface LanguageContextProps {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  t: (key: string) => string; // Translation function
  translations: Translations; // Add translations to the context
}

// Create context with default values
export const LanguageContext = createContext<LanguageContextProps>({
  language: 'english',
  setLanguage: () => {},
  t: (key: string) => key,
  translations: {}, // Add empty translations object as default
});

// Translations for all languages
const translations: Translations = {
  // Common UI elements
  'app.title': {
    english: 'AROGYA MITRA',
    hindi: 'केयरिंग वॉइस हेवन',
    marathi: 'केअरिंग व्हॉइस हेवन',
  },
  'welcome.message': {
    english: 'Welcome',
    hindi: 'स्वागत है',
    marathi: 'स्वागत आहे',
  },
  'reminders.title': {
    english: 'Today\'s Reminders',
    hindi: 'आज के रिमाइंडर',
    marathi: 'आजच्या आठवणी',
  },
  'sos.button': {
    english: 'SOS',
    hindi: 'आपातकालीन',
    marathi: 'आपत्कालीन',
  },
  'feature.quickaccess': {
    english: 'Quick Access',
    hindi: 'त्वरित पहुंच',
    marathi: 'त्वरित प्रवेश',
  },
  'feature.appointments': {
    english: 'Appointments',
    hindi: 'अपॉइंटमेंट',
    marathi: 'अपॉइंटमेंट',
  },
  'feature.appointments.desc': {
    english: 'View and manage your appointments',
    hindi: 'अपने अपॉइंटमेंट देखें और प्रबंधित करें',
    marathi: 'आपल्या अपॉइंटमेंट पहा आणि व्यवस्थापित करा',
  },
  'feature.assistant': {
    english: 'Health Assistant',
    hindi: 'स्वास्थ्य सहायक',
    marathi: 'आरोग्य सहाय्यक',
  },
  'feature.assistant.desc': {
    english: 'AI-powered health support',
    hindi: 'एआई-संचालित स्वास्थ्य सहायता',
    marathi: 'एआई-संचालित आरोग्य समर्थन',
  },
  
  // Navigation items
  'nav.home': {
    english: 'Home',
    hindi: 'होम',
    marathi: 'मुख्यपृष्ठ',
  },
  
  // Mental Health Component
  'mentalhealth.title': {
    english: 'Mental Health Support',
    hindi: 'मानसिक स्वास्थ्य सहायता',
    marathi: 'मानसिक आरोग्य समर्थन',
  },
  'mentalhealth.assessment.title': {
    english: 'Mental Wellness Assessment',
    hindi: 'मानसिक स्वास्थ्य मूल्यांकन',
    marathi: 'मानसिक आरोग्य मूल्यांकन',
  },
  'mentalhealth.assessment.description': {
    english: 'Answer a few questions to help us understand how you\'re feeling. This is not a diagnostic tool, but can help identify areas where support might be beneficial.',
    hindi: 'यह समझने के लिए कुछ प्रश्नों का उत्तर दें कि आप कैसा महसूस कर रहे हैं। यह एक नैदानिक उपकरण नहीं है, लेकिन उन क्षेत्रों की पहचान करने में मदद कर सकता है जहां सहायता फायदेमंद हो सकती है।',
    marathi: 'आपण कसे वाटत आहे हे समजण्यासाठी काही प्रश्नांची उत्तरे द्या. हे निदान साधन नाही, परंतु समर्थन फायदेशीर ठरू शकेल अशा क्षेत्रांची ओळख करण्यास मदत करू शकते.',
  },
  'mentalhealth.question': {
    english: 'Question',
    hindi: 'प्रश्न',
    marathi: 'प्रश्न',
  },
  'mentalhealth.of': {
    english: 'of',
    hindi: 'का',
    marathi: 'पैकी',
  },
  'mentalhealth.view.resources': {
    english: 'View Resources',
    hindi: 'संसाधन देखें',
    marathi: 'संसाधने पहा',
  },
  'mentalhealth.view.results': {
    english: 'View Assessment Results',
    hindi: 'मूल्यांकन परिणाम देखें',
    marathi: 'मूल्यांकन निकाल पहा',
  },
  'mentalhealth.retake': {
    english: 'Retake Assessment',
    hindi: 'मूल्यांकन फिर से करें',
    marathi: 'मूल्यांकन पुन्हा करा',
  },
  'mentalhealth.score.title': {
    english: 'Your Mental Wellness Score',
    hindi: 'आपका मानसिक स्वास्थ्य स्कोर',
    marathi: 'आपला मानसिक आरोग्य स्कोर',
  },
  'mentalhealth.score.description': {
    english: 'Based on your responses, we\'ve created a preliminary wellness assessment.',
    hindi: 'आपकी प्रतिक्रियाओं के आधार पर, हमने एक प्रारंभिक स्वास्थ्य मूल्यांकन बनाया है।',
    marathi: 'आपल्या प्रतिसादांच्या आधारे, आम्ही प्राथमिक आरोग्य मूल्यांकन तयार केले आहे.',
  },
  'mentalhealth.wellness.score': {
    english: 'Wellness Score',
    hindi: 'स्वास्थ्य स्कोर',
    marathi: 'आरोग्य स्कोर',
  },
  'mentalhealth.what.means': {
    english: 'What this means',
    hindi: 'इसका क्या मतलब है',
    marathi: 'याचा अर्थ काय',
  },
  'mentalhealth.score.high': {
    english: 'You appear to be managing well overall. Continue practicing good self-care!',
    hindi: 'आप समग्र रूप से अच्छा प्रबंधन कर रहे हैं। अच्छी आत्म-देखभाल का अभ्यास जारी रखें!',
    marathi: 'आपण एकूणच चांगले व्यवस्थापन करत आहात. चांगली स्वतःची काळजी घेण्याचा सराव सुरू ठेवा!',
  },
  'mentalhealth.score.medium': {
    english: 'You may be experiencing some difficulties. Consider reviewing our resources or speaking with a professional.',
    hindi: 'आप कुछ कठिनाइयों का अनुभव कर सकते हैं। हमारे संसाधनों की समीक्षा करने या किसी पेशेवर से बात करने पर विचार करें।',
    marathi: 'आपण काही अडचणींचा अनुभव घेत असू शकता. आमची संसाधने पाहण्याचा किंवा व्यावसायिकाशी बोलण्याचा विचार करा.',
  },
  'mentalhealth.score.low': {
    english: 'Your responses suggest you might benefit from professional support. Please consider speaking with a healthcare provider.',
    hindi: 'आपकी प्रतिक्रियाएं सुझाव देती हैं कि आपको पेशेवर सहायता से लाभ हो सकता है। कृपया किसी स्वास्थ्य सेवा प्रदाता से बात करने पर विचार करें।',
    marathi: 'आपले प्रतिसाद सूचित करतात की आपल्याला व्यावसायिक समर्थनाचा फायदा होऊ शकतो. कृपया आरोग्य सेवा प्रदात्याशी बोलण्याचा विचार करा.',
  },
  'mentalhealth.view.recommended': {
    english: 'View Recommended Resources',
    hindi: 'अनुशंसित संसाधन देखें',
    marathi: 'शिफारस केलेली संसाधने पहा',
  },
  'mentalhealth.read.article': {
    english: 'Read Article',
    hindi: 'लेख पढ़ें',
    marathi: 'लेख वाचा',
  },
  'mentalhealth.resource.saved': {
    english: 'Resource Saved',
    hindi: 'संसाधन सहेजा गया',
    marathi: 'संसाधन जतन केले',
  },
  'mentalhealth.resource.saved.desc': {
    english: 'has been saved to your library.',
    hindi: 'आपकी लाइब्रेरी में सहेजा गया है।',
    marathi: 'आपल्या लायब्ररीमध्ये जतन केले आहे.',
  },
  'mentalhealth.opening.external': {
    english: 'Opening External Resource',
    hindi: 'बाहरी संसाधन खोला जा रहा है',
    marathi: 'बाह्य संसाधन उघडत आहे',
  },
  'mentalhealth.opening.desc': {
    english: 'Opening',
    hindi: 'खोल रहा है',
    marathi: 'उघडत आहे',
  },
  'mentalhealth.in.new.tab': {
    english: 'in a new tab.',
    hindi: 'नए टैब में।',
    marathi: 'नवीन टॅबमध्ये.',
  },
  'mentalhealth.resource.selected': {
    english: 'Resource Selected',
    hindi: 'संसाधन चयनित',
    marathi: 'संसाधन निवडले',
  },
  'mentalhealth.viewing': {
    english: 'Viewing',
    hindi: 'देख रहे हैं',
    marathi: 'पाहत आहे',
  },
  
  // AI Assistant Component
  'aiassistant.title': {
    english: 'AI Health Assistant',
    hindi: 'AI स्वास्थ्य सहायक',
    marathi: 'AI आरोग्य सहाय्यक',
  },
  'aiassistant.welcome': {
    english: 'Welcome! How can I help you today?',
    hindi: 'स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूं?',
    marathi: 'स्वागत आहे! आज मी तुमची कशी मदत करू शकतो?'
  },
  'aiassistant.placeholder': {
    english: 'Type your message...',
    hindi: 'अपना संदेश टाइप करें...',
    marathi: 'तुमचा संदेश टाइप करा...',
  },
  'aiassistant.error': {
    english: "I'm having trouble connecting to my knowledge base. Please try again later.",
    hindi: "मुझे अपने ज्ञान आधार से जुड़ने में परेशानी हो रही है। कृपया बाद में पुन: प्रयास करें।",
    marathi: "मला माझ्या ज्ञान आधाराशी जोडण्यात अडचण येत आहे. कृपया नंतर पुन्हा प्रयत्न करा.",
  },
  'aiassistant.connection.error': {
    english: 'Connection Error',
    hindi: 'कनेक्शन त्रुटि',
    marathi: 'जोडणी त्रुटी',
  },
  'aiassistant.connection.error.desc': {
    english: 'Could not connect to the AI service. Please try again later.',
    hindi: 'एआई सेवा से कनेक्ट नहीं हो सका। कृपया बाद में पुन: प्रयास करें।',
    marathi: 'एआय सेवेशी जोडणी करू शकलो नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
  },
  'aiassistant.voice.not.available': {
    english: 'Voice Recognition Not Available',
    hindi: 'आवाज पहचान उपलब्ध नहीं है',
    marathi: 'व्हॉइस ओळख उपलब्ध नाही',
  },
  'aiassistant.voice.not.available.desc': {
    english: "Your browser doesn't support voice recognition. Please type your question instead.",
    hindi: 'आपका ब्राउज़र आवाज पहचान का समर्थन नहीं करता है। कृपया इसके बजाय अपना प्रश्न टाइप करें।',
    marathi: 'तुमचा ब्राउझर व्हॉइस ओळखीस समर्थन देत नाही. कृपया त्याएवजी तुमचा प्रश्न टाइप करा.',
  },
  'aiassistant.voice.recognition': {
    english: 'Voice Recognition',
    hindi: 'आवाज पहचान',
    marathi: 'व्हॉइस ओळख',
  },
  'aiassistant.voice.recognition.activated': {
    english: 'Voice input activated. Please speak your question.',
    hindi: 'आवाज इनपुट सक्रिय। कृपया अपना प्रश्न बोलें।',
    marathi: 'व्हॉइस इनपुट सक्रिय केले. कृपया तुमचा प्रश्न बोला.',
  },
  'aiassistant.voice.recognized': {
    english: 'Voice Recognized',
    hindi: 'आवाज पहचानी गई',
    marathi: 'व्हॉइस ओळखली',
  },
  'aiassistant.voice.recognized.desc': {
    english: 'Your question has been captured.',
    hindi: 'आपका प्रश्न कैप्चर कर लिया गया है।',
    marathi: 'तुमचा प्रश्न कॅप्चर केला गेला आहे.',
  },
  'aiassistant.voice.error': {
    english: 'Voice Recognition Error',
    hindi: 'आवाज पहचान त्रुटि',
    marathi: 'व्हॉइस ओळख त्रुटी',
  },
  'aiassistant.voice.error.desc': {
    english: 'Could not recognize your voice. Please try again or type your question.',
    hindi: 'आपकी आवाज को पहचान नहीं सका। कृपया पुन: प्रयास करें या अपना प्रश्न टाइप करें।',
    marathi: 'तुमचा आवाज ओळखू शकलो नाही. कृपया पुन्हा प्रयत्न करा किंवा तुमचा प्रश्न टाइप करा.',
  },
  'aiassistant.response': {
    english: 'This is a mock response since the AI service is currently unavailable.',
    hindi: 'यह एक मॉक प्रतिक्रिया है क्योंकि AI सेवा वर्तमान में अनुपलब्ध है।',
    marathi: 'AI सेवा सध्या उपलब्ध नसल्याने ही एक नकली प्रतिसाद आहे.'
  },
  'aiassistant.input_placeholder': {
    english: 'Type your message here...',
    hindi: 'अपना संदेश यहां टाइप करें...',
    marathi: 'तुमचा संदेश येथे टाइप करा...'
  },
  'aiassistant.send': {
    english: 'Send',
    hindi: 'भेजें',
    marathi: 'पाठवा'
  },
  
  // TelemedicineConsult Component
  'telemedicine.title': {
    english: 'Telemedicine Consultation',
    hindi: 'टेलीमेडिसिन परामर्श',
    marathi: 'टेलिमेडिसिन सल्ला',
  },
  'telemedicine.schedule': {
    english: 'Schedule an Appointment',
    hindi: 'एक अपॉइंटमेंट शेड्यूल करें',
    marathi: 'एक अपॉइंटमेंट शेड्यूल करा',
  },
  'telemedicine.book': {
    english: 'Book a video consultation with a healthcare provider',
    hindi: 'स्वास्थ्य सेवा प्रदाता के साथ वीडियो परामर्श बुक करें',
    marathi: 'आरोग्य सेवा प्रदात्यासोबत व्हिडिओ सल्ला बुक करा',
  },
  'telemedicine.select.doctor': {
    english: 'Select Doctor',
    hindi: 'डॉक्टर चुनें',
    marathi: 'डॉक्टर निवडा',
  },
  'telemedicine.choose.doctor': {
    english: 'Choose a doctor',
    hindi: 'एक डॉक्टर चुनें',
    marathi: 'एक डॉक्टर निवडा',
  },
  'telemedicine.unavailable': {
    english: '- Unavailable',
    hindi: '- अनुपलब्ध',
    marathi: '- अनुपलब्ध',
  },
  'telemedicine.select.date': {
    english: 'Select Date',
    hindi: 'तारीख चुनें',
    marathi: 'तारीख निवडा',
  },
  'telemedicine.choose.date': {
    english: 'Choose a date',
    hindi: 'एक तारीख चुनें',
    marathi: 'एक तारीख निवडा',
  },
  'telemedicine.select.time': {
    english: 'Select Time',
    hindi: 'समय चुनें',
    marathi: 'वेळ निवडा',
  },
  'telemedicine.choose.time': {
    english: 'Choose a time',
    hindi: 'एक समय चुनें',
    marathi: 'एक वेळ निवडा',
  },
  'telemedicine.schedule.appointment': {
    english: 'Schedule Appointment',
    hindi: 'अपॉइंटमेंट शेड्यूल करें',
    marathi: 'अपॉइंटमेंट शेड्यूल करा',
  },
  'telemedicine.your.appointments': {
    english: 'Your Appointments',
    hindi: 'आपकी अपॉइंटमेंट',
    marathi: 'तुमच्या अपॉइंटमेंट',
  },
  'telemedicine.no.appointments': {
    english: 'No upcoming appointments',
    hindi: 'कोई आगामी अपॉइंटमेंट नहीं',
    marathi: 'कोणतीही येणारी अपॉइंटमेंट नाही',
  },
  'telemedicine.past.appointments': {
    english: 'Past Appointments',
    hindi: 'पिछली अपॉइंटमेंट',
    marathi: 'मागील अपॉइंटमेंट',
  },
  'telemedicine.view.summary': {
    english: 'View Summary',
    hindi: 'सारांश देखें',
    marathi: 'सारांश पहा',
  },
  'telemedicine.join.video': {
    english: 'Join Video Call',
    hindi: 'वीडियो कॉल में शामिल हों',
    marathi: 'व्हिडिओ कॉलमध्ये सहभागी व्हा',
  },
  'telemedicine.live': {
    english: 'Live',
    hindi: 'लाइव',
    marathi: 'लाइव्ह',
  },
  'telemedicine.camera.off': {
    english: 'Camera is turned off',
    hindi: 'कैमरा बंद है',
    marathi: 'कॅमेरा बंद आहे',
  },
  'telemedicine.missing.info': {
    english: 'Missing Information',
    hindi: 'जानकारी का अभाव',
    marathi: 'माहिती गहाळ',
  },
  'telemedicine.missing.info.desc': {
    english: 'Please select a doctor, date, and time for your appointment.',
    hindi: 'कृपया अपनी अपॉइंटमेंट के लिए एक डॉक्टर, तारीख और समय चुनें।',
    marathi: 'कृपया तुमच्या अपॉइंटमेंटसाठी एक डॉक्टर, तारीख आणि वेळ निवडा.',
  },
  'telemedicine.appointment.scheduled': {
    english: 'Appointment Scheduled',
    hindi: 'अपॉइंटमेंट शेड्यूल की गई',
    marathi: 'अपॉइंटमेंट शेड्यूल केली',
  },
  'telemedicine.appointment.confirmed': {
    english: 'Your appointment with',
    hindi: 'आपकी अपॉइंटमेंट',
    marathi: 'तुमची अपॉइंटमेंट',
  },
  'telemedicine.appointment.on': {
    english: 'on',
    hindi: 'को',
    marathi: 'रोजी',
  },
  'telemedicine.appointment.at': {
    english: 'at',
    hindi: 'पर',
    marathi: 'येथे',
  },
  'telemedicine.appointment.confirmed.end': {
    english: 'has been confirmed.',
    hindi: 'की पुष्टि की गई है।',
    marathi: 'ची पुष्टी केली गेली आहे.',
  },
  'telemedicine.error': {
    english: 'Error',
    hindi: 'त्रुटि',
    marathi: 'त्रुटी',
  },
  'telemedicine.error.desc': {
    english: 'Failed to schedule appointment, but it\'s available in your list',
    hindi: 'अपॉइंटमेंट शेड्यूल करने में विफल, लेकिन यह आपकी सूची में उपलब्ध है',
    marathi: 'अपॉइंटमेंट शेड्यूल करण्यात अयशस्वी, परंतु ते तुमच्या यादीत उपलब्ध आहे',
  },
  'telemedicine.joining': {
    english: 'Joining Video Call',
    hindi: 'वीडियो कॉल में शामिल हो रहे हैं',
    marathi: 'व्हिडिओ कॉलमध्ये सहभागी होत आहे',
  },
  'telemedicine.connecting': {
    english: 'Connecting to video call with',
    hindi: 'वीडियो कॉल से जुड़ रहे हैं',
    marathi: 'व्हिडिओ कॉलशी कनेक्ट करत आहे',
  },
  'telemedicine.call.ended': {
    english: 'Call Ended',
    hindi: 'कॉल समाप्त हुआ',
    marathi: 'कॉल संपला',
  },
  'telemedicine.call.ended.desc': {
    english: 'Your video consultation has ended.',
    hindi: 'आपका वीडियो परामर्श समाप्त हो गया है।',
    marathi: 'तुमचा व्हिडिओ सल्ला संपला आहे.',
  },
  'telemedicine.mic.muted': {
    english: 'Microphone Muted',
    hindi: 'माइक्रोफोन म्यूट किया गया',
    marathi: 'माइक्रोफोन म्यूट केला',
  },
  'telemedicine.mic.unmuted': {
    english: 'Microphone Unmuted',
    hindi: 'माइक्रोफोन अनम्यूट किया गया',
    marathi: 'माइक्रोफोन अनम्यूट केला',
  },
  'telemedicine.mic.muted.desc': {
    english: 'You have muted your microphone.',
    hindi: 'आपने अपना माइक्रोफोन म्यूट कर दिया है।',
    marathi: 'तुम्ही तुमचा माइक्रोफोन म्यूट केला आहे.',
  },
  'telemedicine.mic.unmuted.desc': {
    english: 'Others can now hear you.',
    hindi: 'अब दूसरे आपको सुन सकते हैं।',
    marathi: 'इतर आता तुम्हाला एकू शकतात.',
  },
  'telemedicine.camera.off.title': {
    english: 'Camera Turned Off',
    hindi: 'कैमरा बंद किया गया',
    marathi: 'कॅमेरा बंद केला',
  },
  'telemedicine.camera.on.title': {
    english: 'Camera Turned On',
    hindi: 'कैमरा चालू किया गया',
    marathi: 'कॅमेरा चालू केला',
  },
  'telemedicine.camera.off.desc': {
    english: 'Your camera has been turned off.',
    hindi: 'आपका कैमरा बंद कर दिया गया है।',
    marathi: 'तुमचा कॅमेरा बंद केला गेला आहे.',
  },
  'telemedicine.camera.on.desc': {
    english: 'Others can now see you.',
    hindi: 'अब दूसरे आपको देख सकते हैं।',
    marathi: 'इतर आता तुम्हाला पाहू शकतात.',
  },
  'telemedicine.appointment.cancelled': {
    english: 'Appointment Cancelled',
    hindi: 'अपॉइंटमेंट रद्द की गई',
    marathi: 'अपॉइंटमेंट रद्द केली',
  },
  'telemedicine.appointment.cancelled.desc': {
    english: 'Your appointment has been cancelled successfully.',
    hindi: 'आपकी अपॉइंटमेंट सफलतापूर्वक रद्द कर दी गई है।',
    marathi: 'तुमची अपॉइंटमेंट यशस्वीरित्या रद्द केली गेली आहे.',
  },
  'nav.medications': {
    english: 'Medications',
    hindi: 'दवाइयां',
    marathi: 'औषधे',
  },
  'nav.games': {
    english: 'Games',
    hindi: 'खेल',
    marathi: 'खेळ',
  },
  'nav.emergency': {
    english: 'Emergency',
    hindi: 'आपातकालीन',
    marathi: 'आपत्कालीन',
  },
  'nav.pharmacy': {
    english: 'Pharmacy',
    hindi: 'फार्मेसी',
    marathi: 'औषधालय',
  },
  'nav.assistant': {
    english: 'AI Assistant',
    hindi: 'एआई सहायक',
    marathi: 'एआई सहाय्यक',
  },
  'nav.videocall': {
    english: 'Video Call',
    hindi: 'वीडियो कॉल',
    marathi: 'व्हिडिओ कॉल',
  },
  'nav.social': {
    english: 'Social Club',
    hindi: 'सोशल क्लब',
    marathi: 'सामाजिक क्लब',
  },
  'nav.mentalhealth': {
    english: 'Mental Health',
    hindi: 'मानसिक स्वास्थ्य',
    marathi: 'मानसिक आरोग्य',
  },
  
  // Feature titles and descriptions
  'feature.medications': {
    english: 'Medications',
    hindi: 'दवाइयां',
    marathi: 'औषधे',
  },
  'feature.medications.desc': {
    english: 'Track and manage your medications',
    hindi: 'अपनी दवाओं को ट्रैक और प्रबंधित करें',
    marathi: 'आपल्या औषधांचा मागोवा घ्या आणि व्यवस्थापित करा',
  },
  'feature.emergency': {
    english: 'Emergency',
    hindi: 'आपातकालीन',
    marathi: 'आपत्कालीन',
  },
  'feature.emergency.desc': {
    english: 'Emergency contacts and SOS',
    hindi: 'आपातकालीन संपर्क और एसओएस',
    marathi: 'आपत्कालीन संपर्क आणि एसओएस',
  },
  'feature.games': {
    english: 'Memory Games',
    hindi: 'मेमोरी गेम्स',
    marathi: 'स्मृती खेळ',
  },
  'feature.games.desc': {
    english: 'Keep your mind active',
    hindi: 'अपने दिमाग को सक्रिय रखें',
    marathi: 'आपले मन सक्रिय ठेवा',
  },
  'feature.pharmacy': {
    english: 'Find Pharmacy',
    hindi: 'फार्मेसी खोजें',
    marathi: 'औषधालय शोधा',
  },
  'feature.pharmacy.desc': {
    english: 'Locate nearby pharmacies',
    hindi: 'आस-पास की फार्मेसी का पता लगाएं',
    marathi: 'जवळपासच्या औषधालयांचा शोध घ्या',
  },
  'feature.videocall': {
    english: 'Video Call',
    hindi: 'वीडियो कॉल',
    marathi: 'व्हिडिओ कॉल',
  },
  'feature.videocall.desc': {
    english: 'Telehealth consultations',
    hindi: 'टेलीहेल्थ परामर्श',
    marathi: 'टेलीहेल्थ सल्लामसलत',
  },
  'feature.social': {
    english: 'Social Club',
    hindi: 'सोशल क्लब',
    marathi: 'सामाजिक क्लब',
  },
  'feature.social.desc': {
    english: 'Connect with others',
    hindi: 'दूसरों से जुड़ें',
    marathi: 'इतरांशी जोडा',
  },
  'feature.mentalhealth': {
    english: 'Mental Health',
    hindi: 'मानसिक स्वास्थ्य',
    marathi: 'मानसिक आरोग्य',
  },
  'feature.mentalhealth.desc': {
    english: 'Support and resources',
    hindi: 'सहायता और संसाधन',
    marathi: 'समर्थन आणि संसाधने',
  },
  'feature.profile': {
    english: 'My Profile',
    hindi: 'मेरी प्रोफाइल',
    marathi: 'माझे प्रोफाइल',
  },
  'feature.profile.desc': {
    english: 'View and edit your profile',
    hindi: 'अपनी प्रोफ़ाइल देखें और संपादित करें',
    marathi: 'आपले प्रोफाइल पहा आणि संपादित करा',
  },
  
  // Language selector
  'language.select': {
    english: 'Select Language',
    hindi: 'भाषा चुनें',
    marathi: 'भाषा निवडा',
  },
  'language.english': {
    english: 'English',
    hindi: 'अंग्रे़ी',
    marathi: 'इंग्रजी',
  },
  'language.hindi': {
    english: 'Hindi',
    hindi: 'हिंदी',
    marathi: 'हिंदी',
  },
  'language.marathi': {
    english: 'Marathi',
    hindi: 'मराठी',
    marathi: 'मराठी',
  },
};

// Hook for using the language context
export const useLanguage = () => useContext(LanguageContext);

// Language Provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved language from localStorage or default to English
  const [language, setLanguage] = useState<LanguageType>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as LanguageType) || 'english';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language] || translations[key]['english'] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    translations, // Provide translations to the context
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
