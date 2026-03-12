from datetime import datetime, timedelta
import os

ZONA_HORARIA = os.environ.get("TZ", "America/Bogota")

OFFSETS = {
    "America/Bogota": -5,
    "America/Lima": -5,
    "America/Cali": -5,
    "America/Medellin": -5,
}

def ahora():
    offset_hours = OFFSETS.get(ZONA_HORARIA, -5)
    utc_now = datetime.utcnow()
    local_dt = utc_now + timedelta(hours=offset_hours)
    return local_dt.replace(tzinfo=None)

def fecha_hoy():
    return ahora().date()
