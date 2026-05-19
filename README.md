# Furnish.AI

**Furnish.AI** is an AI-powered interior design visualization system that helps users see how an empty or partially furnished room could look after adding furniture, layout, lighting, and style.

Instead of generating a random room from text only, Furnish.AI uses a room image, furniture reference images, and a text prompt to generate a realistic furnished room visualization. The goal is simple: upload your room, describe what you want, and let AI preview the furnished version before you physically buy or arrange anything.

---

## Team

| Name | Email |
|---|---|
| Abdul Rauf | irauf.babar@gmail.com |
| Talha Farooq | m.talhafarooq05@gmail.com |
| Zohaib Jamal | z1911j@gmail.com |

---

## Project Links

- **Training Repository:** https://github.com/rauf-babar/SDXL-LoRA-Training
- **Hugging Face LoRA Weights:** https://huggingface.co/ZohaibJamal/Funiture-LoRA-Diffusers

---

## What Furnish.AI Does

Furnish.AI takes:

1. A base room image, such as an empty bedroom or living room.
2. Furniture reference images, such as a bed, chair, table, sofa, or lamp.
3. A text prompt describing the desired layout, style, or room theme.

It generates:

- A realistic furnished room image.
- A visual preview of how the room may look with the selected furniture.
- A design concept that can help with interior planning, virtual staging, and furniture placement.

Example:

> A user uploads an empty bedroom image and gives furniture references like a bed, side table, and lamp. Furnish.AI generates a furnished bedroom while trying to keep the original room structure and place the furniture according to the prompt.

---

## Problem Statement

General text-to-image models can create good-looking images, but they are not specialized for interior design. They often struggle with:

- Realistic furniture placement
- Room layout consistency
- Spatial balance
- Interior design terminology
- Prompt-to-image alignment
- Correct object relationships, such as a table beside a bed or a sofa facing a center table

Furnish.AI improves this by fine-tuning Stable Diffusion XL on interior scene data and using additional guidance during inference.

---

## Website / Output Demo Flow

The website flow is designed to be simple:

1. Upload a room image.
2. Upload furniture reference image(s).
3. Enter a prompt describing the target room design.
4. Generate the furnished room.
5. Compare the original room with the generated output.

[▶ Watch Furnish.AI Demo](./Assets/furnish-ai-demo.mp4)

https://github.com/user-attachments/assets/1533ade7-e557-4935-bfbc-36d8e1dbd866

--- 

## Key Features

- Interior-specialized image generation using SDXL fine-tuning
- LoRA-based training instead of full model fine-tuning
- ControlNet guidance for preserving room structure and spatial layout
- IP-Adapter guidance for using furniture reference images
- BLIP-2 caption generation for LSUN images that originally had no captions
- Automated dataset preparation from LSUN data to LoRA-ready image-caption pairs
- Flask backend API for model inference
- Next.js frontend for user interaction

---

## Tech Stack

### AI / Machine Learning

- Stable Diffusion XL Base 1.0
- LoRA fine-tuning
- ControlNet
- IP-Adapter
- BLIP-2 with Flan-T5
- PyTorch
- Hugging Face Diffusers
- Hugging Face Transformers
- Torchvision
- Safetensors
- Pillow
- CUDA

### Backend

- Python
- Flask API
- Diffusers inference pipeline
- PyTorch model execution

### Frontend

- Next.js
- React
- Vercel deployment workflow

---

## Dataset

The project uses the **LSUN (Large-Scale Scene Understanding)** dataset because it contains a large number of indoor scene images useful for training an interior-focused generative model.

Selected categories:

- Bedroom
- Living Room
- Kitchen
- Classroom
- Conference Room

The dataset was processed into a balanced subset of about **2,000 images per category**, giving around **10,000 images** across the selected room types.

LSUN was useful because it contains different indoor layouts, furniture arrangements, lighting conditions, architectural structures, and visual styles.

---

## Data Preparation Pipeline

LSUN does not provide natural language captions by default, so a preprocessing pipeline was created to prepare the dataset for diffusion model training.

### Steps

1. Download selected LSUN categories.
2. Extract images from LMDB files.
3. Remove corrupted images.
4. Remove images smaller than 128 × 128 pixels.
5. Convert images to RGB.
6. Resize images for training.
7. Generate captions using BLIP-2 with Flan-T5.
8. Convert generated captions into tag-style annotations.
9. Save each image with a matching `.txt` caption file.
10. Structure the dataset for LoRA training.

Example caption conversion:

```txt
Original caption: A bedroom with a bed and a window
Tag format: bedroom, bed, window
```

Final paired format:

```txt
images/
├── image001.jpg
├── image001.txt
├── image002.jpg
├── image002.txt
```

Training folder format:

```txt
train_data/
├── 100_bedroom/
├── 100_living_room/
├── 100_kitchen/
├── 100_classroom/
├── 100_conference_room/
```

---

## Model Architecture

Furnish.AI has two main pipelines:

1. Training pipeline
2. Inference pipeline

