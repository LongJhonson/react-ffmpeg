#### Notas:
- Hay que guardarlos en otro formato para luego poder unirlos.
- El -i es el input, el -ss es el tiempo de inicio y el -to es el tiempo de fin.
- El -c copy es para que no se reencode el video, sino que se copie tal cual.
- el -i tiene que ir al principio para que el corte sea correcto.
- En el segundo corte no se pone el -to porque se corta hasta el final.


### cortar 1
ffmpeg -i test.mp4 -ss 00:00:00 -to 00:00:10  -c copy out1.ts

### cortar 2
ffmpeg -i test.mp4 -ss 00:00:20 -c copy out2.ts

### unir
ffmpeg -i "concat:out1.ts|out2.ts" -c copy output.mp4
