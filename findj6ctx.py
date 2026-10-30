s=open('F:/proyec-diamons/static/data.js',encoding='utf-8',errors='ignore').read()
idx=0
c=0
while True:
    idx=s.find('JORNADA 6',idx)
    if idx==-1: break
    print(repr(s[max(0,idx-60):idx+120]))
    print('===END===')
    c+=1
    idx+=1
    if c>=6: break
