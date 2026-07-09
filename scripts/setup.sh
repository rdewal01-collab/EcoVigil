#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Generating sample lake & prediction data..."
python3 scripts/generate_sample_data.py

echo "==> Setting up Python venv..."
python3 -m venv ml/.venv
source ml/.venv/bin/activate
pip install -q -r ml/requirements.txt

echo "==> Training Random Forest model..."
python ml/train.py

echo "==> Running batch predictions..."
python ml/predict.py

echo "==> Done. Start frontend with: cd frontend && npm install && npm run dev"
