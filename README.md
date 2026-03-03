# Juan Peco — Web estática (GitHub Pages)

## Qué incluye
- HTML/CSS/JS sin frameworks
- Laboratorio interactivo (test, presupuesto, ROI, equilibrio, DAFO, márgenes, factura, tendencias)
- Banco de Prompts cargado desde `data/prompts.json` (ideal para 50 categorías / 500 prompts)

## Cómo actualizar el banco de prompts
1. Edita `data/prompts.json`
2. Mantén el formato:
   {
     "Categoria 1": [{"title":"...", "text":"..."}, ...],
     "Categoria 2": [{"title":"...", "text":"..."}, ...]
   }
3. Guarda y haz commit

## Publicar en GitHub Pages
Settings → Pages → Deploy from a branch → main / (root)
