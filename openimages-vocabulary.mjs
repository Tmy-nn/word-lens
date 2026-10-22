import labels from './public/expanded/labels.json' with { type: 'json' };
import { DETECTION_VOCAB } from './detector-vocabulary.mjs';
import { VOCAB } from './vocabulary.mjs';

// Rows are: Open Images ID | Japanese | English | Spanish (Spain)
// | Portuguese (Brazil) | French | Italian | German.
const translations = `
1|カメ|tortoise|tortuga|tartaruga|tortue|tartaruga|Landschildkröte
2|容器|container|contenedor|recipiente|conteneur|contenitore|Behälter
3|カササギ|magpie|urraca|pega|pie|gazza|Elster
4|ウミガメ|sea turtle|tortuga marina|tartaruga marinha|tortue marine|tartaruga marina|Meeresschildkröte
5|フットボール|football|balón de fútbol|bola de futebol|ballon de football|pallone da football|Football
6|救急車|ambulance|ambulancia|ambulância|ambulance|ambulanza|Krankenwagen
7|はしご|ladder|escalera|escada|échelle|scala|Leiter
8|歯ブラシ|toothbrush|cepillo de dientes|escova de dentes|brosse à dents|spazzolino da denti|Zahnbürste
9|注射器|syringe|jeringa|seringa|seringue|siringa|Spritze
10|流し台|sink|fregadero|pia|évier|lavello|Spüle
11|おもちゃ|toy|juguete|brinquedo|jouet|giocattolo|Spielzeug
12|オルガン|organ|órgano|órgão|orgue|organo|Orgel
13|カセットデッキ|cassette deck|reproductor de casetes|toca-fitas|lecteur de cassettes|lettore di cassette|Kassettendeck
14|リンゴ|apple|manzana|maçã|pomme|mela|Apfel
15|人の目|human eye|ojo humano|olho humano|œil humain|occhio umano|menschliches Auge
16|化粧品|cosmetics|cosméticos|cosméticos|cosmétiques|cosmetici|Kosmetik
17|パドル|paddle|remo|remo|pagaie|pagaia|Paddel
18|雪だるま|snowman|muñeco de nieve|boneco de neve|bonhomme de neige|pupazzo di neve|Schneemann
19|ビール|beer|cerveza|cerveja|bière|birra|Bier
20|箸|chopsticks|palillos|hashis|baguettes|bacchette|Essstäbchen
21|ひげ|beard|barba|barba|barbe|barba|Bart
22|鳥|bird|pájaro|pássaro|oiseau|uccello|Vogel
23|パーキングメーター|parking meter|parquímetro|parquímetro|parcmètre|parcometro|Parkuhr
24|信号機|traffic light|semáforo|semáforo|feu de circulation|semaforo|Ampel
25|クロワッサン|croissant|cruasán|croissant|croissant|croissant|Croissant
26|キュウリ|cucumber|pepino|pepino|concombre|cetriolo|Gurke
27|ラディッシュ|radish|rábano|rabanete|radis|ravanello|Radieschen
28|タオル|towel|toalla|toalha|serviette|asciugamano|Handtuch
29|人形|doll|muñeca|boneca|poupée|bambola|Puppe
30|頭蓋骨|skull|cráneo|crânio|crâne|cranio|Schädel
31|洗濯機|washing machine|lavadora|máquina de lavar|machine à laver|lavatrice|Waschmaschine
32|手袋|glove|guante|luva|gant|guanto|Handschuh
33|マダニ|tick|garrapata|carrapato|tique|zecca|Zecke
34|ベルト|belt|cinturón|cinto|ceinture|cintura|Gürtel
35|サングラス|sunglasses|gafas de sol|óculos de sol|lunettes de soleil|occhiali da sole|Sonnenbrille
36|バンジョー|banjo|banjo|banjo|banjo|banjo|Banjo
37|カート|cart|carrito|carrinho|chariot|carrello|Wagen
38|ボール|ball|pelota|bola|ballon|palla|Ball
39|リュックサック|backpack|mochila|mochila|sac à dos|zaino|Rucksack
40|自転車|bicycle|bicicleta|bicicleta|vélo|bicicletta|Fahrrad
41|家電|home appliance|electrodoméstico|eletrodoméstico|appareil électroménager|elettrodomestico|Haushaltsgerät
42|ムカデ|centipede|ciempiés|centopeia|centipède|centopiede|Hundertfüßer
43|ボート|boat|barco|barco|bateau|barca|Boot
44|サーフボード|surfboard|tabla de surf|prancha de surfe|planche de surf|tavola da surf|Surfbrett
45|ブーツ|boot|bota|bota|botte|stivale|Stiefel
46|ヘッドホン|headphones|auriculares|fones de ouvido|casque audio|cuffie|Kopfhörer
47|ホットドッグ|hot dog|perrito caliente|cachorro-quente|hot-dog|hot dog|Hotdog
48|ショートパンツ|shorts|pantalones cortos|shorts|short|pantaloncini|Shorts
49|ファストフード|fast food|comida rápida|fast food|restauration rapide|fast food|Fast Food
50|バス|bus|autobús|ônibus|bus|autobus|Bus
51|男の子|boy|niño|menino|garçon|ragazzo|Junge
52|ドライバー|screwdriver|destornillador|chave de fenda|tournevis|cacciavite|Schraubendreher
53|自転車の車輪|bicycle wheel|rueda de bicicleta|roda de bicicleta|roue de vélo|ruota di bicicletta|Fahrrad Rad
54|はしけ|barge|barcaza|barcaça|péniche|chiatta|Lastkahn
55|ノートパソコン|laptop|portátil|notebook|ordinateur portable|computer portatile|Laptop
56|ミニスカート|miniskirt|minifalda|minissaia|minijupe|minigonna|Minirock
57|ドリル|drill|taladro|furadeira|perceuse|trapano|Bohrmaschine
58|ワンピース|dress|vestido|vestido|robe|vestito|Kleid
59|クマ|bear|oso|urso|ours|orso|Bär
60|ワッフル|waffle|gofre|waffle|gaufre|waffle|Waffel
61|パンケーキ|pancake|panqueque|panqueca|crêpe|pancake|Pfannkuchen
62|ヒグマ|brown bear|oso pardo|urso-pardo|ours brun|orso bruno|Braunbär
63|キツツキ|woodpecker|pájaro carpintero|pica-pau|pic|picchio|Specht
64|アオカケス|blue jay|arrendajo azul|gaio-azul|geai bleu|ghiandaia azzurra|Blauhäher
65|プレッツェル|pretzel|pretzel|pretzel|bretzel|pretzel|Brezel
66|ベーグル|bagel|bagel|bagel|bagel|bagel|Bagel
67|塔|tower|torre|torre|tour|torre|Turm
68|ティーポット|teapot|tetera|bule|théière|teiera|Teekanne
69|人|person|persona|pessoa|personne|persona|Person
70|弓矢|bow and arrow|arco y flecha|arco e flecha|arc et flèche|arco e freccia|Pfeil und Bogen
71|水着|swimwear|ropa de baño|roupa de banho|maillot de bain|costume da bagno|Badebekleidung
72|蜂の巣|beehive|colmena|colmeia|ruche|alveare|Bienenstock
73|ブラジャー|bra|sujetador|sutiã|soutien-gorge|reggiseno|BH
74|ハチ|bee|abeja|abelha|abeille|ape|Biene
75|コウモリ|bat|murciélago|morcego|chauve-souris|pipistrello|Fledermaus
76|ヒトデ|starfish|estrella de mar|estrela-do-mar|étoile de mer|stella marina|Seestern
77|ポップコーン|popcorn|palomitas|pipoca|pop-corn|popcorn|Popcorn
78|ブリトー|burrito|burrito|burrito|burrito|burrito|Burrito
79|チェーンソー|chainsaw|motosierra|motosserra|tronçonneuse|motosega|Kettensäge
80|風船|balloon|globo|balão|ballon|palloncino|Luftballon
81|レンチ|wrench|llave inglesa|chave inglesa|clé|chiave inglese|Schraubenschlüssel
82|テント|tent|tienda de campaña|barraca|tente|tenda|Zelt
83|ナンバープレート|license plate|matrícula|placa de veículo|plaque d’immatriculation|targa|Nummernschild
84|ランタン|lantern|linterna|lanterna|lanterne|lanterna|Laterne
85|トースター|toaster|tostadora|torradeira|grille-pain|tostapane|Toaster
86|懐中電灯|flashlight|linterna|lanterna|lampe torche|torcia|Taschenlampe
87|看板|billboard|cartelera|painel publicitário|panneau publicitaire|cartellone pubblicitario|Werbetafel
88|ティアラ|tiara|tiara|tiara|diadème|tiara|Tiara
89|リムジン|limousine|limusina|limusine|limousine|limousine|Limousine
90|ネックレス|necklace|collar|colar|collier|collana|Halskette
91|肉食動物|carnivore|carnívoro|carnívoro|carnivore|carnivoro|Fleischfresser
92|はさみ|scissors|tijeras|tesoura|ciseaux|forbici|Schere
93|階段|stairs|escaleras|escada|escalier|scale|Treppe
94|キーボード|computer keyboard|teclado|teclado|clavier|tastiera|Tastatur
95|プリンター|printer|impresora|impressora|imprimante|stampante|Drucker
96|道路標識|traffic sign|señal de tráfico|sinal de trânsito|panneau de signalisation|segnale stradale|Verkehrsschild
97|椅子|chair|silla|cadeira|chaise|sedia|Stuhl
98|シャツ|shirt|camisa|camisa|chemise|camicia|Hemd
99|ポスター|poster|póster|pôster|affiche|poster|Poster
100|チーズ|cheese|queso|queijo|fromage|formaggio|Käse
101|靴下|sock|calcetín|meia|chaussette|calzino|Socke
102|消火栓|fire hydrant|hidrante|hidrante|borne d’incendie|idrante|Hydrant
103|陸上車両|land vehicle|vehículo terrestre|veículo terrestre|véhicule terrestre|veicolo terrestre|Landfahrzeug
104|イヤリング|earrings|pendientes|brincos|boucles d’oreilles|orecchini|Ohrringe
105|ネクタイ|tie|corbata|gravata|cravate|cravatta|Krawatte
106|船舶|watercraft|embarcación|embarcação|embarcation|imbarcazione|Wasserfahrzeug
107|キャビネット|cabinetry|muebles de cocina|armários|meubles de rangement|mobili contenitori|Schrankmöbel
108|スーツケース|suitcase|maleta|mala|valise|valigia|Koffer
109|マフィン|muffin|muffin|muffin|muffin|muffin|Muffin
110|ビデ|bidet|bidé|bidê|bidet|bidet|Bidet
111|軽食|snack|aperitivo|lanche|collation|spuntino|Snack
112|スノーモービル|snowmobile|moto de nieve|moto de neve|motoneige|motoslitta|Schneemobil
113|時計|clock|reloj|relógio|horloge|orologio|Uhr
114|医療機器|medical equipment|equipo médico|equipamento médico|équipement médical|attrezzatura medica|medizinisches Gerät
115|牛|cattle|ganado|gado|bétail|bestiame|Rinder
116|チェロ|cello|violonchelo|violoncelo|violoncelle|violoncello|Cello
117|ジェットスキー|jet ski|moto acuática|jet ski|jet-ski|moto d’acqua|Wassermotorrad
118|ラクダ|camel|camello|camelo|chameau|cammello|Kamel
119|コート|coat|abrigo|casaco|manteau|cappotto|Mantel
120|スーツ|suit|traje|terno|costume|abito|Anzug
121|机|desk|escritorio|mesa|bureau|scrivania|Schreibtisch
122|猫|cat|gato|gato|chat|gatto|Katze
123|ブロンズ像|bronze sculpture|escultura de bronce|escultura de bronze|sculpture en bronze|scultura in bronzo|Bronzeskulptur
124|ジュース|juice|jugo|suco|jus|succo|Saft
125|ゴンドラ|gondola|góndola|gôndola|gondole|gondola|Gondel
126|甲虫|beetle|escarabajo|besouro|scarabée|scarabeo|Käfer
127|大砲|cannon|cañón|canhão|canon|cannone|Kanone
128|マウス|computer mouse|ratón|mouse|souris|mouse|Computermaus
129|クッキー|cookie|galleta|biscoito|biscuit|biscotto|Keks
130|オフィスビル|office building|edificio de oficinas|prédio de escritórios|immeuble de bureaux|edificio per uffici|Bürogebäude
131|噴水|fountain|fuente|fonte|fontaine|fontana|Brunnen
132|硬貨|coin|moneda|moeda|pièce|moneta|Münze
133|電卓|calculator|calculadora|calculadora|calculatrice|calcolatrice|Taschenrechner
134|カクテル|cocktail|cóctel|coquetel|cocktail|cocktail|Cocktail
135|モニター|computer monitor|monitor|monitor|écran d’ordinateur|monitor|Computerbildschirm
136|箱|box|caja|caixa|boîte|scatola|Karton
137|ホチキス|stapler|grapadora|grampeador|agrafeuse|spillatrice|Heftgerät
138|クリスマスツリー|Christmas tree|árbol de Navidad|árvore de Natal|sapin de Noël|albero di Natale|Weihnachtsbaum
139|カウボーイハット|cowboy hat|sombrero vaquero|chapéu de cowboy|chapeau de cowboy|cappello da cowboy|Cowboyhut
140|登山用品|hiking equipment|equipo de senderismo|equipamento de caminhada|équipement de randonnée|attrezzatura da escursionismo|Wanderausrüstung
141|ソファベッド|sofa bed|sofá cama|sofá-cama|canapé-lit|divano letto|Schlafsofa
142|ドラム|drum|tambor|tambor|tambour|tamburo|Trommel
143|デザート|dessert|postre|sobremesa|dessert|dessert|Dessert
144|ワインラック|wine rack|botellero|adega|porte-bouteilles|portabottiglie|Weinregal
145|飲み物|drink|bebida|bebida|boisson|bevanda|Getränk
146|ズッキーニ|zucchini|calabacín|abobrinha|courgette|zucchina|Zucchini
147|おたま|ladle|cucharón|concha|louche|mestolo|Schöpfkelle
148|人の口|human mouth|boca humana|boca humana|bouche humaine|bocca umana|menschlicher Mund
149|乳製品|dairy|lácteos|laticínios|produits laitiers|latticini|Milchprodukte
150|さいころ|dice|dados|dados|dés|dadi|Würfel
151|オーブン|oven|horno|forno|four|forno|Backofen
152|恐竜|dinosaur|dinosaurio|dinossauro|dinosaure|dinosauro|Dinosaurier
153|ラチェット|ratchet|trinquete|catraca|cliquet|cricchetto|Ratsche
154|ソファ|couch|sofá|sofá|canapé|divano|Sofa
155|クリケットボール|cricket ball|pelota de críquet|bola de críquete|balle de cricket|palla da cricket|Cricketball
156|トウガン|winter melon|melón de invierno|melão-de-inverno|courge cireuse|melone invernale|Wintermelone
157|へら|spatula|espátula|espátula|spatule|spatola|Pfannenwender
158|ホワイトボード|whiteboard|pizarra blanca|quadro branco|tableau blanc|lavagna bianca|Whiteboard
159|鉛筆削り|pencil sharpener|sacapuntas|apontador|taille-crayon|temperamatite|Bleistiftspitzer
160|ドア|door|puerta|porta|porte|porta|Tür
161|帽子|hat|sombrero|chapéu|chapeau|cappello|Hut
162|シャワー|shower|ducha|chuveiro|douche|doccia|Dusche
163|消しゴム|eraser|goma de borrar|borracha|gomme|gomma|Radiergummi
164|フェドラ帽|fedora|sombrero fedora|chapéu fedora|chapeau fedora|cappello fedora|Fedora
165|ワカモレ|guacamole|guacamole|guacamole|guacamole|guacamole|Guacamole
166|短剣|dagger|daga|adaga|dague|pugnale|Dolch
167|マフラー|scarf|bufanda|cachecol|écharpe|sciarpa|Schal
168|イルカ|dolphin|delfín|golfinho|dauphin|delfino|Delfin
169|ソンブレロ|sombrero|sombrero|sombrero|sombrero|sombrero|Sombrero
170|缶|tin can|lata|lata|boîte de conserve|barattolo|Konservendose
171|マグカップ|mug|taza|caneca|mug|tazza|Becher
172|蛇口|tap|grifo|torneira|robinet|rubinetto|Wasserhahn
173|ゼニガタアザラシ|harbor seal|foca común|foca-comum|phoque commun|foca comune|Seehund
174|担架|stretcher|camilla|maca|brancard|barella|Trage
175|缶切り|can opener|abrelatas|abridor de latas|ouvre-boîte|apriscatole|Dosenöffner
176|ゴーグル|goggles|gafas protectoras|óculos de proteção|lunettes de protection|occhiali protettivi|Schutzbrille
177|人体|human body|cuerpo humano|corpo humano|corps humain|corpo umano|menschlicher Körper
178|ローラースケート|roller skates|patines de ruedas|patins|patins à roulettes|pattini a rotelle|Rollschuhe
179|コーヒーカップ|coffee cup|taza de café|xícara de café|tasse à café|tazza da caffè|Kaffeetasse
180|まな板|cutting board|tabla de cortar|tábua de corte|planche à découper|tagliere|Schneidebrett
181|ミキサー|blender|licuadora|liquidificador|mixeur|frullatore|Mixer
182|水回り設備|plumbing fixture|accesorio de fontanería|instalação hidráulica|équipement de plomberie|apparecchio idraulico|Sanitäreinrichtung
183|一時停止標識|stop sign|señal de alto|placa de pare|panneau stop|segnale di stop|Stoppschild
184|事務用品|office supplies|material de oficina|material de escritório|fournitures de bureau|materiale da ufficio|Bürobedarf
185|バレーボール|volleyball|voleibol|voleibol|volley-ball|pallavolo|Volleyball
186|花瓶|vase|jarrón|vaso|vase|vaso|Vase
187|スロークッカー|slow cooker|olla de cocción lenta|panela de cozimento lento|mijoteuse|pentola a cottura lenta|Schongarer
188|ワードローブ|wardrobe|armario|guarda-roupa|armoire|armadio|Kleiderschrank
189|コーヒー|coffee|café|café|café|caffè|Kaffee
190|泡立て器|whisk|batidor|batedor|fouet|frusta|Schneebesen
191|ペーパータオル|paper towel|toalla de papel|papel-toalha|essuie-tout|carta da cucina|Küchenpapier
192|身だしなみ用品|personal care|cuidado personal|cuidados pessoais|soins personnels|cura personale|Körperpflege
193|食べ物|food|comida|comida|nourriture|cibo|Essen
194|日よけ帽子|sun hat|sombrero para el sol|chapéu de sol|chapeau de soleil|cappello da sole|Sonnenhut
195|ツリーハウス|tree house|casa del árbol|casa na árvore|cabane dans les arbres|casa sull’albero|Baumhaus
196|フライングディスク|flying disc|disco volador|disco voador|disque volant|disco volante|Flugscheibe
197|スカート|skirt|falda|saia|jupe|gonna|Rock
198|ガスコンロ|gas stove|cocina de gas|fogão a gás|cuisinière à gaz|fornello a gas|Gasherd
199|塩こしょう入れ|salt and pepper shakers|salero y pimentero|saleiro e pimenteiro|salière et poivrière|saliera e pepiera|Salz- und Pfefferstreuer
200|扇風機|fan|ventilador|ventilador|ventilateur|ventilatore|Ventilator
201|フェイスパウダー|face powder|polvos faciales|pó facial|poudre pour le visage|cipria|Gesichtspuder
202|ファクス|fax|fax|fax|télécopieur|fax|Faxgerät
203|果物|fruit|fruta|fruta|fruit|frutta|Obst
204|フライドポテト|French fries|patatas fritas|batatas fritas|frites|patatine fritte|Pommes frites
205|ナイトテーブル|nightstand|mesita de noche|mesa de cabeceira|table de nuit|comodino|Nachttisch
206|たる|barrel|barril|barril|baril|barile|Fass
208|タルト|tart|tarta|torta|tarte|crostata|Tarte
209|ランニングマシン|treadmill|cinta de correr|esteira|tapis de course|tapis roulant|Laufband
210|キツネ|fox|zorro|raposa|renard|volpe|Fuchs
211|旗|flag|bandera|bandeira|drapeau|bandiera|Flagge
212|ホルン|horn|trompa|trompa|cor|corno|Waldhorn
213|ブラインド|window blind|persiana|persiana|store|tenda|Jalousie
214|足|foot|pie|pé|pied|piede|Fuß
215|ゴルフカート|golf cart|carrito de golf|carrinho de golfe|voiturette de golf|carrello da golf|Golfwagen
218|街灯|street light|farola|poste de luz|lampadaire|lampione|Straßenlaterne
219|ギター|guitar|guitarra|violão|guitare|chitarra|Gitarre
221|脚|leg|pierna|perna|jambe|gamba|Bein
222|ワラジムシ|isopod|isópodo|isópode|isopode|isopode|Assel
223|ブドウ|grape|uva|uva|raisin|uva|Weintraube
224|耳|ear|oreja|orelha|oreille|orecchio|Ohr
225|電源プラグとコンセント|power plugs and sockets|enchufes y tomas|plugues e tomadas|prises électriques|spine e prese|Stecker und Steckdosen
226|パンダ|panda|panda|panda|panda|panda|Panda
228|女性|woman|mujer|mulher|femme|donna|Frau
229|ドアノブ|door handle|pomo de puerta|maçaneta|poignée de porte|maniglia della porta|Türgriff
230|サイ|rhinoceros|rinoceronte|rinoceronte|rhinocéros|rinoceronte|Nashorn
232|金魚|goldfish|pez dorado|peixe-dourado|poisson rouge|pesce rosso|Goldfisch
233|観葉植物|houseplant|planta de interior|planta de interior|plante d’intérieur|pianta da interno|Zimmerpflanze
234|ヤギ|goat|cabra|cabra|chèvre|capra|Ziege
237|ミキシングボウル|mixing bowl|cuenco para mezclar|tigela para misturar|saladier|ciotola per mescolare|Rührschüssel
238|海洋無脊椎動物|marine invertebrate|invertebrado marino|invertebrado marinho|invertébré marin|invertebrato marino|Wirbelloses Meerestier
239|調理器具|kitchen utensil|utensilio de cocina|utensílio de cozinha|ustensile de cuisine|utensile da cucina|Küchenutensil
240|照明スイッチ|light switch|interruptor de luz|interruptor de luz|interrupteur|interruttore della luce|Lichtschalter
243|フィットネスバイク|stationary bicycle|bicicleta estática|bicicleta ergométrica|vélo d’appartement|cyclette|Ergometer
244|ハンマー|hammer|martillo|martelo|marteau|martello|Hammer
245|天井扇|ceiling fan|ventilador de techo|ventilador de teto|ventilateur de plafond|ventilatore a soffitto|Deckenventilator
246|ソファベッド|sofa bed|sofá cama|sofá-cama|canapé-lit|divano letto|Schlafsofa
247|粘着テープ|adhesive tape|cinta adhesiva|fita adesiva|ruban adhésif|nastro adesivo|Klebeband
248|ハープ|harp|arpa|harpa|harpe|arpa|Harfe
249|サンダル|sandal|sandalia|sandália|sandale|sandalo|Sandale
250|自転車用ヘルメット|bicycle helmet|casco de bicicleta|capacete de bicicleta|casque de vélo|casco da bici|Fahrradhelm
251|受け皿|saucer|platillo|pires|soucoupe|piattino|Untertasse
252|チェンバロ|harpsichord|clavicémbalo|cravo|clavecin|clavicembalo|Cembalo
253|髪|hair|cabello|cabelo|cheveux|capelli|Haar
254|暖房器具|heater|calefactor|aquecedor|radiateur|stufa|Heizgerät
255|ハーモニカ|harmonica|armónica|gaita|harmonica|armonica|Mundharmonika
256|ハムスター|hamster|hámster|hamster|hamster|criceto|Hamster
260|暖炉|fireplace|chimenea|lareira|cheminée|camino|Kamin
261|はかり|scale|báscula|balança|balance|bilancia|Waage
262|ストロー|drinking straw|pajita|canudo|paille|cannuccia|Trinkhalm
263|昆虫|insect|insecto|inseto|insecte|insetto|Insekt
264|ヘアドライヤー|hair dryer|secador de pelo|secador de cabelo|sèche-cheveux|asciugacapelli|Haartrockner
265|台所用品|kitchenware|utensilios de cocina|utensílios de cozinha|ustensiles de cuisine|utensili da cucina|Küchenutensilien
266|ローイングマシン|indoor rower|máquina de remo|remador ergométrico|rameur d’intérieur|vogatore|Rudergerät
267|無脊椎動物|invertebrate|invertebrado|invertebrado|invertébré|invertebrato|Wirbelloses Tier
268|フードプロセッサー|food processor|procesador de alimentos|processador de alimentos|robot culinaire|robot da cucina|Küchenmaschine
269|本棚|bookcase|estantería|estante para livros|bibliothèque|libreria|Bücherregal
271|薪ストーブ|wood-burning stove|estufa de leña|fogão a lenha|poêle à bois|stufa a legna|Holzofen
272|サンドバッグ|punching bag|saco de boxeo|saco de pancadas|sac de frappe|sacco da boxe|Boxsack
273|イチジク|common fig|higo|figo|figue|fico|Feige
274|カクテルシェーカー|cocktail shaker|coctelera|coqueteleira|shaker à cocktail|shaker per cocktail|Cocktailshaker
275|ジャガー|jaguar|jaguar|jaguar|jaguar|giaguaro|Jaguar
276|ゴルフボール|golf ball|pelota de golf|bola de golfe|balle de golf|pallina da golf|Golfball
277|ファッション小物|fashion accessory|complemento de moda|acessório de moda|accessoire de mode|accessorio di moda|Modeaccessoire
278|目覚まし時計|alarm clock|despertador|despertador|réveil|sveglia|Wecker
279|ファイルキャビネット|filing cabinet|archivador|arquivo|classeur|schedario|Aktenschrank
280|アーティチョーク|artichoke|alcachofa|alcachofra|artichaut|carciofo|Artischocke
282|食器|tableware|vajilla|louça|vaisselle|stoviglie|Geschirr
283|カンガルー|kangaroo|canguro|canguru|kangourou|canguro|Känguru
284|コアラ|koala|koala|coala|koala|koala|Koala
287|栓抜き|bottle opener|abrebotellas|abridor de garrafas|ouvre-bouteille|apribottiglie|Flaschenöffner
288|オオヤマネコ|lynx|lince|lince|lynx|lince|Luchs
289|ラベンダー|lavender|lavanda|lavanda|lavande|lavanda|Lavendel
290|灯台|lighthouse|faro|farol|phare|faro|Leuchtturm
291|ダンベル|dumbbell|mancuerna|halter|haltère|manubrio|Kurzhantel
292|頭|head|cabeza|cabeça|tête|testa|Kopf
294|加湿器|humidifier|humidificador|umidificador|humidificateur|umidificatore|Luftbefeuchter
295|玄関ポーチ|porch|porche|varanda|porche|portico|Veranda
296|トカゲ|lizard|lagarto|lagarto|lézard|lucertola|Eidechse
297|ビリヤード台|billiard table|mesa de billar|mesa de bilhar|table de billard|tavolo da biliardo|Billardtisch
298|哺乳類|mammal|mamífero|mamífero|mammifère|mammifero|Säugetier
301|楽器|musical instrument|instrumento musical|instrumento musical|instrument de musique|strumento musicale|Musikinstrument
302|水泳帽|swim cap|gorro de natación|touca de natação|bonnet de bain|cuffia da nuoto|Badekappe
304|除雪車|snowplow|quitanieves|limpa-neve|chasse-neige|spazzaneve|Schneepflug
305|洗面所の収納棚|bathroom cabinet|armario de baño|armário de banheiro|armoire de salle de bains|mobile da bagno|Badezimmerschrank
306|ミサイル|missile|misil|míssil|missile|missile|Rakete
307|胸像|bust|busto|busto|buste|busto|Büste
308|男性|man|hombre|homem|homme|uomo|Mann
309|ワッフルメーカー|waffle iron|gofrera|máquina de waffle|gaufrier|piastra per waffle|Waffeleisen
310|牛乳|milk|leche|leite|lait|latte|Milch
311|リングファイル|ring binder|carpeta de anillas|fichário|classeur à anneaux|raccoglitore ad anelli|Ringordner
313|携帯電話|mobile phone|teléfono móvil|telemóvel|téléphone portable|cellulare|Handy
314|焼き菓子|baked goods|productos horneados|produtos de forno|pâtisseries|prodotti da forno|Backwaren
315|キノコ|mushroom|seta|cogumelo|champignon|fungo|Pilz
316|松葉づえ|crutch|muleta|muleta|béquille|stampella|Krücke
317|ピッチャー|pitcher|jarra|jarra|pichet|brocca|Krug
319|救命胴衣|lifejacket|chaleco salvavidas|colete salva-vidas|gilet de sauvetage|giubbotto salvagente|Rettungsweste
320|卓球ラケット|table tennis racket|pala de tenis de mesa|raquete de tênis de mesa|raquette de tennis de table|racchetta da ping-pong|Tischtennisschläger
321|筆箱|pencil case|estuche|estojo|trousse|astuccio|Federmäppchen
322|電子キーボード|musical keyboard|teclado musical|teclado musical|clavier électronique|tastiera musicale|Keyboard
323|得点表示板|scoreboard|marcador|placar|tableau d’affichage|tabellone segnapunti|Anzeigetafel
324|ブリーフケース|briefcase|maletín|pasta executiva|serviette|valigetta|Aktentasche
325|包丁|kitchen knife|cuchillo de cocina|faca de cozinha|couteau de cuisine|coltello da cucina|Küchenmesser
326|釘|nail|clavo|prego|clou|chiodo|Nagel
327|テニスボール|tennis ball|pelota de tenis|bola de tênis|balle de tennis|pallina da tennis|Tennisball
328|ビニール袋|plastic bag|bolsa de plástico|saco de plástico|sac en plastique|sacchetto di plastica|Plastiktüte
329|オーボエ|oboe|oboe|oboé|hautbois|oboe|Oboe
330|たんす|chest of drawers|cómoda|cômoda|commode|cassettiera|Kommode
331|ダチョウ|ostrich|avestruz|avestruz|autruche|struzzo|Strauß
332|ピアノ|piano|piano|piano|piano|pianoforte|Klavier
333|女の子|girl|niña|menina|fille|ragazza|Mädchen
334|植物|plant|planta|planta|plante|pianta|Pflanze
335|ジャガイモ|potato|patata|batata|pomme de terre|patata|Kartoffel
336|ヘアスプレー|hair spray|laca|spray para cabelo|laque|lacca|Haarspray
337|スポーツ用品|sports equipment|equipamiento deportivo|equipamento esportivo|équipement sportif|attrezzatura sportiva|Sportausrüstung
339|ペンギン|penguin|pingüino|pinguim|manchot|pinguino|Pinguin
340|カボチャ|pumpkin|calabaza|abóbora|citrouille|zucca|Kürbis
341|洋ナシ|pear|pera|pera|poire|pera|Birne
342|ベビーベッド|infant bed|cuna|berço|lit pour bébé|lettino|Babybett
343|ホッキョクグマ|polar bear|oso polar|urso-polar|ours polaire|orso polare|Eisbär
344|ミキサー|mixer|batidora|batedeira|batteur|sbattitore|Rührgerät
345|食器棚|cupboard|armario|armário|placard|credenza|Schrank
346|ジャグジー|Jacuzzi|jacuzzi|banheira de hidromassagem|jacuzzi|vasca idromassaggio|Whirlpool
348|デジタル時計|digital clock|reloj digital|relógio digital|horloge numérique|orologio digitale|Digitaluhr
350|爬虫類|reptile|reptil|réptil|reptile|rettile|Reptil
351|ライフル|rifle|rifle|rifle|fusil|fucile|Gewehr
352|口紅|lipstick|pintalabios|batom|rouge à lèvres|rossetto|Lippenstift
354|ワタリガラス|raven|cuervo|corvo|grand corbeau|corvo imperiale|Rabe
355|ハイヒール|high heels|tacones altos|salto alto|talons hauts|tacchi alti|hohe Absätze
356|レッサーパンダ|red panda|panda rojo|panda-vermelho|panda roux|panda rosso|Roter Panda
357|バラ|rose|rosa|rosa|rose|rosa|Rose
359|彫刻|sculpture|escultura|escultura|sculpture|scultura|Skulptur
360|サクソフォン|saxophone|saxofón|saxofone|saxophone|sassofono|Saxofon
361|ショットガン|shotgun|escopeta|espingarda|fusil à pompe|fucile a pompa|Schrotflinte
362|魚介類|seafood|marisco|frutos do mar|fruits de mer|frutti di mare|Meeresfrüchte
363|サブマリンサンドイッチ|submarine sandwich|sándwich submarino|sanduíche submarino|sandwich sous-marin|panino sottomarino|Sub-Sandwich
365|剣|sword|espada|espada|épée|spada|Schwert
366|写真立て|picture frame|marco de fotos|porta-retrato|cadre photo|cornice|Bilderrahmen
367|寿司|sushi|sushi|sushi|sushi|sushi|Sushi
368|二人掛けソファ|loveseat|sofá de dos plazas|sofá de dois lugares|causeuse|divanetto|Zweisitzersofa
369|スキー板|ski|esquí|esqui|ski|sci|Ski
370|リス|squirrel|ardilla|esquilo|écureuil|scoiattolo|Eichhörnchen
371|三脚|tripod|trípode|tripé|trépied|treppiede|Stativ
372|聴診器|stethoscope|estetoscopio|estetoscópio|stéthoscope|stetoscopio|Stethoskop
373|潜水艦|submarine|submarino|submarino|sous-marin|sottomarino|U-Boot
374|サソリ|scorpion|escorpión|escorpião|scorpion|scorpione|Skorpion
375|セグウェイ|Segway|Segway|Segway|Segway|Segway|Segway
376|トレーニングベンチ|training bench|banco de entrenamiento|banco de treino|banc de musculation|panca da allenamento|Trainingsbank
377|ヘビ|snake|serpiente|cobra|serpent|serpente|Schlange
378|コーヒーテーブル|coffee table|mesa de centro|mesa de centro|table basse|tavolino|Couchtisch
379|高層ビル|skyscraper|rascacielos|arranha-céu|gratte-ciel|grattacielo|Wolkenkratzer
382|トロンボーン|trombone|trombón|trombone|trombone|trombone|Posaune
383|お茶|tea|té|chá|thé|tè|Tee
384|戦車|tank|tanque|tanque|char|carro armato|Panzer
385|タコス|taco|taco|taco|taco|taco|Taco
386|電話機|telephone|teléfono|telefone|téléphone|telefono|Telefon
387|たいまつ|torch|antorcha|tocha|torche|torcia|Fackel
388|トラ|tiger|tigre|tigre|tigre|tigre|Tiger
390|トランペット|trumpet|trompeta|trompete|trompette|tromba|Trompete
394|工具|tool|herramienta|ferramenta|outil|attrezzo|Werkzeug
395|ピクニックバスケット|picnic basket|cesta de pícnic|cesta de piquenique|panier de pique-nique|cestino da picnic|Picknickkorb
396|調理用スプレー|cooking spray|aceite en aerosol|óleo culinário em spray|huile en spray|olio spray da cucina|Backspray
397|ズボン|trousers|pantalones|calças|pantalon|pantaloni|Hose
398|ボウリング用品|bowling equipment|equipo de bolos|equipamento de boliche|équipement de bowling|attrezzatura da bowling|Bowlingausrüstung
399|アメリカンフットボール用ヘルメット|football helmet|casco de fútbol americano|capacete de futebol americano|casque de football américain|casco da football americano|Footballhelm
401|計量カップ|measuring cup|vaso medidor|copo medidor|tasse à mesurer|misurino|Messbecher
402|コーヒーメーカー|coffee maker|cafetera|cafeteira|cafetière|macchina da caffè|Kaffeemaschine
403|バイオリン|violin|violín|violino|violon|violino|Geige
404|乗り物|vehicle|vehículo|veículo|véhicule|veicolo|Fahrzeug
406|ペーパーカッター|paper cutter|cortador de papel|cortador de papel|massicot|taglierina|Papierschneider
407|ワイン|wine|vino|vinho|vin|vino|Wein
408|武器|weapon|arma|arma|arme|arma|Waffe
409|車輪|wheel|rueda|roda|roue|ruota|Rad
410|ミミズ|worm|gusano|minhoca|ver|verme|Wurm
411|中華鍋|wok|wok|wok|wok|wok|Wok
412|クジラ|whale|ballena|baleia|baleine|balena|Wal
414|自動車部品|auto part|pieza de automóvil|peça de automóvel|pièce automobile|ricambio auto|Autoteil
415|水差し|jug|jarra|jarro|broc|brocca|Krug
416|ピザカッター|pizza cutter|cortador de pizza|cortador de pizza|roulette à pizza|rotella tagliapizza|Pizzaschneider
417|クリーム|cream|crema|creme|crème|crema|Sahne
418|サル|monkey|mono|macaco|singe|scimmia|Affe
419|ライオン|lion|león|leão|lion|leone|Löwe
421|大皿|platter|fuente|travessa|plat de service|vassoio da portata|Servierplatte
422|ニワトリ|chicken|pollo|galinha|poulet|pollo|Huhn
423|ワシ|eagle|águila|águia|aigle|aquila|Adler
424|ヘリコプター|helicopter|helicóptero|helicóptero|hélicoptère|elicottero|Hubschrauber
425|フクロウ|owl|búho|coruja|hibou|gufo|Eule
426|アヒル|duck|pato|pato|canard|anatra|Ente
427|カメ|turtle|tortuga|tartaruga|tortue|tartaruga|Schildkröte
428|カバ|hippopotamus|hipopótamo|hipopótamo|hippopotame|ippopotamo|Nilpferd
429|ワニ|crocodile|cocodrilo|crocodilo|crocodile|coccodrillo|Krokodil
431|トイレットペーパー|toilet paper|papel higiénico|papel higiênico|papier toilette|carta igienica|Toilettenpapier
432|イカ|squid|calamar|lula|calmar|calamaro|Tintenfisch
433|衣類|clothing|ropa|roupa|vêtements|abbigliamento|Kleidung
434|履物|footwear|calzado|calçado|chaussures|calzature|Schuhe
436|クモ|spider|araña|aranha|araignée|ragno|Spinne
437|シカ|deer|ciervo|veado|cerf|cervo|Hirsch
438|カエル|frog|rana|sapo|grenouille|rana|Frosch
440|ロケット|rocket|cohete|foguete|fusée|razzo|Rakete
442|カウンタートップ|countertop|encimera|bancada|plan de travail|piano di lavoro|Arbeitsplatte
443|タブレット端末|tablet computer|tableta|tablet|tablette|tablet|Tablet
444|ごみ容器|waste container|contenedor de residuos|contentor de resíduos|bac à déchets|contenitore dei rifiuti|Abfallbehälter
445|プール|swimming pool|piscina|piscina|piscine|piscina|Schwimmbad
449|サメ|shark|tiburón|tubarão|requin|squalo|Hai
450|ろうそく|candle|vela|vela|bougie|candela|Kerze
451|ヒョウ|leopard|leopardo|leopardo|léopard|leopardo|Leopard
452|斧|axe|hacha|machado|hache|ascia|Axt
453|ハンドドライヤー|hand dryer|secador de manos|secador de mãos|sèche-mains|asciugamani elettrico|Händetrockner
454|ソープディスペンサー|soap dispenser|dispensador de jabón|dispenser de sabonete|distributeur de savon|dispenser di sapone|Seifenspender
455|ヤマアラシ|porcupine|puercoespín|porco-espinho|porc-épic|istrice|Stachelschwein
457|カナリア|canary|canario|canário|canari|canarino|Kanarienvogel
458|チーター|cheetah|guepardo|guepardo|guépard|ghepardo|Gepard
459|ヤシの木|palm tree|palmera|palmeira|palmier|palma|Palme
461|カエデ|maple|arce|bordo|érable|acero|Ahorn
462|建物|building|edificio|edifício|bâtiment|edificio|Gebäude
464|ロブスター|lobster|langosta|lagosta|homard|aragosta|Hummer
465|アスパラガス|asparagus|espárrago|aspargo|asperge|asparago|Spargel
466|家具|furniture|muebles|mobília|meubles|mobili|Möbel
467|ハリネズミ|hedgehog|erizo|ouriço|hérisson|riccio|Igel
470|カワウソ|otter|nutria|lontra|loutre|lontra|Otter
471|雄牛|bull|toro|touro|taureau|toro|Stier
472|カキ|oyster|ostra|ostra|huître|ostrica|Auster
473|鉄棒|horizontal bar|barra horizontal|barra fixa|barre fixe|sbarra|Reck
474|コンビニ|convenience store|tienda de conveniencia|loja de conveniência|supérette|negozio di alimentari|Convenience-Store
475|爆弾|bomb|bomba|bomba|bombe|bomba|Bombe
477|アイスクリーム|ice cream|helado|sorvete|glace|gelato|Eis
478|毛虫|caterpillar|oruga|lagarta|chenille|bruco|Raupe
480|パラシュート|parachute|paracaídas|paraquedas|parachute|paracadute|Fallschirm
482|レイヨウ|antelope|antílope|antílope|antilope|antilope|Antilope
483|ビーカー|beaker|vaso de precipitados|béquer|bécher|becher|Becherglas
484|ガまたはチョウ|moth or butterfly|polilla o mariposa|mariposa-noturna ou borboleta|papillon de nuit ou papillon|falena o farfalla|Nachtfalter oder Schmetterling
486|クローゼット|closet|armario|armário|placard|armadio|Kleiderschrank
487|城|castle|castillo|castelo|château|castello|Burg
488|クラゲ|jellyfish|medusa|água-viva|méduse|medusa|Qualle
489|ガチョウ|goose|ganso|ganso|oie|oca|Gans
490|ラバ|mule|mula|mula|mule|mulo|Maultier
491|白鳥|swan|cisne|cisne|cygne|cigno|Schwan
492|桃|peach|melocotón|pêssego|pêche|pesca|Pfirsich
493|ココナッツ|coconut|coco|coco|noix de coco|cocco|Kokosnuss
494|シートベルト|seat belt|cinturón de seguridad|cinto de segurança|ceinture de sécurité|cintura di sicurezza|Sicherheitsgurt
495|アライグマ|raccoon|mapache|guaxinim|raton laveur|procione|Waschbär
496|のみ|chisel|cincel|cinzel|ciseau|scalpello|Meißel
499|カメラ|camera|cámara|câmera|appareil photo|fotocamera|Kamera
500|カボチャ類|squash|calabaza|abóbora|courge|zucca|Kürbis
501|ラケット|racket|raqueta|raquete|raquette|racchetta|Schläger
502|顔|face|cara|rosto|visage|viso|Gesicht
503|腕|arm|brazo|braço|bras|braccio|Arm
504|野菜|vegetable|verdura|legume|légume|verdura|Gemüse
505|おむつ|diaper|pañal|fralda|couche|pannolino|Windel
506|一輪車|unicycle|monociclo|monociclo|monocycle|monociclo|Einrad
507|ハヤブサ|falcon|halcón|falcão|faucon|falco|Falke
508|チャイム|chime|campanilla|campainha|carillon|campanello|Glockenspiel
509|カタツムリ|snail|caracol|caracol|escargot|lumaca|Schnecke
510|貝類|shellfish|marisco|molusco|coquillage|mollusco|Schalentiere
511|キャベツ|cabbage|col|repolho|chou|cavolo|Kohl
513|マンゴー|mango|mango|manga|mangue|mango|Mango
514|ジーンズ|jeans|vaqueros|jeans|jean|jeans|Jeans
515|植木鉢|flowerpot|maceta|vaso de planta|pot de fleurs|vaso da fiori|Blumentopf
516|パイナップル|pineapple|piña|abacaxi|ananas|ananas|Ananas
517|引き出し|drawer|cajón|gaveta|tiroir|cassetto|Schublade
518|スツール|stool|taburete|banqueta|tabouret|sgabello|Hocker
519|封筒|envelope|sobre|envelope|enveloppe|busta|Umschlag
521|トンボ|dragonfly|libélula|libélula|libellule|libellula|Libelle
522|ヒマワリ|sunflower|girasol|girassol|tournesol|girasole|Sonnenblume
523|電子レンジ|microwave oven|microondas|forno de micro-ondas|four à micro-ondes|forno a microonde|Mikrowelle
524|ハニカム|honeycomb|panal|favo de mel|rayon de miel|favo|Bienenwabe
525|海生哺乳類|marine mammal|mamífero marino|mamífero marinho|mammifère marin|mammifero marino|Meeressäuger
526|アシカ|sea lion|león marino|leão-marinho|otarie|leone marino|Seelöwe
527|テントウムシ|ladybug|mariquita|joaninha|coccinelle|coccinella|Marienkäfer
528|棚|shelf|estante|prateleira|étagère|mensola|Regal
530|キャンディ|candy|caramelo|doce|bonbon|caramella|Bonbon
531|サラダ|salad|ensalada|salada|salade|insalata|Salat
532|オウム|parrot|loro|papagaio|perroquet|pappagallo|Papagei
533|拳銃|handgun|pistola|arma de mão|arme de poing|pistola|Handfeuerwaffe
534|スズメ|sparrow|gorrión|pardal|moineau|passero|Spatz
535|バン|van|furgoneta|van|fourgonnette|furgone|Kleintransporter
536|グラインダー|grinder|amoladora|moedor|meuleuse|smerigliatrice|Schleifmaschine
537|スパイスラック|spice rack|especiero|porta-temperos|porte-épices|portaspezie|Gewürzregal
538|電球|light bulb|bombilla|lâmpada|ampoule|lampadina|Glühbirne
539|有線電話|corded phone|teléfono con cable|telefone com fio|téléphone filaire|telefono fisso|Festnetztelefon
540|スポーツユニフォーム|sports uniform|uniforme deportivo|uniforme esportivo|tenue de sport|divisa sportiva|Sportkleidung
542|掛け時計|wall clock|reloj de pared|relógio de parede|horloge murale|orologio da parete|Wanduhr
543|配膳トレー|serving tray|bandeja|bandeja|plateau de service|vassoio da portata|Serviertablett
544|キッチンテーブル|kitchen table|mesa de cocina|mesa de cozinha|table de cuisine|tavolo da cucina|Küchentisch
545|犬用ベッド|dog bed|cama para perros|cama para cachorro|panier pour chien|cuccia per cani|Hundebett
546|ケーキスタンド|cake stand|soporte para tartas|suporte para bolo|présentoir à gâteau|alzata per torte|Kuchenständer
547|猫用家具|cat furniture|muebles para gatos|móveis para gatos|meuble pour chat|arredo per gatti|Katzenmöbel
548|浴室用品|bathroom accessory|accesorio de baño|acessório de banheiro|accessoire de salle de bains|accessorio da bagno|Badezimmerzubehör
549|ティッシュケース|facial tissue holder|portapañuelos|porta-lenços|boîte à mouchoirs|portafazzoletti|Papiertaschentuchbox
550|圧力鍋|pressure cooker|olla a presión|panela de pressão|autocuiseur|pentola a pressione|Schnellkochtopf
551|キッチン家電|kitchen appliance|electrodoméstico de cocina|eletrodoméstico de cozinha|appareil de cuisine|elettrodomestico da cucina|Küchengerät
552|タイヤ|tire|neumático|pneu|pneu|pneumatico|Reifen
553|定規|ruler|regla|régua|règle|righello|Lineal
554|かばん類|luggage and bags|equipaje y bolsos|bagagem e bolsas|bagages et sacs|bagagli e borse|Gepäck und Taschen
555|マイク|microphone|micrófono|microfone|microphone|microfono|Mikrofon
558|ペストリー|pastry|bollo|doce de massa|pâtisserie|pasticcino|Gebäck
559|グレープフルーツ|grapefruit|pomelo|toranja|pamplemousse|pompelmo|Grapefruit
560|絆創膏|bandage|tirita|curativo|pansement|cerotto|Pflaster
561|動物|animal|animal|animal|animal|animale|Tier
562|パプリカ|bell pepper|pimiento|pimentão|poivron|peperone|Paprika
563|七面鳥|turkey|pavo|peru|dinde|tacchino|Truthahn
564|ユリ|lily|lirio|lírio|lys|giglio|Lilie
565|ザクロ|pomegranate|granada|romã|grenade|melagrana|Granatapfel
566|ドーナツ|doughnut|rosquilla|rosquinha|beignet|ciambella|Donut
567|眼鏡|glasses|gafas|óculos|lunettes|occhiali|Brille
568|鼻|nose|nariz|nariz|nez|naso|Nase
569|ペン|pen|bolígrafo|caneta|stylo|penna|Stift
570|アリ|ant|hormiga|formiga|fourmi|formica|Ameise
572|航空機|aircraft|aeronave|aeronave|aéronef|velivolo|Flugzeug
573|手|hand|mano|mão|main|mano|Hand
574|スカンク|skunk|mofeta|gambá|mouffette|moffetta|Stinktier
577|カンタロープ|cantaloupe|melón cantalupo|melão-cantalupo|cantaloup|melone cantalupo|Cantaloupe-Melone
578|食器洗い機|dishwasher|lavavajillas|lava-louças|lave-vaisselle|lavastoviglie|Geschirrspüler
579|フルート|flute|flauta|flauta|flûte|flauto|Flöte
580|平均台|balance beam|barra de equilibrio|trave de equilíbrio|poutre d’équilibre|trave di equilibrio|Schwebebalken
582|エビ|shrimp|gamba|camarão|crevette|gambero|Garnele
583|ミシン|sewing machine|máquina de coser|máquina de costura|machine à coudre|macchina da cucire|Nähmaschine
584|双眼鏡|binoculars|prismáticos|binóculos|jumelles|binocolo|Fernglas
585|エイ|ray or skate|raya|raia|raie|razza|Rochen
586|iPod|iPod|iPod|iPod|iPod|iPod|iPod
587|アコーディオン|accordion|acordeón|acordeão|accordéon|fisarmonica|Akkordeon
588|ヤナギ|willow|sauce|salgueiro|saule|salice|Weide
589|カニ|crab|cangrejo|caranguejo|crabe|granchio|Krabbe
590|王冠|crown|corona|coroa|couronne|corona|Krone
591|タツノオトシゴ|seahorse|caballito de mar|cavalo-marinho|hippocampe|cavalluccio marino|Seepferdchen
592|香水|perfume|perfume|perfume|parfum|profumo|Parfüm
593|アルパカ|alpaca|alpaca|alpaca|alpaga|alpaca|Alpaka
594|タクシー|taxi|taxi|táxi|taxi|taxi|Taxi
595|カヌー|canoe|canoa|canoa|canoë|canoa|Kanu
597|車椅子|wheelchair|silla de ruedas|cadeira de rodas|fauteuil roulant|sedia a rotelle|Rollstuhl
598|ラグビーボール|rugby ball|balón de rugby|bola de rúgbi|ballon de rugby|palla da rugby|Rugbyball
599|アルマジロ|armadillo|armadillo|tatu|tatou|armadillo|Gürteltier
600|マラカス|maracas|maracas|maracas|maracas|maracas|Maracas
601|ヘルメット|helmet|casco|capacete|casque|casco|Helm
299|ネズミ|mouse|ratón|camundongo|souris|topo|Maus
`;

