import asyncio
from uuid import UUID
from typing import AsyncGenerator


class Broker:
    """Message broker to manage sending Quart WebSocket messages"""

    def __init__(self) -> None:
        self.connections: dict[UUID, asyncio.Queue] = {}

    async def publish_to(self, conn_id: UUID, message: str) -> None:
        """Send a message to a specific client."""

        connection = self.connections.get(conn_id)
        if connection:
            await connection.put(message)

    async def publish_all(self, message: str) -> None:
        """Send a message to all connected clients."""

        for connection in self.connections.values():
            await connection.put(message)

    async def subscribe(self, conn_id: UUID) -> AsyncGenerator[str, None]:
        """Register client with conn_id and receive messages from the broker."""
        connection = asyncio.Queue()
        self.connections[conn_id] = connection

        # While the connection is open, yield messages as they arrive
        # If there is an error or the connection is closed, remove the connection from the set
        try:
            while True:
                yield await connection.get()

        finally:
            del self.connections[conn_id]
