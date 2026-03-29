import soundfile as sf
import numpy as np
from kokoro import KPipeline

pipe = KPipeline(lang_code='h')
audio_chunks = []
try:
    for _, _, audio in pipe("Hello world, this is a test of English text spoken by an Indian voice.", voice="hf_alpha", speed=1.0):
        print("Generated chunk...")
        audio_chunks.append(audio)
    print(f"Total chunks: {len(audio_chunks)}")
    if audio_chunks:
        combined = np.concatenate(audio_chunks)
        print("Concatenation successful, len:", len(combined))
    else:
        print("NO AUDIO GENERATED!")
except Exception as e:
    import traceback
    traceback.print_exc()
    print("Error:", e)
