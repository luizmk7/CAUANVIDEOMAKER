import json

with open('/tmp/cauan_images/classified_items.json') as f:
    items = json.load(f)

# Refined metadata mappings
formaturas_meta = [
    ("A Conquista do Diploma", "Colação & Becas", "O sorriso radiante que celebra anos de dedicação e o início de um novo ciclo profissional.", "Formanda com beca preta segurando capelo"),
    ("Sorrisos na Graduação", "Luz & Emoção", "O sorriso radiante que marca a celebração e a vitória de um grande ciclo concluído.", "Formanda sorrindo com beca e capelo"),
    ("A Medicina e o Sonho", "Palco & Vitória", "A celebração de um sonho realizado sob as luzes da vitória acadêmica.", "Formandos de Medicina em palco festivo"),
    ("Brilho no Olhar", "Ensaio de Formando", "O sorriso de quem transformou anos de dedicação em uma conquista inesquecível.", "Formanda em beca solene"),
    ("Euforia e Vitória", "Baile & Palco", "A alegria vibrante de uma jornada acadêmica que termina em grande estilo.", "Formandas comemorando no baile"),
    ("Retratos da Jornada", "Toga & Mérito", "O brilho no olhar de quem celebra o fim de uma jornada e o início de um sonho.", "Formanda posando com toga e canudo"),
    ("O Capelo e a Conquista", "Solenidade", "A celebração de anos de dedicação concretizada no brilho de um diploma.", "Grupo de formandas com capelo"),
    ("Novos Horizontes", "Conquista & Brilho", "A celebração do esforço e o brilho de uma nova jornada profissional.", "Casal celebrando formatura no salão"),
    ("Abraços e Conquista", "Colação Oficial", "O sorriso radiante de quem celebra a concretização de uma grande jornada acadêmica.", "Formanda sorridente na colação"),
    ("O Brilho da Trajetória", "Retrato Solene", "A elegância de um momento especial, marcando o início de uma nova jornada.", "Ensaio de formando em estúdio e externo"),
    ("O Diploma em Mãos", "Mérito Acadêmico", "Celebrando a realização de um sonho e o início de um futuro brilhante.", "Formanda erguendo o diploma"),
    ("Vitória Compartilhada", "Celebração de Gala", "Cada brilho neste olhar reflete o esforço e a dedicação de uma longa jornada acadêmica.", "Formanda no baile de formatura"),
    ("O Sonho Concretizado", "Orgulho & Família", "O sorriso radiante que ilumina o fechamento de um ciclo inesquecível e o começo de um grande futuro.", "Formanda em momento solene"),
    ("A Luz da Superação", "Festa & Reconhecimento", "O brilho inesquecível de quem celebra o ápice de uma importante jornada acadêmica.", "Formanda sorrindo na cerimônia"),
    ("Conclusão Inesquecível", "Canudo & Emoção", "A alegria estampada no rosto de quem concretiza o sonho de uma vida.", "Formanda com canudo de formatura"),
    ("Aplausos e Realização", "Palco da Vida", "A alegria vibrante de quem alcançou o tão sonhado diploma acadêmico.", "Formanda celebrando conquista"),
    ("A Força da Dedicação", "Baile de Gala", "A alegria vibrante de celebrar uma vitória tão esperada ao lado de quem amamos.", "Formandas comemorando em festa"),
    ("Dra. Raissa e Conquista", "Medicina em Festa", "A energia contagiante de um momento de pura celebração e brilho da formatura.", "Formanda de Medicina com óculos comemorativos"),
    ("O Instante Solene", "Beca & Vocação", "O brilho no olhar de quem celebra a vitória de uma jornada inesquecível.", "Formanda em traje solene com jabô branco"),
    ("Alegria que Transborda", "Comemoração", "A alegria estampada de quem alcançou o objetivo final com maestria.", "Formanda de gala no baile"),
    ("Vitória Inesquecível", "O Grande Dia", "O momento em que todo o esforço se transforma em uma vitória inesquecível.", "Formanda emocionada com canudo"),
    ("Emoção no Palco", "Conclusão de Curso", "Cada lágrima e sorriso refletem a dedicação de uma jornada que hoje se torna realidade.", "Formanda no palco oficial"),
    ("Brilho e Tradição", "Dra. Malu", "A celebração de uma nova etapa médica marcada pelo brilho da conquista.", "Formanda comemorando no baile de formatura")
]

