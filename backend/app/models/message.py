from marshmallow import Schema, fields, post_load

class Message:
    """WebSocket message model."""

    def __init__(self, action: str, payload: dict):
        self.action = action
        self.payload = payload

class MessageSchema(Schema):
    """A WebSocekt message schema. Message has action and payload fields."""

    action = fields.String()
    payload = fields.Dict()

    @post_load
    def make_message(self, data, **kwargs):
        """Return a pythonic Message object"""
        return Message(**data)

