from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np

model = load_model("plant_disease_model.h5")

class_names = [
    "Healthy",
    "Leaf Blight",
    "Rust",
    "Powdery Mildew"
]

@app.route('/detect', methods=['POST'])
def detect():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({"error": "Empty filename"}), 400

        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        index = np.argmax(prediction)
        confidence = float(np.max(prediction)) * 100

        return jsonify({
            "disease": class_names[index],
            "confidence": f"{round(confidence, 2)}%",
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500