casamentos_meta = [
    ("Caminho Lado a Lado", "Primeiros Passos", "A cumplicidade refletida em cada olhar no primeiro passeio como recém-casados.", "Casal de noivos caminhando de mãos dadas"),
    ("Passos Rumo ao Altar", "A Poesia do Início", "A poesia de um novo começo capturada na luz serena do altar.", "Noivos de costas caminhando para a cerimônia"),
    ("O Preparo da Noiva", "Making Of & Afeto", "Cada pequeno detalhe do preparo carrega a expectativa e a magia do grande dia.", "Noiva com vestido de noiva em preparação"),
    ("O Sim sob o Altar", "Aliança & Natureza", "O momento em que duas vidas se entrelaçam em uma promessa de amor eterno.", "Casal no altar sob gazebo decorado"),
    ("A Fé e o Terço", "Paz & Devoção", "Detalhes que guardam a essência e a espiritualidade de um momento único.", "Mãos da noiva segurando terço e vestido"),
    ("O Sorriso da Noiva", "Beleza Clássica", "A beleza clássica de um momento que marca o início de uma nova jornada.", "Noiva sorridente com vestido tomara-que-caia"),
    ("Saída dos Noivos", "Chuva de Afeto", "Um momento inesquecível de alegria e luz no caminho rumo a uma nova vida a dois.", "Noivos aplaudidos pelos convidados"),
    ("Memória & Homenagens", "Lírios e Saudade", "Um momento de memória e afeto, eternizando quem amamos no dia mais especial.", "Noivos com buquê de lírios e medalhão"),
    ("A Espera do Sim", "Robe & Renda", "Cada detalhe prepara o cenário para o momento mais esperado da vida a dois.", "Noiva em robe de cetim na preparação"),
    ("O Véu e a Luz", "Elegância Atemporal", "A beleza singular de um momento inesquecível de preparação e contemplação.", "Noiva com vestido longo e véu de costas"),
    ("O Brilho da Fé", "Oração e Gratidão", "Um momento de gratidão e emoção sincera que antecede o sagrado 'sim'.", "Noiva com olhos fechados e terço em oração"),
    ("As Alianças Mariana & N.", "Promessa Bordada", "Dois corações que se tornam um sob a bênção de um compromisso eterno.", "Porta-alianças bordado com nomes dos noivos"),
    ("A Noiva no Corredor", "Harmonia do Branco", "A pureza de um momento único capturado em plena harmonia com a celebração.", "Noiva sorridente no corredor da igreja"),
    ("Beleza e Serenidade", "O Espelho da Alma", "A elegância e a emoção em cada detalhe de um momento inesquecível.", "Retrato intimista da noiva no making of"),
    ("A Mão e o Altar", "Caminhada Emocionante", "Cada passo compartilhado reflete o início de um novo e lindo capítulo de vida.", "Mão da noiva dada ao pai a caminho do altar"),
    ("O Encontro no Jardim", "Golden Hour & Amor", "O instante em que o sol se curva para testemunhar a união de duas vidas.", "Noivos no jardim ao entardecer"),
    ("Votos Sob o Céu", "Conexão Sagrada", "O momento em que duas vidas se entrelaçam sob o olhar atento da natureza.", "Noivos no altar ao ar livre"),
    ("O Buquê de Lírios", "Detalhes do Grande Dia", "A elegância e a emoção de um momento que se tornará eterno na memória.", "Noiva segurando buquê de lírios brancos"),
    ("Conexão e Promessa", "Mãos Dadas no Altar", "A união de duas almas em um momento de pura conexão, cumplicidade e fé.", "Noivos de mãos dadas durante os votos"),
    ("O Beijo e a Ternura", "Fotografia P&B", "Um momento de pura ternura que eterniza a união de duas almas apaixonadas.", "Noivo beijando a testa da noiva em preto e branco"),
    ("O Vestido e a Expectativa", "Making Of Intimista", "Cada detalhe é um passo em direção ao sonho que está prestes a se realizar.", "Noiva observando vestido pendurado"),
    ("Detalhes da Recepção", "Cenografia de Casamento", "Cada detalhe foi planejado com carinho para celebrar o início de uma vida a dois.", "Detalhes cenográficos do casamento"),
    ("Celebração Radiante", "Sorrisos dos Noivos", "Um momento de pura euforia e brilho celebrando o início de uma nova jornada a dois.", "Casal caminhando sorridente na festa"),
    ("Um Sonho a Dois", "Olhar dos Recém-Casados", "O brilho no olhar de quem celebra o início de uma nova jornada a dois.", "Noiva sorridente abraçada ao noivo"),
    ("Noivos Sob as Estrelas", "Recepção Noturna", "A celebração eterna de um compromisso que floresce sob o brilho da noite.", "Noivos em ensaio noturno iluminado"),
    ("Momento Sagrado", "Fé e Espiritualidade", "A serenidade e a fé marcam o início de uma nova jornada de união e amor.", "Noiva em momento de reflexão e oração"),
    ("O Beijo com Sparkles", "Festa e Magia", "Um momento mágico iluminado pelo brilho dos convidados e pela promessa de uma vida juntos.", "Noivos se beijando entre sparkles iluminados"),
    ("Os Toques Finais do Vestido", "Preparativos da Noiva", "Cada detalhe é cuidadosamente ajustado para o momento em que o sonho se torna realidade.", "Noiva sentada em ajustes finais do vestido"),
    ("A Troca de Alianças", "Cerimônia ao Ar Livre", "Um momento inesquecível selado com a beleza da natureza e a luz de uma nova jornada.", "Noivos no altar durante troca de alianças"),
    ("A Descida Radiante da Noiva", "Rumo ao Altar", "A descida emocionante da noiva com buquê e véu a caminho do altar.", "Noiva sorridente descendo escada com buquê")
]

