# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Configuracion
 (c) 2026 Neptunzinho. Todos los derechos reservados.
 Uso y redistribucion prohibidos sin autorizacion del autor.
=====================================================================
"""
import os
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _config_desde_uri(uri):
    """Acepta MYSQL_ADDON_URI y devuelve un diccionario de conexion."""
    u = urlparse(uri)
    return {
        "host": u.hostname or "",
        "user": u.username or "",
        "password": u.password or "",
        "database": (u.path or "/").lstrip("/"),
        "port": u.port or 3306,
    }


def obtener_config():
    """Arma la configuracion de MySQL desde el entorno."""
    uri = os.getenv("MYSQL_ADDON_URI", "").strip()
    if uri and not os.getenv("MYSQL_ADDON_HOST"):
        cfg = _config_desde_uri(uri)
        cfg["host"] = os.getenv("MYSQL_HOST") or os.getenv("MYSQLHOST") or cfg["host"]
        cfg["user"] = os.getenv("MYSQL_USER") or os.getenv("MYSQLUSER") or cfg["user"]
        cfg["password"] = os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQLPASSWORD") or cfg["password"]
        cfg["database"] = os.getenv("MYSQL_DATABASE") or os.getenv("MYSQLDATABASE") or cfg["database"]
        cfg["port"] = int(os.getenv("MYSQL_PORT") or os.getenv("MYSQLPORT") or cfg["port"] or 3306)
        return cfg

    return {
        "host": os.getenv("MYSQL_HOST") or os.getenv("MYSQLHOST") or os.getenv("MYSQL_ADDON_HOST", "localhost"),
        "user": os.getenv("MYSQL_USER") or os.getenv("MYSQLUSER") or os.getenv("MYSQL_ADDON_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQLPASSWORD") or os.getenv("MYSQL_ADDON_PASSWORD", ""),
        "database": os.getenv("MYSQL_DATABASE") or os.getenv("MYSQLDATABASE") or os.getenv("MYSQL_ADDON_DB", "diamonds"),
        "port": int(os.getenv("MYSQL_PORT") or os.getenv("MYSQLPORT") or os.getenv("MYSQL_ADDON_PORT", "3306")),
    }

DB = obtener_config()
SECRET_KEY = os.getenv("SECRET_KEY", "diamonds-league-neptunzinho-2026")
PUERTO = int(os.getenv("PORT", "5000"))