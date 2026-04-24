import os
import logging
from langfuse import Langfuse
from config import LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST

logger = logging.getLogger(__name__)

langfuse = None

def get_langfuse():
    global langfuse
    if langfuse is not None:
        return langfuse

    try:
        if LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY and "pk-lf" in LANGFUSE_PUBLIC_KEY:
            client = Langfuse(
                public_key=LANGFUSE_PUBLIC_KEY,
                secret_key=LANGFUSE_SECRET_KEY,
                host=LANGFUSE_HOST
            )
            langfuse = client
            logger.info("Langfuse integration active.")
        else:
            logger.warning("Langfuse credentials not configured or invalid. Traces will not be sent.")
    except Exception as e:
        logger.error(f"Langfuse initialization failed: {e}")
        langfuse = None
    return langfuse

get_langfuse()
