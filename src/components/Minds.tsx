import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as CloseIcon, Info as InfoIcon } from 'lucide-react';
import './Minds.css';
import { getConversations, saveConversation, askAI } from '../services/conversations';
import cerebro from '../cerebro.png';

// ==============================================
// MODAL: About Modal (Modal 'Acerca de')
// ==============================================
interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => (
  <motion.div
    className="modal-overlay"
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="modal-content about-modal"
      onClick={e => e.stopPropagation()}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
    >
      <button className="modal-close-btn" onClick={onClose}>
        <CloseIcon size={24} />
      </button>

      <button className="modal-close-btn" onClick={onClose}>
        <CloseIcon size={24} />
      </button>
      <h4>About Great Minds App</h4>
      <p>
        This application is an interactive experiment designed to bring my portfolio to life. Every
        project, conversation, and interaction you see here is powered by a custom full-stack
        ecosystem built from scratch — combining modern web technologies with real-time AI
        responses.
      </p>

      <h5>Technology Stack</h5>
      <ul>
        <li>
          <strong>Frontend:</strong> React + TypeScript running on a lightweight Node.js environment
        </li>
        <li>
          <strong>Styling:</strong> CSS Modules and Tailwind CSS for fast, responsive UI development
        </li>
        <li>
          <strong>Backend:</strong> Node.js / Express deployed on Render
        </li>
        <li>
          <strong>Database:</strong> MongoDB Atlas (Serverless) for seamless cloud storage
        </li>
        <li>
          <strong>AI Engine:</strong> OpenAI Base for dynamic, on-the-fly conversational generation
        </li>
        <li>
          <strong>Tools:</strong> Framer Motion for smooth animations, Lucide React for clean and
          minimal icons
        </li>
      </ul>

      <h5>How to Use This App</h5>
      <ul>
        <li>
          Click <strong>“Clear History”</strong> to reset the app and wipe previously saved
          sessions.
        </li>
        <li>
          Use the <strong>“Select a saved conversation”</strong> dropdown to revisit any past AI
          debate stored in MongoDB.
        </li>
        <li>The conversation list updates automatically whenever a new session is completed.</li>
        <li>
          Enter a topic and click <strong>“Start Conversation”</strong> to generate a fresh AI-to-AI
          debate.
        </li>
      </ul>

      <h5>Why I Built This</h5>
      <p>
        I created this project as a playful yet technical experiment: a place where two powerful AIs
        —<strong>ChatGPT</strong> and <strong>Gemini</strong> — face off in fully automated,
        topic-driven conversations. The goal was to explore how different AI systems “think,” how
        their tones diverge, and how far a custom full-stack setup can push real-time generative
        interaction.
      </p>
      <p>
        Beyond the entertainment factor, this app also serves as a personal lab: a space to test
        deployment pipelines, API orchestration, UI animations, scalable data storage, and efficient
        communication between multiple models. It represents my passion for building systems that
        are both technically solid and genuinely fun to use.
      </p>

      <footer>© 2025 Diego Da Rocha — Portfolio Demo</footer>
    </motion.div>
  </motion.div>
);

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

const CHATGPT_NAME = '🤖 ChatGPT';
const GEMINI_NAME = '✨ Gemini';
const FINAL_MESSAGE = '🤖 End of conversation — Great Minds think alike! ✨';
const TOTAL_ROUNDS = 8;

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

