import asyncio
import json

from quart import Quart, websocket
from quart_cors import cors

from app.broker import Broker
from app.models.customer import Customer, CustomerSchema
from app.models.item import Item, ItemSchema
from app.models.message import Message, MessageSchema, MessageAction


# Using global variables here is...distateful.
# In practice we'd use a proper database that supports async operations.
# For the purposes of this challeng, it will suffice. I use separate locks
# here because the customer and item dbs have no relation to each other and
# can be updated independently.
customer_db = {}
item_db = {}

customer_lock = asyncio.Lock()
item_lock = asyncio.Lock()


async def process_message(message: str) -> str:
    """
    Process a given messsage and return the response.
    This is usually a string representing the new state. In the case of an error,
    the string will contain the error message.


    For the *:create actions, the payload is expected to be a list of dictionaries
    corresponding to the objects to be created. This corresponds to a POST HTTP verb.

    For the *:read actions, the payload is expected to be a dictionary with the
    key "id" corresponding to the object to be read. *:read-all does not require
    a payload and will return all objects in the database. This corresponds to a GET HTTP verb.

    For the *:update actions, the payload is expected to be a dictionary with the
    key "id" corresponding to the object to be updated and the key "data" corresponding
    to the new data. This corresponds to a PUT HTTP verb.

    For the *:delete actions, the payload is expected to be a list of "id"s corresponding
    to the objects to be deleted. *:delete-all does not require a payload and will delete
    all objects in the database. This corresponds to a DELETE HTTP verb.
    """
    global customer_db, item_db, customer_lock, item_lock

    try:
        message = MessageSchema().loads(message)
    except Exception as e:
        return f"Invalid message: {message}. The error: {e}"

    match message.action:
        case MessageAction.CUSTOMER_CREATE:
            payload = CustomerSchema(many=True).load(message.payload)
            async with customer_lock:
                for item in payload:
                    customer_db[item.id] = item
        case MessageAction.CUSTOMER_READ:
            return CustomerSchema().dumps(customer_db[message.payload["id"]])
        case MessageAction.CUSTOMER_READ_ALL:
            return CustomerSchema(many=True).dumps(customer_db.values())
        case MessageAction.CUSTOMER_UPDATE:
            payload = CustomerSchema().load(message.payload)
            async with customer_lock:
                customer_db[payload.id] = payload
        case MessageAction.CUSTOMER_DELETE:
            async with customer_lock:
                for item in message.payload:
                    del customer_db[item]
        case MessageAction.CUSTOMER_DELETE_ALL:
            async with customer_lock:
                customer_db = {}
        case MessageAction.ITEM_CREATE:
            payload = ItemSchema(many=True).load(message.payload)
            async with item_lock:
                for item in payload:
                    item_db[item.id] = item
        case MessageAction.ITEM_READ:
            return ItemSchema().dumps(item_db[message.payload["id"]])
        case MessageAction.ITEM_READ_ALL:
            return ItemSchema(many=True).dumps(item_db.values())
        case MessageAction.ITEM_UPDATE:
            payload = ItemSchema().load(message.payload)
            async with item_lock:
                item_db[payload.id] = payload
        case MessageAction.ITEM_DELETE:
            async with item_lock:
                for item in message.payload:
                    del item_db[item]
        case MessageAction.ITEM_DELETE_ALL:
            async with item_lock:
                item_db = {}
        case MessageAction.ECHO:
            return message.payload["message"]
        case MessageAction.REVERSE:
            return message.payload["message"][::-1]
        case _:
            return f"Invalid action: {message.action}"

    # return the new state
    return json.dumps(
        {
            "customer": CustomerSchema(many=True).dump(customer_db.values()),
            "item": ItemSchema(many=True).dump(item_db.values()),
        }
    )


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
            await broker.publish(result)

    @application.route("/healthcheck")
    async def healthcheck() -> str:
        return "OK", 200

    @application.websocket("/ws")
    async def ws() -> None:
        task = asyncio.create_task(_receive())
        try:
            # send messages to the client as they arrive
            async for message in broker.subscribe():
                await websocket.send(message)
        finally:
            task.cancel()
            await task

    return application
