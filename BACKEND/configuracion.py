import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "barberia")

if DB_HOST:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/barberia")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "barberia-secreto-2024")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "check_hostname": True,
                "verify_cert": True,
            }
        },
        "pool_recycle": 300,
        "pool_pre_ping": True,
        "pool_timeout": 30,
    }
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-barberia-2024")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

def obtener_info_conexion():
    return {
        "host": DB_HOST,
        "port": DB_PORT,
        "database": DB_NAME,
        "ssl": True
    }
