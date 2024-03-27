from uuid import uuid4
from marshmallow import Schema, fields, post_load


class Customer:
    """A simple customer class. Customer has name, email, and phone number."""

    def __init__(self, name: str, email: str):
        self.id = uuid4()
        self.name = name
        self.email = email

    def __repr__(self):
        return f"<Customer(id={self.id})>"


class CustomerSchema(Schema):
    """A simple customer schema. Customer has name, email."""

    id = fields.UUID(load_default=uuid4, dump_only=True)
    name = fields.String()
    email = fields.Email()

    @post_load
    def make_customer(self, data, **kwargs):
        """Return a pythonic Customer object"""
        return Customer(**data)
