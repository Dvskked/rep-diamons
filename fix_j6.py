import json
import re

path = r'F:\proyec-diamons\static\data.js'
with open(path, encoding='utf-8') as f:
    content = f.read()

# Find SITIO object
start = content.find('window.SITIO')
brace = content.find('{', start)
depth = 0
for i in range(brace, len(content)):
    if content[i] == '{':
        depth += 1
    elif content[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break

obj = json.loads(content[brace:end])
partidos = obj['contenidos']['liga']

# Find Jornada 6 D1 matches
j6_matches = []
for p in partidos:
    if p.get('jornada') == 'JORNADA 6' and p.get('division_a') == 'D1':
        j6_matches.append(p)
        print(f"Found J6 D1: id={p['id']} {p['equipo_a']} vs {p['equipo_b']} (jugado={p.get('jugado')})")
