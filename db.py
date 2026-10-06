# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Capa de base de datos (MySQL / Clever Cloud)
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import pymysql
from pymysql.cursors import DictCursor
from config import DB

_pool = None


def conexion(sin_db=False):
    """Abre una conexion MySQL nueva. sin_db=True omite la base (para crear)."""
    cfg = dict(DB)
    if sin_db:
        cfg.pop("database", None)
    return pymysql.connect(
        host=cfg["host"],
        user=cfg["user"],
        password=cfg["password"],
        database=cfg.get("database"),
        port=cfg["port"],
        cursorclass=DictCursor,
        charset="utf8mb4",
        autocommit=True,
        connect_timeout=15,
    )


def consultar(sql, args=None):
    """SELECT -> lista de diccionarios."""
    with conexion() as cx:
        with cx.cursor() as cur:
            cur.execute(sql, args or ())
            return cur.fetchall()


def consultar_uno(sql, args=None):
    """SELECT -> un diccionario o None."""
    filas = consultar(sql, args)
    return filas[0] if filas else None


def ejecutar(sql, args=None):
    """INSERT / UPDATE / DELETE -> cantidad de filas afectadas."""
    with conexion() as cx:
        with cx.cursor() as cur:
            cur.execute(sql, args or ())
            return cur.rowcount


def insertar(sql, args=None):
    """INSERT -> id autogenerado (lastrowid)."""
    with conexion() as cx:
        with cx.cursor() as cur:
            cur.execute(sql, args or ())
            return cur.lastrowid


def ejecutar_varios(sql, args):
    """Ejecuta varios INSERT de una sola vez."""
    if not args:
        return 0
    with conexion() as cx:
        with cx.cursor() as cur:
            return cur.executemany(sql, args)


def probar():
    """Verifica que la base responde. Devuelve (ok, mensaje)."""
    try:
        consultar_uno("SELECT 1 AS ok")
        return True, "Conexion correcta a %s" % DB.get("database")
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)