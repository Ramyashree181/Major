import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import "./Chatbot.css";
import ChatMessage from "./ChatMessage";
import API_BASE_URL from "../../api";


const Chatbot = () => {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

   const [conversationId] = useState(() => {
    const savedConversationId =
      localStorage.getItem("conversationId");

    if (savedConversationId) {
      return savedConversationId;
    }

    const newConversationId = crypto.randomUUID();

    localStorage.setItem(
      "conversationId",
      newConversationId
    );

    return newConversationId;
  });

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I can help you with loans, eligibility, documents, interest rates, and application status."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // Get speech language based on selected website language
  const getSpeechLanguage = () => {
    const languageMap = {
      en: "en-IN",
      hi: "hi-IN",
      kn: "kn-IN"
    };

    return languageMap[i18n.language] || "en-IN";
  };


  // Text-to-Speech
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis is not supported");
      return;
    }

    // Stop any currently speaking response
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = getSpeechLanguage();
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };


  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn(
        "Speech recognition is not supported in this browser"
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setInput(spokenText);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };

  }, []);


  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Voice recognition is not supported in this browser."
      );
      return;
    }

    try {
      recognitionRef.current.lang =
        getSpeechLanguage();

      recognitionRef.current.start();

    } catch (error) {
      console.error(
        "Unable to start voice recognition:",
        error
      );
    }
  };


  // Send message
  const sendMessage = async (messageFromVoice = null) => {

    const finalMessage =
      messageFromVoice || input;

    if (!finalMessage.trim()) return;

    const userMessage = {
      sender: "user",
      text: finalMessage
    };

    // Add user message
    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    // Clear input
    setInput("");

    setLoading(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/chatbot/message`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: finalMessage,

            // Send selected language for future
            // multilingual backend handling
            language: i18n.language,
            conversationId: conversationId
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Failed to get chatbot response"
        );
      }

      const botMessage = {
        sender: "bot",
        text: result.response,

        intent: result.intent,
        action: result.action,

        data: result.data
      };

      // Add chatbot response
      setMessages((prev) => [
        ...prev,
        botMessage
      ]);

      // Speak chatbot response
      speakText(result.response);

    } catch (error) {

      console.error(
        "Chatbot error:",
        error
      );

      const errorMessage =
        "Sorry, I'm unable to respond right now. Please try again later.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: errorMessage
        }
      ]);

      speakText(errorMessage);

    } finally {

      setLoading(false);

    }
  };


  // Send message when Enter is pressed
  const handleKeyDown = (event) => {

    if (event.key === "Enter") {
      sendMessage();
    }

  };


  return (
    <div className="chatbot-container">

      {/* Floating Chat Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </button>


      {/* Chat Window */}
      {isOpen && (

        <div className="chatbot-window">

          {/* Header */}
          <div className="chatbot-header">

            <div>
              <h3>Loan Assistant</h3>

              <span>
                {isListening
                  ? "Listening..."
                  : "Online"}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

          </div>


          {/* Messages */}
          <div className="chatbot-messages">

            {messages.map((message, index) => (

              <ChatMessage
                key={index}
                message={message}
              />

            ))}

            {loading && (

              <div className="chat-loading">
                Typing...
              </div>

            )}

          </div>


          {/* Input */}
          <div className="chatbot-input">

            <input
              type="text"

              placeholder="Ask me about loans..."

              value={input}

              onChange={(event) =>
                setInput(event.target.value)
              }

              onKeyDown={handleKeyDown}
            />


            {/* Voice Input */}
            <button
              className={
                isListening
                  ? "voice-button listening"
                  : "voice-button"
              }
              onClick={startListening}
              title="Speak"
              type="button"
            >
              🎤
            </button>


            {/* Send Message */}
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              type="button"
            >
              Send
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Chatbot;