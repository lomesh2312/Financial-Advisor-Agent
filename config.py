import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

APP_NAME = "Financial Advisor Agent"
APP_VERSION = "0.1.1"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / 'data'

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
LANGFUSE_PUBLIC_KEY = os.getenv('LANGFUSE_PUBLIC_KEY')
LANGFUSE_SECRET_KEY = os.getenv('LANGFUSE_SECRET_KEY')
LANGFUSE_HOST = os.getenv('LANGFUSE_HOST', 'https://cloud.langfuse.com')
