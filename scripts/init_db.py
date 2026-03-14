import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import engine, Base
from backend.models import User, Report, Department

async def init_models():
    print(" Creating database tables...")
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print(" Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())
