from quart import Quart

def init_app() -> Quart:
    application = Quart(__name__)
    
    @application.route("/")
    async def hello():
        return "Hello, World!"
        
    return application
