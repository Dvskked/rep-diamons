with open('F:/proyec-diamons/static/data.js','r',encoding='utf-8',errors='ignore') as f:
    s=f.read()
starts=[]
idx=0
while True:
    idx=s.find('"jornada": "JORNADA 6"', idx)
    if idx==-1: break
    starts.append(idx)
    idx+=1
for k,si in enumerate(starts):
    start=s.rfind('{',0,si)
    depth=0
    end=start
    for i in range(start,len(s)):
        if s[i]=='{': depth+=1
        elif s[i]=='}':
            depth-=1
            if depth==0:
                end=i+1
                break
    print('===SEP'+str(k)+'===')
    print(s[start:end])
    print()
