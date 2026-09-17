from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
from PIL import Image
import os
import base64
from io import BytesIO


# ==========================================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)

HF_TOKEN = os.getenv("HF_TOKEN", "").strip()


# ==========================================================
# FLASK APP
# ==========================================================

app = Flask(__name__)
CORS(app)


# ==========================================================
# HUGGING FACE CLIENT
# ==========================================================

client = None

if HF_TOKEN:
    client = InferenceClient(
        api_key=HF_TOKEN,
        provider="auto"
    )


# ==========================================================
# HOME PAGE
# ==========================================================

@app.route("/")
def index():
    return render_template("index.html")


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route("/health", methods=["GET"])
def health_check():

    return jsonify({
        "status": "healthy",
        "model": "black-forest-labs/FLUX.1-dev",
        "token_configured": bool(HF_TOKEN),
        "message": "Flask server is running"
    })


# ==========================================================
# GENERATE IMAGE
# ==========================================================

@app.route("/generate", methods=["POST"])
def generate_image():

    try:

        # --------------------------------------------------
        # Check Hugging Face token
        # --------------------------------------------------

        if not HF_TOKEN or client is None:

            return jsonify({
                "error": "Hugging Face token is not configured.",
                "message": "Please check your .env file."
            }), 401


        # --------------------------------------------------
        # Get request data
        # --------------------------------------------------

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data received."
            }), 400


        # --------------------------------------------------
        # Get prompt
        # --------------------------------------------------

        prompt = data.get("prompt", "").strip()

        if not prompt:

            return jsonify({
                "error": "Prompt is required."
            }), 400


        # --------------------------------------------------
        # Get image settings
        # --------------------------------------------------

        width = int(data.get("width", 1024))
        height = int(data.get("height", 1024))
        steps = int(data.get("steps", 28))


        print("\n" + "=" * 70)
        print("GENERATING IMAGE")
        print("=" * 70)

        print("Prompt:", prompt)
        print("Width:", width)
        print("Height:", height)
        print("Steps:", steps)

        print("=" * 70)


        # --------------------------------------------------
        # Generate image using Hugging Face
        # --------------------------------------------------

        image = client.text_to_image(

            prompt=prompt,

            model="black-forest-labs/FLUX.1-dev",

            width=width,

            height=height,

            num_inference_steps=steps
        )


        # --------------------------------------------------
        # Convert PIL image to Base64
        # --------------------------------------------------

        buffer = BytesIO()

        image.save(buffer, format="PNG")

        image_bytes = buffer.getvalue()

        image_base64 = base64.b64encode(
            image_bytes
        ).decode("utf-8")


        print("Image generated successfully!")
        print("=" * 70)


        # --------------------------------------------------
        # Send image to frontend
        # --------------------------------------------------

        return jsonify({

            "success": True,

            "image": image_base64,

            "message": "Image generated successfully"
        })


    # ======================================================
    # ERROR HANDLING
    # ======================================================

    except Exception as e:

        print("\nERROR:")
        print(str(e))
        print("=" * 70)


        return jsonify({

            "error": "Image generation failed.",

            "message": str(e)

        }), 500


# ==========================================================
# RUN SERVER
# ==========================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 70)
    print("        AI IMAGE GENERATOR")
    print("=" * 70)

    print("Server: http://localhost:5000")
    print("Model: FLUX.1-dev")
    print("Provider: Hugging Face Inference Providers")
    print("=" * 70)


    # ------------------------------------------------------
    # Token status
    # ------------------------------------------------------

    if HF_TOKEN:

        print("HF TOKEN: CONFIGURED")

    else:

        print("WARNING: HF TOKEN NOT FOUND")
        print("Please check your .env file.")


    print("=" * 70)
    print("\n")


    # ------------------------------------------------------
    # Start Flask
    # ------------------------------------------------------

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True
    )