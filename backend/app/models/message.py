from enum import Enum
from marshmallow import Schema, fields, post_load, ValidationError


class MessageAction(Enum):
    """
    Enumerates the possible types of messages. These represent CRUD actions.
    """

    CUSTOMER_CREATE = "customer:create"
    CUSTOMER_READ = "customer:read"
    CUSTOMER_READ_ALL = "customer:read-all"
    CUSTOMER_UPDATE = "customer:update"
    CUSTOMER_DELETE = "customer:delete"
    CUSTOMER_DELETE_ALL = "customer:delete-all"

    ITEM_CREATE = "item:create"
    ITEM_READ = "item:read"
    ITEM_READ_ALL = "item:read-all"
    ITEM_UPDATE = "item:update"
    ITEM_DELETE = "item:delete"
    ITEM_DELETE_ALL = "item:delete-all"

    ECHO = "echo"
    REVERSE = "reverse"


class Message:
    """WebSocket message model."""

    def __init__(self, action: MessageAction, payload: dict):
        self.action = action
        self.payload = payload


class DictOrListOfDictsField(fields.Field):
    def _deserialize(self, value, attr, data, **kwargs):
        if isinstance(value, dict):
            # If the value is a dict, return it directly or wrap it in a list, based on your needs.
            return value
        if isinstance(value, list):
            # If the value is a list, validate that all elements are dicts.
            if all(isinstance(item, dict) for item in value):
                return value
            raise ValidationError("All elements in the list must be dicts.")
        raise ValidationError(
            "Invalid input type. Must be a dict or a list of dicts."
        )


class MessageSchema(Schema):
    """A WebSocekt message schema. Message has action and payload fields."""

    action = fields.Enum(MessageAction, by_value=True)
    payload = DictOrListOfDictsField()

    @post_load
    def make_message(self, data, **kwargs):
        """Return a pythonic Message object"""
        return Message(**data)
