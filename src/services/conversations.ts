const API_URL = process.env.REACT_APP_API_BASE;

export async function getConversations() {
  const res = await fetch(`${API_URL}/api/conversations`);
  return res.json();
}

export async function saveConversation(topic: string, messages: any[]) {
  const res = await fetch(`${API_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, messages }),
  });

  return res.json();
}

export async function askAI(topic: string, messages: any[]) {
  const res = await fetch(`${API_URL}/ai/openai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, messages }),
  });

  const data = await res.json();

  console.log('🧠 askAI RAW response:', data);

  return data.reply ?? '';
}
