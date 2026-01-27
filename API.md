# API Despertame - Documentação

**Base URL:** `https://api.despertame.com`

---

## 🔐 Autenticação

Endpoints de usuários exigem API Key:

```http
X-API-Key: SUA_API_KEY
```

Storage R2 é **público** (sem autenticação).

---

## 👤 Gestão de Usuários

### Criar Usuário

```http
POST /api/users/create
```

**Headers:**
```http
X-API-Key: sua-chave
Content-Type: application/json
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "displayName": "Nome do Usuário",
  "isAdmin": false
}
```

**Resposta:**
```json
{
  "success": true,
  "uid": "abc123",
  "message": "Usuário criado com sucesso"
}
```

---

### Listar Usuários

```http
GET /api/users
```

**Headers:**
```http
X-API-Key: sua-chave
```

**Resposta:**
```json
{
  "success": true,
  "users": [
    {
      "uid": "abc123",
      "email": "user@exemplo.com",
      "displayName": "Usuário",
      "disabled": false,
      "isAdmin": true
    }
  ]
}
```

---

### Habilitar/Desabilitar Usuário

```http
POST /api/users/:uid/toggle
```

**Headers:**
```http
X-API-Key: sua-chave
Content-Type: application/json
```

**Body:**
```json
{
  "disabled": true
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso"
}
```

---

### Excluir Usuário

```http
DELETE /api/users/:uid
```

**Headers:**
```http
X-API-Key: sua-chave
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

---

### Mudar Própria Senha

```http
PUT /api/me/password
```

**Headers:**
```http
X-API-Key: sua-chave
Content-Type: application/json
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "currentPassword": "senhaAtual",
  "newPassword": "novaSenha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

---

### Admin Muda Senha de Outro

```http
PUT /api/users/:uid/password
```

**Headers:**
```http
X-API-Key: sua-chave
Content-Type: application/json
```

**Body:**
```json
{
  "newPassword": "novaSenha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Senha do usuário alterada com sucesso"
}
```

---

## 📦 Storage R2 (Público - Sem Autenticação)

### Buckets e Domínios

| Bucket | Domínio |
|--------|---------|
| `logo` | `https://logo.despertame.org` |
| `financeiro` | `https://financeiro.despertame.org` |
| `tesouraria` | `https://tesouraria.despertame.org` |
| `blog` | `https://blog.despertame.org` |

---

### Listar Arquivos

```http
GET /api/storage/:bucket
```

**Exemplo:**
```http
GET /api/storage/logo
```

**Resposta:**
```json
{
  "success": true,
  "files": [
    {
      "key": "logo-principal.png",
      "url": "https://logo.despertame.org/logo-principal.png",
      "size": 15420,
      "uploaded": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

---

### Upload de Arquivo

```http
POST /api/storage/:bucket/upload
```

**Content-Type:** `multipart/form-data`

**Exemplo em JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', arquivo);

const response = await fetch('https://api.despertame.com/api/storage/logo/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
// data.url = "https://logo.despertame.org/arquivo.png"
```

**Resposta:**
```json
{
  "success": true,
  "url": "https://logo.despertame.org/arquivo.png",
  "key": "arquivo.png",
  "size": 15420
}
```

---

### Deletar Arquivo

```http
DELETE /api/storage/:bucket/delete/:filename
```

**Exemplo:**
```http
DELETE /api/storage/logo/delete/arquivo.png
```

**Resposta:**
```json
{
  "success": true,
  "message": "Arquivo deletado com sucesso"
}
```

---

## 📝 Configuração Wrangler

### wrangler.toml

```toml
name = "despertame"
main = "src/worker.js"
compatibility_date = "2024-09-23"

[vars]
API_KEY = "sua-chave-secreta-aqui"
FIREBASE_PROJECT_ID = "despertame-8b932"
FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@despertame-8b932.iam.gserviceaccount.com"
FIREBASE_WEB_API_KEY = "AIzaSyA8nykV5bBkk2SflhOjnt3IbqVHKO-qTcE"

[[r2_buckets]]
binding = "LOGO_BUCKET"
bucket_name = "logo"

[[r2_buckets]]
binding = "FINANCEIRO"
bucket_name = "financeiro"

[[r2_buckets]]
binding = "TESOURARIA"
bucket_name = "tesouraria"

[[r2_buckets]]
binding = "BLOG"
bucket_name = "blog"
```

