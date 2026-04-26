"""
GPU Manager for Scam Detection System

Automatically detects and manages GPU resources for ML inference.
Supports CUDA (NVIDIA), MPS (Apple Silicon), and falls back to CPU.
"""

import os
import torch
import platform


class GPUMgr:
    """GPU resource manager with automatic device selection."""
    
    def __init__(self):
        self.device = self._get_best_device()
        self.device_info = self._get_device_info()
        self.has_gpu = self.device != "cpu"
    
    def _get_best_device(self) -> str:
        """Force CPU usage."""
        return "cpu"
    
    def _get_device_info(self) -> dict:
        """Get detailed device information."""
        info = {"type": self.device, "available": False, "name": None, "memory": None}
        
        if self.device == "cuda":
            info["available"] = True
            info["name"] = torch.cuda.get_device_name(0)
            info["memory"] = f"{torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB"
            info["compute_capability"] = f"{torch.cuda.get_device_capability(0)}"
        
        elif self.device == "mps":
            info["available"] = True
            info["name"] = "Apple Silicon (M1/M2/M3)"
            info["memory"] = "Unified Memory"
        
        else:
            info["available"] = False
            info["name"] = "CPU Only"
        
        return info
    
    def get_device(self):
        """Get torch device object."""
        if self.device == "mps":
            return torch.device("mps")
        elif self.device == "cuda":
            return torch.device("cuda")
        return torch.device("cpu")
    
    def get_device_index(self) -> int:
        """Get device index for transformers pipeline (-1 for CPU, 0 for GPU)."""
        return 0 if self.has_gpu else -1
    
    def print_status(self):
        """Print GPU status."""
        print(f"\n{'='*50}")
        print(f"  AI Engine Device: {self.device.upper()}")
        if self.device == "cuda":
            print(f"  GPU: {self.device_info['name']}")
            print(f"  VRAM: {self.device_info['memory']}")
            print(f"  Compute: {self.device_info['compute_capability']}")
        elif self.device == "mps":
            print(f"  GPU: {self.device_info['name']}")
            print(f"  Memory: {self.device_info['memory']}")
        else:
            print(f"  Running on CPU")
            print(f"  Install CUDA PyTorch for GPU acceleration")
        print(f"{'='*50}\n")
    
    def optimize_memory(self):
        """Clear GPU cache and optimize memory."""
        if self.device == "cuda":
            torch.cuda.empty_cache()
        elif self.device == "mps":
            torch.mps.empty_cache()
    
    def memory_stats(self) -> dict:
        """Get current memory usage."""
        stats = {"device": self.device}
        
        if self.device == "cuda":
            stats["allocated"] = f"{torch.cuda.memory_allocated(0) / 1024**3:.2f} GB"
            stats["reserved"] = f"{torch.cuda.memory_reserved(0) / 1024**3:.2f} GB"
        
        return stats


def create_gpu_manager() -> GPUMgr:
    """Factory function to create GPU manager."""
    return GPUMgr()


# Initialize global GPU manager
GPU_MGR = create_gpu_manager()
DEVICE = GPU_MGR.device
DEVICE_OBJ = GPU_MGR.get_device()

if __name__ == "__main__":
    GPU_MGR.print_status()
    print(f"Device: {DEVICE}")
    print(f"Device object: {DEVICE_OBJ}")
    print(f"Pipeline device index: {GPU_MGR.get_device_index()}")