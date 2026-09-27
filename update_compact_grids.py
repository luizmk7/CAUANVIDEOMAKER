import json
import re

with open('data/portfolio-manifest.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

form_items = [it for it in items if it['category'] == 'formaturas']
ev_items = [it for it in items if it['category'] == 'eventos']
cas_items = [it for it in items if it['category'] == 'casamentos']

def build_compact_section(items_list, cat_slug, cat_display, is_dark, total_count):
    card_class = "work-card work-card-dark" if is_dark else "work-card glass-card-light"
    explore_class = "work-card work-card-explore work-card-dark" if is_dark else "work-card work-card-explore glass-card-light"
    kicker_class = "work-card-kicker kicker-dark" if is_dark else "work-card-kicker"
    title_class = "work-card-title title-dark" if is_dark else "work-card-title"

    # 3 featured photo cards
    featured = items_list[:3]
    # 4th item used as background of explore card
    explore_bg = items_list[3]['url'] if len(items_list) > 3 else (items_list[0]['url'] if items_list else '')

    cards = []
    for i, it in enumerate(featured):
        loading = 'eager' if i == 0 else 'lazy'
        card = f'''        <article class="{card_class}" data-title="{it['title']}" data-category="{cat_display}" data-media-type="photo" data-image="{it['url']}" data-caption="{it['caption']}">
          <div class="work-media-container">
            <img src="{it['url']}" alt="{it['alt']}" loading="{loading}" decoding="async" referrerpolicy="no-referrer">
          </div>
          <div class="work-card-content">
            <span class="{kicker_class}">{it['kicker']}</span>
            <h3 class="{title_class}">{it['title']}</h3>
            <p class="work-card-note">{it['caption']}</p>
          </div>
        </article>'''
        cards.append(card)

    # 4th Card: Explore Gallery
    explore_card = f'''        <!-- Card 4: Ver Mais Fotos / Galeria Completa ({total_count} fotos) -->
        <article class="{explore_class}" data-open-gallery="{cat_slug}" role="button" tabindex="0" aria-label="Abrir galeria completa com todas as {total_count} fotos de {cat_display}">
          <div class="work-media-container">
            <img src="{explore_bg}" alt="Ver todas as {total_count} fotos de {cat_display}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </div>
          <div class="work-card-content">
            <h3 class="{title_class}">Ver mais fotos ↗</h3>
            <p class="work-card-note">Galeria completa ({total_count} fotos)</p>
          </div>
        </article>'''
    cards.append(explore_card)

    dots = []
    for i in range(len(cards)):
        is_active = " is-active" if i == 0 else ""
        selected = "true" if i == 0 else "false"
        label = f"Foto {i+1}: {featured[i]['title']}" if i < len(featured) else f"Foto 4: Galeria Completa ({total_count} fotos)"
        dots.append(f'        <button type="button" role="tab" class="carousel-dot{is_active}" aria-selected="{selected}" aria-label="{label}" data-index="{i}"></button>')

    grid_block = f'''      <div class="category-showcase category-cards-grid">
{chr(10).join(cards)}
      </div>

      <!-- Indicadores de carrossel {cat_display} (4 cards) -->
      <div class="carousel-dots" role="tablist" aria-label="Navegar pelas fotos de {cat_display}">
{chr(10).join(dots)}
      </div>'''
    return grid_block

form_block = build_compact_section(form_items, "formaturas", "Formatura", is_dark=False, total_count=len(form_items))
ev_block = build_compact_section(ev_items, "eventos", "Evento", is_dark=True, total_count=len(ev_items))
cas_block = build_compact_section(cas_items, "casamentos", "Casamento", is_dark=True, total_count=len(cas_items))

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Formaturas grid & dots
form_pattern = re.compile(r'(<section class="category-block category-block-light section" id="formaturas">[\s\S]*?<div class="category-block-header">[\s\S]*?</div>\s*</div>\s*)(<div class="category-showcase category-cards-grid">[\s\S]*?</div>\s*<!-- Indicadores de carrossel Formaturas -->\s*<div class="carousel-dots"[\s\S]*?</div>)(\s*<div class="category-footer-cta">)', re.MULTILINE)
m_form = form_pattern.search(html)
if not m_form:
    print("ERROR: Could not match formaturas block")
else:
    html = html[:m_form.start(2)] + form_block + html[m_form.end(2):]
    print("SUCCESS: Replaced Formaturas with 4 cards")

# Replace Eventos grid & dots
ev_pattern = re.compile(r'(<section class="category-block category-block-dark section" id="eventos">[\s\S]*?<div class="category-block-header">[\s\S]*?</div>\s*</div>\s*)(<div class="category-showcase category-cards-grid">[\s\S]*?</div>\s*<!-- Indicadores de carrossel Eventos -->\s*<div class="carousel-dots"[\s\S]*?</div>)(\s*<div class="category-footer-cta">)', re.MULTILINE)
m_ev = ev_pattern.search(html)
if not m_ev:
    print("ERROR: Could not match eventos block")
else:
    html = html[:m_ev.start(2)] + ev_block + html[m_ev.end(2):]
    print("SUCCESS: Replaced Eventos with 4 cards")

# Replace Casamentos grid & dots
cas_pattern = re.compile(r'(<section class="category-block category-block-dark section" id="casamentos">[\s\S]*?<div class="category-block-header">[\s\S]*?</div>\s*</div>\s*)(<div class="category-showcase category-cards-grid">[\s\S]*?</div>\s*<!-- Indicadores de carrossel Casamentos -->\s*<div class="carousel-dots"[\s\S]*?</div>)(\s*<div class="category-footer-cta">)', re.MULTILINE)
m_cas = cas_pattern.search(html)
if not m_cas:
    print("ERROR: Could not match casamentos block")
else:
    html = html[:m_cas.start(2)] + cas_block + html[m_cas.end(2):]
    print("SUCCESS: Replaced Casamentos with 4 cards")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated successfully with 4 cards per category.")
