# 🔴 DIAGNÓSTICO: Error 404 en Vercel

## Problema
```
POST https://la-mejor-zona-norte.vercel.app/api/usuarios/crear → 404 Not Found
GET  https://la-mejor-zona-norte.vercel.app/api/health        → 404 Not Found
```

## Causa Probable
El servidor en Vercel **no está iniciando correctamente** o **ha fallado**

## Checklist de Verificación

### 1️⃣ Verificar Logs en Vercel

**Acceso a los logs:**
```
1. Ve a https://vercel.com/doriamontserrat/LA-MEJOR-ZONA-NORTE-
2. Click en "Deployments" (en el tab de arriba)
3. Haz click en el deployment más reciente
4. Click en "View Logs"
5. Busca "Error" o "Cannot connect"
```

**¿Qué buscar en los logs:**
```
✅ "Servidor corriendo" - indica que está bien
❌ "Error conectando" - problema con BD
❌ "Cannot find module" - falta dependencia
❌ "TypeError" - error en el código
```

### 2️⃣ Verificar Variables de Entorno

**En Vercel Dashboard:**
```
1. Settings → Environment Variables
2. Verifica que EXISTEN exactamente estas variables:

   DB_HOST=bz7f8goizarwrvv12qti-mysql.services.clever-cloud.com
   DB_PORT=3306
   DB_USER=uk0qjoobxgx1y5om
   DB_PASSWORD=SkkjmdFjwHHIUs1iuM9v
   DB_NAME=bz7f8goizarwrvv12qti
   NODE_ENV=production
```

### 3️⃣ Verificar que Redeploy se Completó

```
1. Ve a Deployments
2. Busca uno que diga "Ready" (no "Building" o "Failed")
3. Si dice "Failed", haz click para ver por qué falló
4. Si dice "Building", espera a que termine
```

### 4️⃣ Forzar Redeploy Completo

Si no funciona:
```
1. En la lista de Deployments
2. Click en los "..." del deployment actual
3. Click en "Redeploy"
4. Espera a que termine (unos 2-3 minutos)
5. Intenta nuevamente: https://la-mejor-zona-norte.vercel.app/api/health
```

---

## Posibles Soluciones Según el Mensaje de Error

### ❌ "Cannot find module 'express'"
```
Causa: Faltan dependencias
Solución: 
  npm install
  git push origin main
```

### ❌ "ECONNREFUSED" o "Connection refused"
```
Causa: No puede conectar a BD
Solución:
  1. Verifica que las variables están correctas
  2. Verifica que la BD en Clever Cloud está activa
  3. Redeploy
```

### ❌ "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"
```
Causa: Pool de BD con problema
Solución:
  1. Revisar credenciales
  2. Limitar conexiones en db.js
```

### ❌ "Cannot find property X of undefined"
```
Causa: Variable de entorno no configurada
Solución:
  1. Verificar que TODAS las variables están en Vercel
  2. Redeploy
```

---

## Pasos EXACTOS a Seguir

### Paso 1: Accede a los Logs (5 min)

```
Vercel → Deployments → Último deployment → View Logs

Copia el ERROR que ves y pega en la siguiente respuesta
```

### Paso 2: Verifica Variables

```
Vercel → Settings → Environment Variables

Verifica que TODAS estas estén:
□ DB_HOST
□ DB_PORT
□ DB_USER
□ DB_PASSWORD
□ DB_NAME
□ NODE_ENV=production
```

### Paso 3: Si Faltan Variables

```
1. Click en "Add New"
2. Variable Name: DB_HOST
   Value: bz7f8goizarwrvv12qti-mysql.services.clever-cloud.com
3. Click "Save"
4. Repite para cada variable

Luego: Click "Redeploy" en Deployments
```

### Paso 4: Si Ya Están Configuradas

```
1. Ve a Deployments
2. Haz click en el más reciente
3. Click en "..." → "Redeploy"
4. Espera 2-3 minutos
5. Intenta: https://la-mejor-zona-norte.vercel.app/api/health
```

---

## Test Local Para Comparar

```bash
# En tu máquina local:
npm start

# Verifica que funciona:
curl http://localhost:3000/api/health

# Resultado esperado:
{"status":"OK","db":"Conectada"}
```

Si funciona localmente pero no en Vercel, es problema de variables.

---

## ¿Por Qué No es el Nombre de la BD?

El error 404 significa que Vercel **no encuentra la ruta**, no que no conecte a BD.

```
404 Not Found = "Esa ruta no existe en el servidor"
Connection Error = "No puedo hablar con la BD"
```

La BD remota es correcta. El problema es que el servidor no está iniciando.

---

## Próximo Paso

👉 **Dime el error exacto que ves en los logs de Vercel**

Sigue esto:
1. Ve a Vercel Dashboard
2. Click en "Deployments"
3. Click en el deployment más reciente
4. Click en "View Logs"
5. Copia-pega todo lo que dice en la sección roja de errores

Con eso, podré decirte exactamente qué hacer.
