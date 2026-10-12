#!/usr/bin/env node

/**
 * Script para verificar la conexión a Vercel y la BD
 * Uso: node test-vercel.js
 */

const https = require('https');
const http = require('http');

// Reemplaza esto con tu URL de Vercel
const VERCEL_URL = process.argv[2] || 'http://localhost:3000';

console.log('\n🔍 Verificando conexión...\n');
console.log(`URL a verificar: ${VERCEL_URL}`);
console.log('─'.repeat(50));

// Función para hacer solicitud HTTP/HTTPS
function testConnection(url, endpoint) {
  return new Promise((resolve) => {
    const fullUrl = new URL(endpoint, url);
    const protocol = fullUrl.protocol === 'https:' ? https : http;

    const request = protocol.get(fullUrl, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            status: res.statusCode,
            data: json
          });
        } catch {
          resolve({
            success: false,
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        success: false,
        error: 'Timeout - Servidor no responde'
      });
    });
  });
}

// Función para prueba del login (requiere usuario existente)
async function testLogin(url) {
  return new Promise((resolve) => {
    const fullUrl = new URL('/api/usuarios/login', url);
    const protocol = fullUrl.protocol === 'https:' ? https : http;

    const postData = JSON.stringify({
      email: 'test@test.com',
      password: 'test1234'
    });

    const options = {
      hostname: fullUrl.hostname,
      port: fullUrl.port,
      path: fullUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };

    const request = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: json
          });
        } catch {
          resolve({
            success: false,
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    request.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });

    request.write(postData);
    request.end();
  });
}

// Ejecutar pruebas
async function runTests() {
  // Test 1: Health check
  console.log('\n📋 Test 1: Health Check (/api/health)');
  console.log('─'.repeat(50));
  const health = await testConnection(VERCEL_URL, '/api/health');
  
  if (health.success) {
    console.log('✅ ÉXITO - Servidor responde');
    console.log('Detalles:', JSON.stringify(health.data, null, 2));
  } else if (health.error) {
    console.log('❌ ERROR:', health.error);
    console.log('\nPosibles causas:');
    console.log('  • El servidor no está corriendo');
    console.log('  • URL incorrecta');
    console.log('  • Problema de red/firewall');
  } else {
    console.log('❌ ERROR:', health.status);
    console.log('Respuesta:', health.data);
  }

  // Test 2: Login endpoint
  console.log('\n📋 Test 2: Login Endpoint (/api/usuarios/login)');
  console.log('─'.repeat(50));
  const login = await testConnection(VERCEL_URL, '/api/usuarios/login');
  
  if (login.success || login.status === 400 || login.status === 401) {
    console.log('✅ ÉXITO - Endpoint existe y responde');
    console.log('Status:', login.status);
    if (login.data) {
      console.log('Respuesta:', JSON.stringify(login.data, null, 2));
    }
  } else if (login.error) {
    console.log('❌ ERROR:', login.error);
  } else {
    console.log('❌ ERROR HTTP', login.status);
  }

  // Resumen
  console.log('\n' + '═'.repeat(50));
  console.log('RESUMEN');
  console.log('═'.repeat(50));

  if (health.success) {
    console.log('✅ Servidor está en línea y BD está conectada');
    console.log('\n🚀 Puedes proceder a desplegar en Vercel');
  } else {
    console.log('❌ Hay problemas de conexión');
    console.log('\n⚠️  Pasos a seguir:');
    console.log('1. Verifica que el servidor está ejecutándose');
    console.log('2. Revisa que la URL es correcta');
    console.log('3. Verifica la conexión a la base de datos');
    console.log('4. Mira los logs del servidor para más detalles');
  }
  console.log('\n');
}

runTests();
