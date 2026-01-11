from flask import Flask, request, jsonify
from flask_cors import CORS
# Use the standalone Keras API (works with TF-backed Keras 3.x too)
from keras.models import load_model
import numpy as np
from PIL import Image

# Disease class names
CLASS_NAMES = [
    "BA-cellulitis",
    "BA-impetigo",
    "FU-athlete-foot",
    "FU-nail-fungus",
    "FU-ringworm",
    "PA-cutaneous-larva-migrans",
    "VI-chickenpox",
    "VI-shingles"
]

app = Flask(__name__)
CORS(app)

# ✅ Do NOT pass custom_objects for TrueDivide. It's a built-in layer in your model.
# ✅ Keep safe_mode as default (True).
model = load_model("skin_disease_model_full.keras")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    try:
        # Preprocess image (do NOT /255.0 here; model handles normalization internally)
        img = Image.open(file).convert("RGB").resize((224, 224))
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        prediction = model.predict(img_array)
        predicted_index = int(np.argmax(prediction, axis=1)[0])
        confidence = float(np.max(prediction))

        return jsonify({
            "class_index": predicted_index,
            "class_name": CLASS_NAMES[predicted_index],
            "confidence": confidence
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Optional: expose explicitly
    app.run(host="0.0.0.0", port=5001, debug=True)
