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
    return render_template("index.html")


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
        "SELECT j.*, e.sigla AS equipo_sigla, e.nombre AS equipo_nombre"
        " FROM jugadores j JOIN equipos e ON e.id = j.equipo_id"
        " ORDER BY e.nombre ASC, j.numero IS NULL, j.numero ASC"
    )
    por_equipo = {}
    for j in jugadores:
        por_equipo.setdefault(j["equipo_id"], []).append(j)
    for equipo in equipos:
        equipo["jugadores"] = por_equipo.get(equipo["id"], [])

    fechas = db.consultar(
        "SELECT f.*, a.nombre AS equipo_a, a.sigla AS sigla_a, a.escudo AS escudo_a,"
        "       b.nombre AS equipo_b, b.sigla AS sigla_b, b.escudo AS escudo_b,"
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

    return jsonify({
        "ok": True,
        "modulos": modulos,
        "contenidos": por_modulo,
        "equipos": equipos,
        "fechas": fechas,
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
    jugadores = db.consultar("SELECT * FROM jugadores ORDER BY numero IS NULL, numero ASC")
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

    nuevo_id = db.ejecutar(
        "INSERT INTO equipos (nombre, sigla, division, escudo, entrenador, fundado, ciudad)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            nombre, sigla,
            (datos.get("division") or "D1").strip(),
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
    escudo = _subir_escudo() or datos.get("escudo") or ""
    db.ejecutar(
        "UPDATE equipos SET nombre=%s, sigla=%s, division=%s, escudo=%s,"
        " entrenador=%s, fundado=%s, ciudad=%s WHERE id=%s",
        (
            (datos.get("nombre") or "").strip(),
            (datos.get("sigla") or "").strip().upper(),
            (datos.get("division") or "D1").strip(),
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

    nuevo_id = db.ejecutar(
        "INSERT INTO jugadores (equipo_id, nombre, numero, posicion)"
        " VALUES (%s, %s, %s, %s)",
        (equipo_id, nombre, datos.get("numero") or None,
         (datos.get("posicion") or "Titular").strip()),
    )
    return jsonify({"ok": True, "jugador": db.consultar_uno(
        "SELECT * FROM jugadores WHERE id=%s", (nuevo_id,))}), 201


@app.delete("/api/admin/jugadores/<int:jugador_id>")
def admin_borrar_jugador(jugador_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM jugadores WHERE id = %s", (jugador_id,))
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
        " r.goles_a, r.goles_b, r.goleadores, r.asistencias, r.cs_a, r.cs_b"
        " FROM fechas f"
        " JOIN equipos a ON a.id=f.equipo_a_id"
        " JOIN equipos b ON b.id=f.equipo_b_id"
        " LEFT JOIN resultados r ON r.fecha_id=f.id"
        " ORDER BY f.fecha DESC, f.hora DESC")})


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

    nuevo_id = db.ejecutar(
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


@app.put("/api/admin/resultados/<int:fecha_id>")
def admin_guardar_resultado(fecha_id):
    """Guarda marcador, goleadores, asistencias y clean sheets."""
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo

    datos = _cuerpo()
    existe = db.consultar_uno("SELECT id FROM fechas WHERE id = %s", (fecha_id,))
    if not existe:
        return jsonify({"ok": False, "error": "La fecha no existe"}), 404

    def entero(valor, defecto=0):
        try:
            return int(valor)
        except (TypeError, ValueError):
            return defecto

    def clean_sheet(valor):
        if valor in (True, 1, "1", "on", "true", "True", "si", "SI"):
            return 1
        return min(max(entero(valor), 0), 99)

    db.ejecutar(
        "INSERT INTO resultados (fecha_id, goles_a, goles_b, goleadores, asistencias,"
        " portero_a, portero_b, cs_a, cs_b, minutos_cs)"
        " VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        " ON DUPLICATE KEY UPDATE goles_a=VALUES(goles_a), goles_b=VALUES(goles_b),"
        " goleadores=VALUES(goleadores), asistencias=VALUES(asistencias),"
        " portero_a=VALUES(portero_a), portero_b=VALUES(portero_b),"
        " cs_a=VALUES(cs_a), cs_b=VALUES(cs_b), minutos_cs=VALUES(minutos_cs)",
        (
            fecha_id,
            entero(datos.get("goles_a")), entero(datos.get("goles_b")),
            json.dumps(_a_lista(datos.get("goleadores")), ensure_ascii=False),
            json.dumps(_a_lista(datos.get("asistencias")), ensure_ascii=False),
            (datos.get("portero_a") or "").strip(),
            (datos.get("portero_b") or "").strip(),
            clean_sheet(datos.get("cs_a")),
            clean_sheet(datos.get("cs_b")),
            entero(datos.get("minutos_cs")),
        ),
    )
    return jsonify({"ok": True})


@app.delete("/api/admin/resultados/<int:fecha_id>")
def admin_borrar_resultado(fecha_id):
    bloqueo = _bloqueado()
    if bloqueo:
        return bloqueo
    db.ejecutar("DELETE FROM resultados WHERE fecha_id = %s", (fecha_id,))
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

    nuevo_id = db.ejecutar(
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