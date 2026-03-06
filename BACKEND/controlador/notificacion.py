from twilio.rest import Client
from configuracion import Config

def get_twilio_client():
    if not Config.TWILIO_ACCOUNT_SID or not Config.TWILIO_AUTH_TOKEN:
        return None
    return Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

def formatear_telefono(telefono):
    if not telefono:
        logger.error("Teléfono vacío o None")
        return None
    telefono = telefono.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if telefono.startswith("+"):
        return telefono
    if telefono.startswith("57"):
        return "+" + telefono
    if telefono.startswith("3"):
        return "+57" + telefono
    if telefono.startswith("0"):
        return "+57" + telefono[1:]
    return "+57" + telefono

def enviar_whatsapp(to_number, mensaje):
    if not to_number:
        return False
    
    client = get_twilio_client()
    if not client:
        return False
    
    try:
        telefono = formatear_telefono(to_number)
        message = client.messages.create(
            body=mensaje,
            from_=Config.TWILIO_WHATSAPP_NUMBER,
            to=f"whatsapp:{telefono}"
        )
        return True
    except Exception:
        return False

def notificar_nuevo_turno_barbero(barbero, nombre_cliente, nombre_servicio, precio, fecha_hora, telefono_cliente):
    if not barbero.telefono:
        return False
    
    mensaje = f"""🔔 Nuevo Turno Asignado!

Cliente: {nombre_cliente}
Servicio: {nombre_servicio}
Precio: ${precio:,.0f}
Cuando: {fecha_hora}
Cliente tel: {telefono_cliente}"""
    
    return enviar_whatsapp(barbero.telefono, mensaje)

def notificar_turno_cliente(telefono_cliente, nombre_cliente, nombre_barbero, nombre_servicio, precio, fecha_hora, codigo_confirmacion):
    mensaje = f"""✅ Turno Confirmado!

Barbero: {nombre_barbero}
Servicio: {nombre_servicio}
Precio: ${precio:,.0f}
Cuando: {fecha_hora}
Código: {codigo_confirmacion}

¡Te esperamos! 💈"""
    
    return enviar_whatsapp(telefono_cliente, mensaje)
