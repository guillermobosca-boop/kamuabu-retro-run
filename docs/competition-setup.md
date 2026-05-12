# KAMUABU Retro Run - Ranking Online

Esta guía deja el juego convertido en una competición real con ranking global, semanal y por ciudad.

## Arquitectura

- **Frontend**: Phaser + DOM overlays en Vercel
- **Backend**: funciones serverless en `api/`
- **Base de datos**: Supabase Postgres
- **Despliegue**: Vercel
- **Entrada desde la tienda**: enlace o `iframe` desde Shopify

## Endpoints disponibles

- `POST /api/player/register`
- `POST /api/run/start`
- `POST /api/run/finish`
- `GET /api/leaderboard/global`
- `GET /api/leaderboard/weekly`
- `GET /api/leaderboard/city?city=valencia`
- `GET /api/health`

## 1. Crear proyecto en Supabase

1. Entra en [Supabase](https://supabase.com/)
2. Crea un proyecto nuevo
3. Copia:
   - `Project URL`
   - `service_role key`

## 2. Ejecutar el esquema SQL

1. En Supabase, abre `SQL Editor`
2. Crea una query nueva
3. Pega el contenido de [`supabase/schema.sql`](/Users/guillermoboscaolmos/Documents/Codex/2026-04-23-game-studio-plugin-game-studio-openai/supabase/schema.sql)
4. Ejecuta la query

Esto crea:
- jugadores
- sesiones de partida
- resultados de runs
- mejores marcas
- vistas de leaderboard

## 3. Configurar variables en Vercel

En Vercel:

1. Abre el proyecto `kamuabu-retro-run`
2. Ve a `Settings > Environment Variables`
3. Crea estas variables:

### `SUPABASE_URL`
Valor:
- tu `Project URL`

### `SUPABASE_SERVICE_ROLE_KEY`
Valor:
- tu `service_role key`

4. Guarda
5. Haz `Redeploy` del proyecto

## 4. Comprobar que la API está viva

Abre:

- `https://kamuabu-retro-run.vercel.app/api/health`

Respuesta esperada:

```json
{
  "ok": true,
  "service": "kamuabu-retro-run-api",
  "database": "configured"
}
```

## 5. Cómo funciona el juego ya con ranking

### Registro
La primera vez, el juego pide un **apodo**.

### Inicio de partida
Al empezar una partida:
- se crea una `run_session`

### Fin de partida
Al morir o completar:
- se valida el score
- se guarda en `runs`
- se recalculan rangos:
  - global
  - semanal
  - ciudad
- se muestra la pantalla de resultados

## 6. Anti-trampas básico

La API valida:
- ciudad válida
- score máximo razonable
- duración mínima
- ratio score/tiempo
- kills máximas
- combo máximo razonable

Si algo huele raro:
- la partida se guarda
- pero `valid = false`
- y no entra al leaderboard

## 7. Integración con Shopify

### Opción rápida
Añadir en el menú de Shopify un enlace a:

- `https://kamuabu-retro-run.vercel.app`

### Opción integrada
Crear una página y embeber:

```liquid
<div style="max-width: 1400px; margin: 0 auto; padding: 24px 0;">
  <iframe
    src="https://kamuabu-retro-run.vercel.app"
    title="KAMUABU Retro Run"
    style="width: 100%; aspect-ratio: 16 / 9; border: 0; display: block; background: #111;"
    allow="autoplay; fullscreen"
    loading="lazy">
  </iframe>
</div>
```

## 8. Qué mide ya el ranking

Por cada run:
- score
- distancia
- enemigos derrotados
- mini-boss
- boss
- combo máximo
- daño recibido
- arma más potente alcanzada
- calcetines
- camisetas
- scooters
- victoria
- duración

## 9. Qué puedes construir después

### Muy recomendable
- ranking mensual
- premios reales KAMUABU
- página pública `/ranking`
- top por ciudad
- perfil del jugador

### Más adelante
- login enlazado con cliente Shopify
- premios automáticos
- campañas:
  - Top semanal Valencia
  - Top global del mes
  - Descuentos por posición

## 10. Flujo de publicación

Cada vez que hagas cambios:

1. GitHub Desktop
2. `Commit to main`
3. `Push origin`
4. Vercel redepliega

No hace falta tocar Supabase otra vez salvo que cambies el esquema.