eventos_meta = [
    ("Brilho e Elegância Solene", "Luzes & Gala", "Um sorriso radiante que ilumina a noite em uma celebração repleta de sofisticação.", "Retrato de mulher elegante em vestido verde de gala"),
    ("Retratos em Festa", "Eventos & Conexão", "A leveza e a alegria eternizadas em um momento especial de celebração.", "Jovem mulher sorridente em festa social"),
    ("Celebração em Movimento", "Taças & Brilho", "A sintonia perfeita e a alegria capturadas em um brinde inesquecível.", "Convidadas brindando com taças iluminadas"),
    ("Noite de Gala", "Close-Up & Presença", "A beleza e sofisticação que irradiam sob o brilho e luzes da noite.", "Retrato em close-up de mulher em festa de gala"),
    ("Energia na Pista", "Ritmo & Cor", "A vibração contagiante e a alegria da festa eternizadas em movimento cheio de cor.", "Convidados dançando na pista de dança"),
    ("A Vibração da Festa", "Luzes & Movimento", "A vibração contagiante e o ritmo que eternizam a euforia do evento.", "Pista de dança com luzes reluzentes"),
    ("Noite Inesquecível", "Estilo & Atmosfera", "A energia contagiante de uma noite inesquecível e cheia de estilo musical.", "Jovem celebrando em festa com iluminação cênica")
]

form_items = [it for it in items if it['category'] == 'formaturas']
cas_items = [it for it in items if it['category'] == 'casamentos']
ev_items = [it for it in items if it['category'] == 'eventos']

for i, it in enumerate(form_items):
    meta = formaturas_meta[i]
    it['title'] = meta[0]
    it['kicker'] = meta[1]
    it['caption'] = meta[2]
    it['alt'] = meta[3]

for i, it in enumerate(cas_items):
    meta = casamentos_meta[i]
    it['title'] = meta[0]
    it['kicker'] = meta[1]
    it['caption'] = meta[2]
    it['alt'] = meta[3]

for i, it in enumerate(ev_items):
    meta = eventos_meta[i]
    it['title'] = meta[0]
    it['kicker'] = meta[1]
    it['caption'] = meta[2]
    it['alt'] = meta[3]

final_all = form_items + cas_items + ev_items
print(f"Total updated: {len(final_all)} items.")

with open('/tmp/cauan_images/classified_items.json', 'w', encoding='utf-8') as f:
    json.dump(final_all, f, ensure_ascii=False, indent=2)
