<<<<<<< HEAD
# 🧠 Document Insight

**Document Insight** is an AI-powered web application that allows you to upload PDF or DOCX files, extract their content, generate a summary using AI, and ask questions based on the summarized content — all in a beautiful, dark-themed interface.

---

## 🚀 Features

### 📂 File Upload & Handling
- Upload PDF (.pdf) and DOCX (.docx) files
- Clean and intuitive `FileUploadButton` with loading indicators
- Client-side validation for supported file types

### 🧾 Document Content Extraction
- Extracts text from PDFs using `pdfjs-dist`
- Extracts text from DOCX using `mammoth`
- Displays full extracted content in the `DocumentDisplayPanel`
- Real-time error feedback with toast notifications

### ✨ AI-Powered Summarization
- Uses `Genkit` AI flow: `summarizeDocument`
- Integrates with Google’s Gemini model (via `googleAI` plugin)
- Automatically truncates overly long documents for efficiency
- Summary becomes the knowledge base for Q&A

### 💬 AI Chat with the Summary
- Ask questions after document summarization
- Uses `Genkit` AI flow: `chatWithDocument`
- Answers are based on the AI-generated summary, not the full document
- Messages displayed with timestamps and clear user/AI separation

---

## 🖥️ UI & Experience

- 🌙 Dark mode by default
- 📱 Responsive design for all screen sizes
- 🧩 Built with reusable React components:
  - `AppHeader`, `DocumentDisplayPanel`, `ChatPanel`, etc.
- 🎨 Styled with Tailwind CSS and ShadCN UI:
  - Buttons, Cards, Inputs, Toasts, Skeletons, ScrollArea, Avatar, and more
- 🔔 Clear visual feedback:
  - Loading states for file parsing, summarization, and chat
  - Inline error messages and toast notifications
  - Placeholder hints like "Upload a document first", "Ask a question"

---

## ⚙️ Tech Stack

- **Next.js (App Router)** – App structure and routing
- **React** – Component-based UI
- **TypeScript** – Type safety across the app
- **Tailwind CSS** – Utility-first styling
- **ShadCN UI** – Modern component library
- **pdfjs-dist & mammoth** – Client-side document parsing
- **Genkit** – AI flows with Google Gemini LLM
- **Zod** – Schema validation for AI flow inputs
- **Lucide React** – Icon set
- **UUID** – Unique identifiers for messages

---

## 🔁 Workflow

1. User uploads a PDF or DOCX file
2. App extracts raw text client-side
3. Text is sent to `summarizeDocument` AI flow
4. Summary is stored and displayed
5. User asks questions about the document
6. Questions and summary are sent to `chatWithDocument` AI flow
7. AI provides answers based on the summary

---

## 🧪 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/document-insight.git
cd document-insight

# Install dependencies
npm install

# Run the development server
npm run dev
=======
# Document Parser
>>>>>>> acf8955 (remove the firebase studio favicon)
