import { Mic, MicOff } from "lucide-react";

interface Props {
  fieldId: string;
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function VoiceInputButton({
  isListening,
  isSupported,
  onStart,
  onStop,
  className = "",
}: Props) {
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported in this browser"
        aria-label="Voice input not supported"
        className={`rounded-lg p-1.5 text-slate-300 cursor-not-allowed ${className}`}
      >
        <MicOff className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isListening ? onStop : onStart}
      title={isListening ? "Listening... Click to stop" : "Click to speak into this field"}
      aria-label={isListening ? "Stop voice recording" : "Start voice recording"}
      aria-pressed={isListening}
      className={`relative inline-flex items-center justify-center rounded-lg p-1.5 transition ${
        isListening
          ? "bg-rose-100 text-rose-600 animate-pulse ring-2 ring-rose-400"
          : "text-slate-400 hover:bg-slate-100 hover:text-brand-600 focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      } ${className}`}
    >
      <Mic className={`h-4 w-4 ${isListening ? "animate-bounce" : ""}`} />
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      )}
    </button>
  );
}
