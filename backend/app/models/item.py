from uuid import uuid4
from marshmallow import Schema, fields, post_load


class Item:
    """Inventory item model for storing item name, quantity, and price."""

    def __init__(self, name: str, quantity: int, price: float):
        self.id = uuid4()
        self.name = name
        self.quantity = quantity
        self.price = price

    def __repr__(self):
        return f"<Item {self.id}>"


class ItemSchema(Schema):
    """A simple Item schema. Item has item name, current stocked quantity, and price in dollars."""

    id = fields.UUID(load_default=uuid4, dump_only=True)
    name = fields.String()
    quantity = fields.Integer()
    price = fields.Float()

    @post_load
    def make_item(self, data, **kwargs):
        """Return a pythonic Item object"""
        return Item(**data)
