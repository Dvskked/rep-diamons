# -*- coding: utf-8 -*-
"""Carga (idempotente) los metodos de donacion con sus logos.

Reemplaza el contenido del modulo 'donacion' por los cuatro metodos
solicitados usando las imagenes de static/assets.
"""
import db

METODOS = [
    {
        "titulo": "PayPal", "subtitulo": "PAYPAL", "imagen": "assets/paypal.png",
        "texto": "Envia tu aporte a nuestra cuenta y apoya a la liga.", "enlace": "",
    },
    {
        "titulo": "Nequi", "subtitulo": "NEQUI", "imagen": "assets/nequi.png",
        "texto": "Donaciones rapidas por Nequi desde Colombia.", "enlace": "",
    },
    {
        "titulo": "Banco de Venezuela", "subtitulo": "BANCO DE VENEZUELA",
        "imagen": "assets/bancovenezuela.png",
        "texto": "Transferencia o pago movil en bolivares.", "enlace": "",
    },
    {
        "titulo": "Western Union", "subtitulo": "WESTERN UNION",
        "imagen": "assets/westerunion.png",
        "texto": "Envio internacional de dinero desde tu pais.", "enlace": "",
    },
]


def main():
    db.ejecutar("DELETE FROM contenidos WHERE modulo = %s", ("donacion",))
    filas = [
        ("donacion", m["titulo"], m["subtitulo"], m["texto"], m["enlace"],
         m["imagen"], "donacion", i, 1)
        for i, m in enumerate(METODOS, start=1)
    ]
    db.ejecutar_varios(
        "INSERT INTO contenidos"
        " (modulo, titulo, subtitulo, texto, enlace, imagen, categoria, orden, visible)"
        " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        filas,
    )
    print("Metodos de donacion cargados:", len(METODOS))


if __name__ == "__main__":
    main()
