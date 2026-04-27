# KAMUABU Retro Run

Prototipo jugable de navegador para KAMUABU: una mision arcade 2D de estilo run-and-gun retro de mayor definicion visual, con selector de ciudades, enemigos, disparos, cajas rompibles, rescates, premios de ropa deportiva, combo, power-up de calcetines y puntuacion.

## Ejecutar

Desde esta carpeta:

```bash
python3 -m http.server 4173
```

Abre:

```text
http://127.0.0.1:4173/
```

## Controles

- `A/D` o `flechas izquierda/derecha`: moverse delante y atras.
- Doble toque en `D` o `flecha derecha`: sprint temporal con animacion de carrera.
- `Espacio` o `flecha arriba`: saltar. Pulsa dos veces para hacer doble salto mas alto.
- `S` o `flecha abajo`: agacharse.
- `J`: disparar.
- `R`: reiniciar partida.
- `ESC`: volver al selector de ciudades.

## Gameplay

- La pantalla avanza cuando empujas hacia la derecha, estilo mision lateral arcade.
- El jugador puede moverse delante y atras dentro de la pantalla.
- Salta barriles y barricadas para sobrevivir.
- El doble salto permite alcanzar plataformas y premios altos.
- Agachate para esquivar drones y obstaculos altos.
- Dispara a enemigos y cajas rompibles.
- Las cajas solidas no se rompen: puedes subirte encima para hacer saltos mas altos y alcanzar premios.
- Los enemigos se aproximan, avisan con un icono antes de disparar y luego atacan.
- Las cajas pueden soltar premios o prisioneros/rescates.
- Rescatar prisioneros da bonus y puede soltar pickups.
- Recoge camisetas, calcetines y zapatillas KAMUABU para sumar puntos.
- Las camisetas dan escudo temporal contra un golpe.
- Las zapatillas activan arma `Heavy` con municion limitada.
- Cada 3 pares de calcetines activan modo `KAMUABU XL`.
- En modo grande sobrevives a un choque: el primer golpe te vuelve pequeno, el segundo te elimina.
- En modo pequeno mueres con un solo choque.
- Encadena premios para subir el combo.
- Si dejas pasar un premio, el combo vuelve a `x1`.
- Ciudades disponibles: Valencia, Roma, Paris, Venecia y Londres.
