"""
Setup script for Scam Detection System GPU

Checks GPU availability and provides installation instructions.
"""

import subprocess
import sys

def check_gpu():
    """Check available GPU and provide setup instructions."""
    
    print("=" * 50)
    print("GPU Detection for Scam Detection System")
    print("=" * 50)
    
    # Check PyTorch
    try:
        import torch
        print(f"\nPyTorch Version: {torch.__version__}")
        print(f"CUDA Available: {torch.cuda.is_available()}")
        print(f"MPS Available: {torch.backends.mps.is_available() if hasattr(torch.backends, 'mps') else 'N/A'}")
        
        if torch.cuda.is_available():
            print(f"GPU: {torch.cuda.get_device_name(0)}")
            print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
            print("\n✅ GPU is ready! Just run the application.")
            return True
    except ImportError:
        print("PyTorch not installed")
    
    # Check system GPU
    result = subprocess.run(["powershell", "-Command", 
        "Get-WmiObject Win32_VideoController | Select-Object Name"], 
        capture_output=True, text=True)
    
    print(f"\nSystem GPUs:\n{result.stdout}")
    
    print("\n" + "=" * 50)
    print("SETUP INSTRUCTIONS")
    print("=" * 50)
    
    print("""
Your system has NVIDIA GPU but CUDA Toolkit is not installed.

OPTION 1: Install CUDA Toolkit (Recommended)
-------------------------------------------
1. Download CUDA Toolkit 11.8 from:
   https://developer.nvidia.com/cuda-11-8-0-download-archive

2. Run the installer with default options

3. Install PyTorch with CUDA support:
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

4. Restart terminal and run:
   python -c "import torch; print('CUDA:', torch.cuda.is_available())"


OPTION 2: Use Intel GPU (Limited)
-------------------------------------------
Install PyTorch with DirectML (Windows):
   pip install torch torchvision --index-url https://download.pytorch.org/whl/directml

Note: DirectML has limited features, some models may not work.


OPTION 3: CPU Only (Already Works)
-------------------------------------------
Your current CPU-only setup works for all models,
just runs slower. No changes needed.
""")
    
    return False

if __name__ == "__main__":
    check_gpu()