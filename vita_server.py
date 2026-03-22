# vita_server.py
# Serves TTS via moulish-dev/vita toolkit (Kokoro-82M) at http://localhost:8181
#
# ── Setup ────────────────────────────────────────────
# git clone https://github.com/moulish-dev/vita.git vita_lib
# cd vita_lib && pip install -e . && cd ..
# python vita_server.py
#
# On Linux:  sudo apt-get install espeak-ng
# On Mac:    brew install espeak
# On Windows: install espeak-ng from github.com/espeak-ng/espeak-ng/releases
# ─────────────────────────────────────────────────────

from flask import Flask, request, send_file
from flask_cors import CORS
import io, os, tempfile

app = Flask(__name__)
CORS(app)

tts_engine = None

def get_tts(voice='af_heart'):
    """Lazy-load the Vita TTS engine."""
    global tts_engine
    if tts_engine is None:
        try:
            from vita import VitaTTS
            tts_engine = VitaTTS(model='kokoro', voice=voice)
            print('[Vita] ✓ Loaded VitaTTS (Kokoro-82M)')
        except ImportError:
            # Fallback: use kokoro directly if vita package not installed
            print('[Vita] vita package not found, using kokoro directly')
            from kokoro import KPipeline
            tts_engine = KPipeline(lang_code='a')
    return tts_engine


@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text', '')[:500]  # 500 char safety limit
    voice = data.get('voice', 'af_heart')
    speed = float(data.get('speed', 1.0))

    if not text.strip():
        return {'error': 'empty text'}, 400

    try:
        engine = get_tts(voice)
        tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        tmp_path = tmp.name
        tmp.close()

        # Use Vita's clean API if available
        if hasattr(engine, 'generate_audio'):
            engine.generate_audio(text, output_path=tmp_path)
        else:
            # Direct kokoro pipeline fallback
            import soundfile as sf
            import numpy as np
            audio_chunks = []
            for _, _, audio in engine(text, voice=voice, speed=speed):
                audio_chunks.append(audio)
            if audio_chunks:
                combined = np.concatenate(audio_chunks)
                sf.write(tmp_path, combined, 24000, format='WAV')

        return send_file(
            tmp_path,
            mimetype='audio/wav',
            as_attachment=False,
            download_name='speech.wav'
        )
    except Exception as e:
        return {'error': str(e)}, 500
    finally:
        # Clean up temp file after a delay (let Flask send it first)
        try:
            if 'tmp_path' in locals():
                import threading
                threading.Timer(5.0, lambda: os.unlink(tmp_path)).start()
        except:
            pass


@app.route('/status', methods=['GET'])
def status():
    return {
        'status': 'ok',
        'model': 'kokoro-82m',
        'library': 'moulish-dev/vita',
        'voices': [
            'af_heart', 'af_bella', 'am_adam', 'am_echo',
            'bf_emma', 'bm_george'
        ]
    }


if __name__ == '__main__':
    print('╔══════════════════════════════════════════════════╗')
    print('║  VITA TTS Server — Kokoro-82M                   ║')
    print('║  Port: 8181 | github.com/moulish-dev/vita       ║')
    print('╚══════════════════════════════════════════════════╝')
    print()
    print('Setup:')
    print('  git clone https://github.com/moulish-dev/vita.git vita_lib')
    print('  cd vita_lib && pip install -e . && cd ..')
    print('  python vita_server.py')
    print()
    app.run(host='0.0.0.0', port=8181, debug=False)
