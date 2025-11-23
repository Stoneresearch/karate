import os
import redis
import logging

logger = logging.getLogger(__name__)

def get_redis_client():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    try:
        return redis.from_url(redis_url, decode_responses=True)
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return None

