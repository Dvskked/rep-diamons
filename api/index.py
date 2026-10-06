# -*- coding: utf-8 -*-
"""
=====================================================================
 DIAMONDS LEAGUE - Punto de entrada para Vercel Serverless
 (c) 2026 Neptunzinho. Todos los derechos reservados.
=====================================================================
"""
import os
import sys

# Vercel despliega la raiz del proyecto fuera de /api, hay que anclarla.
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if RAIZ not in sys.path:
    sys.path.insert(0, RAIZ)

from app import app  # noqa: E402  (se importa despues de ajustar sys.path)

# WSGI expuesto al runtime de Vercel
application = app