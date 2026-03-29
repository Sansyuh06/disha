# DISHA - Digital Indian Superhero Assistant

DISHA is a premier, hyper-localized banking companion designed to make banking accessible, empathetic, and intuitive for all users. Built for the Hackathon, this project combines a sleek React frontend with a robust Python/Kokoro TTS backend to deliver localized voice AI, real-time advanced OCR document scanning, and empathetic UI/UX flows.

## Features
- **Hyper-localized Indian TTS**: Authentic voice interactions using Kokoro-82M.
- **Agentic OCR Document Scanning**: Advanced image binarization and Ollama AI data extraction tied natively into Voice feedbacks.
- **Bereavement & Intake Compassion**: Accessibility-focused guided wizards with Aria-live updates.
- **Eligibility Meter**: Real-time visual dynamic dashboards.

## Running the Application

### 1. Start the Background TTS Server (Python)
The backend handles the synthetic audio pipeline and requires Python 3.9+ installed natively.
```bash
# Install the strict dependencies
pip install -r requirements.txt

# Start the Flask TTS application
python vita_server.py
```
*Note for Production: Do not use the Flask built-in development server in production. Wrap the server in a WSGI container like `gunicorn` or `waitress`.*

### 2. Start the Local AI Engine (Ollama)
For the agent workflows to understand documents natively, start your local Ollama engine in another terminal tab:
```bash
ollama serve
```

### 3. Start the Frontend Development Environment (Node.js)
```bash
# Install frontend dependencies (if not already installed)
npm install

# Start the Vite development interface
npm run dev
```

The application will be available at `http://localhost:5174` (or whatever local port Vite provisions for you).