### Adicionar Secret

**Via CLI:**
```bash
wrangler secret put FIREBASE_PRIVATE_KEY
```

---

## 🔧 Exemplos JavaScript

### Classe Helper Completa

```javascript
class DespertameAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.despertame.com';
  }

  // =========================================================================
  // USUÁRIOS
  // =========================================================================

  /**
   * Cria um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} displayName - Nome de exibição
   * @param {boolean} isAdmin - Se o usuário é administrador
   * @returns {Promise<Object>} Resultado da operação
   */
  async createUser(email, password, displayName, isAdmin = false) {
    const response = await fetch(`${this.baseURL}/api/users/create`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, displayName, isAdmin })
    });
    return response.json();
  }

  /**
   * Lista todos os usuários
   * @returns {Promise<Object>} Lista de usuários
   */
  async listUsers() {
    const response = await fetch(`${this.baseURL}/api/users`, {
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  /**
   * Habilita ou desabilita um usuário
   * @param {string} uid - ID do usuário
   * @param {boolean} disabled - true para desabilitar, false para habilitar
   * @returns {Promise<Object>} Resultado da operação
   */
  async toggleUser(uid, disabled) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}/toggle`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ disabled })
    });
    return response.json();
  }

  /**
   * Exclui um usuário
   * @param {string} uid - ID do usuário
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteUser(uid) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': this.apiKey }
    });
    return response.json();
  }

  /**
   * Muda a própria senha
   * @param {string} email - Email do usuário
   * @param {string} currentPassword - Senha atual
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async changePassword(email, currentPassword, newPassword) {
    const response = await fetch(`${this.baseURL}/api/me/password`, {
      method: 'PUT',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, currentPassword, newPassword })
    });
    return response.json();
  }

  /**
   * Admin muda senha de outro usuário
   * @param {string} uid - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<Object>} Resultado da operação
   */
  async changeUserPassword(uid, newPassword) {
    const response = await fetch(`${this.baseURL}/api/users/${uid}/password`, {
      method: 'PUT',
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newPassword })
    });
    return response.json();
  }

  // =========================================================================
  // STORAGE (PÚBLICO - NÃO PRECISA DE API KEY)
  // =========================================================================

  /**
   * Lista arquivos de um bucket
   * @param {string} bucket - Nome do bucket (logo, financeiro, tesouraria, blog)
   * @returns {Promise<Object>} Lista de arquivos
   */
  async listFiles(bucket) {
    const response = await fetch(`${this.baseURL}/api/storage/${bucket}`);
    return response.json();
  }

  /**
   * Faz upload de um arquivo
   * @param {string} bucket - Nome do bucket
   * @param {File} file - Arquivo para upload
   * @returns {Promise<Object>} Informações do arquivo enviado
   */
  async uploadFile(bucket, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/storage/${bucket}/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  /**
   * Deleta um arquivo
   * @param {string} bucket - Nome do bucket
   * @param {string} filename - Nome do arquivo
   * @returns {Promise<Object>} Resultado da operação
   */
  async deleteFile(bucket, filename) {
    const response = await fetch(
      `${this.baseURL}/api/storage/${bucket}/delete/${encodeURIComponent(filename)}`,
      { method: 'DELETE' }
    );
    return response.json();
  }
}
```

### Exemplos de Uso

```javascript
// Inicializar API
const api = new DespertameAPI('sua-api-key-aqui');

// =========================================================================
// EXEMPLOS - USUÁRIOS
// =========================================================================

// Criar usuário
const novoUsuario = await api.createUser(
  'novo@user.com',
  'senha123',
  'João Silva',
  false
);
console.log(novoUsuario);
// { success: true, uid: "abc123", message: "Usuário criado com sucesso" }

// Listar todos os usuários
const { users } = await api.listUsers();
users.forEach(user => {
  console.log(`${user.displayName} - ${user.email} - Admin: ${user.isAdmin}`);
});

// Desabilitar um usuário
await api.toggleUser('abc123', true);

// Habilitar um usuário
await api.toggleUser('abc123', false);

