@echo off
echo ========================================================
echo  JARVIS - Criar repositorio no GitHub
echo ========================================================
echo.
echo PASSO 1: Fazendo login no GitHub CLI...
echo.
"C:\Program Files\GitHub CLI\gh.exe" auth login --web --git-protocol https
echo.
echo PASSO 2: Inicializando repositorio Git...
cd /d "C:\Users\Yuri\Desktop\Jarvis"
git init
git add .
git status
echo.
echo PASSO 3: Criando commit inicial...
git commit -m "feat: Jarvis - Assistente de IA pessoal com LiveKit, Gemini e integracoes"
echo.
echo PASSO 4: Criando repositorio no GitHub...
"C:\Program Files\GitHub CLI\gh.exe" repo create jarvis-ai-assistant --public --description "Assistente de voz pessoal com LiveKit Agents, Google Gemini Realtime, Spotify, controle do PC e casa inteligente" --source=. --remote=origin --push
echo.
echo ========================================================
echo  PRONTO! Repositorio criado e enviado com sucesso!
echo ========================================================
pause
