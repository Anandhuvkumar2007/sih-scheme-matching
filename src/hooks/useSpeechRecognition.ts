import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "../i18n";

// Extended window interface for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function useSpeechRecognition() {
  const { lang } = useI18n();
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Map app language code to BCP 47 language tag for Indian locales
  const getLocale = useCallback(() => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "ml":
        return "ml-IN";
      case "en":
      default:
        return "en-IN";
    }
  }, [lang]);

  useEffect(() => {
    const win = typeof window !== "undefined" ? (window as IWindow) : null;
    const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;
    setIsSupported(Boolean(SpeechRec));
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveField(null);
  }, []);

  const parseSpokenNumbers = (text: string): string => {
    // Basic numerical extraction and common Indian spoken number conversions
    let cleaned = text.toLowerCase().trim();

    // Remove currency words
    cleaned = cleaned.replace(/rupees|rupee|rs|inr|रुपये|രൂപ/gi, "").trim();

    // Handle common Indian words (Lakh, Crore, Thousand)
    const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|लाख|ലക്ഷം)/i);
    if (lakhMatch) {
      const num = parseFloat(lakhMatch[1]);
      return String(Math.round(num * 100000));
    }

    const croreMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|करोड़|കോടി)/i);
    if (croreMatch) {
      const num = parseFloat(croreMatch[1]);
      return String(Math.round(num * 10000000));
    }

    const thousandMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:thousand|thousands|हजार|ആയിരം)/i);
    if (thousandMatch) {
      const num = parseFloat(thousandMatch[1]);
      return String(Math.round(num * 1000));
    }

    // Extract continuous digits if present
    const digitsMatch = cleaned.replace(/,/g, "").match(/\d+/);
    if (digitsMatch) {
      return digitsMatch[0];
    }

    return cleaned;
  };

  const startListening = useCallback(
    (
      fieldId: string,
      onResult: (value: string) => void,
      options?: { numericOnly?: boolean }
    ) => {
      setError(null);
      const win = typeof window !== "undefined" ? (window as IWindow) : null;
      const SpeechRec = win?.SpeechRecognition || win?.webkitSpeechRecognition;

      if (!SpeechRec) {
        setError("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
        return;
      }

      // If already listening on another field, stop it
      if (recognitionRef.current) {
        stopListening();
      }

      try {
        const recognition = new SpeechRec();
        recognition.lang = getLocale();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setActiveField(fieldId);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          if (event.results && event.results.length > 0) {
            const rawTranscript = event.results[0][0].transcript;
            if (options?.numericOnly) {
              const parsedNumber = parseSpokenNumbers(rawTranscript);
              onResult(parsedNumber);
            } else {
              onResult(rawTranscript);
            }
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setError("Microphone permission was denied. Please allow microphone access in browser settings.");
          } else if (event.error === "no-speech") {
            setError("No speech was detected. Please try speaking again.");
          } else if (event.error === "network") {
            setError("Network error occurred during speech recognition.");
          } else {
            setError(`Speech recognition notice: ${event.error || "Please try again."}`);
          }
          stopListening();
        };

        recognition.onend = () => {
          setIsListening(false);
          setActiveField(null);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setError("Failed to initialize speech recognition. Please try typing directly.");
        stopListening();
      }
    },
    [getLocale, stopListening]
  );

  return {
    isListening,
    activeField,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
