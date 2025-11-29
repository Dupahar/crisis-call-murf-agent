"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Phone, Radio } from "lucide-react";
import { Visualizer } from "./Visualizer";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";

export default function VoiceAgent() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [callStatus, setCallStatus] = useState("IDLE");
    const [lastResponseTime, setLastResponseTime] = useState<number>(Date.now());
    const [isPanic, setIsPanic] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramConnectionRef = useRef<LiveClient | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (callStatus === "ACTIVE") {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startListening = async () => {
        try {
            setCallStatus("CONNECTING...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const keyRes = await fetch("/api/speech-to-text");
            const keyData = await keyRes.json();

            if (!keyData.key) {
                console.error("Failed to get Deepgram key");
                setCallStatus("ERROR");
                return;
            }

            const deepgram = createClient(keyData.key);
            const connection = deepgram.listen.live({
                model: "nova-2",
                language: "en-IN",
                smart_format: true,
            });

            connection.on(LiveTranscriptionEvents.Open, () => {
                console.log("Deepgram connection opened");
                setCallStatus("ACTIVE");
                setLastResponseTime(Date.now()); // Start timer

                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0 && connection.getReadyState() === 1) {
                        connection.send(event.data);
                    }
                };
                mediaRecorderRef.current.start(100);
                setIsListening(true);
            });

            connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const sentence = data.channel.alternatives[0].transcript;
                if (sentence && data.is_final) {
                    setTranscript((prev) => prev + " " + sentence);
                    handleConversation(sentence);
                }
            });

            deepgramConnectionRef.current = connection;

        } catch (error) {
            console.error("Error starting listening:", error);
            setCallStatus("ERROR");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
        if (deepgramConnectionRef.current) {
            deepgramConnectionRef.current.finish();
            deepgramConnectionRef.current = null;
        }
        setCallStatus("ENDED");
    };

    const handleConversation = async (text: string) => {
        if (!text.trim()) return;

        const now = Date.now();
        const latencyMs = now - lastResponseTime;
        const latencySec = (latencyMs / 1000).toFixed(1);

        setIsProcessing(true);

        let messageContent = `${text} [User response time: ${latencySec}s]`;
        let panicMode = false;

        if (latencyMs > 4000) {
            messageContent += " [SYSTEM NOTE: The dispatcher hesitated. PANIC and SCREAM!]";
            panicMode = true;
        }
        setIsPanic(panicMode);

        const newMessages = [...messages, { role: "user", content: messageContent }];

        setMessages(newMessages);
        setTranscript("");

        try {
            const chatRes = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ messages: newMessages }),
            });
            const chatData = await chatRes.json();
            const aiText = chatData.response;

            setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);

            // Dynamic Voice Parameters based on Panic
            const ttsBody = {
                text: aiText,
                style: panicMode ? "Terrified" : "Angry",
                rate: panicMode ? 30 : 10,
                pitch: panicMode ? 10 : 0,
            };

            const ttsRes = await fetch("/api/text-to-speech", {
                method: "POST",
                body: JSON.stringify(ttsBody),
            });

            const audioBlob = await ttsRes.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            setIsSpeaking(true);
            audio.play();
            audio.onended = () => {
                setIsSpeaking(false);
                setIsPanic(false);
                setLastResponseTime(Date.now());
            };

        } catch (error) {
            console.error("Conversation error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 p-4 font-mono">
            <div className={`w-full max-w-4xl border-2 rounded-lg bg-gray-900/50 p-6 shadow-[0_0_20px_rgba(0,255,65,0.1)] transition-colors duration-500 ${isPanic ? 'border-red-600 shadow-[0_0_30px_rgba(255,0,0,0.3)]' : 'border-green-900'}`}>

                {/* Header / Status Bar */}
                <div className={`flex justify-between items-center mb-8 border-b pb-4 ${isPanic ? 'border-red-900' : 'border-green-900'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${isPanic ? 'bg-red-600' : 'bg-red-500'}`}></div>
                        <h1 className={`text-2xl font-bold tracking-widest text-glow ${isPanic ? 'text-red-500' : 'text-green-500'}`}>CRISIS CALL // MUMBAI</h1>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs ${isPanic ? 'text-red-400' : 'text-green-700'}`}>SYSTEM STATUS</div>
                        <div className={`text-xl font-bold ${isPanic ? 'text-red-500' : 'text-green-500'}`}>{callStatus}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Panel: Call Info */}
                    <div className={`col-span-1 space-y-6 border-r pr-6 ${isPanic ? 'border-red-900' : 'border-green-900'}`}>
                        <div className={`bg-black border p-4 rounded ${isPanic ? 'border-red-800' : 'border-green-800'}`}>
                            <div className={`text-xs mb-1 ${isPanic ? 'text-red-400' : 'text-green-700'}`}>CALL DURATION</div>
                            <div className="text-4xl font-bold text-red-500">{formatTime(elapsedTime)}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className={`${isPanic ? 'text-red-400' : 'text-green-700'}`}>CALLER ID:</span>
                                <span>UNKNOWN</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={`${isPanic ? 'text-red-400' : 'text-green-700'}`}>LOCATION:</span>
                                <span className="animate-pulse">TRACING...</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={`${isPanic ? 'text-red-400' : 'text-green-700'}`}>LATENCY:</span>
                                <span>{isProcessing ? "CALCULATING..." : "12ms"}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-10">
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`w-full py-4 px-6 rounded border-2 transition-all duration-100 uppercase font-bold tracking-wider flex items-center justify-center gap-3 ${isListening
                                    ? 'border-red-500 text-red-500 hover:bg-red-500/10'
                                    : 'border-green-500 text-green-500 hover:bg-green-500/10'
                                    }`}
                            >
                                {isListening ? <Square className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                                {isListening ? "TERMINATE LINK" : "INITIATE LINK"}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Transcript & Visuals */}
                    <div className="col-span-2 flex flex-col h-[500px]">

                        {/* Visualizer Area */}
                        <div className={`h-32 bg-black border rounded mb-4 relative overflow-hidden ${isPanic ? 'border-red-900' : 'border-green-900'}`}>
                            <div className={`absolute top-2 left-2 text-xs ${isPanic ? 'text-red-400' : 'text-green-700'}`}>AUDIO SPECTRUM</div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                <Visualizer isListening={isListening} isSpeaking={isSpeaking} isPanic={isPanic} />
                            </div>
                        </div>

                        {/* Transcript Area */}
                        <div className={`flex-1 overflow-y-auto bg-black border rounded p-4 space-y-4 font-mono text-sm scrollbar-thin ${isPanic ? 'border-red-900 scrollbar-thumb-red-900' : 'border-green-900 scrollbar-thumb-green-900'}`}>
                            {messages.length === 0 && (
                                <div className={`${isPanic ? 'text-red-900' : 'text-green-900'} text-center mt-20`}>WAITING FOR INCOMING TRANSMISSION...</div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <span className={`text-[10px] mb-1 uppercase ${isPanic ? 'text-red-800' : 'text-green-800'}`}>{msg.role === 'user' ? 'DISPATCHER (YOU)' : 'CALLER (ANJALI)'}</span>
                                    <div className={`max-w-[80%] p-3 border ${msg.role === 'user'
                                        ? 'border-green-700 bg-green-900/10 text-green-100'
                                        : 'border-red-900 bg-red-900/10 text-red-100'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isProcessing && (
                                <div className={`flex items-center gap-2 animate-pulse ${isPanic ? 'text-red-700' : 'text-green-700'}`}>
                                    <Radio className="w-4 h-4" />
                                    <span>DECODING SIGNAL...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
