from kokoro import KPipeline
pipe = KPipeline(lang_code='h')
try:
    for _, _, audio in pipe("Hello world", voice="hf_alpha", speed=1.0):
        print("Success for hf_alpha")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error: {e}")
