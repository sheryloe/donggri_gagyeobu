# Run Donggri Ledger on Local Wi-Fi

This guide is for running the ledger as a local web server and opening it from your phone on the same Wi-Fi network.

## 1) Start the server

From repo root:

```powershell
python launcher.py
```

or run the packaged EXE:

```powershell
.\dist\donggri-ledger\donggri-ledger.exe
```

The server binds to `0.0.0.0:8000`.

## 2) Open from PC

Open:

- `http://127.0.0.1:8000/ui/`

## 3) Find PC IP and open from phone

Find your PC IPv4:

```powershell
ipconfig
```

Use your Wi-Fi adapter IPv4, for example `192.168.0.23`.

Open on phone (same Wi-Fi):

- `http://192.168.0.23:8000/ui/`

## 4) Windows firewall

If phone cannot connect, allow inbound TCP 8000.

Example (PowerShell as Administrator):

```powershell
New-NetFirewallRule -DisplayName "Donggri Ledger 8000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000
```

## 5) Auto start at Windows login

After building EXE, install startup shortcut:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install_startup.ps1
```

Remove auto start:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\uninstall_startup.ps1
```

## Notes

- Keep PC and phone on the same local network.
- URL path is `/ui/`.
- API health check: `http://<PC_IP>:8000/health`.
