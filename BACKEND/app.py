from flask import Flask
import os
from configuracion import Config
from database import db
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from modelo.bloqueo_agenda import BloqueoAgenda
from modelo.horario_dia import HorarioDia
from modelo.push_subscription import PushSubscription

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    jwt = JWTManager(app)
    
    # ✅ Configuración CORS mejorada para desarrollo
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "*"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
             "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
             "expose_headers": ["Location", "Content-Disposition"],
             "supports_credentials": True,
             "max_age": 3600
         }},
         supports_credentials=True)
    
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    from rutas.barberias import barberias_bp
    from rutas.barberos import barberos_bp
    from rutas.servicios import servicios_bp
    from rutas.clientes import clientes_bp
    from rutas.turnos import turnos_bp
    from rutas.contabilidad import contabilidad_bp
    from rutas.horarios import horarios_bp
    from rutas.auth import auth_bp
    from rutas.invitaciones import invitaciones_bp
    from rutas.horario_dia import horario_dia_bp
    from rutas.push import push_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(barberias_bp)
    app.register_blueprint(barberos_bp)
    app.register_blueprint(servicios_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(turnos_bp)
    app.register_blueprint(contabilidad_bp)
    app.register_blueprint(horarios_bp)
    app.register_blueprint(invitaciones_bp)
    app.register_blueprint(horario_dia_bp)
    app.register_blueprint(push_bp)
    
    @app.route("/")
    def index():
        return {"mensaje": "API Barbería Multi-Tenant", "version": "1.0"}
    
    @app.route("/health")
    def health():
        try:
            db.session.execute(db.text("SELECT 1"))
            return {"status": "OK", "database": "connected"}
        except Exception as e:
            return {"status": "ERROR", "database": str(e)}, 500
    
    @app.route("/ping")
    def ping():
        return {"message": "pong"}
    
    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)