# KAMUABU Retro Run - Production Roadmap

Este proyecto debe evolucionar como un juego arcade serio, no como una demo de navegador.

## Objetivo de juego

Crear una experiencia 2D run-and-gun retro inspirada en recreativas de los 90, con identidad propia KAMUABU:

- Misiones laterales por ciudades.
- Movimiento preciso y justo.
- Disparo, enemigos, pickups, rescates y obstaculos.
- Curva de dificultad calibrada.
- Estetica pixel art urbana/deportiva.
- Partidas cortas, rejugables y divertidas.

## Estado actual

- Selector de ciudad: Valencia, Roma, Paris, Venecia y Londres.
- Movimiento lateral, salto, agacharse y disparo.
- Enemigos con disparo basico.
- Balas del jugador y balas enemigas.
- Cajas rompibles.
- Rescates/prisioneros.
- Pickups KAMUABU: calcetines, camisetas y zapatillas.
- Power-up KAMUABU XL al coger 3 pares de calcetines.
- Jugador pequeno muere de un golpe; jugador XL aguanta un golpe y vuelve a pequeno.

## Correcciones criticas aplicadas

- El salto ya no modifica `runner.y` desde la animacion visual. Phaser Physics controla la posicion vertical.
- Se ha anadido jump buffer y coyote time para que el salto sea mas permisivo.
- Las vallas/obstaculos aparecen menos seguido.
- El director evita juntar obstaculos y enemigos de forma injusta.
- Hay invulnerabilidad corta tras recibir dano.

## Prioridad 1 - Jugabilidad

- Ajustar salto, gravedad y caida con pruebas reales.
- Crear un director de oleadas por secciones, no solo por temporizadores.
- Definir enemigos por rol: soldado, lanzador, corredor, dron, mini-boss.
- Hacer telegraph claro antes de ataques peligrosos.
- Separar obstaculos de combate: no saturar ambos a la vez.
- Ajustar dano para que la muerte se sienta responsabilidad del jugador.

## Prioridad 2 - Arquitectura

- Dividir `src/game.js` en modulos:
- `config/`: ciudades, tuning, constantes.
- `systems/`: input, director, combate, pickups, dano.
- `scenes/`: boot, menu, play.
- `render/`: factories de sprites, fondos y efectos.
- `ui/`: HUD DOM y estado.

## Prioridad 3 - Arte y audio

- Sustituir sprites dibujados por codigo por spritesheets reales.
- Animaciones: idle, run, jump, duck, shoot, hit, power-up, death.
- Fondos por ciudad con capas parallax especificas.
- Efectos: casquillos, humo, explosiones, flashes, hit pause.
- Musica chiptune/funk por ciudad.
- SFX para salto, disparo, pickup, dano, rescate y mision completa.

## Prioridad 4 - Contenido

- Una mision completa por ciudad.
- Objetivos secundarios: rescatar 3 personas, recoger 5 prendas, no recibir dano.
- Ranking local por ciudad.
- Pantalla de resultados con medallas.
- Tienda/coleccion de prendas KAMUABU desbloqueables.

## Criterio de calidad

Una version no se considera buena hasta que:

- El jugador puede sobrevivir al menos 60 segundos si juega bien.
- El primer minuto ensena mecanicas sin castigar demasiado.
- Ninguna muerte ocurre por dos amenazas inevitables juntas.
- El salto responde aunque pulses un poco antes de tocar suelo.
- Los enemigos se pueden leer antes de que disparen.
- La partida tiene ritmo: avance, combate, premio, respiro y nueva presion.
