

import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

# ─── Escopos de permissão ──────────────────────────────────────────────────────
# Cada escopo libera um grupo de funcionalidades na API do Spotify
SCOPES = " ".join([
    "user-read-playback-state",       # ler estado atual (música tocando, volume, etc)
    "user-modify-playback-state",     # play, pause, volume, skip
    "user-read-currently-playing",    # saber qual música está tocando agora
    "playlist-read-private",          # ler playlists privadas
    "playlist-read-collaborative",    # ler playlists colaborativas
    "user-library-read",              # ler músicas salvas
    "user-top-read",                  # ler top músicas/artistas do usuário
])

# ─── Conexão com o Spotify ─────────────────────────────────────────────────────
def get_spotify() -> spotipy.Spotify:
    """
    Cria e retorna uma instância autenticada do Spotipy.
    Na primeira execução, abre o navegador para autorização.
    Nas próximas, usa o token salvo automaticamente.
    """
    return spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI", "http://127.0.0.1:8888/callback"),
        scope=SCOPES,
        open_browser=True,
        cache_path=".spotify_cache",  # salva o token localmente para não precisar logar sempre
    ))


# ─── Funções de controle ───────────────────────────────────────────────────────

def get_current_track() -> dict:
    """
    Retorna informações sobre a música que está tocando agora.

    Retorna:
        dict com 'playing' (bool), 'track', 'artist', 'album', 'progress_pct'
    """
    try:
        sp = get_spotify()
        current = sp.current_playback()

        if not current or not current.get("is_playing"):
            return {"playing": False, "message": "Nenhuma música tocando no momento."}

        track = current["item"]
        progress = current["progress_ms"]
        duration = track["duration_ms"]
        pct = round((progress / duration) * 100)

        return {
            "playing": True,
            "track": track["name"],
            "artist": ", ".join(a["name"] for a in track["artists"]),
            "album": track["album"]["name"],
            "progress_pct": pct,
            "message": f"Tocando: {track['name']} — {', '.join(a['name'] for a in track['artists'])}"
        }
    except Exception as e:
        return {"playing": False, "message": f"Erro ao buscar música atual: {e}"}


def play(uri: str = None) -> dict:
    """
    Inicia ou retoma a reprodução.

    Args:
        uri: URI do Spotify (opcional). Ex: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh'
             Se None, retoma a reprodução pausada.

    Retorna:
        dict com 'success' e 'message'
    """
    try:
        sp = get_spotify()
        if uri:
            # Detecta se é track, album ou playlist pelo URI
            if "track" in uri:
                sp.start_playback(uris=[uri])
            else:
                sp.start_playback(context_uri=uri)
        else:
            sp.start_playback()
        return {"success": True, "message": "Reprodução iniciada."}
    except spotipy.exceptions.SpotifyException as e:
        if "Premium" in str(e):
            return {"success": False, "message": "Controle de playback requer conta Spotify Premium."}
        return {"success": False, "message": f"Erro ao iniciar reprodução: {e}"}


def pause() -> dict:
    """Pausa a reprodução atual."""
    try:
        sp = get_spotify()
        sp.pause_playback()
        return {"success": True, "message": "Reprodução pausada."}
    except Exception as e:
        return {"success": False, "message": f"Erro ao pausar: {e}"}


def next_track() -> dict:
    """Pula para a próxima música."""
    try:
        sp = get_spotify()
        sp.next_track()
        return {"success": True, "message": "Avançou para a próxima música."}
    except Exception as e:
        return {"success": False, "message": f"Erro ao pular: {e}"}


def previous_track() -> dict:
    """Volta para a música anterior."""
    try:
        sp = get_spotify()
        sp.previous_track()
        return {"success": True, "message": "Voltou para a música anterior."}
    except Exception as e:
        return {"success": False, "message": f"Erro ao voltar: {e}"}


def set_volume(volume: int) -> dict:
    """
    Define o volume do Spotify.

    Args:
        volume: Valor de 0 a 100.

    Retorna:
        dict com 'success' e 'message'
    """
    volume = max(0, min(100, volume))  # garante que fica entre 0 e 100
    try:
        sp = get_spotify()
        sp.volume(volume)
        return {"success": True, "message": f"Volume definido para {volume}%."}
    except Exception as e:
        return {"success": False, "message": f"Erro ao ajustar volume: {e}"}


