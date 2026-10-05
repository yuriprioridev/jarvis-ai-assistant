# 🤖 Jarvis — Assistente de IA Pessoal

Assistente de voz pessoal inspirado no JARVIS do Homem de Ferro, construído com **LiveKit Agents**, **Google Gemini** e integração com **Spotify**, **controle do PC** e **casa inteligente**.

---

## 📁 Estrutura do Projeto

```
Jarvis/
├── Jarvis- Aula 01/        # Agente principal com todas as integrações
│   ├── agent.py            # Agente principal (LiveKit + Gemini Realtime)
│   ├── prompts.py          # Persona e instruções do JARVIS
│   ├── automacao_jarvis.py # Controle do PC (arquivos, volume, apps)
│   ├── integrations/
│   │   └── spotify.py      # Integração completa com Spotify
│   └── requirements.txt    # Dependências Python
│
├── Jarvis Mem0/            # Versão simplificada com memória de longo prazo
│   ├── agent.py            # Agente com Mem0 integrado
│   └── testememoria.py     # Testes do sistema de memória
│
└── agent-starter-react-main/ # Frontend web (Next.js)
    └── ...                 # Interface para conectar ao agente via browser
```

---

## ✨ Funcionalidades

- 🎙️ **Voz em tempo real** via LiveKit Agents + Google Gemini Realtime
- 🧠 **Memória de longo prazo** com Mem0 (lembra de conversas anteriores)
- 🎵 **Controle do Spotify** (play, pause, next, volume, playlists, dispositivos)
- 💻 **Controle do PC** (criar/mover/deletar arquivos, volume, brilho, apps)
- 🌐 **Pesquisa na web** e controle do Chrome via CDP/Playwright
- 🏠 **Casa inteligente** via Voice Monkey + Alexa
- 🎬 **Controle do YouTube** (play/pause via pyautogui ou CDP)

---

## 🚀 Como Usar

### 1. Pré-requisitos

- Python 3.11+
- Node.js 18+ (para o frontend)
- Conta no [LiveKit](https://livekit.io)
- Conta no [Google AI Studio](https://aistudio.google.com)
- Conta no [Mem0](https://mem0.ai) (opcional, para memória)
- App no [Spotify for Developers](https://developer.spotify.com/dashboard) (opcional)

### 2. Configurar variáveis de ambiente

```bash
# No diretório "Jarvis- Aula 01":
cp .env.example .env
# Edite o .env com suas chaves reais
```

### 3. Instalar dependências

```bash
cd "Jarvis- Aula 01"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Executar o agente

```bash
python agent.py dev
```

### 5. Frontend (opcional)

```bash
cd agent-starter-react-main
cp .env.local.example .env.local
# Edite o .env.local com suas chaves LiveKit
pnpm install
pnpm dev
```

---

## 🔐 Segurança

> **IMPORTANTE:** Nunca suba suas chaves de API para o GitHub!
> 
> - Copie `.env.example` para `.env` e preencha com suas próprias chaves
> - O arquivo `.env` já está listado no `.gitignore`
> - O arquivo `.spotify_cache` (tokens OAuth) também está ignorado

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [LiveKit Agents](https://docs.livekit.io/agents/) | Framework de agentes de voz em tempo real |
| [Google Gemini Realtime](https://ai.google.dev/) | Modelo de linguagem multimodal |
| [Mem0](https://mem0.ai/) | Memória de longo prazo para IA |
| [Spotipy](https://spotipy.readthedocs.io/) | Integração com Spotify |
| [Playwright](https://playwright.dev/) | Automação do Chrome (CDP) |
| [Next.js](https://nextjs.org/) | Frontend web |
| [Voice Monkey](https://voicemonkey.io/) | Automação de dispositivos Alexa |

---

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para usar como referência.