// Excluir um usuário
await api.deleteUser('abc123');

// Mudar própria senha
await api.changePassword('meu@email.com', 'senhaAtual', 'novaSenha123');

// Admin muda senha de outro usuário
await api.changeUserPassword('uid-do-usuario', 'novaSenha123');

// =========================================================================
// EXEMPLOS - STORAGE
// =========================================================================

// Upload no bucket logo (retorna URL com domínio customizado)
const inputFile = document.querySelector('#fileInput').files[0];
const result = await api.uploadFile('logo', inputFile);
console.log(result.url);
// https://logo.despertame.org/arquivo.png

// Listar arquivos do blog
const { files } = await api.listFiles('blog');
files.forEach(file => {
  console.log(`${file.key} - ${file.size} bytes`);
  console.log(file.url); // https://blog.despertame.org/post.jpg
});

// Deletar arquivo
await api.deleteFile('logo', 'arquivo-antigo.png');

// Upload em diferentes buckets
const logoFile = document.querySelector('#logoInput').files[0];
const financeFile = document.querySelector('#financeInput').files[0];

const logoResult = await api.uploadFile('logo', logoFile);
// URL: https://logo.despertame.org/arquivo.png

const financeResult = await api.uploadFile('financeiro', financeFile);
// URL: https://financeiro.despertame.org/relatorio.pdf
```

---

## 🎯 Principais Diferenças da Refatoração

### ✅ O que tem agora:
- **Domínios customizados** nos links do R2
- **Gestão completa de usuários** (criar, listar, editar, excluir)
- **Mudança de senha** (própria e de outros)
- **API Key única** para autenticação
- **Storage público** (sem autenticação)

### ❌ O que foi removido:
- Firestore
- Múltiplas API Keys por usuário
- Complexidade desnecessária

---

## 📊 Fluxo de URLs do R2

```
Bucket: logo
Arquivo: meu-logo.png

Antes (URL genérica):
https://pub-400ec3043a4b4f2284aa39938b2cb1da.r2.dev/meu-logo.png

Agora (domínio customizado):
https://logo.despertame.org/meu-logo.png
```

**Benefícios:**
- ✅ URLs mais profissionais
- ✅ Branding próprio
- ✅ Fácil de lembrar
- ✅ Controle de DNS

---

## ⚙️ Configuração dos Domínios R2

### Via Cloudflare Dashboard

1. Acesse **R2** → Selecione seu bucket → **Settings**
2. Clique em **Custom Domains** → **Connect Domain**
3. Adicione o domínio customizado (ex: `logo.despertame.org`)
4. Repita o processo para cada bucket

### Via Wrangler CLI

```bash
# Adicionar domínios customizados
wrangler r2 bucket domain add logo logo.despertame.org
wrangler r2 bucket domain add financeiro financeiro.despertame.org
wrangler r2 bucket domain add tesouraria tesouraria.despertame.org
wrangler r2 bucket domain add blog blog.despertame.org
```

### Verificar Domínios Configurados

```bash
# Listar domínios de um bucket
wrangler r2 bucket domain list logo
```

---

## 🔒 Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso |
| `201` | Recurso criado com sucesso |
| `400` | Requisição inválida |
| `401` | Não autenticado (API Key inválida) |
| `403` | Sem permissão |
| `404` | Recurso não encontrado |
| `500` | Erro interno do servidor |

---

## 📚 Recursos Adicionais

- **Cloudflare Workers**: [Documentação Oficial](https://developers.cloudflare.com/workers/)
- **Cloudflare R2**: [Documentação Oficial](https://developers.cloudflare.com/r2/)
- **Wrangler CLI**: [Guia de Instalação](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

---

## 🐛 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se o header `X-API-Key` está sendo enviado corretamente
- Confirme que a API Key corresponde à configurada no `wrangler.toml`

### Erro: "CORS"
- Certifique-se de que o worker está configurado para aceitar requisições do seu domínio
- Verifique os headers CORS na resposta

### Upload não retorna URL customizada
- Confirme que os domínios customizados estão configurados no R2
- Verifique o DNS dos subdomínios

---

## 📄 Licença

© 2025 Despertame - Todos os direitos reservados
