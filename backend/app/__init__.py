from app.main import init_app

app = init_app()
app.config.from_prefixed_env()
