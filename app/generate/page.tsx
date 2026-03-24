"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "@/lib/svg-paths";

function Logo() {
  return (
    <div className="h-[37.828px] relative shrink-0 w-[36px]">
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 36 37.8281"
      >
        <g id="Logo">
          <path
            d={svgPaths.p1c4d2300}
            fill="var(--fill-0, #160211)"
            id="Star 1"
          />
          <path
            d={svgPaths.p2128f680}
            fill="var(--fill-0, #160211)"
            id="Star 3"
          />
          <path
            d={svgPaths.p1c2ff500}
            fill="var(--fill-0, #160211)"
            id="Star 2"
          />
        </g>
      </svg>
    </div>
  );
}

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isGenerating?: boolean;
}

export default function GeneratePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestions = [
    "Create a 10-minute meditation for stress relief",
    "I need help falling asleep tonight",
    "Guide me through a morning focus meditation",
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };

    const generatingMessage: Message = {
      id: Date.now() + 1,
      text: "",
      isUser: false,
      isGenerating: true,
    };

    setMessages((prev) => [...prev, userMessage, generatingMessage]);
    setInputValue("");
    setIsGenerating(true);

    // TODO: Replace with actual API call to your backend
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === generatingMessage.id
          ? {
              ...msg,
              text: "I've created a personalized meditation for you. It includes natural pause-aware pacing and professional studio-quality audio. Your meditation is ready to play.",
              isGenerating: false,
            }
          : msg
      )
    );
    setIsGenerating(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const showInitialState = messages.length === 0;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Blurred gradient background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[544px] h-[464px] pointer-events-none">
        <div className="absolute inset-[-96.98%_-68.01%_-107.76%_-91.91%]">
          <svg
            className="block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 1414 1414"
          >
            <g>
              <g filter="url(#filter0_f_meditation)">
                <circle cx="904" cy="590" fill="#E0E7FF" r="140" />
              </g>
              <g filter="url(#filter1_f_meditation)">
                <circle cx="707" cy="707" fill="#EEF2FF" r="207" />
              </g>
            </g>
            <defs>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="880"
                id="filter0_f_meditation"
                width="880"
                x="464"
                y="150"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_meditation"
                  stdDeviation="150"
                />
              </filter>
              <filter
                colorInterpolationFilters="sRGB"
                filterUnits="userSpaceOnUse"
                height="1414"
                id="filter1_f_meditation"
                width="1414"
                x="0"
                y="0"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  mode="normal"
                  result="shape"
                />
                <feGaussianBlur
                  result="effect1_foregroundBlur_meditation"
                  stdDeviation="250"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <AnimatePresence mode="wait">
          {showInitialState ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-12 min-h-[calc(100vh-200px)] justify-center"
            >
              <Logo />
              <h1 className="text-2xl text-[#160211] text-center">
                Ask our AI to create your meditation
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 mb-32 min-h-[calc(100vh-300px)]"
            >
              <div className="flex items-center gap-3 mb-12">
                <Logo />
                <h1 className="text-xl text-[#160211]">MindFlow AI</h1>
              </div>

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                      message.isUser
                        ? "bg-indigo-600 text-white"
                        : "bg-white/70 backdrop-blur-sm text-[#160211] border border-white"
                    }`}
                  >
                    {message.isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          Creating your meditation...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions and Input - Fixed at bottom */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-20">
          {showInitialState && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <p className="text-sm text-[#606060] mb-3">
                Suggestions on what to ask our AI
              </p>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/50 backdrop-blur-sm border border-white px-4 py-3 rounded-lg text-[#160211] text-sm hover:bg-white/70 transition-all text-left"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input */}
          <div className="bg-white border border-[rgba(22,2,17,0.3)] rounded-lg p-3 flex items-center gap-3 shadow-lg">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Ask me anything about meditation..."
              className="flex-1 outline-none text-sm text-[#160211] placeholder:text-[#aaa] bg-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isGenerating}
              className="shrink-0 size-9 flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <svg
                className="size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 34.8962 34.8922"
              >
                <path
                  d={svgPaths.p2f0e8d80}
                  fill={
                    inputValue.trim() && !isGenerating ? "#4F46E5" : "#AAAAAA"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
