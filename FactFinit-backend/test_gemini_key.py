from google import genai

# 🔑 Paste your Gemini API key here
API_KEY = "AIzaSyAp0fJ_z27eEDmhvaft-_Ua5d9kvWqNhtc"

def main():
    if not API_KEY or API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ Please paste your actual Gemini API key into API_KEY variable.")
        return

    client = genai.Client(api_key=API_KEY)

    print("🔍 Fetching available models for your key...\n")
    try:
        models = client.models.list()
        if not models:
            print("⚠️ No models returned. Your key might be invalid or restricted.")
            return

        for m in models:
            print(f"✅ {m.name}")

        # Pick one model (usually flash is fastest)
        model_name = next((m.name for m in models if "flash" in m.name), models[0].name)
        print(f"\n🚀 Testing model: {model_name}\n")

        response = client.models.generate_content(
            model=model_name,
            contents="Say a one-line friendly hello and include today's year."
        )

        print("🤖 Model response:")
        print(response.text.strip())

    except Exception as e:
        print("❌ Error while testing API key:")
        print(e)

if __name__ == "__main__":
    main()
