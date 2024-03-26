from marshmallow import Schema, fields, post_load


class Customer:
    """A simple customer class. Customer has name, email, and phone number."""

    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def __repr__(self):
        return f"<Customer(name={self.name!r}, email={self.email!r})>"


class CustomerSchema(Schema):
    """A simple customer schema. Customer has name, email."""

    name = fields.String()
    email = fields.Email()

    @post_load
    def make_customer(self, data, **kwargs):
        """Return a pythonic Customer object"""
        return Customer(**data)