### Training Pipeline

```txt
LSUN Images
   ↓
Image Cleaning and Preprocessing
   ↓
BLIP-2 Caption Generation
   ↓
Image-Caption Pair Creation
   ↓
SDXL LoRA Fine-Tuning
   ↓
Saved LoRA Weights
```

The training pipeline teaches SDXL interior-specific patterns such as room composition, furniture relationships, lighting, textures, and object placement.

### Inference Pipeline

```txt
Room Image + Furniture References + Text Prompt
   ↓
Preprocessing
   ↓
ControlNet Spatial Guidance
   ↓
IP-Adapter Furniture Appearance Guidance
   ↓
LoRA-Fine-Tuned SDXL Generation
   ↓
Final Furnished Room Image
```

ControlNet helps preserve the structure of the input room, while IP-Adapter helps use visual information from the furniture reference images.

---

## Training Details

### Base Model

```txt
stabilityai/stable-diffusion-xl-base-1.0
```

SDXL was selected because it supports high-resolution 1024 × 1024 generation and provides stronger visual quality than older Stable Diffusion versions.

### Why LoRA?

Full fine-tuning of SDXL is expensive because SDXL is a very large model. LoRA fine-tuning updates only small trainable adapter weights while keeping the base model frozen.

This makes training:

- More memory efficient
- Faster than full fine-tuning
- Easier to save and share
- Suitable for learning a specific domain like interior design

### Main Hyperparameters

| Setting | Value |
|---|---|
| Base Model | Stable Diffusion XL Base 1.0 |
| Training Method | LoRA |
| LoRA Rank | 8 |
| Learning Rate | 5e-6 |
| Optimizer | AdamW |
| Batch Size | 1 |
| Epochs | 1 |
| Precision | bfloat16 for UNet, float32 for VAE/loss |
| Gradient Clipping | 1.0 |
| Scheduler | DDPM |
| Target Resolution | 1024 × 1024 |

### Training Objective

The model follows the diffusion noise prediction objective. Noise is added to image latents, and the UNet learns to predict that noise.

```txt
Loss = MSE(predicted_noise, actual_noise)
```

---

## Repository Components

The training repository includes the main files used for SDXL LoRA training.

```txt
lora.py
```
Implements LoRA layers and helper functions for injecting LoRA into the model.

```txt
dataset.py
```
Loads image-caption pairs and applies image transformations.

```txt
utils.py
```
Handles SDXL-specific utilities such as prompt encoding and time ID conditioning.

```txt
convert_lora.py
```
Converts saved PyTorch LoRA checkpoints into Diffusers-compatible `.safetensors` format.

---

### Output Artifacts

```txt
lora_sdxl.pth
```
Raw PyTorch checkpoint containing LoRA weights.

```txt
lora_diffusers.safetensors
```
Diffusers-compatible LoRA weights that can be loaded during inference.

---

## Evaluation Results

The LoRA fine-tuned model was compared with the base SDXL model using image generation metrics.

| Metric | Base SDXL | LoRA Model | Meaning |
|---|---:|---:|---|
| FID ↓ | 18.25 | 14.32 | Better realism and closer target distribution |
| CLIP Score ↑ | 0.26 | 0.31 | Better prompt alignment |
| LPIPS ↓ | 0.42 | 0.18 | Better perceptual similarity and texture quality |
| Aesthetic Score ↑ | 6.2 | 7.8 | More visually appealing outputs |

### Evaluation Insight

The LoRA model generated more realistic and more prompt-aligned interior images than the base SDXL model. For the prompt:

```txt
generate a room with windows, bed and a table
```

The base SDXL output failed to properly include the table, while the LoRA fine-tuned output generated a clearer table and a more coherent bed structure.

---

## Challenges Faced

### Dataset Handling

The LSUN dataset is large, so downloading, extracting, filtering, and preprocessing required careful storage and time management.

### Caption Quality

BLIP-2 generated useful captions, but some captions were generic, such as `room, table, chair`. This helped training but sometimes reduced fine detail in prompt understanding.

### Training Stability

SDXL training required careful dtype handling. The VAE was kept in float32 for stability, while the UNet used bfloat16. Incorrect precision handling could cause unstable loss or NaN values.

### VRAM Constraints

Training SDXL at 1024 × 1024 resolution requires high GPU memory. Gradient checkpointing and batch size 1 were used to make training feasible.

### LoRA Conversion

Custom LoRA checkpoint keys had to be converted into the naming format expected by Hugging Face Diffusers.

### Spatial Accuracy

The model can sometimes struggle with exact furniture scale, complex object placement, or prompts with too many small details.

---

## Limitations

- The model performs best on room types similar to the training categories.
- It may struggle with unseen room types or highly abstract prompts.
- Furniture placement is guided but not always physically perfect.
- Minor prompt details can sometimes be ignored.
- BLIP-2 captions can introduce noise if they are too generic.
- The system is for interior visualization, not CAD modeling or architectural blueprint generation.

---