const byId = new Map(translations.trim().split('\n').filter(Boolean).map((line) => {
  const [id, ja, en, es, pt, fr, it, de] = line.split('|');
  return [Number(id), { ja, en, es, pt, fr, it, de }];
}));

const existing = new Map([...DETECTION_VOCAB, ...VOCAB].map((entry) => {
  const label = entry.label ?? entry.words.en;
  return [label.toLowerCase(), entry.words];
}));

const englishDisplay = new Map([
  ['Human eye', 'eye'], ['Human beard', 'beard'], ['Human mouth', 'mouth'],
  ['Human foot', 'foot'], ['Human leg', 'leg'], ['Human ear', 'ear'],
  ['Human body', 'body'], ['Human head', 'head'], ['Human hair', 'hair'],
  ['Human face', 'face'], ['Human arm', 'arm'], ['Human nose', 'nose'],
  ['Human hand', 'hand'], ['Vehicle registration plate', 'license plate'],
  ['Kitchen & dining room table', 'kitchen table'], ['Ipod', 'iPod'],
  ['Moths and butterflies', 'moth or butterfly'], ['Rays and skates', 'ray or skate'],
  ['Luggage and bags', 'luggage or bag'],
]);

// The source MIDs disambiguate Organ (music), Horn (French horn), Scale
// (weighing scale), Mouse (animal), Tank (armored vehicle), and Torch (flame).
export const OPENIMAGES_VOCAB = labels.map(({ id: numericId, label }) => {
  const words = byId.get(numericId) ?? existing.get(label.toLowerCase());
  if (!words) throw new Error(`Missing Open Images translation for ID ${numericId}: ${label}`);
  const en = englishDisplay.get(label) ?? words.en ?? label.toLowerCase();
  return { id: `oi-${numericId}`, label, ja: words.ja, words: { en, es: words.es, pt: words.pt, fr: words.fr, it: words.it, de: words.de, ja: words.ja } };
});

export const OPENIMAGES_BY_LABEL = new Map(OPENIMAGES_VOCAB.map((entry) => [entry.label, entry]));
