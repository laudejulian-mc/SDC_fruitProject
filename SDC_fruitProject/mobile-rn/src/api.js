import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Change this to your backend server IP/URL.
// Use your local network IP (not localhost) when running on a physical device.
const BASE_URL = 'http://10.0.0.97:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach stored auth token on every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Store / clear / retrieve token helper
export const setAuthToken = async (token) => {
  if (token) {
    await AsyncStorage.setItem('authToken', token);
  } else {
    await AsyncStorage.removeItem('authToken');
  }
};

export const getAuthToken = async () => {
  return AsyncStorage.getItem('authToken');
};

// ---- Auth ----
export const loginApi = (username, password) =>
  api.post('/auth/login/', { username, password });

export const logoutApi = () => api.post('/auth/logout/');

export const getMe = () => api.get('/auth/me/');

export const changeUsername = (currentPassword, newUsername) =>
  api.post('/auth/change-username/', {
    current_password: currentPassword,
    new_username: newUsername,
  });

export const changePassword = (currentPassword, newPassword, confirmPassword) =>
  api.post('/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });

// ---- Detection ----
export const detectSingle = (formData) =>
  api.post('/detect/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

export const detectBatch = (formData) =>
  api.post('/detect/batch/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ---- Records ----
export const getRecords = (params) => api.get('/records/', { params });
export const deleteRecord = (id) => api.delete(`/records/${id}/`);

// ---- Dashboard ----
export const getDashboardStats = () => api.get('/dashboard/stats/');

// ---- Reports ----
export const getReportSummary = (params) =>
  api.get('/reports/summary/', { params });

// ---- Chatbot (Gemini) ----
import { getOfflineReply, getGenericFallback } from './utils/fallbackReplies';

const GEMINI_API_KEY = 'AIzaSyC4iCqgOkczdnFoDC63h-7ipN8z_fBu0fc';

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
];

const makeGeminiUrl = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are FruitMD, an AI fruit doctor assistant. You specialize in fruit quality assessment for apples, oranges, mangoes, grapes, and bananas.
Your expertise includes:
- Classifying apple conditions: Fresh, Bruised, Rot, and Scab
- Classifying orange conditions: Fresh, Bruised, Mold, and Overripe
- Classifying mango conditions: Fresh, Bruised, Black Spot, and Rotten
- Classifying grape conditions: Fresh, Bruised, Mold, and Rot
- Classifying banana conditions: Fresh, Bruised, Overripe, and Unripe
- Fruit grading (Grade A, B, C, Reject) based on confidence scores
- Storage and preservation tips for all five fruit types
- Nutritional information about fruits
- Best practices for fruit quality inspection
- Agricultural advice related to fruit cultivation and disease prevention

Always respond in a helpful, friendly, and professional medical-doctor style.
Keep responses concise but informative. Use emojis occasionally to be friendly.
If asked about topics outside of fruits and agriculture, politely redirect to fruit-related topics.

CRITICAL FORMATTING RULE: NEVER use asterisks (*) or markdown formatting in your responses. Do NOT use *bold*, **bold**, or bullet points with asterisks. Instead use plain text, dashes (-) for lists, and natural emphasis through word choice. Keep your responses as clean plain text.`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const chatWithGemini = async (messages, retries = 2) => {
  const lastUserMsg =
    [...messages].reverse().find((m) => m.role === 'user')?.content || '';

  const contents = [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    {
      role: 'model',
      parts: [
        {
          text: "Understood! I am FruitMD, your AI fruit doctor. I'm here to help with all things related to fruit quality, classification, grading, and care for apples, oranges, mangoes, grapes, and bananas. How can I assist you today? 🍎🍊🥭🍇🍌",
        },
      ],
    },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(makeGeminiUrl(model), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let text =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Sorry, I could not generate a response.';
          text = text
            .replace(/\*{1,3}([^*]+?)\*{1,3}/g, '$1')
            .replace(/^\*\s+/gm, '- ');
          return { text, offline: false };
        }

        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || '';

        if (
          response.status === 429 ||
          response.status === 404 ||
          response.status === 503 ||
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('overloaded') ||
          errMsg.toLowerCase().includes('high demand')
        ) {
          lastError = new Error(`${model}: ${errMsg || response.status}`);
          if (
            attempt < retries &&
            (response.status === 429 || response.status === 503)
          ) {
            await delay(2000 * (attempt + 1));
            continue;
          }
          break;
        }

        throw new Error(errMsg || `Gemini API error (${response.status})`);
      } catch (err) {
        lastError = err;
        if (
          err.message?.includes('Quota exceeded') ||
          err.message?.includes('not found') ||
          err.message?.includes('overloaded') ||
          err.message?.includes('high demand') ||
          err.name === 'TypeError'
        ) {
          if (attempt < retries) {
            await delay(2000 * (attempt + 1));
            continue;
          }
          break;
        }
        break;
      }
    }
  }

  const offlineMatch = getOfflineReply(lastUserMsg);
  if (offlineMatch) {
    return { text: offlineMatch.reply, offline: true };
  }

  const generic = getGenericFallback();
  return { text: generic.reply, offline: true };
};

export default api;
