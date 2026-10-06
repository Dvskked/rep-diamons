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
        return _config_desde_uri(uri)

    return {
        "host": os.getenv("MYSQL_ADDON_HOST", "localhost"),
        "user": os.getenv("MYSQL_ADDON_USER", "root"),
        "password": os.getenv("MYSQL_ADDON_PASSWORD", ""),
        "database": os.getenv("MYSQL_ADDON_DB", "diamonds"),
        "port": int(os.getenv("MYSQL_ADDON_PORT", "3306")),
    }


DB = obtener_config()
SECRET_KEY = os.getenv("SECRET_KEY", "diamonds-league-neptunzinho-2026")
PUERTO = int(os.getenv("PORT", "5000"))