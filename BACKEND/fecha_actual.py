from datetime import datetime, timedelta, timezone

def ahora():
    utc_now = datetime.now(timezone.utc)
    bogota_offset = timedelta(hours=-5)
    bogota_tz = timezone(bogota_offset)
    return utc_now.astimezone(bogota_tz)

def fecha_hoy():
    return ahora().date()
