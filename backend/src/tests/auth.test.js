/**
 * Testes básicos de autenticação
 * Para executar: npm test
 * 
 * NOTA: Estes testes requerem um banco de dados Supabase configurado
 * e variáveis de ambiente válidas. Para testes mais completos,
 * considere usar um banco de dados de teste isolado.
 */

// Mock básico para testes
const request = require('supertest');

// Importa o app sem iniciar o servidor
let app;
beforeAll(() => {
  // Desabilita o listen do servidor durante testes
  process.env.NODE_ENV = 'test';
  app = require('../server');
});

afterAll(async () => {
  // Cleanup se necessário
});

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('deve criar um novo usuário', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        full_name: 'Test User',
        user_type: 'citizen'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('deve retornar erro se email já existe', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Test User'
      };

      // Primeiro registro
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Tentativa de registro duplicado
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Primeiro cria um usuário
      const userData = {
        email: `login${Date.now()}@example.com`,
        password: 'password123',
        full_name: 'Test User'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Faz login
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('deve retornar erro com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('deve retornar status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

