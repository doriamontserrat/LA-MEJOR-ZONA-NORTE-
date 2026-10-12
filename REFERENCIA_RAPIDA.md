# ⚡ REFERENCIA RÁPIDA - Vercel + BD Remota

## El Problema en 1 Línea
Tu servidor en Vercel intenta conectar a `localhost` (BD local), pero Vercel no puede acceder a tu máquina.

## La Solución en 1 Línea
Usa una BD remota (Cloud) en lugar de local.

---

## 🔧 Cambios en Tu Código

### Archivo: `server.js` (2 cambios)

#### 1️⃣ CORS Agregado
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
```

#### 2️⃣ Health Check Mejorado
```javascript
app.get('/api/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT 1');
    connection.release();
    
    res.json({ 
      status: 'OK', 
      mensaje: 'Servidor y BD funcionando correctamente',
      db: 'Conectada',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      mensaje: 'Error conectando a la base de datos',
      error: error.message
    });
  }
});
```

---

## 🚀 Instrucciones Vercel (Copiar y Pegar)

### Paso 1: Vercel Dashboard

```
https://vercel.com/doriamontserrat/LA-MEJOR-ZONA-NORTE-
↓
Settings
↓
Environment Variables
↓
Agrega estas variables:
```

### Paso 2: Environment Variables (Para Clever Cloud)

```
DB_HOST=mysql-xxxx.eu-west-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=uxxxx
DB_PASSWORD=xxxxxxxxxx
DB_NAME=beisbol_app
NODE_ENV=production
```

### Paso 3: Redeploy

```bash
git push origin main
# O en Vercel Dashboard → Redeploy
```

### Paso 4: Verificar

```
Abre en navegador:
https://tu-proyecto.vercel.app/api/health

Resultado esperado:
{
  "status": "OK",
  "db": "Conectada",
  "environment": "production"
}
```

---

## 📋 Variables Según Proveedor

### Clever Cloud
```
DB_HOST=mysql-xxxx.eu-west-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=uxxxx
DB_PASSWORD=xxxxxxxxxxxxx
DB_NAME=beisbol_app
```

### PlanetScale
```
DB_HOST=xxxx.eu-west-2.psdb.cloud
DB_PORT=3306
DB_USER=root
DB_PASSWORD=pscale_pw_xxxxx
DB_NAME=beisbol_app
```

### Railway
```
DB_HOST=railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxxxxxxxxxxxx
DB_NAME=beisbol_app
```

---

## 🧪 Pruebas

### Local
```bash
npm start
# En otra terminal:
node test-vercel.js http://localhost:3000

# Esperado: ✅ Servidor está en línea y BD está conectada
```

### Remoto
```bash
node test-vercel.js https://tu-proyecto.vercel.app

# Esperado: ✅ Servidor está en línea y BD está conectada
```

---

## 📝 Importar SQL a BD Remota

```bash
mysql -h HOST -u USER -p DATABASE < database.sql
```

Reemplaza:
- `HOST` → Tu servidor remoto (ej: `mysql-xxxx.eu-west-1.rds.amazonaws.com`)
- `USER` → Tu usuario (ej: `uxxxx`)
- `DATABASE` → Nombre BD (ej: `beisbol_app`)

Luego pide password (pega tu contraseña)

---

## ✅ Verificación Completa

```
┌─────────────────────────────────────┐
│ Local                               │
└─────────────────────────────────────┘
npm start
✅ Servidor corre
✅ BD conectada
✅ Login funciona

↓ git push origin main

┌─────────────────────────────────────┐
│ Vercel                              │
└─────────────────────────────────────┘
✅ Código actualizado
✅ Environment Variables agregadas
✅ BD remota importada

↓ Test

curl https://tu-proyecto.vercel.app/api/health
{"status":"OK","db":"Conectada"}

✅ ¡LISTO! 🎉
```

---

## 🆘 Si Falla

### Paso 1: Ver Logs
```
Vercel Dashboard
→ Deployments
→ View Logs
→ Busca "Error" o "Cannot connect"
```

### Paso 2: Verificar Variables
```
Vercel Dashboard
→ Settings
→ Environment Variables
→ Verifica que están todas
```

### Paso 3: Verificar BD Remota
```bash
mysql -h HOST -u USER -p DATABASE
SHOW TABLES;
# Debe mostrar: usuarios, favoritos, monedas_usuario, etc.
```

---

## 🔐 Seguridad

✅ **Haz:**
- Usar Environment Variables en Vercel
- Guardar `.env` local en `.gitignore` (ya está)
- Contraseñas diferentes para dev/prod

❌ **NO hagas:**
- Hardcodear contraseñas en código
- Subir `.env` a GitHub
- Usar misma contraseña en múltiples servicios

---

## 📊 Resumen

| Paso | Qué hacer | Dónde | Tiempo |
|------|-----------|-------|--------|
| 1 | Crear BD remota | Clever Cloud/PlanetScale/Railway | 10 min |
| 2 | Importar SQL | Línea de comandos | 2 min |
| 3 | Agregar variables | Vercel Dashboard | 5 min |
| 4 | Redeploy | git push o Vercel | 2 min |
| 5 | Verificar | GET /api/health | 1 min |

**Total: 20 minutos** ⏱️

---

## 🎯 Resultado Final

```
Tu App en Vercel
    ↓ (API requests)
Vercel Server
    ↓ (queries)
BD Remota (Clever Cloud/PlanetScale/Railway)
    ↓ (data)
Vercel Server
    ↓ (JSON response)
Tu App en Vercel
```

✅ **Todo está conectado y funcionando**

---

## 📞 Documentos Relacionados

1. [INDICE.md](./INDICE.md) - Mapa de documentación
2. [RESUMEN_SOLUCION.md](./RESUMEN_SOLUCION.md) - Resumen ejecutivo
3. [CREAR_BD_REMOTA.md](./CREAR_BD_REMOTA.md) - Paso a paso BD
4. [DESPLIEGUE_VERCEL.md](./DESPLIEGUE_VERCEL.md) - Guía completa

---

**Última actualización**: 2026-10-12
**Estado**: ✅ Listo para producción
