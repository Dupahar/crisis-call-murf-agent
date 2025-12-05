"use client";

import { useState, useRef, useEffect } from "react";
import { createClient, LiveClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import styles from "./CrisisInterface.module.css";

export default function CrisisInterface() {
    // --- State ---
    const [callActive, setCallActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string; time: string }[]>([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [callStatus, setCallStatus] = useState("Connecting...");
    const [lastResponseTime, setLastResponseTime] = useState<number>(Date.now());
    const [isPanic, setIsPanic] = useState(false);
    const [latencyDisplay, setLatencyDisplay] = useState("0.0s");

    // --- Refs ---
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramConnectionRef = useRef<LiveClient | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const processingIdRef = useRef<number>(0);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const transcriptBufferRef = useRef<string>("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // --- Audio Visualizer Logic (Simple Bars) ---
    const [audioBars, setAudioBars] = useState<number[]>(new Array(50).fill(20));
    useEffect(() => {
        if (!callActive) return;
        const interval = setInterval(() => {
            setAudioBars(prev => prev.map(() => Math.random() * (40 + (isPanic ? 30 : 0)) + 10));
        }, 100);
        return () => clearInterval(interval);
    }, [callActive, isPanic]);

    // --- Timer Logic ---
    useEffect(() => {
        if (callActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callActive]);

    // --- Auto-scroll Transcript ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            URL.revokeObjectURL(audioRef.current.src);
            audioRef.current = null;
        }
        setIsSpeaking(false);
        setLastResponseTime(Date.now()); // Reset timer on interruption
    };

    const startCall = async () => {
        setCallActive(true);
        setCallStatus("Connecting...");
        await startListening();
        setCallStatus("Active - High Distress");
        setLastResponseTime(Date.now()); // Reset timer on call start

        // Initial AI Message Trigger (simulated delay)
        setTimeout(() => {
            handleConversation("Hello? Is anyone there?", true);
        }, 1000);
    };



    const endCall = () => {
        stopListening();
        stopAudio();
        setCallActive(false);
        setCallStatus("Ended");
    };

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const keyRes = await fetch("/api/speech-to-text");
            const keyData = await keyRes.json();

            if (!keyData.key) {
                console.error("Failed to get Deepgram key");
                setCallStatus("Connection Error");
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
                setLastResponseTime(Date.now()); // Reset timer when listening starts

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
                if (sentence && data.is_final && sentence.trim().length > 0) {
                    stopAudio(); // Stop AI speech immediately

                    transcriptBufferRef.current += " " + sentence;
                    setTranscript((prev) => prev + " " + sentence);

                    if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                    }

                    debounceTimerRef.current = setTimeout(() => {
                        const fullText = transcriptBufferRef.current.trim();
                        if (fullText) {
                            handleConversation(fullText);
                            transcriptBufferRef.current = "";
                        }
                    }, 200); // Reduced to 200ms for speed 
                }
            });

            deepgramConnectionRef.current = connection;

        } catch (error) {
            console.error("Error starting listening:", error);
            setCallStatus("Mic Error");
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
    };

    const handleConversation = async (text: string, isInitial = false) => {
        if (!text.trim()) return;

        const currentId = ++processingIdRef.current;
        const now = Date.now();
        const latencyMs = now - lastResponseTime;
        const latencySec = (latencyMs / 1000).toFixed(1);
        setLatencyDisplay(`${latencySec}s`);

        setIsProcessing(true);

        let messageContent = text;
        if (!isInitial) {
            messageContent = `${text} [User response time: ${latencySec}s]`;
        }

        let panicMode = false;
        if (latencyMs > 10000 && !isInitial) {
            messageContent += " [SYSTEM NOTE: The dispatcher is silent. Beg for help!]";
            panicMode = true;
        }
        setIsPanic(panicMode);

        const timeString = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Add User Message to UI
        const userMsg = { role: "user", content: text, time: timeString };
        // We use a separate array for API context to include system notes
        const apiMessages = [...messages.map(m => ({ role: m.role, content: m.content })), { role: "user", content: messageContent }];

        if (!isInitial) {
            setMessages(prev => [...prev, userMsg]);
        }
        setTranscript("");

        try {
            // For initial trigger, we might want to skip Gemini or force a specific prompt
            // But let's just let Gemini handle it with the context
            const chatRes = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ messages: apiMessages }),
            });

            if (processingIdRef.current !== currentId) return;

            const chatData = await chatRes.json();
            let aiText = chatData.response;

            if (!aiText || !aiText.trim()) {
                aiText = "I... I can't hear you! The fire is loud! Help!";
            }

            // Clean text for TTS (Remove actions like [coughing], (gasping), *sigh*)
            let cleanAiText = aiText.replace(/[\(\[\*].*?[\)\]\*]/g, "").trim();

            // Deduplication Check: Sometimes Gemini repeats the entire response.
            // If the second half is identical to the first half, cut it.
            const halfLength = Math.floor(cleanAiText.length / 2);
            const firstHalf = cleanAiText.substring(0, halfLength).trim();
            const secondHalf = cleanAiText.substring(halfLength).trim();

            // Simple check: if the string is just two copies of the same thing
            if (cleanAiText.length > 20 && cleanAiText.substring(cleanAiText.length / 2).trim() === cleanAiText.substring(0, cleanAiText.length / 2).trim()) {
                cleanAiText = cleanAiText.substring(0, cleanAiText.length / 2).trim();
                // Also update the displayed text
                aiText = cleanAiText;
            }

            const ttsBody = {
                text: cleanAiText,
                voiceId: "en-IN-isha",
                style: "Conversational",
                rate: panicMode ? 50 : 10, // Increased to 50
                pitch: panicMode ? 30 : 0, // Increased to 30
            };

            const ttsRes = await fetch("/api/text-to-speech", {
                method: "POST",
                body: JSON.stringify(ttsBody),
            });

            if (processingIdRef.current !== currentId) return;

            if (!ttsRes.ok) throw new Error("TTS Failed");

            const audioBlob = await ttsRes.blob();
            if (audioBlob.size === 0) throw new Error("Empty Audio");

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                if (processingIdRef.current === currentId) {
                    setIsSpeaking(false);
                    setIsPanic(false);
                    setLastResponseTime(Date.now());
                }
                URL.revokeObjectURL(audioUrl);
                if (audioRef.current === audio) audioRef.current = null;
            };

            audio.onerror = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (audioRef.current === audio) audioRef.current = null;
            };

            if (processingIdRef.current !== currentId) return;

            await audio.play();

            // Add AI Message to UI (Cleaned of system notes if any)
            setMessages(prev => [...prev, { role: "assistant", content: aiText, time: timeString }]);
            setIsSpeaking(true);

        } catch (error) {
            console.error("Conversation error:", error);
        } finally {
            if (processingIdRef.current === currentId) {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Start Overlay */}
            {!callActive && (
                <div className={styles.startOverlay}>
                    <div className={styles.startContent}>
                        <div className={styles.startTitle}>CrisisCall</div>
                        <div className={styles.startSubtitle}>Live Emergency Dispatch System</div>
                        <button className={styles.startButton} onClick={startCall}>Connect to Emergency Channel</button>
                    </div>
                </div>
            )}

            {/* Panic Overlay */}
            <div className={`${styles.panicOverlay} ${isPanic ? styles.active : ''}`}></div>

            <div className={styles.callInterface}>
                {/* Video Section */}
                <div className={styles.videoSection}>
                    <div className={styles.videoMain}>
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.callerAvatar}>👤</div>
                            <div className={styles.callerNameDisplay}>Anjali Kumar</div>
                            <div className={styles.callerStatus}>{callStatus}</div>
                        </div>

                        {/* Audio Wave */}
                        <div className={styles.audioWaveOverlay}>
                            {audioBars.map((height, i) => (
                                <div key={i} className={styles.waveBar} style={{ height: `${height}px` }}></div>
                            ))}
                        </div>

                        {/* Operator PIP */}
                        <div className={styles.operatorPip}>
                            <div className={styles.operatorPipContent}>
                                <div className={styles.operatorPipAvatar}>👨‍💼</div>
                                <div style={{ fontWeight: 600 }}>You (Operator)</div>
                                <div className={styles.operatorLabel}>Emergency Dispatcher</div>
                            </div>
                        </div>

                        {/* Stats Overlay */}
                        <div className={styles.callStatsOverlay}>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}>⏱️</div>
                                <div className={styles.statLabel}>Duration</div>
                                <div className={styles.statValue}>{formatTime(elapsedTime)}</div>
                            </div>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}>📍</div>
                                <div className={styles.statLabel}>Location</div>
                                <div className={styles.statValue}>Mumbai, Worli</div>
                            </div>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}>📶</div>
                                <div className={styles.statLabel}>Signal</div>
                                <div className={`${styles.statValue} ${isPanic ? styles.danger : ''}`}>
                                    {isPanic ? 'Weak' : 'Strong'}
                                </div>
                            </div>
                        </div>

                        {/* Recording Indicator */}
                        <div className={styles.recordingIndicator}>
                            <div className={styles.recDot}></div>
                            <span>RECORDING</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className={styles.callControls}>
                        <button
                            className={`${styles.controlButton} ${styles.mic} ${isListening ? styles.active : styles.muted}`}
                            onClick={isListening ? stopListening : startListening}
                        >
                            🎤
                        </button>
                        <button
                            className={`${styles.controlButton} ${styles.endCall}`}
                            onClick={endCall}
                        >
                            📞
                        </button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.scenarioInfo}>
                            <div className={styles.scenarioTitle}>Active Scenario</div>
                            <div className={styles.scenarioName}>Fire Emergency – High Rise</div>
                        </div>

                        <div className={styles.liveMetrics}>
                            <div className={styles.metricBox}>
                                <div className={styles.metricLabel}>Response Time</div>
                                <div className={`${styles.metricValueLarge} ${parseFloat(latencyDisplay) > 5 ? styles.danger : ''}`}>
                                    {latencyDisplay}
                                </div>
                            </div>
                            <div className={styles.metricBox}>
                                <div className={styles.metricLabel}>Panic Index</div>
                                <div className={`${styles.metricValueLarge} ${isPanic ? styles.danger : ''}`}>
                                    {isPanic ? 'HIGH' : 'LOW'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.transcriptPanel}>
                        <div className={styles.transcriptHeader}>
                            📝 Live Transcript
                        </div>
                        <div className={styles.transcriptMessages}>
                            {messages.map((msg, i) => (
                                <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.operator : styles.caller}`}>
                                    <div className={styles.messageHeader}>
                                        <div className={`${styles.messageAvatar} ${msg.role === 'user' ? styles.operator : styles.caller}`}>
                                            {msg.role === 'user' ? '👨‍💼' : '👤'}
                                        </div>
                                        <div className={styles.messageName}>{msg.role === 'user' ? 'You' : 'Anjali'}</div>
                                        <div className={styles.messageTime}>{msg.time}</div>
                                    </div>
                                    <div className={styles.messageContent}>
                                        {msg.content.replace(/\[SYSTEM NOTE:.*?\]/g, "")}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area (Disabled for voice-only, but kept for layout fidelity) */}
                        <div className={styles.inputArea}>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    className={styles.responseInput}
                                    placeholder="Voice input active..."
                                    disabled
                                />
                                <button className={styles.sendButton} disabled>
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
