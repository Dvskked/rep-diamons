path = r'F:\proyec-diamons\static\data.js'
with open(path, encoding='utf-8') as f:
    content = f.read()
start = content.find('window.SITIO')
brace = content.find('{', start)
depth = 0
end = -1
for i in range(brace, len(content)):
    if content[i] == '{':
        depth += 1
    elif content[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
print('end=' + str(end))
