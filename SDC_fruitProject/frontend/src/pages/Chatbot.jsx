import { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../api';
import Toast from '../components/Toast';
import {
  Send, Loader2, Stethoscope, Trash2, MessageSquareText,
  Sparkles, Bot, User, Cherry, HeartPulse, Lightbulb,
  Download, Copy, CheckCheck, Hash, WifiOff, Zap
} from 'lucide-react';
import clsx from 'clsx';

const SUGGESTIONS = [
  { text: 'What does apple scab look like?', emoji: '🍎' },
  { text: 'What causes black spots on mangoes?', emoji: '🥭' },
  { text: 'How to tell if oranges have mold?', emoji: '🍊' },
  { text: 'When are grapes overripe?', emoji: '�' },
  { text: 'How to tell if a banana is unripe?', emoji: '🍌' },
  { text: 'Tips for storing fruits longer', emoji: '🧊' },
  { text: 'What does Grade A quality mean?', emoji: '🏆' },
  { text: 'How to spot bruised fruit', emoji: '🔍' },
];

const QUICK_REPLIES = [
  'Tell me more',
  'What should I do next?',
  'Give me a summary',
  'Any tips?',
];

const MAX_CHARS = 500;

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
        setToast({
          type: 'info',
          message: '📚 Gemini API unavailable — replied from built-in knowledge base.',
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message || 'Failed to get response from FruitMD.',
      });
      setMessages([
        ...updated,
        {
          role: 'assistant',
          content: '😔 Sorry, I encountered an unexpected error. Please try again in a moment.',
          offline: false,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setToast({ type: 'info', message: 'Chat cleared.' });
  };

  const exportChat = () => {
    if (!messages.length) return;
    const text = messages.map((m) => `${m.role === 'user' ? '🧑 You' : '🩺 Dr. FruitMD'}: ${m.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `fruitmD-chat-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    setToast({ type: 'success', message: 'Chat exported!' });
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="card !rounded-b-none !border-b-0 bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-600 dark:from-primary-700 dark:via-primary-600 dark:to-emerald-700 text-white !border-primary-500 relative overflow-hidden" style={{ backgroundSize: '200% 200%', animation: 'gradientX 15s ease infinite' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -mr-8 -mt-8 blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                FruitMD AI Assistant
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </h2>
              <p className="text-xs text-white/70">Powered by Google Gemini + Offline Knowledge • Ask anything about fruits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{messages.length} msg{messages.length !== 1 ? 's' : ''}</span>
            {messages.length > 0 && (
              <button
                onClick={exportChat}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Export chat"
                title="Export chat as text"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto card !rounded-none !border-y-0 !py-4 space-y-4 bg-gray-50/30 dark:bg-gray-950/30 backdrop-blur-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-5 animate-float">
              <Stethoscope size={36} className="text-primary-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
              Hello! I'm Dr. FruitMD 🩺
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Your AI-powered fruit health specialist. Ask me anything about fruit quality,
              classification, grading, storage tips, or nutritional information.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-2.5 text-left px-4 py-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-sm text-gray-600 dark:text-gray-300"
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={clsx(
                    'flex gap-3 animate-slide-up',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={16} className="text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div className="group/msg relative">
                    <div
                      className={clsx(
                        'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm'
                      )}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {/* Offline knowledge base badge */}
                      {msg.role === 'assistant' && msg.offline && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <WifiOff size={10} className="text-amber-500" />
                          <span className="text-[10px] text-amber-500/80 font-medium">Offline • Built-in Knowledge</span>
                        </div>
                      )}
                      {msg.role === 'assistant' && msg.offline === false && msg.content && !msg.content.startsWith('😔') && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                          <Zap size={10} className="text-emerald-500" />
                          <span className="text-[10px] text-emerald-500/80 font-medium">Gemini AI</span>
                        </div>
                      )}
                    </div>
                    {/* Copy button */}
                    <button
                      onClick={() => copyMessage(msg.content, i)}
                      className={clsx(
                        'absolute -bottom-1 right-2 p-1 rounded-md text-[10px] transition-all',
                        msg.role === 'user'
                          ? 'text-white/40 hover:text-white/80 hover:bg-white/10'
                          : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700',
                        'opacity-0 group-hover/msg:opacity-100'
                      )}
                      title="Copy message"
                    >
                      {copiedIdx === i ? <CheckCheck size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
                {/* Quick reply buttons after last assistant message */}
                {msg.role === 'assistant' && i === messages.length - 1 && !loading && (
                  <div className="flex flex-wrap gap-1.5 ml-11 animate-fade-in">
                    {QUICK_REPLIES.map((qr, qi) => (
                      <button
                        key={qi}
                        onClick={() => sendMessage(qr)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div className="card !rounded-t-none !border-t border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Dr. FruitMD anything about fruits…"
              className="input-field w-full resize-none pr-4 text-sm min-h-[44px] max-h-32"
              rows={1}
              disabled={loading}
              aria-label="Chat message input"
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={clsx(
              'p-2.5 rounded-xl transition-all flex-shrink-0',
              input.trim() && !loading
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-gray-400">
            FruitMD AI may produce inaccurate information. Always verify with professional assessment.
          </p>
          <span className={clsx(
            'text-[10px] font-mono transition-colors',
            input.length > MAX_CHARS * 0.9 ? 'text-red-400' : input.length > MAX_CHARS * 0.7 ? 'text-amber-400' : 'text-gray-300'
          )}>
            {input.length}/{MAX_CHARS}
          </span>
        </div>
      </div>
    </div>
  );
}
