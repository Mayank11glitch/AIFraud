from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.routes import scanner
from api.routes import history
from api.routes import stats
from api.routes import export
from api.ws_manager import manager
import os

# Import our database modules
from database import engine, Base
import models.db_models

# Create the database tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ScamDetect AI API", version="1.0.0")

# Set up CORS for React frontend
# Add production frontend URLs via ALLOWED_ORIGINS env var (comma-separated)
default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
extra_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allowed_origins = default_origins + [o.strip() for o in extra_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include HTTP routers
app.include_router(scanner.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(export.router, prefix="/api")

# WebSocket endpoint — mounted directly on app to bypass CORS middleware
@app.websocket("/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "ScamDetect API is running."}

