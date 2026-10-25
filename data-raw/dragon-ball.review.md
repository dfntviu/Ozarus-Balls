# Revisión editorial — saga dragon-ball

Generado por `scripts/normalize-saga.ts`. Edita `data-raw/dragon-ball.editorial.json` y vuelve a correr el script.

- **31** personajes · tier editorial en **31** (revísalos) · `purpose` pendiente en **31**.

## sin arco

| id | rol | raza | tier | origen tier | poder | transformaciones | técnicas | nota |
|---|---|---|---|---|---|---|---|---|
| goku-dragon-ball | hero | saiyan | 5 | editorial | — |  | 3 |  |
| rey-piccolo-dragon-ball | villain | namekian | 5 | editorial | — |  | 4 |  |
| kamisama-dragon-ball | hero | namekian | 4 | editorial | — |  | 4 |  |
| ten-shin-han-dragon-ball | hero | human | 4 | editorial | — |  | 3 |  |
| yamcha-dragon-ball | hero | human | 3 | editorial | — |  | 3 |  |
| maestro-roshi-dragon-ball | hero | human | 3 | editorial | — |  | 3 | Descripción de Max Power redactada por Claude (la original era una copia de una técnica de Kami): verifícala. |
| jackie-chun-dragon-ball | hero | human | 3 | editorial | — |  | 3 | Es la identidad secreta del Maestro Roshi: ¿ficha aparte o alias de Roshi? |
| mr-popo-dragon-ball | support | alien | 3 | editorial | — |  | 4 | Raza no especificada en la serie; alien provisional. |
| tao-pai-pai-dragon-ball | villain | human | 3 | editorial | — |  | 3 |  |
| demonio-mai-dragon-ball | villain | demon | 3 | editorial | — |  | 4 | La imagen es 'ayudante.picolo' y tiene alas: ¿es Tambourine? Mai (asistente de Pilaf) ya tiene su ficha. |
| cymbal-dragon-ball | villain | demon | 3 | editorial | — |  | 0 |  |
| abuelo-gohan-dragon-ball | hero | human | 2 | editorial | — |  | 0 |  |
| oxatan-dragon-ball | support | human | 2 | editorial | — |  | 3 |  |
| bora-dragon-ball | hero | human | 2 | editorial | — |  | 3 |  |
| yajirobe-dragon-ball | hero | human | 2 | editorial | — |  | 3 |  |
| chaoz-dragon-ball | hero | human | 2 | editorial | — |  | 3 |  |
| general-blue-dragon-ball | villain | human | 2 | editorial | — |  | 0 |  |
| maestro-shen-dragon-ball | villain | human | 2 | editorial | — |  | 0 |  |
| ninja-purpura-dragon-ball | villain | human | 2 | editorial | — |  | 0 |  |
| androide-8-dragon-ball | hero | android | 2 | editorial | — |  | 3 | Venía en la página de Villanos, pero en la serie se pone del lado de Goku. |
| giran-dragon-ball | villain | monster | 2 | editorial | — |  | 3 | Es rival de torneo, no estrictamente villano. |
| bulma-dragon-ball | support | human | 1 | editorial | — |  | 0 |  |
| oolong-dragon-ball | support | anthropomorphic | 1 | editorial | — |  | 3 |  |
| puar-dragon-ball | support | anthropomorphic | 1 | editorial | — |  | 2 |  |
| uranai-baba-dragon-ball | support | human | 1 | editorial | — |  | 3 |  |
| chi-chi-dragon-ball | support | human | 1 | editorial | — |  | 3 |  |
| emperador-pilaf-dragon-ball | villain | alien | 1 | editorial | — |  | 0 | Raza no especificada; alien provisional. |
| general-red-dragon-ball | villain | human | 1 | editorial | — |  | 0 |  |
| mai-dragon-ball | villain | human | 1 | editorial | — |  | 0 |  |
| lunch-dragon-ball | support | human | 1 | editorial | — |  | 0 | Venía en la página de Villanos; en la serie termina como aliada. ¿villain o support? |
| coronel-silver-dragon-ball | villain | human | 1 | editorial | — |  | 0 |  |

## Notas de la extracción

- `abuelo-gohan-dragon-ball`: nombre corregido: "abuelo gohan" → "Abuelo Gohan"
- `yamcha-dragon-ball`: nombre corregido: "yamcha" → "Yamcha"
- `oolong-dragon-ball`: nombre corregido: "oloog" → "Oolong"
- `kamisama-dragon-ball`: nombre corregido: "kami.sama" → "Kamisama"
- `maestro-roshi-dragon-ball`: nombre corregido: "Mutten Roshi" → "Maestro Roshi"
- `jackie-chun-dragon-ball`: nombre corregido: "jakie-chull" → "Jackie Chun"
- `uranai-baba-dragon-ball`: nombre corregido: "Uranai-Baba" → "Uranai Baba"
- `ten-shin-han-dragon-ball`: nombre corregido: "Tenshinhan" → "Ten Shin Han"
- `mr-popo-dragon-ball`: nombre corregido: "Mister. Poppo" → "Mr. Popo"
- `chi-chi-dragon-ball`: nombre corregido: "Chichi Kid" → "Chi-Chi"
- `goku-dragon-ball`: nombre corregido: "Son Goku" → "Goku"
- `puar-dragon-ball`: aparecía dos veces en el HTML: descripciones y técnicas fusionadas en una ficha
- `tao-pai-pai-dragon-ball`: nombre corregido: "tao-pai-pai" → "Tao Pai Pai"
- `red-ribbon-dragon-ball`: nombre corregido: "Red Ribon" → "Red Ribbon"
- `emperador-pilaf-dragon-ball`: nombre corregido: "Emperador Pillaf" → "Emperador Pilaf"
- `maestro-shen-dragon-ball`: nombre corregido: "Maestro-Sheen" → "Maestro Shen"
- `ninja-purpura-dragon-ball`: nombre corregido: "Ninja Purpura" → "Ninja Púrpura"
- `mai-dragon-ball`: nombre corregido: "May" → "Mai"
- `coronel-silver-dragon-ball`: nombre corregido: "coronel silver" → "Coronel Silver"
- `androide-8-dragon-ball`: nombre corregido: "Adroide 8" → "Androide 8"
- `giran-dragon-ball`: nombre corregido: "Reptil Giran" → "Giran"
- `maestro-roshi-dragon-ball`: técnica corregida: "Forma Maxima" → {"name":"Max Power","description":"Roshi expande su masa muscular para multiplicar su fuerza y la potencia de su Kamehameha. Con ella apagó el fuego de la Montaña Frypan y destruyó la Luna."}
- `red-ribbon-dragon-ball`: excluido de personajes: es una organización: convertida en la facción "red-ribbon" (src/data/factions.json)

## Normalización de impacto (verifica el mapeo)

| texto original | impacto |
|---|---|
| Daño Máximo | max |
| Daño Medio | mid |
| Daño Alto(intermido) | high |
| Daño Ninguno | — (utilidad) |
| Daño Intermedio | mid |
| Daño alto Máx | max |
| Daño causado: Ninguno | — (utilidad) |
| alto-minímo | high |
| Daño Medio-medio | mid |
| Daño Causado: Medio-alto | mid |
| Daño Inflijido -Alto medio | high |
| alto-minímo | high |
| Hab. alto-bajo | high |
| Hab: Alta-media | high |
| daño: alto-bajo | high |
| daño medio-medio | mid |
| daño alto alto | high |
