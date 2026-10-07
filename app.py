# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Servidor Flask (frontend vanilla + API)
 (c) 2026 Neptunzinho. Todos los derechos reservados.
 Uso comercial o redistribucion prohibidos sin autorizacion.
=====================================================================
"""
import json
import os
import uuid
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from flask import (
    Flask, jsonify, render_template, request,
    session, send_from_directory, abort
)
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

import db
from config import BASE_DIR, SECRET_KEY, PUERTO


class JsonLigero:
    """Traduce los tipos de MySQL a JSON (fechas, horas, decimales)."""

    @staticmethod
    def normalizar(obj):
        if isinstance(obj, datetime):
            return obj.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        if isinstance(obj, time):
            return obj.strftime("%H:%M:%S")
        if isinstance(obj, timedelta):
            total = int(obj.total_seconds())
            signo = "-" if total < 0 else ""
            total = abs(total)
            return "%s%02d:%02d:%02d" % (
                signo, total // 3600, (total % 3600) // 60, total % 60
            )
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (bytes, bytearray)):
            return obj.decode("utf-8", "replace")
        raise TypeError(
            "Object of type %s is not JSON serializable" % type(obj).__name__
        )


app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    template_folder=os.path.join(BASE_DIR, "templates"),
)
app.secret_key = SECRET_KEY
app.config["JSON_SORT_KEYS"] = False


class ProveedorJson(app.json.__class__):
    """Proveedor de JSON de Flask con los tipos de MySQL soportados."""

    @staticmethod
    def default(obj):
        return JsonLigero.normalizar(obj)


app.json = ProveedorJson(app)

UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

CLAVES_MODULO = {
    "liga", "pubs", "museo", "noticias", "anuncios",
    "alianzas", "redes", "equipo", "donacion",
}

# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------


def _json_col(texto, por_defecto):
    """Convierte una columna JSON de MySQL a lista de Python."""
    if not texto:
        return por_defecto
    try:
        return json.loads(texto)
    except (ValueError, TypeError):
        return por_defecto


def _a_lista(valor):
    """Recibe texto del formulario o JSON y devuelve siempre una lista."""
    if valor is None or valor == "":
        return []
    if isinstance(valor, list):
        return valor
    try:
        datos = json.loads(valor)
        return datos if isinstance(datos, list) else [datos]
    except ValueError:
        return [{"nombre": valor}]


def _admin_necesario():
    """Verifica la sesion de administrador."""
    return session.get("admin") is True


def _bloqueado():
    """Devuelve 401 si no hay sesion admin."""
    if _admin_necesario():
        return None
    return jsonify({"ok": False, "error": "Necesitas iniciar sesion"}), 401


def _cuerpo():
    """Lee el cuerpo de la peticion (JSON o formulario)."""
    if request.is_json:
        return request.get_json(silent=True) or {}
    return request.form.to_dict(flat=True)


POSICIONES = ("GK", "Mid", "Dfwd", "Fwd")
POSICIONES_VIEJAS = {
    "portero": "GK", "arquero": "GK", "gk": "GK",
    "titular": "Mid", "mediocampo": "Mid", "centrocampista": "Mid", "mid": "Mid",
    "defensa": "Dfwd", "defensor": "Dfwd", "dfwd": "Dfwd",
    "delantero": "Fwd", "fwd": "Fwd", "suplente": "Mid",
}
COLOR_DEFECTO = "#0AFFD6"


def _color(valor):
    """Valida un color hex corto. Devuelve uno de defecto si no lo es."""
    texto = (valor or "").strip().upper()
    if len(texto) in (4, 7) and texto.startswith("#") \
            and all(c in "0123456789ABCDEF" for c in texto[1:]):
        return texto
    return COLOR_DEFECTO


def _posicion(valor):
    """Valida la posicion del jugador (GK, Mid, Dfwd, Fwd)."""
    texto = (valor or "").strip().lower()
    return POSICIONES_VIEJAS.get(texto, _a_posicion(texto))


def _a_posicion(texto):
    for p in POSICIONES:
        if texto == p.lower():
            return p
    return "Mid"


def _dorsal(valor):
    """Dorsal de maximo 2 caracteres (numeros o letra)."""
    texto = (valor or "").strip()
    return texto[:2] if texto else None


def _subir_escudo():
    """Guarda el escudo subido y devuelve la ruta publica (o '')."""
    archivo = request.files.get("escudo")
    if not archivo or not archivo.filename:
        return ""
    ext = os.path.splitext(secure_filename(archivo.filename))[1].lower()
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"):
        return ""
    nombre = "%s%s" % (uuid.uuid4().hex[:12], ext)
    archivo.save(os.path.join(UPLOAD_DIR, nombre))
    return "uploads/%s" % nombre


# --------------------------------------------------------------------------
# Paginas
# --------------------------------------------------------------------------


@app.route("/")
def index():
    return render_template("inicio.html")


@app.route("/liga")
def liga():
    return render_template("liga.html")


@app.route("/estadisticas")
def estadisticas():
    return render_template("estadisticas.html")


@app.route("/redes")
def redes():
    return render_template("redes.html")


@app.route("/equipo")
def equipo():
    return render_template("equipo.html")


@app.route("/donacion")
def donacion():
    return render_template("donacion.html")


@app.route("/shop")
def shop():
    return render_template("shop.html")


@app.route("/equipos/<int:equipo_id>")
def equipo_detalle(equipo_id):
    equipo = db.consultar_uno(
        "SELECT id, nombre, sigla, division, escudo FROM equipos WHERE id = %s",
        (equipo_id,)
    )
    if not equipo:
        abort(404)
    return render_template("equipo_detalle.html", equipo=equipo)


@app.route("/admin")
def admin():
    if not _admin_necesario():
        return render_template("login.html")
    return render_template("admin.html")


@app.route("/uploads/<path:nombre>")
def uploads(nombre):
    return send_from_directory(UPLOAD_DIR, nombre)


# --------------------------------------------------------------------------
# API publica
# --------------------------------------------------------------------------


@app.get("/api/sitio")
def api_sitio():
    """Todo el contenido publico de la pagina en una sola llamada."""
    modulos = db.consultar(
        "SELECT clave, nombre, titulo, subtitulo, orden, activo"
        " FROM modulos WHERE activo = 1 ORDER BY orden ASC"
    )

    contenidos = db.consultar(
        "SELECT id, modulo, titulo, subtitulo, texto, enlace, imagen,"
        " dato_extra, categoria, fecha, orden"
        " FROM contenidos WHERE visible = 1"
        " ORDER BY modulo ASC, orden ASC, id DESC"
    )

    por_modulo = {clave: [] for clave in CLAVES_MODULO}
    for item in contenidos:
        por_modulo.setdefault(item["modulo"], []).append(item)

    equipos = db.consultar("SELECT * FROM equipos ORDER BY nombre ASC")

    jugadores = db.consultar(
        "SELECT j.*, e.sigla AS equipo_sigla, e.nombre AS equipo_nombre,"
        " e.color AS equipo_color"
        " FROM jugadores j JOIN equipos e ON e.id = j.equipo_id"
        " ORDER BY e.nombre ASC, j.dorsal IS NULL, j.dorsal ASC"
    )
    por_equipo = {}
    for j in jugadores:
        por_equipo.setdefault(j["equipo_id"], []).append(j)
    for equipo in equipos:
        equipo["jugadores"] = por_equipo.get(equipo["id"], [])

    fechas = db.consultar(
        "SELECT f.*, a.nombre AS equipo_a, a.sigla AS sigla_a, a.escudo AS escudo_a,"
        "       a.color AS color_a, a.division AS division_a,"
        "       b.nombre AS equipo_b, b.sigla AS sigla_b, b.escudo AS escudo_b,"
        "       b.color AS color_b, b.division AS division_b,"
        "       r.goles_a, r.goles_b, r.goleadores, r.asistencias,"
        "       r.portero_a, r.portero_b, r.cs_a, r.cs_b, r.minutos_cs,"
        "       (r.id IS NOT NULL) AS jugado"
        " FROM fechas f"
        " JOIN equipos a ON a.id = f.equipo_a_id"
        " JOIN equipos b ON b.id = f.equipo_b_id"
        " LEFT JOIN resultados r ON r.fecha_id = f.id"
        " ORDER BY f.fecha ASC, f.hora ASC"
    )
    for f in fechas:
        f["goleadores"] = _json_col(f.get("goleadores"), [])
        f["asistencias"] = _json_col(f.get("asistencias"), [])
        if f["jugado"]:
            f["jugado"] = bool(f["jugado"])

    ideales = db.consultar(
        "SELECT i.id, i.jornada, i.division, i.posicion, i.orden,"
        " j.id AS jugador_id, j.nombre AS jugador, j.dorsal,"
        " e.id AS equipo_id, e.nombre AS equipo, e.sigla AS equipo_sigla,"
        " e.color AS equipo_color, e.escudo AS equipo_escudo"
        " FROM ideales i"
        " JOIN jugadores j ON j.id = i.jugador_id"
        " JOIN equipos e ON e.id = j.equipo_id"
        " ORDER BY i.jornada ASC, i.division ASC, i.orden ASC"
    )

    return jsonify({
        "ok": True,
        "modulos": modulos,
        "contenidos": por_modulo,
        "equipos": equipos,
        "fechas": fechas,
        "ideales": ideales,
        "foro": db.consultar(
            "SELECT id, nombre, mensaje, fecha FROM foro ORDER BY id DESC LIMIT 60"
        ),
    })


@app.post("/api/foro")
def api_crear_foro():
    """Publica un mensaje en el foro de sugerencias."""
    datos = _cuerpo()
    nombre = (datos.get("nombre") or "").strip()[:60]
    mensaje = (datos.get("mensaje") or "").strip()[:1000]

    if not nombre or not mensaje:
        return jsonify({"ok": False, "error": "Escribe tu nombre y el mensaje"}), 400

    ejecuto = db.ejecutar(
        "INSERT INTO foro (nombre, mensaje) VALUES (%s, %s)", (nombre, mensaje)
    )
    if not ejecuto:
        return jsonify({"ok": False, "error": "No se pudo publicar"}), 500

    nuevo = db.consultar_uno(
        "SELECT id, nombre, mensaje, fecha FROM foro ORDER BY id DESC LIMIT 1"
    )
    return jsonify({"ok": True, "mensaje": nuevo}), 201


# --------------------------------------------------------------------------
# Autenticacion
# --------------------------------------------------------------------------


@app.post("/api/login")
def api_login():
    datos = _cuerpo()
    usuario = (datos.get("usuario") or "").strip()
    clave = datos.get("clave") or ""

    fila = db.consultar_uno(
        "SELECT * FROM usuarios WHERE usuario = %s", (usuario,)
    )
    if not fila or not check_password_hash(fila["clave"], clave):
        return jsonify({"ok": False, "error": "Usuario o clave incorrectos"}), 401

    session["admin"] = True
    session["nombre"] = fila["nombre"]
    session["rol"] = fila["rol"]
    return jsonify({"ok": True, "nombre": fila["nombre"], "rol": fila["rol"]})


@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/sesion")
def api_sesion():
    return jsonify({
        "ok": True,
        "autenticado": _admin_necesario(),
        "nombre": session.get("nombre"),
        "rol": session.get("rol"),
    })


# --------------------------------------------------------------------------
# Admin - equipos y jugadores
# --------------------------------------------------------------------------


@app.get("/api/admin/equipos")
def admin_equipos():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    equipos = db.consultar("SELECT * FROM equipos ORDER BY nombre ASC")
    jugadores = db.consultar(
        "SELECT * FROM jugadores ORDER BY dorsal IS NULL, dorsal ASC"
    )
    por_equipo = {}
    for j in jugadores:
        por_equipo.setdefault(j["equipo_id"], []).append(j)
    for e in equipos:
        e["jugadores"] = por_equipo.get(e["id"], [])
    return jsonify({"ok": True, "equipos": equipos})


@app.post("/api/admin/equipos")
def admin_crear_equipo():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    nombre = (datos.get("nombre") or "").strip()
    sigla = (datos.get("sigla") or "").strip().upper()
    if not nombre or not sigla:
        return jsonify({"ok": False, "error": "Nombre y sigla son obligatorios"}), 400

    nuevo_id = db.insertar(
        "INSERT INTO equipos (nombre, sigla, division, color, escudo, entrenador,"
        " fundado, ciudad)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (
            nombre, sigla,
            (datos.get("division") or "D1").strip(),
            _color(datos.get("color")),
            _subir_escudo(),
            (datos.get("entrenador") or "").strip(),
            datos.get("fundado") or None,
            (datos.get("ciudad") or "").strip(),
        ),
    )
    equipo = db.consultar_uno("SELECT * FROM equipos WHERE id = %s", (nuevo_id,))
    return jsonify({"ok": True, "equipo": equipo}), 201


@app.put("/api/admin/equipos/<int:equipo_id>")
def admin_editar_equipo(equipo_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    actual = db.consultar_uno("SELECT escudo FROM equipos WHERE id = %s",
                              (equipo_id,))
    escudo = _subir_escudo() or (actual["escudo"] if actual else "")
    db.ejecutar(
        "UPDATE equipos SET nombre=%s, sigla=%s, division=%s, color=%s, escudo=%s,"
        " entrenador=%s, fundado=%s, ciudad=%s WHERE id=%s",
        (
            (datos.get("nombre") or "").strip(),
            (datos.get("sigla") or "").strip().upper(),
            (datos.get("division") or "D1").strip(),
            _color(datos.get("color")),
            escudo,
            (datos.get("entrenador") or "").strip(),
            datos.get("fundado") or None,
            (datos.get("ciudad") or "").strip(),
            equipo_id,
        ),
    )
    return jsonify({"ok": True, "equipo": db.consultar_uno(
        "SELECT * FROM equipos WHERE id=%s", (equipo_id,))})


@app.delete("/api/admin/equipos/<int:equipo_id>")
def admin_borrar_equipo(equipo_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM equipos WHERE id = %s", (equipo_id,))
    return jsonify({"ok": True})


@app.post("/api/admin/jugadores")
def admin_crear_jugador():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    equipo_id = datos.get("equipo_id")
    nombre = (datos.get("nombre") or "").strip()
    if not equipo_id or not nombre:
        return jsonify({"ok": False, "error": "Equipo y nombre son obligatorios"}), 400

    nuevo_id = db.insertar(
        "INSERT INTO jugadores (equipo_id, nombre, dorsal, posicion)"
        " VALUES (%s, %s, %s, %s)",
        (equipo_id, nombre, _dorsal(datos.get("dorsal")),
         _posicion(datos.get("posicion"))),
    )
    return jsonify({"ok": True, "jugador": db.consultar_uno(
        "SELECT * FROM jugadores WHERE id=%s", (nuevo_id,))}), 201


@app.put("/api/admin/jugadores/<int:jugador_id>")
def admin_editar_jugador(jugador_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    actual = db.consultar_uno(
        "SELECT * FROM jugadores WHERE id = %s", (jugador_id,)
    )
    if not actual:
        return jsonify({"ok": False, "error": "No existe"}), 404

    db.ejecutar(
        "UPDATE jugadores SET equipo_id=%s, nombre=%s, dorsal=%s, posicion=%s"
        " WHERE id=%s",
        (
            datos.get("equipo_id") or actual["equipo_id"],
            (datos.get("nombre") or actual["nombre"]).strip(),
            _dorsal(datos.get("dorsal")),
            _posicion(datos.get("posicion")),
            jugador_id,
        ),
    )
    return jsonify({"ok": True, "jugador": db.consultar_uno(
        "SELECT * FROM jugadores WHERE id=%s", (jugador_id,))})


@app.delete("/api/admin/jugadores/<int:jugador_id>")
def admin_borrar_jugador(jugador_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM jugadores WHERE id = %s", (jugador_id,))
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Admin - X5 ideal de cada jornada
# --------------------------------------------------------------------------


@app.get("/api/admin/ideales")
def admin_ideales():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    return jsonify({
        "ok": True,
        "ideales": db.consultar(
            "SELECT i.id, i.jornada, i.division, i.posicion, i.orden,"
            " j.id AS jugador_id, j.nombre AS jugador, j.dorsal,"
            " e.nombre AS equipo, e.sigla AS equipo_sigla, e.color AS equipo_color"
            " FROM ideales i"
            " JOIN jugadores j ON j.id = i.jugador_id"
            " JOIN equipos e ON e.id = j.equipo_id"
            " ORDER BY i.jornada DESC, i.division ASC, i.orden ASC"
        ),
        "jornadas": db.consultar(
            "SELECT DISTINCT jornada FROM fechas ORDER BY jornada DESC"
        ),
    })


@app.post("/api/admin/ideales")
def admin_guardar_ideal():
    """Guarda el cinco ideal de una jornada (5 jugadores de cualquier equipo)."""
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    jornada = (datos.get("jornada") or "").strip().upper()[:40]
    division = (datos.get("division") or "D1").strip().upper()
    slots = datos.get("slots") or []

    if not jornada:
        return jsonify({"ok": False, "error": "Escribe la jornada"}), 400
    if division not in ("D1", "D2"):
        return jsonify({"ok": False, "error": "Division invalida"}), 400

    limpios, ordenes, vistos = [], set(), set()
    for slot in slots[:5]:
        jugador_id = slot.get("jugador_id")
        try:
            jugador_id = int(jugador_id)
        except (TypeError, ValueError):
            continue
        if jugador_id in vistos:
            return jsonify({"ok": False,
                            "error": "Un jugador no puede repetirse en el cinco ideal"}), 400
        if not db.consultar_uno("SELECT id FROM jugadores WHERE id = %s",
                                (jugador_id,)):
            return jsonify({"ok": False,
                            "error": "El jugador %s no existe" % jugador_id}), 400
        orden = entero_orden(slot.get("orden"), len(limpios) + 1)
        orden = min(max(orden, 1), 5)
        if orden in ordenes:
            orden = len(limpios) + 1
        ordenes.add(orden)
        vistos.add(jugador_id)
        limpios.append((jornada, division, jugador_id,
                        _posicion(slot.get("posicion")), orden))

    if len(limpios) > 5:
        return jsonify({"ok": False, "error": "El cinco ideal son 5 jugadores"}), 400

    db.ejecutar(
        "DELETE FROM ideales WHERE jornada = %s AND division = %s",
        (jornada, division),
    )
    if limpios:
        db.ejecutar_varios(
            "INSERT INTO ideales (jornada, division, jugador_id, posicion, orden)"
            " VALUES (%s, %s, %s, %s, %s)",
            limpios,
        )
    return jsonify({"ok": True, "guardados": len(limpios)})


@app.delete("/api/admin/ideales")
def admin_borrar_ideal():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    jornada = (request.args.get("jornada") or "").strip()
    division = (request.args.get("division") or "").strip()
    if not jornada or not division:
        return jsonify({"ok": False, "error": "Faltan jornada o division"}), 400
    db.ejecutar(
        "DELETE FROM ideales WHERE jornada = %s AND division = %s",
        (jornada, division),
    )
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Admin - fechas y resultados
# --------------------------------------------------------------------------


@app.get("/api/admin/fechas")
def admin_fechas():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    return jsonify({"ok": True, "fechas": db.consultar(
        "SELECT f.*, a.sigla AS sigla_a, b.sigla AS sigla_b,"
        " r.goles_a, r.goles_b, r.goleadores, r.asistencias,"
        " r.cs_a, r.cs_b, r.portero_a, r.portero_b,"
        " r.minutos_cs_a, r.minutos_cs_b"
        " FROM fechas f"
        " JOIN equipos a ON a.id=f.equipo_a_id"
        " JOIN equipos b ON b.id=f.equipo_b_id"
        " LEFT JOIN resultados r ON r.fecha_id=f.id"
        " ORDER BY f.fecha DESC, f.hora DESC")})


def _division_equipo(equipo_id):
    """Devuelve la division (D1/D2) de un equipo o None si no existe."""
    fila = db.consultar_uno("SELECT division FROM equipos WHERE id = %s", (equipo_id,))
    return fila["division"] if fila else None


def _misma_division(equipo_a, equipo_b):
    """Valida que ambos equipos existan y sean de la misma division."""
    div_a = _division_equipo(equipo_a)
    div_b = _division_equipo(equipo_b)
    if not div_a or not div_b:
        return "Uno de los equipos no existe"
    if div_a != div_b:
        return "No esta permitido programar un partido entre Division %s y Division %s" % (div_a, div_b)
    return None


@app.post("/api/admin/fechas")
def admin_crear_fecha():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    equipo_a, equipo_b = datos.get("equipo_a_id"), datos.get("equipo_b_id")
    fecha = (datos.get("fecha") or "").strip()
    if not equipo_a or not equipo_b or not fecha:
        return jsonify({"ok": False, "error": "Equipos y fecha son obligatorios"}), 400
    if str(equipo_a) == str(equipo_b):
        return jsonify({"ok": False, "error": "Un equipo no juega consigo mismo"}), 400
    error = _misma_division(equipo_a, equipo_b)
    if error:
        return jsonify({"ok": False, "error": error}), 400

    nuevo_id = db.insertar(
        "INSERT INTO fechas (equipo_a_id, equipo_b_id, fecha, hora, jornada, fase, sala)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            equipo_a, equipo_b, fecha,
            datos.get("hora") or None,
            (datos.get("jornada") or "JORNADA 1").strip(),
            (datos.get("fase") or "LIGA REGULAR").strip(),
            (datos.get("sala") or "").strip(),
        ),
    )
    return jsonify({"ok": True, "id": nuevo_id}), 201


@app.put("/api/admin/fechas/<int:fecha_id>")
def admin_editar_fecha(fecha_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    equipo_a, equipo_b = datos.get("equipo_a_id"), datos.get("equipo_b_id")
    if str(equipo_a) == str(equipo_b):
        return jsonify({"ok": False, "error": "Un equipo no juega consigo mismo"}), 400
    error = _misma_division(equipo_a, equipo_b)
    if error:
        return jsonify({"ok": False, "error": error}), 400

    db.ejecutar(
        "UPDATE fechas SET equipo_a_id=%s, equipo_b_id=%s, fecha=%s, hora=%s,"
        " jornada=%s, fase=%s, sala=%s WHERE id=%s",
        (
            datos.get("equipo_a_id"), datos.get("equipo_b_id"),
            (datos.get("fecha") or "").strip(), datos.get("hora") or None,
            (datos.get("jornada") or "JORNADA 1").strip(),
            (datos.get("fase") or "LIGA REGULAR").strip(),
            (datos.get("sala") or "").strip(),
            fecha_id,
        ),
    )
    return jsonify({"ok": True})


@app.delete("/api/admin/fechas/<int:fecha_id>")
def admin_borrar_fecha(fecha_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM fechas WHERE id = %s", (fecha_id,))
    return jsonify({"ok": True})


def _recalcular_stats():
    """Recalcula goles, asistencias y clean sheets de todos los jugadores
    a partir de los resultados guardados. Idempotente: se puede llamar
    cuantas veces se quiera sin duplicar datos."""
    filas = db.consultar(
        "SELECT goleadores, asistencias, portero_a, portero_b, cs_a, cs_b,"
        " minutos_cs_a, minutos_cs_b"
        " FROM resultados"
    )
    # Reinicia por completo para no arrastrar datos de jugadores
    # que ya no aportan en ningun resultado.
    db.ejecutar("UPDATE jugadores SET goles=0, asistencias=0, cs=0, minutos_cs=0")

    goles = {}
    asis = {}
    cs = {}
    minutos_cs = {}
    for r in filas:
        for g in _json_col(r.get("goleadores"), []):
            pid = g.get("jugador_id")
            if pid:
                goles[pid] = goles.get(pid, 0) + int(g.get("goles") or 1)
        for a in _json_col(r.get("asistencias"), []):
            pid = a.get("jugador_id")
            if pid:
                asis[pid] = asis.get(pid, 0) + int(a.get("asistencias") or 1)
        for lado, portero, col_min in (
                ("cs_a", "portero_a", "minutos_cs_a"),
                ("cs_b", "portero_b", "minutos_cs_b")):
            if r.get(lado) and r.get(portero):
                try:
                    pid = int(r[portero])
                except (TypeError, ValueError):
                    continue
                cs[pid] = cs.get(pid, 0) + 1
                minutos_cs[pid] = minutos_cs.get(pid, 0) + int(r.get(col_min) or 0)

    for pid in set(goles) | set(asis) | set(cs):
        db.ejecutar(
            "UPDATE jugadores SET goles=%s, asistencias=%s, cs=%s, minutos_cs=%s"
            " WHERE id=%s",
            (goles.get(pid, 0), asis.get(pid, 0), cs.get(pid, 0),
             minutos_cs.get(pid, 0), pid),
        )


@app.put("/api/admin/resultados/<int:fecha_id>")
def admin_guardar_resultado(fecha_id):
    """Guarda marcador, goleadores, asistencias y clean sheets por jugador."""
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    fecha = db.consultar_uno(
        "SELECT f.*, a.division AS div_a, b.division AS div_b"
        " FROM fechas f"
        " JOIN equipos a ON a.id = f.equipo_a_id"
        " JOIN equipos b ON b.id = f.equipo_b_id"
        " WHERE f.id = %s", (fecha_id,)
    )
    if not fecha:
        return jsonify({"ok": False, "error": "La fecha no existe"}), 404

    def entero(valor, defecto=0):
        try:
            return int(valor)
        except (TypeError, ValueError):
            return defecto

    def jugador_valido(jugador_id, equipo_id):
        """Devuelve el id en texto si el jugador pertenece al equipo, o ''."""
        if not jugador_id:
            return ""
        fila = db.consultar_uno(
            "SELECT id FROM jugadores WHERE id = %s AND equipo_id = %s",
            (jugador_id, equipo_id),
        )
        return str(fila["id"]) if fila else ""

    equipo_a_id, equipo_b_id = fecha["equipo_a_id"], fecha["equipo_b_id"]
    goles_a = entero(datos.get("goles_a"))
    goles_b = entero(datos.get("goles_b"))
    # Minutos de porteria en cero de cada arquero. 0 = no cerco el arco.
    minutos_cs_a = max(entero(datos.get("minutos_cs_a")), 0)
    minutos_cs_b = max(entero(datos.get("minutos_cs_b")), 0)

    def jugadores_lista(campo, col_extra):
        """Une jugador_id ↔ equipo y normaliza la lista de goles/asistencias."""
        salida = []
        for item in _a_lista(datos.get(campo)):
            lado = "b" if str(item.get("equipo")) == "b" else "a"
            equipo_id = equipo_b_id if lado == "b" else equipo_a_id
            nombre = (item.get("nombre") or "").strip()
            jugador_id = jugador_valido(item.get("jugador_id"), equipo_id)
            if not jugador_id and nombre:
                mat = db.consultar_uno(
                    "SELECT id FROM jugadores WHERE nombre = %s AND equipo_id = %s LIMIT 1",
                    (nombre, equipo_id),
                )
                jugador_id = str(mat["id"]) if mat else ""
            if not jugador_id:
                continue
            valor = max(entero(item.get(col_extra), 1), 1)
            salida.append({
                "jugador_id": int(jugador_id),
                "nombre": nombre,
                "equipo": lado,
                col_extra: valor,
            })
        return salida

    goleadores = jugadores_lista("goleadores", "goles")
    asistencias = jugadores_lista("asistencias", "asistencias")

    portero_a = jugador_valido(datos.get("arquero_a_id"), equipo_a_id)
    portero_b = jugador_valido(datos.get("arquero_b_id"), equipo_b_id)
    cs_a = 1 if goles_b == 0 and minutos_cs_a > 0 and portero_a else 0
    cs_b = 1 if goles_a == 0 and minutos_cs_b > 0 and portero_b else 0

    db.ejecutar(
        "INSERT INTO resultados (fecha_id, goles_a, goles_b, goleadores, asistencias,"
        " portero_a, portero_b, cs_a, cs_b, minutos_cs, minutos_cs_a, minutos_cs_b)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        " ON DUPLICATE KEY UPDATE goles_a=VALUES(goles_a), goles_b=VALUES(goles_b),"
        " goleadores=VALUES(goleadores), asistencias=VALUES(asistencias),"
        " portero_a=VALUES(portero_a), portero_b=VALUES(portero_b),"
        " cs_a=VALUES(cs_a), cs_b=VALUES(cs_b),"
        " minutos_cs=VALUES(minutos_cs),"
        " minutos_cs_a=VALUES(minutos_cs_a), minutos_cs_b=VALUES(minutos_cs_b)",
        (
            fecha_id,
            goles_a, goles_b,
            json.dumps(goleadores, ensure_ascii=False),
            json.dumps(asistencias, ensure_ascii=False),
            portero_a, portero_b, cs_a, cs_b,
            max(minutos_cs_a, minutos_cs_b),
            minutos_cs_a, minutos_cs_b,
        ),
    )
    _recalcular_stats()
    return jsonify({"ok": True})


@app.delete("/api/admin/resultados/<int:fecha_id>")
def admin_borrar_resultado(fecha_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM resultados WHERE fecha_id = %s", (fecha_id,))
    _recalcular_stats()
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Admin - contenidos (anuncios, museo, noticias, redes...)
# --------------------------------------------------------------------------


@app.get("/api/admin/contenidos")
def admin_contenidos():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    return jsonify({"ok": True, "contenidos": db.consultar(
        "SELECT * FROM contenidos ORDER BY modulo ASC, orden ASC, id DESC")})


@app.post("/api/admin/contenidos")
def admin_crear_contenido():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    modulo = (datos.get("modulo") or "").strip()
    titulo = (datos.get("titulo") or "").strip()
    if modulo not in CLAVES_MODULO or not titulo:
        return jsonify({"ok": False, "error": "Modulo y titulo son obligatorios"}), 400

    siguiente = db.consultar_uno(
        "SELECT COALESCE(MAX(orden), 0) + 1 AS n FROM contenidos WHERE modulo = %s",
        (modulo,),
    )["n"]

    nuevo_id = db.insertar(
        "INSERT INTO contenidos (modulo, titulo, subtitulo, texto, enlace, imagen,"
        " dato_extra, categoria, fecha, orden, visible)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (
            modulo, titulo,
            (datos.get("subtitulo") or "").strip(),
            (datos.get("texto") or "").strip(),
            (datos.get("enlace") or "").strip(),
            (datos.get("imagen") or "").strip(),
            (datos.get("dato_extra") or "").strip(),
            (datos.get("categoria") or "").strip(),
            datos.get("fecha") or None,
            entero_orden(datos.get("orden"), siguiente),
            0 if str(datos.get("visible")) == "0" else 1,
        ),
    )
    return jsonify({"ok": True, "id": nuevo_id}), 201


@app.put("/api/admin/contenidos/<int:contenido_id>")
def admin_editar_contenido(contenido_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    actual = db.consultar_uno(
        "SELECT orden FROM contenidos WHERE id = %s", (contenido_id,)
    )
    if not actual:
        return jsonify({"ok": False, "error": "No existe"}), 404

    db.ejecutar(
        "UPDATE contenidos SET modulo=%s, titulo=%s, subtitulo=%s, texto=%s,"
        " enlace=%s, imagen=%s, dato_extra=%s, categoria=%s, fecha=%s,"
        " orden=%s, visible=%s WHERE id=%s",
        (
            (datos.get("modulo") or "").strip(),
            (datos.get("titulo") or "").strip(),
            (datos.get("subtitulo") or "").strip(),
            (datos.get("texto") or "").strip(),
            (datos.get("enlace") or "").strip(),
            (datos.get("imagen") or "").strip(),
            (datos.get("dato_extra") or "").strip(),
            (datos.get("categoria") or "").strip(),
            datos.get("fecha") or None,
            entero_orden(datos.get("orden"), actual["orden"]),
            0 if str(datos.get("visible")) == "0" else 1,
            contenido_id,
        ),
    )
    return jsonify({"ok": True})


@app.delete("/api/admin/contenidos/<int:contenido_id>")
def admin_borrar_contenido(contenido_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM contenidos WHERE id = %s", (contenido_id,))
    return jsonify({"ok": True})


def entero_orden(valor, defecto):
    """Convierte a entero devolviendo el defecto si no es valido."""
    try:
        return int(valor)
    except (TypeError, ValueError):
        return defecto


# --------------------------------------------------------------------------
# Admin - modulos del header y foro
# --------------------------------------------------------------------------


@app.get("/api/admin/modulos")
def admin_modulos():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    return jsonify({"ok": True, "modulos": db.consultar(
        "SELECT * FROM modulos ORDER BY orden ASC")})


@app.put("/api/admin/modulos/<int:modulo_id>")
def admin_editar_modulo(modulo_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    actual = db.consultar_uno("SELECT * FROM modulos WHERE id = %s", (modulo_id,))
    if not actual:
        return jsonify({"ok": False, "error": "No existe"}), 404

    db.ejecutar(
        "UPDATE modulos SET nombre=%s, titulo=%s, subtitulo=%s, orden=%s, activo=%s"
        " WHERE id=%s",
        (
            (datos.get("nombre") or actual["nombre"]).strip(),
            (datos.get("titulo") or actual["titulo"]).strip(),
            (datos.get("subtitulo") or "").strip(),
            entero_orden(datos.get("orden"), actual["orden"]),
            0 if str(datos.get("activo")) == "0" else 1,
            modulo_id,
        ),
    )
    return jsonify({"ok": True})


@app.get("/api/admin/foro")
def admin_foro():
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    return jsonify({"ok": True, "foro": db.consultar(
        "SELECT * FROM foro ORDER BY id DESC LIMIT 200")})


@app.delete("/api/admin/foro/<int:mensaje_id>")
def admin_borrar_foro(mensaje_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM foro WHERE id = %s", (mensaje_id,))
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Errores
# --------------------------------------------------------------------------


@app.errorhandler(404)
def error_404(_):
    return jsonify({"ok": False, "error": "Recurso no encontrado"}), 404


@app.errorhandler(500)
def error_500(_):
    return jsonify({"ok": False, "error": "Error interno del servidor"}), 500


if __name__ == "__main__":
    ok, mensaje = db.probar()
    print("=" * 60)
    print(" DIAMONDS LEAGUE - (c) Neptunzinho")
    print("=" * 60)
    print(" Base de datos: %s" % ("OK -> " + mensaje if ok else "ERROR -> " + mensaje))
    print(" Admin: usuario 'admin' / clave 'mascapito'")
    print("=" * 60)
    app.run(host="0.0.0.0", port=PUERTO, debug=True)