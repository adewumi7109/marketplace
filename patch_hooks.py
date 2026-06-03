from pathlib import Path

path = Path(r'c:\Users\user\Desktop\Projects\marketplace-frontend\lib\hooks.ts')
text = path.read_text(encoding='utf-8')
old = '''  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.storeId) query.set("storeId", params.storeId);
  if (params?.search) query.set("search", params.search);
  if (params?.city) query.set("city", params.city);
'''
new = '''  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.storeId) query.set("storeId", params.storeId);
  if (params?.locationId) query.set("locationId", params.locationId);
  if (params?.search) query.set("search", params.search);
  if (params?.city) query.set("city", params.city);
'''
if old not in text:
    raise SystemExit('Pattern not found in hooks.ts')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('patched hooks.ts')
