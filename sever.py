# server.py
from flask import Flask, request
import requests

app = Flask(__name__)

COLAB_ENDPOINT = "https://your-colab-url.ngrok.io/process"  # Địa chỉ Colab

@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    files = {'image': (file.filename, file.stream, file.mimetype)}

    # Gửi ảnh sang Colab
    response = requests.post(COLAB_ENDPOINT, files=files)

    # Trả kết quả từ Colab lại cho frontend
    return response.text

if __name__ == '__main__':
    app.run(port=5000)
