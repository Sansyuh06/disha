# vita_server.py
# Kokoro-82M TTS server at http://localhost:8181
# Uses moulish-dev/vita's kokoro dependency directly for maximum reliability

from flask import Flask, request, send_file
from flask_cors import CORS
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import tempfile, os, threading

app = Flask(__name__)
CORS(app)

# Lazy-loaded pipelines
pipelines = {}

def get_pipeline(lang='a'):
    if lang not in pipelines:
        print(f'[Vita] Loading pipeline for language: {lang}...')
        pipelines[lang] = KPipeline(lang_code=lang)
        print(f'[Vita] OK pipeline for {lang} ready')
    return pipelines[lang]


@app.route('/speak', methods=['POST'])
def speak():
    data = request.json or {}
    text = (data.get('text', '') or '')[:500]
    voice = data.get('voice', 'af_heart')
    speed = float(data.get('speed', 1.0))

    if not text.strip():
        return {'error': 'empty text'}, 400

    try:
        # Detect language code from voice name (e.g., 'hf_alpha' -> 'h')
        lang = voice[0] if voice and len(voice) > 0 else 'a'
        pipe = get_pipeline(lang)
        
        audio_chunks = []
        for _, _, audio in pipe(text, voice=voice, speed=speed):
            audio_chunks.append(audio)

        if not audio_chunks:
            return {'error': 'no audio generated'}, 500

        combined = np.concatenate(audio_chunks)
        tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        tmp_path = tmp.name
        tmp.close()
        sf.write(tmp_path, combined, 24000, format='WAV')

        response = send_file(tmp_path, mimetype='audio/wav')
        # Clean up temp file after serving
        threading.Timer(10.0, lambda: os.unlink(tmp_path) if os.path.exists(tmp_path) else None).start()
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'error': str(e)}, 500


@app.route('/status', methods=['GET'])
def status():
    return {
        'status': 'ok',
        'model': 'kokoro-82m',
        'library': 'kokoro-python',
        'voices': {
            'US English': ['af_heart', 'af_bella', 'am_adam', 'am_echo'],
            'UK English': ['bf_emma', 'bf_isabella', 'bm_george', 'bm_lewis'],
            'Hindi (Indian)': ['hf_alpha', 'hf_beta', 'hm_omega', 'hm_psi']
        }
    }


if __name__ == '__main__':
    print()
    print('====================================================')
    print('|  VITA TTS Server - Kokoro-82M (Multilingual)     |')
    print('|  Port: 8181 | Support: US, UK, HI, ES, etc.      |')
    print('====================================================')
    print()
    # Pre-warm the US pipeline as default
    get_pipeline('a')
    print()
    print('[Vita] Server starting on http://localhost:8181')
    app.run(host='0.0.0.0', port=8181, debug=False)
