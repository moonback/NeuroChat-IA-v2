# Gemini NeuroChat

A modern React application that enables voice and text conversations with Google's Gemini Pro AI. Features real-time speech recognition, text-to-speech synthesis, and a beautiful conversational interface.

## ✨ Features

- **Voice Recognition**: Talk to Gemini using the Web Speech API
- **Text-to-Speech**: Hear AI responses with natural voice synthesis
- **Real-time Chat**: Seamless conversation interface with message bubbles
- **Theme Toggle**: Light and dark mode support
- **Responsive Design**: Mobile-first design that works on all devices
- **Auto-scroll**: Automatic scrolling to keep latest messages visible
- **Error Handling**: Graceful error handling with user feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your API key:**
   - Copy the `.env.local` file in the project root
   - Replace `your_gemini_api_key_here` with your actual Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` and start chatting!

## 🎯 How to Use

1. **Text Input**: Type your message in the input field and press Enter or click Send
2. **Voice Input**: Click the microphone button to start voice recognition
3. **Theme Toggle**: Use the sun/moon icon to switch between light and dark themes
4. **Auto-Speech**: AI responses are automatically spoken aloud (can be muted via browser)

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **AI API**: Google Gemini Pro
- **Speech**: Web Speech API (SpeechRecognition & SpeechSynthesis)
- **State Management**: React Hooks

## 📱 Browser Compatibility

- **Voice Recognition**: Chrome, Edge, Safari (iOS 14+)
- **Text-to-Speech**: All modern browsers
- **Chat Interface**: All modern browsers

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ChatContainer.tsx
│   ├── MessageBubble.tsx
│   ├── VoiceInput.tsx
│   └── ThemeToggle.tsx
├── hooks/               # Custom React hooks
│   ├── useTheme.ts
│   ├── useSpeechRecognition.ts
│   └── useSpeechSynthesis.ts
├── services/            # API services
│   └── geminiApi.ts
└── App.tsx             # Main application component
```

## 🔒 Privacy & Security

- API keys are stored locally and never transmitted except to Google's official API
- Speech recognition is processed locally in your browser
- No conversation data is stored permanently
- All communication with Gemini includes safety filters

## 🚨 Troubleshooting

### Common Issues

1. **"API key not found" error:**
   - Ensure your `.env.local` file exists in the project root
   - Verify your API key is correctly set without quotes
   - Restart the development server after adding the key

2. **Voice recognition not working:**
   - Check your browser supports Web Speech API
   - Ensure microphone permissions are granted
   - Try using Chrome or Edge for best compatibility

3. **No sound from AI responses:**
   - Check your browser's autoplay policy
   - Ensure your system volume is on
   - Try interacting with the page first (browser requirement)

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is valid and has quota remaining
3. Ensure you're using a supported browser
4. Try refreshing the page

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini Pro for AI capabilities
- shadcn/ui for beautiful components
- Lucide for clean, modern icons
- Tailwind CSS for rapid styling