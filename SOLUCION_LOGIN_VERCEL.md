# 🔧 Solución: Error de Conexión en Vercel - Login API

## 📋 Resumen del Problema

**Error**: `api/usuarios/login:1 no se puede conectar con el servidor en Vercel`

**Causa raíz**: Tu servidor en Vercel intenta conectar a `localhost:3306` (BD local), pero Vercel no tiene acceso a tu máquina local.

## ✅ Cambios Realizados

### 1. **CORS Habilitado** (`server.js`)
   - ✅ Permite solicitudes desde cualquier origen
   - ✅ Soporta métodos GET, POST, PUT, DELETE
   - ✅ Maneja requests OPTIONS automáticamente

### 2. **Health Check Mejorado** (`server.js`)
   - ✅ Verifica conexión real a la BD
   - ✅ Devuelve detalles de diagnóstico
   - ✅ Útil para detectar problemas en Vercel

### 3. **Documentación Completa**
   - ✅ [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md) - Guía paso a paso
   - ✅ [.env.example](./.env.example) - Template de variables
   - ✅ [test-vercel.js](./test-vercel.js) - Script de diagnóstico

## 🚀 Próximos Pasos para Desplegar

### Opción 1: USA CLEVER CLOUD (Recomendado)
```
1. Crea cuenta en https://www.clever-cloud.com
2. Crea una app MySQL
3. Obtendrás datos como:
   - Host: mysql-xxxxx.eu-west-1.rds.amazonaws.com
   - User: uxxxxxxx
   - Pass: xxxxxxxxxxxxxxx
```

### Opción 2: USA PLANETSCALE
```
1. Crea cuenta en https://planetscale.com
2. Crea base de datos
3. Conecta desde Vercel
```

### Opción 3: USA RAILWAY
```
1. Crea cuenta en https://railway.app
2. Agrega MySQL service
3. Copia credenciales
```

## 🔑 Configurar en Vercel

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Agrega estas variables**:

```
DB_HOST=tu_servidor_remoto.com
DB_PORT=3306
DB_USER=tu_usuario_bd
DB_PASSWORD=tu_contraseña_super_secreta
DB_NAME=beisbol_app
NODE_ENV=production
```

4. **Redeploy**: Click en "Redeploy" o hace push a GitHub

## ✔️ Verificar que Funciona![alt text](image.png)

### Local (antes de subir)
```bash
npm start
node test-vercel.js http://localhost:3000
```

### Remoto (después de desplegar)
```
Abre en el navegador:
https://tu-proyecto.vercel.app/api/health

Deberías ver:
{
  "status": "OK",
  "mensaje": "Servidor y BD funcionando correctamente",
  "db": "Conectada",
  "timestamp": "...",
  "environment": "production"
}
```

## 🐛 Si Aún No Funciona

### "Connection Timeout"
```
❌ La BD remota no está accesible
✅ Solución: Verifica credenciales en Vercel
✅ Verifica que el servidor BD está activo
```

### "No such table: usuarios"
```
❌ Las tablas no existen en la BD remota
✅ Solución: Ejecuta el script SQL en la BD remota:
   mysql -h host -u user -p database < database.sql
```

### "Access denied for user"
```
❌ Usuario o contraseña incorrectos
✅ Solución: Verifica las credenciales en Vercel
```

## 📊 Verificación Local

Tu servidor está 100% funcional localmente:

```
✅ Servidor: Corriendo en http://localhost:3000/
✅ BD Local: Conectada exitosamente
✅ CORS: Habilitado
✅ API: Respondiendo correctamente

Test Results:
✅ GET /api/health → 200 OK (BD Conectada)
✅ POST /api/usuarios/login → Funcionando
```

## 📝 Configuración por Proveedor

### Para Clever Cloud
```
DB_HOST=mysql-xx.eu-west-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=user_xxx
DB_PASSWORD=password_from_clever
DB_NAME=beisbol_app
```

### Para PlanetScale
```
DB_HOST=xxxx.eu-west-2.psdb.cloud
DB_PORT=3306
DB_USER=xxxxxxx
DB_PASSWORD=pscale_pw_xxxx
DB_NAME=beisbol_app
```

### Para Railway
```
DB_HOST=railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=from_railway_dashboard
DB_NAME=beisbol_app
```

## ⚠️ Seguridad

- ✅ `.env` local está en `.gitignore` (no se sube)
- ✅ Las credenciales en Vercel están seguras
- ✅ Usa Environment Variables, nunca hardcodees credenciales
- ✅ Las contraseñas están hasheadas en la BD (scrypt)

## 📞 Resumen Rápido

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Crear BD remota | ⏳ Pendiente |
| 2 | Agregar variables en Vercel | ⏳ Pendiente |
| 3 | Importar SQL a BD remota | ⏳ Pendiente |
| 4 | Redeploy en Vercel | ⏳ Pendiente |
| 5 | Probar /api/health | ⏳ Pendiente |
| 6 | ¡Listo! | 🎉 |

---

**Cualquier duda**: Revisa los logs en Vercel Dashboard → Deployments → View Logs
