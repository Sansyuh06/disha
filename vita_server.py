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

# Lazy-loaded pipeline
pipeline = None

def get_pipeline():
    global pipeline
    if pipeline is None:
        print('[Vita] Loading Kokoro-82M pipeline (first load downloads ~300MB)...')
        pipeline = KPipeline(lang_code='a')
        print('[Vita] ✓ Kokoro-82M pipeline ready')
    return pipeline


@app.route('/speak', methods=['POST'])
def speak():
    data = request.json or {}
    text = (data.get('text', '') or '')[:500]
    voice = data.get('voice', 'af_heart')
    speed = float(data.get('speed', 1.0))

    if not text.strip():
        return {'error': 'empty text'}, 400

    try:
        pipe = get_pipeline()
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
        'library': 'moulish-dev/vita',
        'voices': ['af_heart', 'af_bella', 'am_adam', 'am_echo', 'bf_emma', 'bm_george']
    }


if __name__ == '__main__':
    print()
    print('╔══════════════════════════════════════════════════╗')
    print('║  VITA TTS Server — Kokoro-82M                   ║')
    print('║  Port: 8181 | github.com/moulish-dev/vita       ║')
    print('╚══════════════════════════════════════════════════╝')
    print()
    # Pre-warm the pipeline
    get_pipeline()
    print()
    print('[Vita] Server starting on http://localhost:8181')
    app.run(host='0.0.0.0', port=8181, debug=False)
