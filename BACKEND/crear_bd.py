import pymysql

def crear_base_datos():
    conexion = pymysql.connect(
        host="localhost",
        user="root",
        password=""
    )
    try:
        with conexion.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS barberia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("Base de datos 'barberia' creada")
    finally:
        conexion.close()

if __name__ == "__main__":
    crear_base_datos()
