from fastapi import WebSocket
from typing import List, Dict, Any
import json
import logging

logger = logging.getLogger("sewasetu")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcast standardized JSON event to all connected clients.
        Structure:
        {
            "event": "new_report",
            "data": { ... }
        }
        """
        message = {
            "event": event_type,
            "data": data
        }
        
        # Clean up closed connections locally to avoid errors
        to_remove = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                to_remove.append(connection)
        
        for conn in to_remove:
            self.disconnect(conn)

manager = ConnectionManager()
