#!/usr/bin/env node

/**
 * Script para verificar problemas 404 en Vercel
 * Uso: node diagnostico-404.js https://tu-proyecto.vercel.app
 */

const https = require('https');
const http = require('http');

const VERCEL_URL = process.argv[2] || 'https://la-mejor-zona-norte.vercel.app';

console.log('\n🔍 DIAGNÓSTICO DE ERROR 404\n');
console.log(`URL a verificar: ${VERCEL_URL}\n`);
console.log('═'.repeat(70));

function testEndpoint(url, endpoint, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const fullUrl = new URL(endpoint, url);
    const protocol = fullUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port || (fullUrl.protocol === 'https:' ? 443 : 80),
      path: fullUrl.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Diagnostics/1.0'
      },
      timeout: 15000
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const request = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          success: res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        code: error.code
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        success: false,
        error: 'Timeout - Servidor no responde',
        code: 'ETIMEDOUT'
      });
    });

    if (body) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}

async function runDiagnostics() {
  // Test 1: Health Check
  console.log('\n🔹 TEST 1: GET /api/health');
  console.log('─'.repeat(70));
  const health = await testEndpoint(VERCEL_URL, '/api/health');

  if (health.success) {
    console.log('✅ ÉXITO');
    console.log(`   Status: ${health.statusCode} ${health.statusText}`);
    try {
      const json = JSON.parse(health.body);
      console.log(`   BD Status: ${json.db || 'Unknown'}`);
      console.log(`   Environment: ${json.environment || 'Unknown'}`);
    } catch {
      console.log(`   Body: ${health.body}`);
    }
  } else if (health.error) {
    console.log('❌ ERROR');
    console.log(`   Tipo: ${health.error}`);
    if (health.code === 'ECONNREFUSED') {
      console.log('   Causa: Vercel no responde (servidor down)');
    } else if (health.code === 'ETIMEDOUT') {
      console.log('   Causa: Timeout (servidor muy lento o sin respuesta)');
    }
  } else {
    console.log('❌ ERROR HTTP');
    console.log(`   Status: ${health.statusCode} ${health.statusText}`);
    console.log(`   Esto significa: ${interpretarError(health.statusCode)}`);

    if (health.statusCode === 404) {
      console.log('\n   📌 ANÁLISIS:');
      console.log('      • El servidor ESTÁ corriendo');
      console.log('      • Pero NO encuentra la ruta /api/health');
      console.log('      • Probables causas:');
      console.log('        1. Server.js no se desplegó correctamente');
      console.log('        2. Build falló silenciosamente');
      console.log('        3. Vercel.json tiene problema');
    }
  }

  // Test 2: Login Endpoint
  console.log('\n🔹 TEST 2: POST /api/usuarios/login');
  console.log('─'.repeat(70));
  const login = await testEndpoint(VERCEL_URL, '/api/usuarios/login', 'POST', {
    email: 'test@test.com',
    password: 'test1234'
  });

  if (login.statusCode === 404) {
    console.log('❌ 404 Not Found');
    console.log('   Causa: Ruta no existe - probablemente server.js no se desplegó');
  } else if (login.statusCode === 400 || login.statusCode === 401) {
    console.log('✅ Endpoint existe');
    console.log(`   Status: ${login.statusCode} (esperado - usuario no existe)`);
  } else if (login.error) {
    console.log('❌ ERROR');
    console.log(`   ${login.error}`);
  } else {
    console.log(`❌ Status: ${login.statusCode}`);
  }

  // Test 3: Root
  console.log('\n🔹 TEST 3: GET /');
  console.log('─'.repeat(70));
  const root = await testEndpoint(VERCEL_URL, '/');

  if (root.success || root.statusCode === 200) {
    console.log('✅ Root endpoint responde');
  } else if (root.statusCode === 404) {
    console.log('❌ Root también falla - Server.js probablemente no se desplegó');
  } else if (root.error) {
    console.log(`❌ Error: ${root.error}`);
  }

  // Resumen
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESUMEN DIAGNÓSTICO');
  console.log('═'.repeat(70));

  if (health.statusCode === 404 && login.statusCode === 404) {
    console.log('\n🔴 PROBLEMA CRÍTICO:');
    console.log('   El servidor está retornando 404 para TODAS las rutas');
    console.log('\n   CAUSAS POSIBLES:');
    console.log('   1. Server.js no se desplegó correctamente');
    console.log('   2. El build falló');
    console.log('   3. Vercel.json está mal configurado');
    console.log('   4. .git/config tiene problemas');
    console.log('\n   ACCIONES:');
    console.log('   1. Ve a Vercel Dashboard → Deployments');
    console.log('   2. Haz click en el deployment más reciente');
    console.log('   3. Click en "View Logs" y busca "Error"');
    console.log('   4. Comparte el error aquí');
  } else if (health.success) {
    console.log('\n✅ TODO ESTÁ BIEN');
    console.log('   • Servidor responde');
    console.log('   • BD conectada');
    console.log('   • Puedes proceder a desplegar');
  } else {
    console.log('\n⚠️  PROBLEMA DE CONECTIVIDAD');
    console.log('   • Vercel no responde');
    console.log('   • Posible: El servidor está down o hay timeout');
  }

  console.log('\n');
}

function interpretarError(statusCode) {
  switch (statusCode) {
    case 400:
      return 'Bad Request - Datos mal formateados';
    case 401:
      return 'Unauthorized - Credenciales inválidas';
    case 404:
      return 'Not Found - Ruta no existe';
    case 500:
      return 'Internal Server Error - Error en el código';
    case 503:
      return 'Service Unavailable - Servidor temporalmente caído';
    default:
      return `HTTP ${statusCode}`;
  }
}

runDiagnostics();
