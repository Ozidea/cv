import pypdf
import glob
for f in glob.glob("assets/certificates/*.pdf"):
    try:
        reader = pypdf.PdfReader(f)
        text = reader.pages[0].extract_text()
        print(f"--- {f} ---")
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        # usually the title is after "successfully completed" or it's a prominent string
        # Let's just print the first 10 lines
        print("\n".join(lines[:10]))
    except Exception as e:
        print(f"Error {f}: {e}")
