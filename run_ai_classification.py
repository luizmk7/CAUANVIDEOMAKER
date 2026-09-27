import os
import sys
import json
import base64
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

with open('/tmp/cauan_images/manifest.json') as f:
    manifest = json.load(f)

unique_items = manifest['unique']
print(f"Total unique images to classify: {len(unique_items)}")

api_key = os.environ.get('GEMINI_API_KEY')
api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"

os.makedirs('/tmp/cauan_thumbs', exist_ok=True)

SYSTEM_PROMPT = """Você é um especialista em classificação visual de fotos profissionais para um fotógrafo e videomaker (Cauan).
Sua tarefa é analisar a imagem fornecida e classificá-la estritamente em UMA das 4 categorias:
1. "casamentos":
- Noivos, noiva ou noivo;
- Vestido de noiva / casamento;
- Alianças;
- Buquê de flores de noiva;
- Cerimônia matrimonial (igreja, ar livre, altar);
- Entrada da noiva;
- Votos;
- Decoração ou recepção claramente identificada como casamento;
- Festa de casamento.

2. "formaturas":
- Pessoas usando toga ou beca;
- Capelo;
- Canudo / Diploma de formatura;
- Colação de grau;
- Palco de formatura;
- Cerimônia de graduação;
- Ensaios de formandos / fotos de formandos com beca ou traje solene;
- Homenagens relacionadas à conclusão de curso.

3. "aniversarios":
- Bolo de aniversário;
- Velas acesas ou apagadas;
- Balões, bexigas ou decoração claramente de aniversário;
- Pessoa comemorando aniversário (15 anos, infantil, adulto);
- Festa infantil ou adulta com sinais claros de aniversário;
- Mesa de bolo ou decoração temática de aniversário.

4. "eventos":
- Shows musicais;
- Palcos e bandas / DJs;
- Apresentações teatrais, conferências ou corporativo;
- Festas genéricas, boates, baladas, pista de dança;
- Eventos corporativos;
- Festivais;
- Público, iluminação cênica e celebrações sem evidência clara de casamento, formatura ou aniversário.

PRIORIDADE:
Dê prioridade às categorias específicas (se tiver noivos/vestido de noiva = casamentos; se tiver beca/capelo/toga/diploma = formaturas; se tiver bolo/velas/balões/aniversário = aniversarios; caso contrário ou se for show/palco/festa genérica = eventos).

Responda APENAS em JSON no seguinte formato:
{
  "category": "formaturas" | "eventos" | "aniversarios" | "casamentos",
  "confidence": 0.95,
  "visual_description": "Breve descrição do que você vê na imagem",
  "title": "Título elegante e profissional em português para o card (máx 5 palavras)",
  "kicker": "Subtítulo / categoria editorial (máx 3 palavras, ex: Colação & Becas, Cerimônia & Amor, Palco & Luz, Encontros & Afeto)",
  "caption": "Legenda curta e poética para o modal (1 frase)",
  "alt": "Texto alternativo acessível e descritivo em português"
}
"""

def process_item(item):
    idx = item['index']
    orig_path = item['path']
    thumb_path = f"/tmp/cauan_thumbs/thumb_{idx:02d}.jpg"
    
    # Resize to 800px max for fast API payload
    subprocess.run(['convert', orig_path, '-resize', '800x800>', '-quality', '85', thumb_path], check=True)
    
    with open(thumb_path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
        
    payload = {
        'contents': [{
            'parts': [
                {'text': SYSTEM_PROMPT},
                {'inline_data': {'mime_type': 'image/jpeg', 'data': b64}}
            ]
        }],
        'generationConfig': {
            'responseMimeType': 'application/json'
        }
    }
    
    payload_file = f"/tmp/cauan_thumbs/req_{idx:02d}.json"
    with open(payload_file, 'w') as f:
        json.dump(payload, f)
        
    # Execute curl with retry
    for attempt in range(3):
        res = subprocess.run([
            'curl', '-s', '-X', 'POST',
            '-H', 'Content-Type: application/json',
            '-d', f'@{payload_file}',
            api_url
        ], capture_output=True, text=True)
        
        try:
            data = json.loads(res.stdout)
            text = data['candidates'][0]['content']['parts'][0]['text']
            parsed = json.loads(text)
            
            result = {
                'id': f"img-{idx:02d}",
                'index': idx,
                'url': item['url'],
                'category': parsed.get('category', 'eventos'),
                'confidence': parsed.get('confidence', 0.9),
                'visual_description': parsed.get('visual_description', ''),
                'title': parsed.get('title', 'Registro autoral'),
                'kicker': parsed.get('kicker', 'Portfólio'),
                'caption': parsed.get('caption', 'Registro autoral por Cauan.'),
                'alt': parsed.get('alt', 'Fotografia profissional por Cauan'),
                'mediaType': 'photo'
            }
            print(f"[{idx:02d}] {result['category'].upper()}: {result['title']} (conf: {result['confidence']})")
            return result
        except Exception as e:
            time.sleep(1 + attempt)
            if attempt == 2:
                print(f"[{idx:02d}] FAILED to parse: {res.stdout[:200]}")
                return {
                    'id': f"img-{idx:02d}",
                    'index': idx,
                    'url': item['url'],
                    'category': 'eventos',
                    'confidence': 0.5,
                    'visual_description': 'Registro de evento',
                    'title': 'Registro de evento',
                    'kicker': 'Eventos',
                    'caption': 'Registro de evento por Cauan.',
                    'alt': 'Fotografia de evento por Cauan',
                    'mediaType': 'photo'
                }

# Run with concurrency 5 to be polite to rate limits
results = []
with ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(process_item, unique_items))

print("\n--- CLASSIFICAÇÃO CONCLUÍDA ---")
cat_counts = {}
for r in results:
    cat = r['category']
    cat_counts[cat] = cat_counts.get(cat, 0) + 1

for cat, count in cat_counts.items():
    print(f"  {cat}: {count} imagens")

with open('/tmp/cauan_images/classified_items.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("Salvo em /tmp/cauan_images/classified_items.json")
