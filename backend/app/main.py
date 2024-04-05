import traceback
import asyncio
import json
from pprint import pprint
from uuid import UUID, uuid4

from quart import Quart, websocket
from quart_cors import cors
from marshmallow.exceptions import ValidationError

from app.broker import Broker
from app.models.customer import Customer, CustomerSchema
from app.models.item import Item, ItemSchema
from app.models.message import MessageSchema, MessageAction

# Some controls for the starting state of the database
# these wouldn't be present in a real application
STARTING_NUM_CUSTOMERS = 3
STARTING_NUM_ITEMS = 3
customer_uuids = [uuid4() for _ in range(STARTING_NUM_CUSTOMERS)]
item_uuids = [uuid4() for _ in range(STARTING_NUM_ITEMS)]

# Using global variables is...distateful.
# In practice we'd use a proper database that supports async operations.
# For the purposes of this challenge, it will suffice. I use separate locks
# here because the customer and item dbs have no relation to each other and
# can be updated independently.
customer_db: dict[UUID, Customer] = {
    customer_uuids[0]: Customer(
        id=customer_uuids[0],
        name="Alice",
        email="alice@example.com",
    ),
    customer_uuids[1]: Customer(
        id=customer_uuids[1],
        name="Bob",
        email="bob@example.com",
    ),
    customer_uuids[2]: Customer(
        id=customer_uuids[2],
        name="Charlie",
        email="charlie@example.com",
    ),
}

item_db: dict[UUID, Item] = {
    item_uuids[0]: Item(
        id=item_uuids[0],
        name="Apple",
        quantity=10,
        price=0.5,
    ),
    item_uuids[1]: Item(
        id=item_uuids[1],
        name="Banana",
        quantity=5,
        price=0.25,
    ),
    item_uuids[2]: Item(
        id=item_uuids[2],
        name="Cherry",
        quantity=20,
        price=0.1,
    ),
}

customer_lock = asyncio.Lock()
item_lock = asyncio.Lock()


class _MyBreak(Exception):
    # This is a clever trick to break out of the match statement below
    # while also always sending the database state. If there is ever
    # an error during message processing, we want to stop processing
    # the message immediately. However, we also always want to keep
    # the client in sync with the database state. This exception allows
    # us to do that.
    pass


async def process_message(message: str) -> tuple[str, bool]:
    """
    Process a given messsage and return a tuple containing the response and
    whether to republish the new state to all clients. Only mutations will trigger
    a state republish.

    For the *:create actions, the payload is expected to be a list of dictionaries
    corresponding to the objects to be created. Even if only one object is to be created,
    it still must be enclosed in an array. This corresponds to a POST HTTP verb.

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
    global customer_db, item_db
    try:
        message = MessageSchema().loads(message)
    except ValidationError as ve:
        raise _MyBreak() from ve

    try:
        match message.action:
            case MessageAction.CUSTOMER_CREATE:
                try:
                    payload = CustomerSchema(many=True).load(message.payload)
                except ValidationError as ve:
                    raise _MyBreak() from ve

                async with customer_lock:
                    for item in payload:
                        customer_db[item.id] = item
            case MessageAction.CUSTOMER_READ:
                return (
                    CustomerSchema().dumps(customer_db[message.payload["id"]]),
                    False,
                )
            case MessageAction.CUSTOMER_READ_ALL:
                return CustomerSchema(many=True).dumps(customer_db.values()), False
            case MessageAction.CUSTOMER_UPDATE:
                try:
                    payload = CustomerSchema(many=True).load(message.payload)
                except ValidationError as ve:
                    raise _MyBreak() from ve

                async with customer_lock:
                    for item in payload:
                        customer_db[item.id] = item
            case MessageAction.CUSTOMER_DELETE:
                async with customer_lock:
                    for item in message.payload:
                        del customer_db[UUID(item)]
            case MessageAction.CUSTOMER_DELETE_ALL:
                async with customer_lock:
                    customer_db = {}
            case MessageAction.ITEM_CREATE:
                try:
                    payload = ItemSchema(many=True).load(message.payload)
                except ValidationError as ve:
                    raise _MyBreak() from ve

                async with item_lock:
                    for item in payload:
                        item_db[item.id] = item
            case MessageAction.ITEM_READ:
                return ItemSchema().dumps(item_db[message.payload["id"]]), False
            case MessageAction.ITEM_READ_ALL:
                return ItemSchema(many=True).dumps(item_db.values()), False
            case MessageAction.ITEM_UPDATE:
                try:
                    payload = ItemSchema(many=True).load(message.payload)
                except ValidationError as ve:
                    raise _MyBreak() from ve

                async with item_lock:
                    for item in payload:
                        item_db[item.id] = item
            case MessageAction.ITEM_DELETE:
                async with item_lock:
                    for item in message.payload:
                        del item_db[UUID(item)]
            case MessageAction.ITEM_DELETE_ALL:
                async with item_lock:
                    item_db = {}
            case _:
                raise _MyBreak()
    except _MyBreak:
        pass

    # return the new state by default
    return (
        json.dumps(
            {
                "customer": CustomerSchema(many=True).dump(customer_db.values()),
                "item": ItemSchema(many=True).dump(item_db.values()),
            }
        ),
        True,
    )


def init_app() -> Quart:
    application = Quart(__name__)
    application = cors(application, allow_origin="*")
    broker = Broker()

    async def _receive(conn_id: UUID) -> None:
        """Receive messages from the clients and publish them to the broker."""
        while True:
            message = await websocket.receive()
            result, republish = await process_message(message)

            # If the result is not None, determine if we should republish the new state to everyone
            # If the result is None, that means an error occurred during processing, so we should
            # simply drop the message
            if result:
                if republish:
                    await broker.publish_all(result)
                else:
                    await broker.publish_to(conn_id, result)

    @application.route("/healthcheck")
    async def healthcheck() -> tuple[str, int]:
        return "OK", 200

    @application.websocket("/ws")
    async def ws() -> None:
        conn_id = uuid4()
        task = asyncio.create_task(_receive(conn_id))
        try:
            # send client the initial state
            await websocket.send(
                json.dumps(
                    {
                        "customer": CustomerSchema(many=True).dump(
                            customer_db.values()
                        ),
                        "item": ItemSchema(many=True).dump(item_db.values()),
                    }
                ),
            )
            # send messages to the client as they arrive
            async for message in broker.subscribe(conn_id):
                await websocket.send(message)
        finally:
            task.cancel()
            await task

    return application
