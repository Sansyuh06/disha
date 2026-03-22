# vita_server.py
# Run with: python vita_server.py
# Serves Kokoro-82M TTS at http://localhost:8181/speak
# Install: pip install kokoro soundfile flask flask-cors espeak-ng
# On Linux: sudo apt-get install espeak-ng
# On Mac: brew install espeak

from flask import Flask, request, send_file
from flask_cors import CORS
import io, soundfile as sf, numpy as np

app = Flask(__name__)
CORS(app)

pipeline = None

def get_pipeline():
    global pipeline
    if pipeline is None:
        from kokoro import KPipeline
        pipeline = KPipeline(lang_code='a')  # 'a' = American English
    return pipeline

@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text', '')[:500]  # 500 char safety limit
    voice = data.get('voice', 'af_heart')  # warm female voice
    speed = float(data.get('speed', 1.0))

    if not text.strip():
        return {'error': 'empty text'}, 400

    try:
        pipe = get_pipeline()
        audio_chunks = []
        generator = pipe(text, voice=voice, speed=speed)
        for _, _, audio in generator:
            audio_chunks.append(audio)

        if not audio_chunks:
            return {'error': 'no audio generated'}, 500

        combined = np.concatenate(audio_chunks)
        buf = io.BytesIO()
        sf.write(buf, combined, 24000, format='WAV')
        buf.seek(0)
        return send_file(buf, mimetype='audio/wav', as_attachment=False,
                         download_name='speech.wav')
    except Exception as e:
        return {'error': str(e)}, 500

@app.route('/status', methods=['GET'])
def status():
    return {'status': 'ok', 'model': 'kokoro-82m', 'voices': [
        'af_heart', 'af_bella', 'am_adam', 'am_echo',
        'bf_emma', 'bm_george'
    ]}

if __name__ == '__main__':
    print('[Vita] Starting Kokoro-82M TTS server on port 8181...')
    print('[Vita] Install: pip install kokoro soundfile flask flask-cors')
    app.run(host='0.0.0.0', port=8181, debug=False)
