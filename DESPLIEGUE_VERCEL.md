# Guía de Despliegue en Vercel

## Problema actual
El servidor no se puede conectar a Vercel porque intenta usar una base de datos **local** (`localhost`). En Vercel necesitas una BD **remota**.

## Solución: Pasos para desplegar correctamente

### 1. **Configurar una Base de Datos Remota**

Elige una de estas opciones:

#### Opción A: **Clever Cloud** (Recomendado - MySQL)
1. Crea una cuenta en [Clever Cloud](https://www.clever-cloud.com)
2. Crea una nueva aplicación MySQL
3. Copia los datos de conexión que recibirás

#### Opción B: **PlanetScale** (MySQL compatible)
1. Crea una cuenta en [PlanetScale](https://planetscale.com)
2. Crea una base de datos
3. Copia la cadena de conexión

#### Opción C: **Railway** (Fácil integración)
1. Crea una cuenta en [Railway](https://railway.app)
2. Crea una base de datos MySQL
3. Copia los datos de conexión

### 2. **Configurar Variables en Vercel**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Click en **Settings** → **Environment Variables**
3. Agrega estas variables (con tus datos reales):

```
DB_HOST=tu_host_remoto
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_de_datos
NODE_ENV=production
```

### 3. **Verificar la Conexión**

Después de desplegar, abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/health
```

Deberías ver una respuesta similar a:
```json
{"status":"OK","mensaje":"Servidor y BD funcionando correctamente"}
```

Si ves un error, revisa los logs en:
- Vercel Dashboard → Deployments → View Logs

### 4. **Probar el Login**

Usa esta solicitud desde tu frontend:

```javascript
const response = await fetch('https://tu-proyecto.vercel.app/api/usuarios/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'tu@email.com',
    password: 'tu_contraseña'
  })
});

const data = await response.json();
console.log(data);
```

## Solución rápida para pruebas locales

Si quieres probar en tu máquina local primero:

1. Asegúrate de tener MySQL corriendo localmente
2. Tu `.env` local ya tiene la configuración correcta
3. Corre: `npm start`
4. Prueba en: `http://localhost:3000/api/usuarios/login`

## Problemas comunes

### "No se puede conectar con el servidor"
- ❌ El servidor en Vercel no tiene acceso a tu BD local
- ✅ Necesitas una BD remota (Clever Cloud, PlanetScale, Railway, etc.)

### "Connection timeout"
- Verifica que la BD remota está activa
- Revisa que los datos de conexión son correctos en Environment Variables

### "Error interno del servidor"
- Revisa los logs en Vercel Dashboard
- Verifica que la BD remota tiene las tablas creadas

## Tablas necesarias en la BD remota

Asegúrate de ejecutar el `database.sql` en tu BD remota:

```bash
# Conéctate a tu BD remota y ejecuta:
mysql -h tu_host -u tu_usuario -p tu_base_de_datos < database.sql
```

## Variables de Vercel - Formato correcto

```
DB_HOST=your_host.your_provider.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=beisbol_app
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Nunca guardes contraseñas en tu código. Usa Environment Variables en Vercel.
