import os
from app.main import init_app

app = init_app()
app.config.from_prefixed_env()

if __name__ == "__main__":
    app.run()
