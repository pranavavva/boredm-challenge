import asyncio

from quart import Quart, websocket
from quart_cors import cors

from app.broker import Broker
from app.models.message import Message, MessageSchema


async def process_message(message: str) -> str:
    """
    Process a given messsage and return the response.
    This is usually a string representing the new state.
    """

    try:
        message = MessageSchema().loads(message)
    except Exception as e:
        return f"Invalid message: {e}"

    match message.action:
        case "echo":
            return message.payload["message"]
        case "reverse":
            return message.payload["message"][::-1]
        case _:
            return "Invalid action"


def init_app() -> Quart:
    application = Quart(__name__)
    application = cors(application, allow_origin="*")
    broker = Broker()

    async def _receive() -> None:
        """Receive messages from the clients and publish them to the broker."""
        while True:
            message = await websocket.receive()
            # process message here
            result = await process_message(message)
            await broker.publish(f"The server received the message: {result}")

    @application.websocket("/ws")
    async def ws() -> None:
        await websocket.send("Connected to the server.")

        task = asyncio.create_task(_receive())
        try:
            # send messages to the client as they arrive
            async for message in broker.subscribe():
                await websocket.send(message)
        finally:
            task.cancel()
            await task

    return application
