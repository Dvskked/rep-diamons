import re, json
with open('F:/proyec-diamons/static/data.js','r',encoding='utf-8',errors='ignore') as f:
    s=f.read()
idx=s.find('"jornada": "JORNADA 6"')
start=s.rfind('{',0,idx)
depth=0
end=start
for i in range(start, min(len(s), start+3000)):
    if s[i]=='{': depth+=1
    elif s[i]=='}':
        depth-=1
        if depth==0:
            end=i+1
            break
print(s[start:end])
