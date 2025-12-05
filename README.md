# 🚨 CrisisCall: AI-Powered Stress Inoculation Platform

> **"We don't just simulate calls. We measure Grace Under Pressure."**

![CrisisCall UI](/brain/2e5b5248-25a0-4834-8894-72b1e017e0d1/crisis_call_ui_1764949662072.png)

### 👨‍💼 Operator Dashboard (Active Call)
![Operator Dashboard](/brain/2e5b5248-25a0-4834-8894-72b1e017e0d1/uploaded_image_1764948476248.png)

---

## � The Problem: The "Silence" Gap
High-stakes verbal skills are currently taught via:
1.  **Passive Theory**: Reading manuals (Zero emotional preparation).
2.  **Human Roleplay**: Hiring actors is expensive, unscalable, and inconsistent.

**The Gap**: There is no scalable way to teach people how to think clearly under *auditory pressure*.

## ⚡ The Solution: Dynamic Escalation Engine
CrisisCall is a browser-based training platform that uses a proprietary **Dynamic Escalation Engine** to monitor your response time and voice patterns in real-time.

*   **If you are calm and fast (<2s):** The AI de-escalates and provides critical information.
*   **If you hesitate (>3s):** The AI panics, screams, and increases the difficulty.
*   **The Result:** Personalized, high-fidelity stress training that scales infinitely.

### 🏆 Why Murf Falcon? (The "Psychological Realism" Layer)
We didn't just use Murf Falcon for speed; we used it for **Psychological Realism**.

In a crisis, silence creates panic. Standard TTS engines introduce a 2-second "robotic silence" that immediately breaks the immersion of a simulation. **Murf Falcon's** streaming capability eliminates this gap, achieving **sub-500ms latency**. This makes the simulation indistinguishable from a real life-or-death call.


## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Voice Generation** | **Murf Falcon API** | Ultra-low latency Streaming TTS |
| **Speech Recognition** | **Deepgram Nova-2** | Real-time ASR (Speech-to-Text) |
| **Intelligence** | **Google Gemini 2.5 Flash** | Low-latency Conversational AI |
| **Frontend** | **Next.js 14** | React Framework & UI |
| **Styling** | **TailwindCSS** | Professional, dark-mode aesthetics |
| **State Management** | **React Hooks** | Custom "Panic" Logic & Audio Visualization |

---

## 🚀 Setup & Installation

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Dupahar/crisis-call-murf-agent.git
    cd crisis-call-murf-agent
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```bash
    MURF_API_KEY=your_murf_key
    DEEPGRAM_API_KEY=your_deepgram_key
    GEMINI_API_KEY=your_gemini_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎥 Simulation Walkthrough
To test the "Panic Mode" yourself:

1.  Click **"Connect to Emergency Channel"**.
2.  **Say:** "112, what is your emergency?"
3.  **Test 1 (Fast Response):** Reply immediately.
    *   *Result:* Anjali calms down and provides details.
4.  **Test 2 (Hesitation):** Wait **10 seconds** in silence.
    *   *Result:* Anjali screams, begs for help, and the UI pulses **RED**.

---

## 👥 Use Cases
*   **B2G (Government):** 112 Dispatch Training, Hostage Negotiation.
*   **B2B (Corporate):** PR Crisis Management, Cybersecurity Incident Response.
*   **Healthcare:** ER Triage and Telehealth Diagnostics.

---

## License
MIT
