import asyncio
import json
import logging
import os
import websockets
from http.server import SimpleHTTPRequestHandler
import socketserver
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("JarvisHUD")

CONECTADOS = set()

# Gerenciamento de conexões WebSocket
async def ws_handler(websocket):
    CONECTADOS.add(websocket)
    logger.info(f"Monitor conectado ao HUD. Total conectados: {len(CONECTADOS)}")
    try:
        await websocket.send(json.dumps({"action": "idle", "target_screen": "all"}))
        async for mensagem in websocket:
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        CONECTADOS.remove(websocket)
        logger.info(f"Monitor desconectado. Total conectados: {len(CONECTADOS)}")

async def transmitir_evento(action: str, target_screen: int = 1, dados: dict = None):
    """Envia um comando para os monitores conectados."""
    if not CONECTADOS:
        logger.warning("Nenhum monitor HUD conectado via WebSocket.")
        return
    payload = json.dumps({
        "action": action,
        "target_screen": target_screen,
        "dados": dados or {}
    })
    tarefas = [asyncio.create_task(ws.send(payload)) for ws in CONECTADOS]
    await asyncio.gather(*tarefas, return_exceptions=True)

def iniciar_servidor_http():
    diretorio = os.path.join(os.path.dirname(__file__), "hud")
    os.makedirs(diretorio, exist_ok=True)
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=diretorio, **kwargs)
        def log_message(self, format, *args):
            pass # Silencia logs HTTP comuns
    
    server = socketserver.TCPServer(("0.0.0.0", 8080), Handler)
    logger.info("Servidor web do HUD ativo em: http://localhost:8080")
    server.serve_forever()

async def main():
    threading.Thread(target=iniciar_servidor_http, daemon=True).start()
    async with websockets.serve(ws_handler, "0.0.0.0", 8765):
        logger.info("Servidor WebSocket do HUD ativo na porta 8765")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
