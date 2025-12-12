import tensorflow as tf
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
from PIL import Image
import io


class ObjectDetectionModel:
    def __init__(self):
        self.model = MobileNetV2(weights='imagenet')
        self.model.trainable = False

    def predict(self, image_file):
        """
        Predict object in image using pre-trained MobileNetV2

        Args:
            image_file: Django UploadedFile or file-like object

        Returns:
            tuple: (predicted_class, confidence)
        """
        try:
            # Load and preprocess image
            img = Image.open(image_file).convert('RGB')
            img = img.resize((224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)

            # Make prediction
            predictions = self.model.predict(img_array)
            decoded = decode_predictions(predictions, top=1)[0]

            # Extract top prediction
            class_id, class_name, confidence = decoded[0]

            return class_name.replace('_', ' ').title(), float(confidence)

        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")


# Global model instance
_model_instance = None


def get_model():
    """Singleton pattern for model loading"""
    global _model_instance
    if _model_instance is None:
        _model_instance = ObjectDetectionModel()
    return _model_instance