def search_and_play(query: str, search_type: str = "track") -> dict:
    """
    Busca uma música, artista ou playlist pelo nome e toca o primeiro resultado.

    Args:
        query:       Nome da música, artista ou playlist.
        search_type: 'track', 'artist', 'playlist' ou 'album'. Padrão: 'track'

    Retorna:
        dict com 'success', 'found' (nome do que foi tocado) e 'message'

    Exemplos:
        search_and_play("Daft Punk")
        search_and_play("lo-fi hip hop", search_type="playlist")
        search_and_play("Dark Side of the Moon", search_type="album")
    """
    try:
        sp = get_spotify()
        results = sp.search(query, type=search_type, limit=1)

        items = results.get(f"{search_type}s", {}).get("items", [])
        if not items:
            return {"success": False, "found": None, "message": f"Nada encontrado para '{query}'."}

        item = items[0]
        name = item.get("name", "?")
        uri = item.get("uri")

        # Para artista, toca as top tracks
        if search_type == "artist":
            top = sp.artist_top_tracks(uri)
            uris = [t["uri"] for t in top["tracks"][:5]]
            sp.start_playback(uris=uris)
        elif search_type == "track":
            sp.start_playback(uris=[uri])
        else:
            sp.start_playback(context_uri=uri)

        return {
            "success": True,
            "found": name,
            "uri": uri,
            "message": f"Tocando: {name}"
        }
    except spotipy.exceptions.SpotifyException as e:
        if "Premium" in str(e):
            return {"success": False, "found": None, "message": "Controle de playback requer Spotify Premium."}
        return {"success": False, "found": None, "message": f"Erro ao buscar/tocar: {e}"}


def get_devices() -> dict:
    try:
        sp = get_spotify()
        result = sp.devices()
        devices = result.get("devices", [])

        if not devices:
            return {
                "success": False,
                "devices": [],
                "message": "Nenhum dispositivo ativo. Abra o Spotify em algum dispositivo primeiro."
            }

        names = [f"{d['name']} ({d['type']})" for d in devices]
        return {
            "success": True,
            "devices": devices,
            "message": f"Dispositivos ativos: {', '.join(names)}"
        }
    except Exception as e:
        return {"success": False, "devices": [], "message": f"Erro ao listar dispositivos: {e}"}


def transfer_playback(device_name: str) -> dict:
    try:
        sp = get_spotify()
        result = sp.devices()
        devices = result.get("devices", [])

        if not devices:
            return {"success": False, "message": "Nenhum dispositivo ativo no momento."}

        alvo = next(
            (d for d in devices if device_name.lower() in d["name"].lower()),
            None
        )

        if not alvo:
            nomes = [d["name"] for d in devices]
            return {
                "success": False,
                "message": f"'{device_name}' não encontrado. Disponíveis: {', '.join(nomes)}"
            }

        sp.transfer_playback(alvo["id"], force_play=True)
        return {"success": True, "message": f"Reprodução transferida para '{alvo['name']}'."}
    except Exception as e:
        return {"success": False, "message": f"Erro ao transferir: {e}"}


def get_user_playlists(limit: int = 10) -> dict:
    """
    Retorna as playlists do usuário.

    Args:
        limit: Quantidade de playlists a retornar. Padrão: 10

    Retorna:
        dict com 'success', 'playlists' (lista de dicts) e 'message'
    """
    try:
        sp = get_spotify()
        result = sp.current_user_playlists(limit=limit)
        playlists = [
            {"name": p["name"], "uri": p["uri"], "tracks": p["tracks"]["total"]}
            for p in result["items"]
        ]
        names = [p["name"] for p in playlists]
        return {
            "success": True,
            "playlists": playlists,
            "message": f"Suas playlists: {', '.join(names)}"
        }
    except Exception as e:
        return {"success": False, "playlists": [], "message": f"Erro ao buscar playlists: {e}"}


# ─── Tool principal do Jarvis ──────────────────────────────────────────────────

