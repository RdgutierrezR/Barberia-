import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='',
    database='barberia'
)

cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE turnos ADD COLUMN fecha_cita_original DATETIME NULL")
    print("Columna fecha_cita_original agregada")
except Exception as e:
    print(f"fecha_cita_original: {e}")

try:
    cursor.execute("ALTER TABLE turnos ADD COLUMN fecha_fin_servicio DATETIME NULL")
    print("Columna fecha_fin_servicio agregada")
except Exception as e:
    print(f"fecha_fin_servicio: {e}")

conn.commit()
conn.close()
print("Migración completada")
