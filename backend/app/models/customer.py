from uuid import UUID, uuid4
from marshmallow import Schema, fields, post_load, EXCLUDE


class Customer:
    """A simple customer class. Customer has name, email, and phone number."""

    def __init__(self, name: str, email: str, customer_id: UUID | None = None):
        self.customer_id = customer_id if customer_id else uuid4()
        self.name = name
        self.email = email

    def __repr__(self):
        return f"<Customer custoimer_id={self.customer_id} name={self.name} email={self.email}>"


class CustomerSchema(Schema):
    """A simple customer schema. Customer has name, email."""

    customer_id = fields.UUID(load_default=uuid4)
    name = fields.String()
    email = fields.Email()

    @post_load
    def make_customer(self, data, **kwargs):
        """Return a pythonic Customer object"""
        return Customer(**data)
