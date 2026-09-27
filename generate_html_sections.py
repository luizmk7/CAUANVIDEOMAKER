import json
import re

with open('data/portfolio-manifest.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

form_items = [it for it in items if it['category'] == 'formaturas']
ev_items = [it for it in items if it['category'] == 'eventos']
cas_items = [it for it in items if it['category'] == 'casamentos']

def build_cards_html(items_list, cat_slug, cat_display, is_dark):
    card_class = "work-card work-card-dark" if is_dark else "work-card glass-card-light"
    explore_class = "work-card work-card-explore work-card-dark" if is_dark else "work-card work-card-explore glass-card-light"
    kicker_class = "work-card-kicker kicker-dark" if is_dark else "work-card-kicker"
    title_class = "work-card-title title-dark" if is_dark else "work-card-title"

    cards = []
    for i, it in enumerate(items_list):
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

    # Explore card
    explore_img = items_list[0]['url'] if items_list else ''
    explore_card = f'''        <!-- Card Saber Mais / Galeria {cat_display} -->
        <article class="{explore_class}" data-open-gallery="{cat_slug}" role="button" tabindex="0" aria-label="Abrir galeria completa com mais fotos de {cat_display}">
          <div class="work-media-container">
            <img src="{explore_img}" alt="Mais fotos de {cat_display}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </div>
          <div class="work-card-content">
            <h3 class="{title_class}">Ver mais fotos ↗</h3>
            <p class="work-card-note">Galeria e acervo completo</p>
          </div>
        </article>'''
    cards.append(explore_card)

    dots = []
    for i in range(len(cards)):
        is_active = " is-active" if i == 0 else ""
        selected = "true" if i == 0 else "false"
        label = f"Foto {i+1}: {items_list[i]['title']}" if i < len(items_list) else f"Foto {i+1}: Galeria Completa"
        dots.append(f'        <button type="button" role="tab" class="carousel-dot{is_active}" aria-selected="{selected}" aria-label="{label}" data-index="{i}"></button>')

    dots_html = f'''      <!-- Indicadores de carrossel {cat_display} -->
      <div class="carousel-dots" role="tablist" aria-label="Navegar pelas fotos de {cat_display}">
{chr(10).join(dots)}
      </div>'''

    cards_grid_html = f'''      <div class="category-showcase category-cards-grid">
{chr(10).join(cards)}
      </div>'''

    return cards_grid_html, dots_html

print(f"Formaturas: {len(form_items)} photos")
print(f"Eventos: {len(ev_items)} photos")
print(f"Casamentos: {len(cas_items)} photos")
