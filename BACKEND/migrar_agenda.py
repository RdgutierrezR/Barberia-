import pymysql
from datetime import datetime

def migrar_base_datos():
    conexion = pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="barberia"
    )
    try:
        with conexion.cursor() as cursor:
            print("Verificando estructura de la base de datos...")
            
            cursor.execute("SHOW COLUMNS FROM turnos LIKE 'tipo_reserva'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE turnos ADD COLUMN tipo_reserva VARCHAR(20) DEFAULT 'cola'")
                print("[OK] Columna 'tipo_reserva' agregada a turnos")
            else:
                print("[OK] Columna 'tipo_reserva' ya existe")
            
            cursor.execute("SHOW COLUMNS FROM turnos LIKE 'cita_fecha_hora'")
            if not cursor.fetchone():
                cursor.execute("ALTER TABLE turnos ADD COLUMN cita_fecha_hora DATETIME NULL")
                print("[OK] Columna 'cita_fecha_hora' agregada a turnos")
            else:
                print("[OK] Columna 'cita_fecha_hora' ya existe")
            
            cursor.execute("SHOW TABLES LIKE 'bloqueos_agenda'")
            if not cursor.fetchone():
                sql_bloqueos = """
                CREATE TABLE bloqueos_agenda (
                    id_bloqueo INT AUTO_INCREMENT PRIMARY KEY,
                    id_barberia INT NOT NULL,
                    id_barbero INT NOT NULL,
                    fecha_inicio DATETIME NOT NULL,
                    fecha_fin DATETIME NOT NULL,
                    motivo VARCHAR(100),
                    activo BOOLEAN DEFAULT TRUE,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_barberia) REFERENCES barberias(id_barberia) ON DELETE CASCADE,
                    FOREIGN KEY (id_barbero) REFERENCES barberos(id_barbero) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
                cursor.execute(sql_bloqueos)
                print("[OK] Tabla 'bloqueos_agenda' creada")
            else:
                print("[OK] Tabla 'bloqueos_agenda' ya existe")
            
            conexion.commit()
            print("\n[MENSAJE] Migracion completada exitosamente!")
            
    finally:
        conexion.close()

if __name__ == "__main__":
    migrar_base_datos()