def jarvis_spotify_tool(
    action: str,
    query: str = None,
    volume: int = None,
    search_type: str = "track",
    device_name: str = None
) -> str:
    """
    Ferramenta principal do Spotify para o Jarvis.
    Recebe a ação e os parâmetros e executa o comando correspondente.

    Args:
        action:      Ação a executar: 'play', 'pause', 'next', 'previous',
                     'volume', 'search', 'current', 'devices', 'playlists', 'transfer'
        query:       Nome da música/artista/playlist (para action='search' ou 'play')
        volume:      Volume de 0 a 100 (para action='volume')
        search_type: 'track', 'artist', 'playlist' ou 'album' (para action='search')
        device_name: Nome do dispositivo para transferir (para action='transfer')

    Retorna:
        str com a resposta para o Jarvis falar ao usuário

    Exemplos de uso:
        jarvis_spotify_tool("search", query="Daft Punk", search_type="artist")
        jarvis_spotify_tool("volume", volume=60)
        jarvis_spotify_tool("current")
        jarvis_spotify_tool("pause")
        jarvis_spotify_tool("transfer", device_name="Echo Dot")
    """
    action = action.lower().strip()

    if action in ("play", "retomar", "continuar"):
        if query:
            result = search_and_play(query, search_type)
        else:
            result = play()
        return result["message"]

    elif action in ("pause", "pausar", "parar"):
        return pause()["message"]

    elif action in ("next", "próxima", "proxima", "pular"):
        return next_track()["message"]

    elif action in ("previous", "anterior", "voltar"):
        return previous_track()["message"]

    elif action in ("volume",):
        if volume is None:
            return "Por favor, informe o volume desejado (0 a 100)."
        return set_volume(volume)["message"]

    elif action in ("search", "buscar", "tocar", "toca"):
        if not query:
            return "Por favor, informe o nome da música, artista ou playlist."
        return search_and_play(query, search_type)["message"]

    elif action in ("current", "atual", "tocando", "o que está tocando"):
        return get_current_track()["message"]

    elif action in ("devices", "dispositivos"):
        return get_devices()["message"]

    elif action in ("transfer", "transferir"):
        if not device_name:
            return "Por favor, informe o nome do dispositivo para transferir a reprodução."
        return transfer_playback(device_name)["message"]

    elif action in ("playlists",):
        return get_user_playlists()["message"]

    else:
        return (
            f"Ação '{action}' não reconhecida. "
            "Ações disponíveis: play, pause, next, previous, volume, search, current, devices, transfer, playlists."
        )


# ─── Tool Definition para o Jarvis (formato OpenAI/LangChain) ─────────────────

JARVIS_TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "controlar_spotify",
        "description": (
            "Controla o Spotify do usuário. Use para tocar músicas, artistas ou playlists, "
            "pausar, pular faixas, ajustar volume, ver o que está tocando agora, "
            "listar dispositivos ativos, transferir reprodução entre dispositivos ou ver as playlists do usuário. "
            "Exemplos: 'toca Daft Punk', 'pausa a música', 'aumenta o volume para 80', "
            "'o que está tocando?', 'toca minha playlist Foco', 'transfere pro meu celular'."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Ação a executar.",
                    "enum": ["play", "pause", "next", "previous", "volume", "search", "current", "devices", "playlists", "transfer"]
                },
                "query": {
                    "type": "string",
                    "description": "Nome da música, artista, álbum ou playlist. Obrigatório para action='search' ou 'play' com nome."
                },
                "volume": {
                    "type": "integer",
                    "description": "Volume de 0 a 100. Obrigatório para action='volume'.",
                    "minimum": 0,
                    "maximum": 100
                },
                "search_type": {
                    "type": "string",
                    "description": "Tipo de busca. Padrão: 'track'.",
                    "enum": ["track", "artist", "album", "playlist"],
                    "default": "track"
                },
                "device_name": {
                    "type": "string",
                    "description": "Nome do dispositivo para transferir a reprodução (ex: 'Echo Dot', 'PC do Pedro', 'iPhone'). Obrigatório para action='transfer'."
                }
            },
            "required": ["action"]
        }
    }
}


# ─── Registro no Jarvis ────────────────────────────────────────────────────────

def register_in_jarvis(tools_list: list) -> None:
    """
    Registra a tool do Spotify na lista de tools do Jarvis.

    No seu jarvis.py:
        from spotify_tool import register_in_jarvis, jarvis_spotify_tool
        register_in_jarvis(tools)
    """
    tools_list.append(JARVIS_TOOL_DEFINITION)
    print("[Jarvis] ✅ Tool 'controlar_spotify' registrada com sucesso.")


# ─── Teste rápido ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Teste spotify_tool.py ===\n")

    print("1. Verificando conexão...")
    sp = get_spotify()
    user = sp.me()
    print(f"   ✅ Conectado como: {user['display_name']}\n")

    print("2. Dispositivos ativos...")
    print(f"   {get_devices()['message']}\n")

    print("3. Música atual...")
    print(f"   {get_current_track()['message']}\n")

    print("4. Suas playlists...")
    print(f"   {get_user_playlists(limit=5)['message']}\n")

    print("5. Simulando comando do Jarvis: 'toca Daft Punk'")
    print(f"   {jarvis_spotify_tool('search', query='Daft Punk', search_type='artist')}\n")

    print("=== Fim do teste ===")
