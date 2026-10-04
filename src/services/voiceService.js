export function speak(text, onEnd) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis is not supported.");

    if (onEnd) {
      onEnd();
    }

    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onend = () => {
    if (onEnd) {
      onEnd();
    }
  };

  utterance.onerror = () => {
    if (onEnd) {
      onEnd();
    }
  };

  window.speechSynthesis.speak(utterance);
}


export function createSpeechRecognition({
  onResult,
  onStart,
  onEnd,
  onError,
}) {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";

  // Keep listening while the candidate is answering.
  recognition.continuous = true;

  // We need interim results so the answer can appear
  // on the screen while the candidate is speaking.
  recognition.interimResults = true;

  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (onStart) {
      onStart();
    }
  };

  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (
      let i = event.resultIndex;
      i < event.results.length;
      i++
    ) {
      const transcript =
        event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        finalTranscript: finalTranscript.trim(),
        interimTranscript: interimTranscript.trim(),
      });
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd();
    }
  };

  recognition.onerror = (event) => {
    console.error(
      "Speech recognition error:",
      event.error
    );

    if (onError) {
      onError(event.error);
    }
  };

  return recognition;
}