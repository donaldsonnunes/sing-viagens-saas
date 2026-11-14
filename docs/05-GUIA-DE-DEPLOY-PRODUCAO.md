# Guia de Publicação em Produção (Deploy) — Sing Viagens SaaS

> **Arquitetura Recomendada:** **GitHub (Repositório Privado)** + **Railway.app (ou Vercel)** + **Domínio na HostGator (Apontamento DNS)**.

---

## Passo 1 — Subir o Código para o seu GitHub (Já preparado localmente)
O repositório Git local em `c:\Projetos\SingViagens` já está inicializado e com o commit inicial realizado.

1. Acesse [https://github.com/new](https://github.com/new) e faça login na sua conta do GitHub.
2. Em **Repository name**, digite: `sing-viagens-saas`.
3. Marque a opção **Private** (Privado) e clique no botão verde **Create repository** (não marque *Add a README*).
4. Copie a URL do repositório criado (ex.: `https://github.com/SEU_USUARIO/sing-viagens-saas.git`) e rode no terminal:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/sing-viagens-saas.git
   git push -u origin main
   ```

---

## Passo 2 — Publicar no Railway (Suporta nosso Docker + Banco de Dados) ou na Vercel

### Opção 1A: Publicar na **Railway.app** (Recomendado para Persistência e Docker)
A Railway lê automaticamente nosso `Dockerfile` e mantém os dados salvos (regras do Admin, valor de milheiro e histórico) + banco PostgreSQL no mesmo lugar:
1. Acesse [https://railway.app](https://railway.app) e clique em **Login with GitHub**.
2. Clique em **New Project** → **Deploy from GitHub repo** e selecione `sing-viagens-saas`.
3. A Railway fará o build automático usando nosso `Dockerfile` e colocará o sistema no ar em cerca de 2 minutos.
4. Para adicionar o banco PostgreSQL gerenciado (opcional para a próxima fase): clique em **+ New** → **Database** → **Add PostgreSQL**.
5. No card do serviço `sing-viagens-saas`, vá na aba **Settings** → **Networking (Public Networking)**:
   - Clique em **Generate Domain** para ganhar um link imediato de teste (ex.: `sing-viagens.up.railway.app`).
   - Clique em **+ Custom Domain** e digite o seu domínio da HostGator (ex.: `www.seudominio.com.br`). A Railway mostrará um registro **CNAME** para você colar na HostGator.

### Opção 1B: Publicar na **Vercel** (Criadora do Next.js)
1. Acesse [https://vercel.com](https://vercel.com) e clique em **Continue with GitHub**.
2. Clique em **Add New...** → **Project** e clique em **Import** ao lado de `sing-viagens-saas`.
3. Clique em **Deploy** (não precisa alterar nenhuma configuração, ela detecta Next.js 15 automaticamente).
4. Em 1 minuto seu site estará publicado. Vá em **Settings** → **Domains** e digite o seu domínio da HostGator. A Vercel mostrará exatamente o IP (`76.76.21.21`) e o `CNAME` para colocar na HostGator.

---

## Passo 3 — Apontar o Domínio lá no Painel da HostGator (Mantendo seus E-mails Intactos)
Você **não precisa alterar os Nameservers (NS)** da HostGator se já usa e-mail lá; basta adicionar/editar 2 registros na Zona de DNS:

1. Acesse o **Portal do Cliente HostGator** ([financeiro.hostgator.com.br](https://financeiro.hostgator.com.br)).
2. No menu lateral, clique em **Domínios** e, ao lado do seu domínio, clique em **Alterar DNS / Gerenciar Zona de DNS**.
3. Adicione/Edite apenas estes **2 registros** (isso aponta apenas o site e **não mexe nos seus e-mails MX**):
   - **Se estiver usando Vercel**:
     - **Tipo `A`** | Nome: `@` (ou deixe em branco) | Valor/Destino: `76.76.21.21`
     - **Tipo `CNAME`** | Nome: `www` | Valor/Destino: `cname.vercel-dns.com`
   - **Se estiver usando Railway**:
     - **Tipo `CNAME`** | Nome: `www` | Valor/Destino: *(o endereço `.up.railway.app` que a Railway exibir na tela de Custom Domain)*
4. Salve as alterações. Em cerca de **15 a 30 minutos**, o seu domínio oficial na HostGator já abrirá o sistema da **Sing Viagens e Turismo** com cadeado de segurança **HTTPS (SSL)** ativo!
