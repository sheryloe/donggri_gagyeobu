import os
import socket
import sys
from pathlib import Path


def _guess_lan_ip() -> str:
    """Resolve the preferred LAN IP without sending external traffic."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def run_api() -> None:
    import uvicorn
    from app.main import app

    host = "0.0.0.0"
    port = 8888
    lan_ip = _guess_lan_ip()

    print("[donggri_gagyeobu] starting web server...")
    print(f"[donggri_gagyeobu] local: http://127.0.0.1:{port}/ui/")
    print(f"[donggri_gagyeobu] wifi:  http://{lan_ip}:{port}/ui/")

    config = uvicorn.Config(
        app,
        host=host,
        port=port,
        log_level="info",
        reload=False,
    )
    server = uvicorn.Server(config)
    server.run()


def main() -> None:
    # Fix cwd to executable (or this file) so relative paths are stable.
    base_dir = Path(sys.executable if getattr(sys, "frozen", False) else __file__).resolve().parent
    os.chdir(base_dir)
    run_api()


if __name__ == "__main__":
    main()
