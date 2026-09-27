import os
import sys
import json
import hashlib
import urllib.request
from concurrent.futures import ThreadPoolExecutor

urls = [
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119535/99051_heif_syorwn.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119535/99050_heif_xnd6g1.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119534/99045_heif_zhikee.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119534/99046_heif_e3zhvp.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119532/99044_heif_xotvpk.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119532/99041_heif_vsro33.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119532/99043_heif_hnjw4l.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119531/99042_heif_zcqlow.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119530/99103_heif_nuicgn.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119529/99101_heif_lkk5nw.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119529/99102_heif_fapyg5.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119527/99100_heif_koq1ih.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119526/99097_heif_zbanw9.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119527/99099_heif_joacsn.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119526/99098_heif_mzvlv5.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119524/99096_heif_o0pykd.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119524/99095_heif_y7rrkz.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119523/99094_heif_dgcfv8.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119522/99093_heif_peyatc.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119522/99091_heif_ex2xaw.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119521/99092_heif_lopswc.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119521/99089_heif_l32cib.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119520/99090_heif_ajzpbq.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119520/99087_heif_t32mvy.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119520/99088_heif_qbzo0a.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119517/99086_heif_mwrlup.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119516/99085_heif_nc0k1a.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119516/99082_heif_m5owou.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119516/99084_heif_uwtt3r.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119515/99083_heif_v5vzpv.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119515/99081_heif_pvxkzz.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119513/99080_heif_w7wdld.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119512/99079_heif_x9nju4.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119512/99076_heif_ooufoz.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119511/99077_heif_lr0sad.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119510/99075_heif_rntpwv.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119509/99074_heif_h9d3c7.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119509/99073_heif_ody0tj.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119508/99072_heif_nqugyd.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119507/99071_heif_fx5fml.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119506/99070_heif_zkuuvv.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119505/99069_heif_gxuhtl.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119505/99068_heif_pzznvg.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119505/99067_heif_yz8i1a.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119503/99065_heif_fqewtb.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119502/99064_heif_zc4epk.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119502/99062_heif_bazvwk.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119502/99063_heif_aswdy4.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119501/99061_heif_h7sfxd.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119501/99059_heif_t9uuyz.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119500/99060_heif_ky9p9b.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119499/99058_heif_is6d89.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119497/99057_heif_mssbdo.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119496/99054_heif_qckgd3.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119496/99056_heif_utlydd.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119497/99055_heif_snjxo2.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119494/99053_heif_pehebq.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119494/99052_heif_dyy5go.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119478/99060_heif_dcr2ly.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119475/99059_heif_lpscnx.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119473/99058_heif_hdjnq6.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119472/99055_heif_zu5dw8.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119471/99057_heif_ihq23r.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119471/99054_heif_ajtsvo.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119470/99056_heif_vxxscj.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119469/99053_heif_g4euqy.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119468/99052_heif_yw3rjc.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119454/99052_heif_d1cg0n.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790117655/99041_heif_1_ylunw3.webp',
  'https://res.cloudinary.com/lvl0nq3r/image/upload/v1790117570/99103_heif_1_cwnu80.webp'
]

os.makedirs('/tmp/cauan_images', exist_ok=True)

def download(item):
    idx, url = item
    fn = f"/tmp/cauan_images/img_{idx:02d}.webp"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            sha = hashlib.sha256(data).hexdigest()
            with open(fn, 'wb') as f:
                f.write(data)
            return {'index': idx, 'url': url, 'size': len(data), 'sha': sha, 'path': fn, 'status': 'ok'}
    except Exception as e:
        return {'index': idx, 'url': url, 'status': f'failed: {str(e)}'}

with ThreadPoolExecutor(max_workers=10) as ex:
    results = list(ex.map(download, enumerate(urls)))

print(f"Downloaded {len(results)} images.")
fails = [r for r in results if r['status'] != 'ok']
print(f"Failed count: {len(fails)}")

# Check for duplicates by SHA256
sha_map = {}
duplicates = []
unique_items = []
for r in results:
    if r['status'] == 'ok':
        sha = r['sha']
        if sha in sha_map:
            duplicates.append({'duplicate_url': r['url'], 'original_url': sha_map[sha]['url'], 'sha': sha})
        else:
            sha_map[sha] = r
            unique_items.append(r)

print(f"Duplicates by exact content hash: {len(duplicates)}")
for d in duplicates:
    print(f"  Duplicate: {d['duplicate_url']} == {d['original_url']}")

print(f"Unique valid images: {len(unique_items)}")
with open('/tmp/cauan_images/manifest.json', 'w') as f:
    json.dump({'all': results, 'duplicates': duplicates, 'unique': unique_items}, f, indent=2)
