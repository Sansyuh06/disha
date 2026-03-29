# vita_server.py
# Kokoro-82M TTS server at http://localhost:8181
# Uses moulish-dev/vita's kokoro dependency directly for maximum reliability

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import tempfile, os, threading, logging

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

app = Flask(__name__)
CORS(app)

# Lazy-loaded pipelines
pipelines = {}
pipeline_lock = threading.Lock()

VALID_VOICES = {
    'af_heart', 'af_bella', 'am_adam', 'am_echo',
    'bf_emma', 'bf_isabella', 'bm_george', 'bm_lewis',
    'hf_alpha', 'hf_beta', 'hm_omega', 'hm_psi'
}

def get_pipeline(lang='a'):
    with pipeline_lock:
        if lang not in pipelines:
            logging.info(f'[Vita] Loading pipeline for language: {lang}...')
            pipelines[lang] = KPipeline(lang_code=lang)
            logging.info(f'[Vita] OK pipeline for {lang} ready')
        return pipelines[lang]


@app.route('/speak', methods=['POST'])
def speak():
    data = request.json or {}
    text = (data.get('text', '') or '')[:500]
    voice = data.get('voice', 'af_heart')
    
    try:
        raw_speed = float(data.get('speed', 1.0))
        speed = max(0.5, min(2.0, raw_speed))
    except (ValueError, TypeError):
        speed = 1.0

    if not text.strip():
        return jsonify({'error': 'empty text'}), 400
        
    if voice not in VALID_VOICES:
        return jsonify({'error': f'invalid voice: {voice}'}), 400

    try:
        # Detect language code from voice name (e.g., 'hf_alpha' -> 'h')
        lang = voice[0]
        pipe = get_pipeline(lang)
        
        audio_chunks = []
        for _, _, audio in pipe(text, voice=voice, speed=speed):
            audio_chunks.append(audio)

        if not audio_chunks:
            return jsonify({'error': 'no audio generated'}), 500

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
        logging.error(f'[Vita] Error generating audio: {e}')
        return jsonify({'error': str(e)}), 500


@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'ok',
        'model': 'kokoro-82m',
        'library': 'kokoro-python',
        'voices': {
            'US English': ['af_heart', 'af_bella', 'am_adam', 'am_echo'],
            'UK English': ['bf_emma', 'bf_isabella', 'bm_george', 'bm_lewis'],
            'Hindi (Indian)': ['hf_alpha', 'hf_beta', 'hm_omega', 'hm_psi']
        }
    })


if __name__ == '__main__':
    logging.info('')
    logging.info('====================================================')
    logging.info('|  VITA TTS Server - Kokoro-82M (Multilingual)     |')
    logging.info('|  Port: 8181 | Support: US, UK, HI, ES, etc.      |')
    logging.info('====================================================')
    logging.info('')
    # Pre-warm American pipeline as default
    get_pipeline('a')
    logging.info('')
    logging.info('[Vita] Server starting on http://localhost:8181')
    app.run(host='0.0.0.0', port=8181, debug=False)
