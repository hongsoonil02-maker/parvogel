import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// 상담 API 프록시 주소 — Agrokorea 공용 Cloudflare Worker (4개 제품 공유)
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL
    || 'https://vetacol.hongsoonil02.workers.dev/api/chat';
const CHAT_TIMEOUT_MS = 15000;

export default function Chatbot() {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('chat.greeting') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0 && newMsgs[0].role === 'assistant') {
                newMsgs[0].content = t('chat.greeting');
            }
            return newMsgs;
        });
    }, [i18n.language, t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const toggleChat = () => setIsOpen(!isOpen);

    // 푸터 '자주 묻는 질문' 등 외부에서 챗봇 열기 요청 수신
    useEffect(() => {
        const openChat = () => setIsOpen(true);
        window.addEventListener('parvogel:open-chat', openChat);
        return () => window.removeEventListener('parvogel:open-chat', openChat);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

        try {
            // Agrokorea 공용 챗봇 프록시 호출
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: 'parvogel',
                    message: userMessage,
                    language: i18n.language
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: t('chat.error') }]);
        } finally {
            clearTimeout(timer);
            setIsLoading(false);
        }
    };

    // ESC 키 누를 때 열려있는 챗봇 창 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom,0px))] end-3 sm:end-6 z-[80] flex flex-col items-end">
            {/* 챗봇 토글 버튼 (56px 원형, WCAG 48px 이상 터치 타겟, z-[80] 전역 항상 노출) */}
            <button
                onClick={toggleChat}
                className={`${isOpen ? 'hidden' : 'flex'} items-center justify-center w-14 h-14 min-w-[48px] min-h-[48px] bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-full shadow-2xl border-2 border-primary-300/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50 transition-all hover:scale-110 active:scale-95 group cursor-pointer`}
                aria-label={t('chat.openButton', 'AI 맞춤 상담 챗봇 열기')}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transition-transform group-hover:scale-105" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            {/* 챗봇 창 */}
            <div
                role="dialog"
                aria-label={t('chat.title', '파보겔 AI 맞춤 상담')}
                className={`${isOpen ? 'flex' : 'hidden'} flex-col w-[92vw] sm:w-[400px] h-[550px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-300/80 overflow-hidden transition-all duration-300 origin-bottom-right z-[85] mb-2`}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold text-sm">
                            AI
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{t('chat.title')}</h3>
                            <p className="text-xs text-blue-100">{t('chat.subtitle')} · {i18n.language.toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={toggleChat} className="text-white hover:text-slate-200 focus:outline-none" aria-label={t('chat.close', '챗봇 닫기')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" role="log" aria-live="polite" aria-label={t('chat.messages', '상담 메시지')}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-white">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                        >
                            {t('chat.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