const Minds: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [typing, setTyping] = useState(false);
  //const [round, setRound] = useState(0);

  const stopRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    async function load() {
      const conv = await getConversations();
      console.log('📦 conversations:', conv); // 👈 CLAVE
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
    const c = savedConversations.find(x => x._id === id);
    if (!c) return;

    stopRef.current = true;
    setIsRunning(false);
    //setRound(0);

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

    const t = res.trim();

    if (!t)
      return persona.includes('Gemini')
        ? "I can't stand you anymore, I'm speechless. 💫"
        : 'I’d rather stay quiet than speak another second with you. ⚡';

    return t;
  }

  const startChat = async () => {
    if (!topic.trim()) return;

    setMessages([]);
    setIsRunning(true);
    stopRef.current = false;
    //setRound(0);

    const startMsg: Message = {
      persona: 'system',
      text: `Starting automatic conversation about "${topic}".`,
      timestamp: Date.now(),
    };

    setMessages([startMsg]);
    messagesRef.current = [startMsg];

    try {
      for (let i = 0; i < TOTAL_ROUNDS; i++) {
        if (stopRef.current) break;
        //setRound(i + 1);

        // GPT
        setTyping(true);
        await wait(200);

        const instrGPT = buildInstruction(
          CHATGPT_NAME,
          topic,
          GEMINI_NAME,
          messagesRef.current[messagesRef.current.length - 1].text
        );

        const gptText = await askSafe(topic, instrGPT, CHATGPT_NAME);

        const gptMsg: Message = {
          persona: CHATGPT_NAME,
          text: gptText,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, gptMsg]);
        messagesRef.current = [...messagesRef.current, gptMsg];

        setTyping(false);
        await wait(250);
        if (stopRef.current) break;

        // GEMINI
        setTyping(true);
        await wait(200);

        const instrGem = buildInstruction(
          GEMINI_NAME,
          topic,
          CHATGPT_NAME,
          messagesRef.current[messagesRef.current.length - 1].text
        );

        //console.log("🟣 askSafe REQUEST for Gemini:", instrGem );

        const gemText = await askSafe(topic, instrGem, GEMINI_NAME);

        const gemMsg: Message = {
          persona: GEMINI_NAME,
          text: gemText,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, gemMsg]);
        messagesRef.current = [...messagesRef.current, gemMsg];

        setTyping(false);
        await wait(250);
      }

      if (!stopRef.current) {
        const endMsg: Message = {
          persona: 'system',
          text: FINAL_MESSAGE,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, endMsg]);
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

  const [showAboutModal, setShowAboutModal] = useState(false);

  const renderMessage = (m: Message, i: number) => {
    const isSystem = m.persona === 'system';
    const isGem = m.persona.includes('Gemini');
    const bubble = isSystem ? 'system' : isGem ? 'gemini' : 'gpt';
    const align = isSystem ? 'center' : isGem ? 'right' : 'left';

    return (
      <div key={i} className={`chat-message ${align} ${bubble}`}>
        <div className="chat-bubble">
          {!isSystem && <div className="chat-persona">{m.persona}</div>}
          <div className="chat-text">{m.text}</div>
          <div className="chat-time">
            {new Date(m.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>
        </div>
      </div>
    );
  };

  async function debugGemini() {
    console.log('🧪 DEBUG GEMINI CLICK');

    //const res = await askAI("Debug", [{ text: "Ping" }]);

    const res = await askAI('Pelos de Gatos', [{ text: 'Hablame de esto en 2 renglones' }]);

    console.log('🧠 DEBUG RESPONSE:', res);

    //Este es el Boton de prueba para Gemini
    //<button onClick={debugGemini}>🔥 Debug Gemini</button>
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={cerebro} alt="Logo" className="header-cerebro" />

        <div className="header-text-group">
          <h1>Great Minds</h1>
          <p>Witness two powerful AIs debating.</p>
        </div>

        <motion.button
          onClick={() => setShowAboutModal(true)}
          className="clear-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <InfoIcon size={18} style={{ marginRight: '5px' }} /> About
        </motion.button>
      </header>

      <div className="conversation-header">
        <select onChange={e => handleSelectConversation(e.target.value)} defaultValue="">
          <option value="">📚 Select a saved conversation...</option>
          {savedConversations.map(c => (
            <option key={c._id} value={c._id}>
              {c.topic} – {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
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
          onChange={e => setTopic(e.target.value)}
        />

        {!isRunning ? (
          <button onClick={startChat} disabled={!topic.trim()}>
            Start Conversation
          </button>
        ) : (
          <button className="stop-button" onClick={stopChat}>
            Stop
          </button>
        )}
      </div>

      <div className="chat-container" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet.</div>
        ) : (
          messages.map((m, i) => renderMessage(m, i))
        )}

        {typing && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
      </AnimatePresence>

      <footer className="footer-note">Conversations stored in MongoDB 🛢️</footer>
    </div>
  );
};

export default Minds;
