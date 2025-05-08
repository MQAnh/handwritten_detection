from gradio_client import Client, handle_file
from PIL import Image

client = Client("MQAnh/DSAproject")
result = client.predict(
		image=Image.open("C:/Users/Hp Pro/Desktop/test.png"),
		api_name="/predict"
)
print(result)