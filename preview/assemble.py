import base64
d='preview-dist/'
b=lambda f,m:'data:%s;base64,%s'%(m,base64.b64encode(open(d+f,'rb').read()).decode())
js=open(d+'p.js',encoding='utf-8').read(); css=open(d+'tanstack_start_ts.css',encoding='utf-8').read()
L=b('logo.png','image/png'); B=b('banner.jpg','image/jpeg')
js=js.replace('/logo.png',L).replace('/banner.jpg',B).replace('</script','<\\/script'); css=css.replace('/logo.png',L).replace('/banner.jpg',B)
html=f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>ليل الأمسيات | معاينة</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet"><style>{css}</style></head><body><div id="root"></div><div style="position:fixed;bottom:0;left:0;z-index:99;font:10px sans-serif;background:#D4AF37;color:#000;padding:2px 8px;opacity:.85">معاينة · بيانات تجريبية في الذاكرة</div><script>{js}</script></body></html>'''
open('/home/claude/preview.html','w',encoding='utf-8').write(html)
