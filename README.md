# ConnectWave

## Accessibility-Focused Communication Platform

ConnectWave is a full-stack web application designed to help deaf and mute individuals communicate effectively during phone calls and real-time conversations.

The application follows an accessibility-first approach and provides features such as live speech-to-text, text-to-speech, multiple accessibility modes, and clear visual feedback to support inclusive communication.

---

## Problem Statement

Traditional phone calls and real-time voice conversations are not accessible for individuals with hearing or speech impairments.

Most existing communication systems do not provide:

- Real-time transcription for deaf users  
- Speech output for mute users  
- Flexible interaction modes based on user needs  
- Visual indicators and accessibility-focused UI  

ConnectWave aims to bridge this gap by enabling two-way accessible communication using modern web technologies.

---

## Key Features

### Phone Call Simulation
- Simulated phone call environment for accessibility testing  
- Real-time interaction between caller and user  
- Call flow designed similar to real-world phone conversations  

### Speech-to-Text (STT)
- Converts spoken speech into readable text  
- Displays interim (live) transcription results  
- Optimized for smooth real-time updates  
- Built using browser Web Speech API  

Designed primarily for deaf and hearing-impaired users.

### Text-to-Speech (TTS)
- Converts typed messages into audible speech  
- Enables mute users to communicate verbally  
- Uses browser speech synthesis  

Voice customization options include:
- Pitch  
- Rate  
- Volume  
- Voice selection (based on browser support)

---

## Accessibility Modes

### Deaf-Friendly Mode
- Caller speech → text  
- User response → typed text converted to speech  
- Live caption-style experience  

### Mute-Friendly Mode
- User types messages → converted to speech  
- Caller responses are heard normally  

### Combined Accessibility Mode
- Speech-to-text enabled  
- Text-to-speech enabled  
- Ability to switch between text and voice input anytime  

Each mode is designed to minimize confusion and improve usability for different accessibility needs.

---

## Language Handling

- Supports recognition of multiple Indian languages based on what the caller speaks  
- Displays speech in the same language as spoken by the caller  

**Important note:**
- The app does not translate languages  
- It only recognizes and displays spoken language  

**Example:**
- Tamil speech → shown as Tamil text  
- English speech → shown as English text  

The user interface currently remains in English (planned improvement).

---

## User Experience Enhancements

- Clear visual separation between caller and user messages  
- Live speech indicators when someone is speaking  
- Visual feedback and tooltips for accessibility  
- Quick-response phrases for faster communication  
- Clean and responsive UI design  

---

## Network Awareness

- Detects online and offline status  
- Displays visual network indicators  
- Provides fallback feedback when internet is unavailable  

**Note:** Offline detection is implemented, but offline speech models are not yet integrated.

---

## Tech Stack

### Frontend
- React (TypeScript)  
- Vite  
- Tailwind CSS  

### Backend
- Node.js  
- Express.js  
- TypeScript  

### Browser & Platform APIs
- Web Speech API (Speech-to-Text, Text-to-Speech)  
- Media Devices API (microphone handling)

---

## High-Level Architecture

Browser (React + TypeScript)
↓
Accessibility UI Layer
↓
Speech APIs (STT / TTS)
↓
Express Backend
↓
Call Simulation & Data Flow

Each layer has a single responsibility:

- Frontend: accessibility UI and interaction logic  
- Backend: API handling and call simulation  
- Browser APIs: speech processing  

---

## Project Structure

```text
ConnectWave/
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── phone-call/
│       │   ├── speech-to-text/
│       │   ├── text-to-speech/
│       │   ├── sign-language/
│       │   ├── call-history/
│       │   └── ui/
│       │
│       ├── hooks/
│       │   ├── use-speech-recognition.ts
│       │   ├── use-speech-synthesis.ts
│       │   ├── use-webcam.ts
│       │   └── use-mobile.tsx
│       │
│       ├── lib/
│       │   ├── sign-detection.ts
│       │   ├── queryClient.ts
│       │   └── utils.ts
│       │
│       ├── pages/
│       │   ├── home.tsx
│       │   └── not-found.tsx
│       │
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
│
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
│
├── shared/
│   └── schema.ts
│
├── package.json
├── vite.config.ts
└── README.md
```
---

## How to Run the Project

### Prerequisites
- Node.js (v18 or later recommended)  
- npm or yarn  
- Modern browser (Chrome recommended for Web Speech API support)

### Installation

```bash
git clone https://github.com/your-username/ConnectWave.git
cd ConnectWave
npm install
```

### Run the Application

```bash
npm run dev
```
---
## Current Implementation Status

### Implemented

- React frontend  
- Express backend  
- Phone call simulation UI  
- Speech-to-Text using Web Speech API  
- Text-to-Speech using browser speech synthesis  
- Deaf-friendly mode  
- Mute-friendly mode  
- Combined accessibility mode  
- Live transcription display  
- Voice settings (pitch, rate, volume)  
- Quick responses  
- Network status indicator  
- Accessibility-focused UI  

These features are fully present and working in the current codebase.

---

## Future Improvements

Planned enhancements:

- Offline Speech-to-Text (Whisper / Vosk)  
- Offline Text-to-Speech (Coqui TTS)  
- Real Indian Sign Language (ISL) recognition  
- Camera-based gesture recognition  
- Full multilingual UI support  
- Advanced translation features  

These are intended as future scope for research and development.
## Author

**Rishwantthi R**  
Computer Science Student
