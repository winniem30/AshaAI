import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/language-context";

interface VoiceChatbotProps {
  onLinkRecommendation?: (links: string[]) => void;
}

export function VoiceChatbot({ onLinkRecommendation }: VoiceChatbotProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [recommendedLinks, setRecommendedLinks] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const languageCodeMap: Record<string, string> = {
    english: "en-IN",
    hindi: "hi-IN",
    telugu: "te-IN",
  };

  const currentLanguageCode = languageCodeMap[language] || "en-IN";

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const audioData = base64Audio.split(",")[1];
          
          // Send to speech-to-text API
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "/api/voice/stt";
            const sttResponse = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioData,
                language: currentLanguageCode,
              }),
            });
            const sttData = await sttResponse.json();
            if (sttData.success) {
              setTranscript(sttData.transcript);
              await processUserInput(sttData.transcript);
            }
          } catch (error) {
            console.error("Speech-to-text error:", error);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const processUserInput = async (userText: string) => {
    // Generate AI response based on user input
    const aiResponse = await generateAIResponse(userText, language);
    setResponse(aiResponse.text);
    setRecommendedLinks(aiResponse.links);
    
    if (onLinkRecommendation) {
      onLinkRecommendation(aiResponse.links);
    }

    // Convert response to speech
    await speakResponse(aiResponse.text);
  };

  const generateAIResponse = async (userText: string, lang: string) => {
    // Simple keyword-based link recommendation logic
    const keywords = {
      scholarship: ["scholarship", "education", "study", "student", "college"],
      job: ["job", "employment", "work", "career", "internship"],
      agriculture: ["farming", "agriculture", "farmer", "crop"],
      startup: ["startup", "business", "entrepreneur", "company"],
      women: ["women", "female", "girl", "lady"],
      disability: ["disability", "disabled", "handicap"],
    };

    const lowerText = userText.toLowerCase();
    let relevantLinks: string[] = [];
    let responseText = "";

    if (keywords.scholarship.some(k => lowerText.includes(k))) {
      relevantLinks = [
        "https://www.scholarships.gov.in/",
        "https://www.vidyalakshmiportal.gov.in/",
        "https://www.nsdl.co.in/",
      ];
      responseText = lang === "hindi" 
        ? "मैंने कुछ छात्रवृत्ति अवसर पाए हैं। आप scholarships.gov.in, vidyalakshmiportal.gov.in और nsdl.co.in पर जा सकते हैं।"
        : lang === "telugu"
        ? "నేను కొన్ని స్కాలర్‌షిప్ అవకాశాలను కనుగొన్నాను. మీరు scholarships.gov.in, vidyalakshmiportal.gov.in మరియు nsdl.co.in కి వెళ్ళవచ్చు."
        : "I found some scholarship opportunities. You can visit scholarships.gov.in, vidyalakshmiportal.gov.in, and nsdl.co.in.";
    } else if (keywords.job.some(k => lowerText.includes(k))) {
      relevantLinks = [
        "https://www.naukri.com/",
        "https://www.indeed.co.in/",
        "https://www.monsterindia.com/",
      ];
      responseText = lang === "hindi"
        ? "मैंने कुछ नौकरी अवसर पाए हैं। आप naukri.com, indeed.co.in और monsterindia.com पर जा सकते हैं।"
        : lang === "telugu"
        ? "నేను కొన్ని ఉద్యోగ అవకాశాలను కనుగొన్నాను. మీరు naukri.com, indeed.co.in మరియు monsterindia.com కి వెళ్ళవచ్చు."
        : "I found some job opportunities. You can visit naukri.com, indeed.co.in, and monsterindia.com.";
    } else if (keywords.agriculture.some(k => lowerText.includes(k))) {
      relevantLinks = [
        "https://agrimachinery.nic.in/",
        "https://agmarket.nic.in/",
        "https://www.agricoop.nic.in/",
      ];
      responseText = lang === "hindi"
        ? "मैंने कुछ कृषि योजनाएं पाई हैं। आप agrimachinery.nic.in, agmarket.nic.in और agricoop.nic.in पर जा सकते हैं।"
        : lang === "telugu"
        ? "నేను కొన్ని వ్యవసాయ పథకాలను కనుగొన్నాను. మీరు agrimachinery.nic.in, agmarket.nic.in మరియు agricoop.nic.in కి వెళ్ళవచ్చు."
        : "I found some agriculture schemes. You can visit agrimachinery.nic.in, agmarket.nic.in, and agricoop.nic.in.";
    } else if (keywords.startup.some(k => lowerText.includes(k))) {
      relevantLinks = [
        "https://www.startupindia.gov.in/",
        "https://www.msmefo.in/",
        "https://www.sidbi.in/",
      ];
      responseText = lang === "hindi"
        ? "मैंने कुछ स्टार्टअप योजनाएं पाई हैं। आप startupindia.gov.in, msmefo.in और sidbi.in पर जा सकते हैं।"
        : lang === "telugu"
        ? "నేను కొన్ని స్టార్టప్ పథకాలను కనుగొన్నాను. మీరు startupindia.gov.in, msmefo.in మరియు sidbi.in కి వెళ్ళవచ్చు."
        : "I found some startup schemes. You can visit startupindia.gov.in, msmefo.in, and sidbi.in.";
    } else {
      relevantLinks = [
        "/opportunities",
        "https://www.india.gov.in/",
        "https://www.mygov.in/",
      ];
      responseText = lang === "hindi"
        ? "मैंने कुछ सामान्य अवसर पाए हैं। आप हमारी वेबसाइट पर अधिक अवसर देख सकते हैं।"
        : lang === "telugu"
        ? "నేను కొన్ని సాధారణ అవకాశాలను కనుగొన్నాను. మీరు మా వెబ్‌సైట్‌లో మరిన్ని అవకాశాలను చూడవచ్చు."
        : "I found some general opportunities. You can visit our website for more opportunities.";
    }

    return { text: responseText, links: relevantLinks };
  };

  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      const apiUrl = import.meta.env.VITE_API_URL || "/api/voice/tts";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: currentLanguageCode,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Text-to-speech error:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl max-w-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Voice Assistant</span>
          <span className="text-xs text-white/60 ml-auto">{language}</span>
        </div>

        {transcript && (
          <div className="mb-3 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="mb-3 p-3 bg-purple-500/20 rounded-lg">
            <p className="text-xs text-purple-300 mb-1">Assistant:</p>
            <p className="text-sm">{response}</p>
          </div>
        )}

        {recommendedLinks.length > 0 && (
          <div className="mb-3 p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-white/60 mb-2">Recommended Links:</p>
            <ul className="space-y-1">
              {recommendedLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-300 hover:text-purple-200 underline block"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : isSpeaking
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            {isListening ? "Stop Listening" : isSpeaking ? "Speaking..." : "Start Voice"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
