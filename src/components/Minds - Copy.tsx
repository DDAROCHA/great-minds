import React, { useEffect, useRef, useState } from "react";
import "./Minds.css";
import { getConversations, saveConversation, askAI } from "../services/conversations";

interface Message {
  persona: string;
  text: string;
  timestamp: number;
}

interface Conversation {
  _id?: string;
  topic: string;
  messages: Message[];
  createdAt?: string;
}

const CHATGPT_NAME = "🤖 ChatGPT";
const GEMINI_NAME = "✨ Gemini";
const FINAL_MESSAGE = "🤖 End of conversation — Great Minds think alike! ✨";
const TOTAL_ROUNDS = 8;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const Minds: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [typing, setTyping] = useState(false);
  const [round, setRound] = useState(0);

  const stopRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    async function load() {
      const conv = await getConversations();
      setSavedConversations(conv);
    }
    load();
  }, []);

  // auto scroll bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSelectConversation = (id: string) => {
    const c = savedConversations.find((x) => x._id === id);
    if (!c) return;

    stopRef.current = true;
    setIsRunning(false);
    setRound(0);

    setTopic(c.topic);
    setMessages(c.messages);

    setTimeout(() => {
      if (chatRef.current) chatRef.current.scrollTop = 0;
    }, 30);
  };

  function buildInstruction(persona: string, topic: string, other: string, prevmessage: string) {
    return `You are ${persona}. Reply to ${other} and his opinion ${prevmessage} with one short witty sentence about "${topic}". Keep it funny.`;
  }

  async function askSafe(topic: string, text: string, persona: string) {
    const res = await askAI(topic, [{ text }]);
    const t = (res?.reply || "").trim();

    if (!t)
      return persona.includes("Gemini")
        ? "I can't stand you anymore, I'm speechless. 💫"
        : "I’d rather stay quiet than speak another second with you. ⚡";

    return t;
  }

  const startChat = async () => {
    if (!topic.trim()) return;

    setMessages([]);
    setIsRunning(true);
    stopRef.current = false;
    setRound(0);

    const startMsg: Message = {
      persona: "system",
      text: `Starting automatic conversation about "${topic}".`,
      timestamp: Date.now(),
    };

    setMessages([startMsg]);
    messagesRef.current = [startMsg];
    

    try {
      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        if (stopRef.current) break;
        setRound(i + 1);

        // GPT
        setTyping(true);
        await wait(200);

        const instrGPT = buildInstruction(CHATGPT_NAME, topic, GEMINI_NAME, messagesRef.current[messagesRef.current.length - 1].text);

        const gptText = await askSafe(topic, instrGPT, CHATGPT_NAME);


        const gptMsg: Message = {
          persona: CHATGPT_NAME,
          text: gptText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, gptMsg]);
        messagesRef.current = [...messagesRef.current, gptMsg];

        setTyping(false);
        await wait(250);
        if (stopRef.current) break;

        // GEMINI
        setTyping(true);
        await wait(200);

        const instrGem = buildInstruction(GEMINI_NAME, topic, CHATGPT_NAME, messagesRef.current[messagesRef.current.length - 1].text);

        //console.log("🟣 askSafe REQUEST for Gemini:", instrGem );

        const gemText = await askSafe(topic, instrGem, GEMINI_NAME);

        const gemMsg: Message = {
          persona: GEMINI_NAME,
          text: gemText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, gemMsg]);
        messagesRef.current = [...messagesRef.current, gemMsg];

        setTyping(false);
        await wait(250);
      }

      if (!stopRef.current) {
        const endMsg: Message = {
          persona: "system",
          text: FINAL_MESSAGE,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, endMsg]);
      }

      await saveConversation(topic, messagesRef.current);
      setSavedConversations(await getConversations());
    } catch (err) {
      console.error(err);
    }

    setTyping(false);
    setIsRunning(false);
    stopRef.current = false;
  };

  const stopChat = async () => {
    stopRef.current = true;
    setTyping(false);
    setIsRunning(false);

    try {
      await saveConversation(topic, messagesRef.current);
      setSavedConversations(await getConversations());
    } catch {}
  };

  const clearHistory = () => {
    setSavedConversations([]);
    setMessages([]);
    setTopic("");
  };

  const renderMessage = (m: Message, i: number) => {
    const isSystem = m.persona === "system";
    const isGem = m.persona.includes("Gemini");
    const bubble = isSystem ? "system" : isGem ? "gemini" : "gpt";
    const align = isSystem ? "center" : isGem ? "right" : "left";

    return (
      <div key={i} className={`chat-message ${align} ${bubble}`}>
        <div className="chat-bubble">
          {!isSystem && <div className="chat-persona">{m.persona}</div>}
          <div className="chat-text">{m.text}</div>
          <div className="chat-time">
            {new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Great Minds 🧠💡</h1>
        <p>Witness two powerful AIs debating.</p>
      </header>

      <div className="top-bar">
        <div className="round-counter">{isRunning ? `Round ${round} / ${TOTAL_ROUNDS}` : ""}</div>
        <button className="clear-btn" onClick={clearHistory}>Clear History</button>
      </div>

      <div className="conversation-header">
        <select onChange={(e) => handleSelectConversation(e.target.value)} defaultValue="">
          <option value="">📚 Select a saved conversation...</option>
          {savedConversations.map((c) => (
            <option key={c._id} value={c._id}>
              {c.topic} – {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="topic-input">
        <input
          type="text"
          placeholder="Type a topic..."
          disabled={isRunning}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {!isRunning ? (
          <button onClick={startChat} disabled={!topic.trim()}>
            Start Conversation
          </button>
        ) : (
          <button className="stop-button" onClick={stopChat}>Stop</button>
        )}
      </div>

      <div className="chat-container" ref={chatRef}>
        {messages.length === 0
          ? <div className="chat-empty">No messages yet.</div>
          : messages.map((m, i) => renderMessage(m, i))}

        {typing && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      <footer className="footer-note">Conversations stored in MongoDB 🛢️</footer>
    </div>
  );
};

export default Minds;
