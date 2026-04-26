from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from api.ws_manager import manager

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Register the new connection
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect the client to send us data, but we must
            # handle the receive loop to keep the connection alive
            # and detect disconnections.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
