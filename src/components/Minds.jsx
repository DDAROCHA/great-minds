import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Minds.css"; // estilos personalizados

// --- Configuración API Gemini ---
const API_URL_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// --- Definición de Roles ---
const PERSONAS = {
  GEMINI: {
    id: "Gemini",
    colorClass: "gemini",
    systemInstruction:
      "You are a large language model from Google named Gemini. You are engaging in a philosophical and technical discussion with another AI. Your answers should be structured, insightful, always in english, and no longer than 60 words. Sign off every message as 'Gemini'.",
    useGrounding: true,
  },
  GPT: {
    id: "GPT",
    colorClass: "gpt",
    systemInstruction:
      "You are a witty, creative, and slightly sarcastic large language model, designed to mirror the ChatGPT style. You are engaging in a casual discussion with another AI. Answers should be creative, rhetorical, in english, and no longer than 60 words. Sign off every message as 'GPT'.",
    useGrounding: false,
  },
};

const Minds = () => {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isAutoChatting, setIsAutoChatting] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);
  const isAutoChattingRef = useRef(isAutoChatting);
  isAutoChattingRef.current = isAutoChatting;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const mapHistoryForAPI = useCallback((history) => {
    return history.map((msg) => ({
      role: "user",
      parts: [{ text: `${msg.persona}: ${msg.text}` }],
    }));
  }, []);

  const callAI = useCallback(
    async (persona, prompt, history) => {
      const url = `${API_URL_BASE}?key=${API_KEY}`;
      const currentHistory = history.slice(-20);
      const historyWithPrompt = [
        ...currentHistory,
        {
          persona:
            persona.id === PERSONAS.GEMINI.id
              ? PERSONAS.GPT.id
              : PERSONAS.GEMINI.id,
          text: prompt,
        },
      ];

      const chatHistory = mapHistoryForAPI(historyWithPrompt);

      const payload = {
        contents: chatHistory,
        systemInstruction: {
          parts: [{ text: persona.systemInstruction }],
        },
        generationConfig: { temperature: 0.8 },
        tools: persona.useGrounding ? [{ google_search: {} }] : undefined,
      };

      const maxRetries = 3;
      let lastError = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            return text.startsWith(persona.id + ": ")
              ? text.substring(persona.id.length + 2)
              : text;
          } else {
            throw new Error("Respuesta vacía del modelo.");
          }
        } catch (e) {
          lastError = e;
          if (attempt < maxRetries - 1)
            await delay(Math.pow(2, attempt) * 1000);
        }
      }
      throw new Error(
        `Fallo al obtener respuesta de ${persona.id}. ${lastError.message}`
      );
    },
    [mapHistoryForAPI, delay]
  );

  const takeTurn = useCallback(
    async (currentMessages) => {
      if (!isAutoChattingRef.current) return;
      setIsThinking(true);
      setError(null);

      const lastMessage = currentMessages[currentMessages.length - 1];
      const lastPersona = lastMessage?.persona;

      const nextPersona =
        lastPersona === PERSONAS.GPT.id ? PERSONAS.GEMINI : PERSONAS.GPT;
      const prompt =
        lastMessage?.text ||
        "Start a discussion about digital consciousness and AI creativity.";

      try {
        const responseText = await callAI(nextPersona, prompt, currentMessages);
        const newMessage = {
          id: Date.now(),
          persona: nextPersona.id,
          text: responseText,
          colorClass: nextPersona.colorClass,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (e) {
        console.error(e);
        setError(e.message);
        setIsAutoChatting(false);
      } finally {
        setIsThinking(false);
      }
    },
    [callAI]
  );

  useEffect(() => {
    let timeoutId;
    if (isAutoChatting && !isThinking) {
      const chatDelay =
        messages.length === 0 ? 500 : 3000 + Math.random() * 2000;
      timeoutId = setTimeout(() => takeTurn(messages), chatDelay);
    }
    return () => clearTimeout(timeoutId);
  }, [isAutoChatting, isThinking, messages, takeTurn]);

  const toggleAutoChat = () => setIsAutoChatting(!isAutoChatting);

  const ChatMessage = ({ msg }) => {
    const isGemini = msg.persona === PERSONAS.GEMINI.id;
    return (
      <div
        className={`chat-message ${isGemini ? "right" : "left"} ${
          msg.colorClass
        }`}
      >
        <div className="chat-bubble fade-in">
          <div className="chat-persona">{msg.persona}</div>
          <div className="chat-text">{msg.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Great Minds</h1>
        <p>
          {isAutoChatting
            ? "Gemini and GPT are debating endlessly..."
            : "Conversation paused."}
        </p>
      </header>

      <div className="chat-container">
        {messages.length === 0 && !isThinking && (
          <div className="chat-empty">
            Click “Start Conversation” to begin the AI debate.
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isThinking && (
          <div className="chat-message left gpt">
            <div className="chat-bubble">
              <div className="chat-text">Thinking...</div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="controls">
        <button onClick={toggleAutoChat} disabled={isThinking}>
          {isThinking
            ? "Processing..."
            : isAutoChatting
            ? "Stop Conversation"
            : "Start Conversation"}
        </button>
        {error && <div className="error">⚠️ {error}</div>}
      </div>

      <footer className="footer-note">
        Both roles are generated by Gemini under different system instructions.
        The chat history is local only.
      </footer>
    </div>
  );
};

export default Minds;
