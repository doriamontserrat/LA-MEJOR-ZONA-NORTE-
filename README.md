# LA-MEJOR-ZONA-NORTE-
App de realidad aumentada

## 🚀 Despliegue en Vercel

**⚠️ IMPORTANTE**: El error "No se puede conectar con el servidor" ocurre porque Vercel no puede acceder a una BD local.

### Solución rápida:

1. **Configura una BD remota** (Clever Cloud, PlanetScale, o Railway)
2. **Agrega Environment Variables en Vercel**:
   ```
   DB_HOST=tu_host_remoto
   DB_PORT=3306
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=beisbol_app
   ```
3. **Prueba la conexión**: `node test-vercel.js`

📖 **Ver guía completa en**: [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md)

## ⚙️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# El servidor estará en http://localhost:3000
```

## 📚 Documentación
- [Guía de despliegue en Vercel](./DESPLIEGUE_VERCEL.md)
- [Configuración de BD](./CONFIGURACION_BD.md)

