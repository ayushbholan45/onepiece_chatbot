#  Poneglyph AI — One Piece Chatbot

> *The One Piece is REAL — and so are the answers.*

A RAG (Retrieval-Augmented Generation) chatbot that knows everything about One Piece. Built with Next.js, LangChain, Groq, HuggingFace, and DataStax Astra DB.

---

## Features

- AI-powered answers about One Piece — characters, devil fruits, haki, arcs, and lore
- RAG architecture for accurate, context-aware responses
- Fast streaming responses powered by Groq (Llama 3)
- Vector search via DataStax Astra DB
- Prompt suggestions for quick questions
- One Piece themed UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript |
| AI / LLM | Groq (Llama 3) |
| Embeddings | HuggingFace (all-MiniLM-L6-v2) |
| Vector DB | DataStax Astra DB |
| RAG Framework | LangChain.js |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ayushbholan45/onepiece-chatbot.git
cd onepiece-chatbot
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env` file in the root:

```bash
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_token
ASTRA_DB_API_ENDPOINT=your_astra_db_endpoint
ASTRA_DB_APPLICATION_TOKEN=your_astra_db_token
ASTRA_DB_NAMESPACE=default_keyspace
ASTRA_DB_COLLECTION=onepiece_chatbot
```

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `ASTRA_DB_API_ENDPOINT` | [astra.datastax.com](https://astra.datastax.com) |
| `ASTRA_DB_APPLICATION_TOKEN` | [astra.datastax.com](https://astra.datastax.com) |

### 4. Seed the database

```bash
npm run seed
```

This scrapes One Piece data from Wikipedia and the One Piece fandom wiki, generates embeddings, and stores them in Astra DB.

> This may take 20-40 minutes depending on the number of URLs.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 

---

## Project Structure

```
onepiece-chatbot/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # API route - RAG + Groq streaming
│   ├── assets/                # Images and backgrounds
│   ├── components/
│   │   ├── Bubble.tsx         # Chat message bubble
│   │   ├── LoadingBubble.tsx  # Animated loading dots
│   │   ├── PromptSuggestionsRow.tsx
│   │   └── PromptSuggestionButton.tsx
│   ├── globals.css            # Global styles
│   └── page.tsx               # Main chat UI
├── scripts/
│   └── loadDb.ts              # Database seeding script
├── .env                       # Environment variables (never commit!)
└── README.md
```

---

## How It Works

```
User asks a question
        ↓
HuggingFace converts question → vector embedding
        ↓
Astra DB searches for similar vectors (relevant One Piece data)
        ↓
Groq (Llama 3) uses that context to generate an answer
        ↓
Streamed response displayed in chat
```

---

## License

MIT

---

*Built by [ayushbholan45](https://github.com/ayushbholan45) — Set sail for the Grand Line! *
