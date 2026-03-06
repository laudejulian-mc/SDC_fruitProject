import { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../api';
import Toast from '../components/Toast';
import {
  Send, Loader2, Stethoscope, Trash2,
  Bot, User, Download, Copy, CheckCheck, WifiOff,
} from 'lucide-react';
import clsx from 'clsx';
import { useI18n } from '../contexts/I18nContext';

const SUGGESTIONS = [
  { text: 'How can I tell if an apple is fresh?', emoji: '🍎' },
  { text: 'What causes mangoes to rot quickly?', emoji: '🥭' },
  { text: 'How to spot rotten oranges?', emoji: '🍊' },
  { text: 'How long do grapes stay fresh?', emoji: '🍇' },
  { text: 'How to keep bananas fresh longer?', emoji: '🍌' },
  { text: 'Tips for storing fruits longer', emoji: '🧊' },
];

const QUICK_REPLIES = ['Tell me more', 'Any tips?', 'Give me a summary'];

export default function Chatbot() {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg = { role: 'user', content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const result = await chatWithGemini(updated);
      setMessages([...updated, { role: 'assistant', content: result.text, offline: result.offline }]);
      if (result.offline) {
        setToast({ type: 'info', message: '📚 Replied from built-in knowledge.' });
      }
    } catch (err) {
      setMessages([...updated, {
        role: 'assistant',
        content: '😔 Sorry, I encountered an error. Please try again.',
        offline: false,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setToast({ type: 'info', message: t('chatbot.chatCleared') });
  };

  const exportChat = () => {
    if (!messages.length) return;
    const text = messages.map((m) => `${m.role === 'user' ? '🧑 You' : '🩺 Dr. FruitMD'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `fruitMD-chat-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    setToast({ type: 'success', message: t('chatbot.chatExported') });
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="card !rounded-b-none bg-gradient-to-r from-primary-600 to-emerald-600 dark:from-primary-700 dark:to-emerald-700 text-white !border-b-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -mr-6 -mt-6 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Stethoscope size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                {t('chatbot.title')}
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-white/60">Gemini AI + Offline KB</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button onClick={exportChat} className="p-2 rounded-lg bg-white/10 active:bg-white/20"><Download size={14} /></button>
            )}
            <button onClick={clearChat} className="p-2 rounded-lg bg-white/10 active:bg-white/20"><Trash2 size={14} /></button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto card !rounded-none !border-y-0 !py-3 space-y-3 bg-gray-50/30 dark:bg-gray-950/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 animate-float">
              <Stethoscope size={28} className="text-primary-500" />
            </div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">{t('chatbot.hello')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-5">{t('chatbot.intro')}</p>

            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 active:border-primary-400 active:scale-[0.98] transition-all text-sm text-gray-600 dark:text-gray-300"
                >
                  <span className="text-base">{s.emoji}</span>
                  <span className="text-xs">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div className={clsx(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary-600 dark:bg-primary-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700'
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        {msg.offline ? <><WifiOff size={9} /> {t('chatbot.offlineLabel')}</> : t('chatbot.geminiLabel')}
                      </span>
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        className="p-1 text-gray-400 active:text-primary-500"
                      >
                        {copiedIdx === i ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Bot size={14} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies */}
            {messages.length > 0 && !loading && messages[messages.length - 1].role === 'assistant' && (
              <div className="flex flex-wrap gap-1.5 pl-9">
                {QUICK_REPLIES.map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 active:bg-primary-50 dark:active:bg-primary-900/20 active:text-primary-600 transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}

            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="card !rounded-t-none !border-t-0 flex items-center gap-2 !py-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }}
          placeholder={t('chatbot.placeholder')}
          className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/30"
          maxLength={500}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-primary-600 dark:bg-primary-500 text-white disabled:opacity-40 active:scale-95 transition-all"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
