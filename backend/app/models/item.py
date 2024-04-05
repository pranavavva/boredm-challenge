from uuid import UUID, uuid4
from marshmallow import Schema, fields, post_load


class Item:
    """Inventory item model for storing item name, quantity, and price."""

    def __init__(
        self, name: str, quantity: int, price: float, id: UUID | None = None
    ):
        self.id = id if id else uuid4()
        self.name = name
        self.quantity = quantity
        self.price = price

    def __repr__(self):
        return f"<Item id={self.id} name={self.name} quantity={self.quantity} price={self.price}>"


class ItemSchema(Schema):
    """A simple Item schema. Item has item name, current stocked quantity, and price in dollars."""

    id = fields.UUID(load_default=uuid4)
    name = fields.String()
    quantity = fields.Integer()
    price = fields.Float()

    @post_load
    def make_item(self, data, **kwargs):
        """Return a pythonic Item object"""
        return Item(**data)
