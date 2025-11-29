# CrisisCall: AI-Powered Stress Inoculation Platform

> **"We don't just simulate calls. We measure Grace Under Pressure."**

![CrisisCall Banner](https://via.placeholder.com/1200x600?text=CrisisCall+Dashboard+Screenshot)
*(Replace this link with a screenshot of your Dispatch Console in "Red/Panic" mode)*

**CrisisCall** is a browser-based **Stress Inoculation Platform** designed to train emergency dispatchers, suicide prevention volunteers, and high-stakes corporate teams. By replacing expensive human actors with hyper-realistic, latency-responsive AI agents, we democratize resilience training.

---

## 🚨 The Problem: The "Silence" Gap
High-stakes verbal skills are currently taught via:
1.  **Passive Theory**: Reading manuals (Zero emotional preparation).
2.  **Human Roleplay**: Hiring actors is expensive, unscalable, and inconsistent.

**The Gap**: There is no scalable way to teach people how to think clearly under *auditory pressure*.

## ⚡ The Solution: Dynamic Escalation Engine
CrisisCall uses a proprietary **Dynamic Escalation Engine** that monitors your response time and voice patterns in real-time.

* **If you are calm and fast (<2s):** The AI de-escalates and provides information.
* **If you hesitate (>3s):** The AI panics, screams, and increases the difficulty.
* **The Result:** Personalized, high-fidelity stress training that scales infinitely.

## 🏆 Why Murf Falcon? (The "Psychological Realism" Layer)
We didn't just use Murf Falcon for speed; we used it for **Psychological Realism**.

In a crisis, silence creates panic. Standard TTS engines introduce a 2-second "robotic silence" that immediately breaks the immersion of a simulation. **Murf Falcon's** streaming capability eliminates this gap, achieving sub-500ms latency. This makes the simulation indistinguishable from a real life-or-death call.

## 💼 Business Viability
CrisisCall bridges the gap between passive learning and expensive human roleplay.
* **B2G (Government):** 911/112 Dispatch, Hostage Negotiation training.
* **B2B (Corporate):** PR Crisis Management, Cybersecurity Incident Response drills.
* **Healthcare:** ER Triage and Telehealth Diagnostics.

It is a low-cost, high-impact solution to a global training deficit.

---

## 🛠️ Tech Stack
* **Voice Generation:** Murf Falcon API (Streaming TTS)
* **Speech Recognition:** Deepgram Nova-2 (Real-time ASR)
* **Intelligence:** OpenAI GPT-4o-mini (Low-latency LLM)
* **Frontend:** Next.js 14, TailwindCSS, Framer Motion
* **State Management:** React Hooks (Custom "Panic" Logic)

## 🚀 Setup & Installation

1.  **Clone & Install**:
    ```bash
    git clone <your-repo-link>
    cd crisis-call
    npm install
    ```

2.  **Env Keys** (Create `.env.local`):
    ```bash
    MURF_API_KEY=your_murf_key
    MURF_API_SECRET=your_murf_secret
    DEEPGRAM_API_KEY=your_deepgram_key
    OPENAI_API_KEY=your_openai_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🎥 Simulation Walkthrough
To test the "Panic Mode" yourself:
1.  Click **"Initiate Link"**.
2.  **Say:** "112, what is your emergency?"
3.  **Test 1 (Fast):** Reply immediately. *Result: Anjali calms down.*
4.  **Test 2 (Slow):** Wait 5 seconds in silence. *Result: Anjali screams and the UI pulses RED.*

---

## License
MIT
