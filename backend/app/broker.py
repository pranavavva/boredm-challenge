import asyncio
from typing import AsyncGenerator


class Broker:
    """Message broker to manage sending Quart WebSocket messages"""

    def __init__(self) -> None:
        self.connections: set[asyncio.Queue] = set()

    async def publish(self, message: str) -> None:
        """Send a message to all connected clients."""

        for connection in self.connections:
            await connection.put(message)

    async def subscribe(self) -> AsyncGenerator[str, None]:
        """Receive messages from the broker."""
        connection = asyncio.Queue()
        self.connections.add(connection)

        # While the connection is open, yield messages as they arrive
        # If there is an error or the connection is closed, remove the connection from the set
        try:
            while True:
                yield await connection.get()

        finally:
            self.connections.remove(connection)
