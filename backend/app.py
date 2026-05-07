import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from diffusers import StableDiffusionXLControlNetPipeline, ControlNetModel, AutoencoderKL
from diffusers.utils import load_image
from PIL import Image
import numpy as np
import cv2
import uuid

app = Flask(__name__)
CORS(app)


MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"
CONTROLNET_ID = "diffusers/controlnet-canny-sdxl-1.0"
LORA_PATH = "models/furniture.safetensors"
OUTPUT_DIR = "static/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("models", exist_ok=True)


pipe = None

def get_pipeline():
    global pipe
    if pipe is None:
        print("Loading models (this may take a while)...")
        controlnet = ControlNetModel.from_pretrained(
            CONTROLNET_ID, torch_dtype=torch.float16
        )
        

        pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
            MODEL_ID, 
            controlnet=controlnet, 
            torch_dtype=torch.float16,
            use_safetensors=True
        ).to("cuda")
        

        try:
            pipe.load_ip_adapter("h94/IP-Adapter", subfolder="sdxl_models", weight_name="ip-adapter_sdxl.bin")
            pipe.set_ip_adapter_scale(0.6)
            print("IP-Adapter loaded successfully")
        except Exception as e:
            print(f"IP-Adapter load failed (skipping): {e}")
        
        # Load LoRA
        if os.path.exists(LORA_PATH):
            pipe.load_lora_weights(LORA_PATH)
            print(f"LoRA loaded from {LORA_PATH}")
        
        pipe.enable_model_cpu_offload()
    return pipe

def get_canny_image(image, low_threshold=100, high_threshold=200):
    image = np.array(image)
    image = cv2.Canny(image, low_threshold, high_threshold)
    image = image[:, :, None]
    image = np.concatenate([image, image, image], axis=2)
    return Image.fromarray(image)

@app.route('/generate', methods=['POST'])
def generate():
    try:
        room_file = request.files.get('room')
        prompt = request.form.get('prompt', '')
        furniture_count = int(request.form.get('furniture_count', 0))
        
        if not room_file:
            return jsonify({"error": "No room image provided"}), 400

        room_img = Image.open(room_file).convert("RGB")
        room_img = room_img.resize((1024, 1024))
        
        control_image = get_canny_image(room_img)
        
        furniture_images = []
        for i in range(furniture_count):
            f_file = request.files.get(f'furniture_{i}')
            if f_file:
                f_img = Image.open(f_file).convert("RGB")
                f_img = f_img.resize((1024, 1024))
                furniture_images.append(f_img)
        
        pipeline = get_pipeline()
        
        full_prompt = f"{prompt}, high quality, realistic interior, architectural photography, cinematic lighting"
        negative_prompt = "deformed, messy, low quality, blurry, distorted perspective"
        
        generator = torch.Generator(device="cuda").manual_seed(42)

        kwargs = {
            "prompt": full_prompt,
            "negative_prompt": negative_prompt,
            "image": control_image,
            "controlnet_conditioning_scale": 0.7,
            "num_inference_steps": 30,
            "generator": generator,
        }
        
        if furniture_images:
            kwargs["ip_adapter_image"] = [furniture_images] 
            if len(furniture_images) == 1:
                kwargs["ip_adapter_image"] = furniture_images[0]
            else:
                kwargs["ip_adapter_image"] = furniture_images

        print(f"Generating with prompt: {full_prompt}")
        output = pipeline(**kwargs).images[0]

        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        output.save(filepath)
        
        return jsonify({
            "imageUrl": f"http://localhost:5000/static/outputs/{filename}"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/static/outputs/<filename>')
def serve_output(filename):
    from flask import send_from_directory
    return send_from_directory(OUTPUT_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
