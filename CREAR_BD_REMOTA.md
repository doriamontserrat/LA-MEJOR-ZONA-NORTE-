# 🗄️ Guía: Crear Base de Datos Remota

## Opción 1: Clever Cloud (Recomendado para principiantes)

### Paso 1: Crear Cuenta
1. Ve a https://www.clever-cloud.com
2. Click en "Sign up"
3. Crea cuenta con email

### Paso 2: Crear Base de Datos MySQL
1. En el Dashboard, click en "New application"
2. Selecciona "MySQL"
3. Llena los datos:
   - Application name: `beisbol_app_db`
   - Region: Elige la más cercana
   - Pricing: "DEV" (gratuita)
4. Click "Create"

### Paso 3: Obtener Credenciales
1. Entra a tu app MySQL
2. En la sección "Environment variables" verás:
   ```
   MYSQL_ADDON_HOST=mysql-xxxx.eu-west-1.rds.amazonaws.com
   MYSQL_ADDON_PORT=3306
   MYSQL_ADDON_USER=uxxxx
   MYSQL_ADDON_PASSWORD=xxxxxxxxxxxxx
   MYSQL_ADDON_DB=beisbol_app
   ```

### Paso 4: Importar Tablas
1. Descarga MySQL Workbench o usa línea de comandos:
   ```bash
   mysql -h mysql-xxxx.eu-west-1.rds.amazonaws.com \
         -u uxxxx \
         -p \
         beisbol_app < database.sql
   ```
2. Te pedirá contraseña (usa la de arriba)

### Paso 5: Agregar a Vercel
En Vercel Dashboard → Project Settings → Environment Variables:
```
DB_HOST=mysql-xxxx.eu-west-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=uxxxx
DB_PASSWORD=xxxxxxxxxxxxx
DB_NAME=beisbol_app
```

---

## Opción 2: PlanetScale (MySQL en la nube)

### Paso 1: Crear Cuenta
1. Ve a https://planetscale.com
2. Click "Sign up"
3. Usa GitHub o email

### Paso 2: Crear Base de Datos
1. Click "Create a new database"
2. Nombre: `beisbol_app`
3. Region: Elige cercana
4. Click "Create database"

### Paso 3: Obtener Conexión
1. Haz click en tu base de datos
2. Click "Connect"
3. Selecciona "Node.js"
4. Copia la cadena (ej): 
   ```
   mysql://root:pscale_pw_xxx@xxxx.eu-west-2.psdb.cloud/beisbol_app
   ```

### Paso 4: Extraer Credenciales
De la cadena anterior:
```
DB_HOST=xxxx.eu-west-2.psdb.cloud
DB_PORT=3306
DB_USER=root
DB_PASSWORD=pscale_pw_xxx
DB_NAME=beisbol_app
```

### Paso 5: Importar Tablas
```bash
mysql -h xxxx.eu-west-2.psdb.cloud \
      -u root \
      -p \
      beisbol_app < database.sql
```

### Paso 6: Agregar a Vercel
Same variables como arriba

---

## Opción 3: Railway (Muy simple)

### Paso 1: Crear Cuenta
1. Ve a https://railway.app
2. Click "Login with GitHub"

### Paso 2: Crear Proyecto
1. Click "New Project"
2. Selecciona "Provision MySQL"
3. Espera a que se cree (2-3 minutos)

### Paso 3: Obtener Credenciales
1. En tu proyecto, click en el servicio MySQL
2. Click en "Variables"
3. Verás:
   ```
   MYSQLHOST=railway.app
   MYSQLPORT=3306
   MYSQLUSER=root
   MYSQLPASSWORD=xxxxx
   MYSQLDATABASE=railway
   ```

### Paso 4: Crear la Base de Datos
```bash
mysql -h railway.app \
      -u root \
      -p \
      -e "CREATE DATABASE beisbol_app;"
```

### Paso 5: Importar Tablas
```bash
mysql -h railway.app \
      -u root \
      -p \
      beisbol_app < database.sql
```

### Paso 6: Agregar a Vercel
```
DB_HOST=railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=xxxxx
DB_NAME=beisbol_app
```

---

## Verificar Conexión Remota

Después de importar las tablas, verifica que todo está bien:

```bash
# Conectarse a la BD remota
mysql -h tu_host -u tu_usuario -p tu_base_de_datos

# Luego ejecuta:
SHOW TABLES;

# Deberías ver:
usuarios
favoritos
monedas_usuario
quiz_usuario
checklist_items
...
```

---

## Resumen Rápido

| Proveedor | Setup | Precio | Performance | Recomendado |
|-----------|-------|--------|-------------|-------------|
| Clever Cloud | ⭐⭐⭐⭐ Fácil | Gratis | Bueno | ✅ Sí |
| PlanetScale | ⭐⭐⭐ Medio | Gratis | Muy Bueno | ✅ Sí |
| Railway | ⭐⭐⭐ Medio | Gratis | Excelente | ✅ Sí |

---

## Solucionar Problemas

### "Host is not allowed to connect to this MySQL server"
```
❌ Problema: Tu IP está bloqueada
✅ Solución: Verifica si el proveedor requiere whitelist de IPs
   (Clever Cloud lo hace automáticamente)
```

### "Access denied for user"
```
❌ Problema: Usuario o contraseña incorrectos
✅ Solución: Copia las credenciales exactamente como aparecen
```

### "Unknown database"
```
❌ Problema: La base de datos no existe
✅ Solución: Crea primero la BD, luego importa el SQL:
   mysql -e "CREATE DATABASE beisbol_app;"
```

---

## ¿Necesitas Ayuda?

1. Verifica que tienes las credenciales correctas
2. Prueba localmente primero: `npm start`
3. Luego prueba con: `node test-vercel.js http://localhost:3000`
4. Finalmente despliega y prueba: `node test-vercel.js https://tu-proyecto.vercel.app`

🎉 ¡Eso es todo! Tu app estará lista en Vercel
