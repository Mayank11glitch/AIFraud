# Use official Python lightweight image
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces strictly requires applications to run as a non-root user (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Create the working directory
WORKDIR $HOME/app

# Copy the requirements file first for Docker layer caching
COPY --chown=user:user backend/requirements.txt $HOME/app/backend/requirements.txt

# Install Python dependencies (this will take a few minutes on Hugging Face during build)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy the entire backend source code
COPY --chown=user:user backend $HOME/app/backend

# Set the working directory to where main.py lives
WORKDIR $HOME/app/backend

# Hugging Face Spaces automatically routes traffic to port 7860
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
