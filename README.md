# Furnish.AI

A high-performance AI interior design tool that lets you visualize furniture in your room using SDXL, ControlNet, and custom LoRAs.

## Project Structure

- `src/`: Next.js frontend
- `backend/`: Flask backend for AI inference
- `backend/models/`: Place your `furniture.safetensors` here

## Getting Started

### 1. Prerequisites

- Node.js (v18+)
- Python 3.9+
- NVIDIA GPU with 16GB+ VRAM (for local inference)

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**LoRA Model:**
Place your `furniture.safetensors` file inside the `backend/models/` directory.

**Run Backend:**
```bash
python3 app.py
```
The backend will run at `http://localhost:5000`.

## How it works

1. **Room Upload:** Upload a base image of your room.
2. **Furniture Upload:** Upload one or more images of furniture you'd like to see in the space.
3. **Instructions:** Provide placement details (e.g., "Place the chair by the window").
4. **Rendering:** The backend uses SDXL with a Canny ControlNet of your room and the `furniture.safetensors` LoRA to generate a cohesive scene.

## Troubleshooting

- **GPU Memory:** If you run out of VRAM, the app is configured with `pipe.enable_model_cpu_offload()` to save memory at the cost of speed.
- **Rewrites:** The frontend is configured to proxy `/api/generate` to `http://localhost:5000/generate` via `next.config.js`.
