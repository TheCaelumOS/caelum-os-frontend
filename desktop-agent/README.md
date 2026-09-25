# CaelumOS Local Infrastructure Connector

The **CaelumOS Local Infrastructure Connector** enables **TheCaelumOS** web desktop (`https://caleum.me/os`) to connect directly and exclusively to your local **Docker Desktop** and local **Kubernetes** (Minikube / Kind / Docker Desktop K8s) environments.

## Architecture & Privacy Guarantee

- **The Website is Shared. The Infrastructure Connection is Local.**
- **Zero Cloud Exposure**: Binds strictly to `127.0.0.1:48721`. Never listens on public interfaces (`0.0.0.0`).
- **Complete Isolation**: User A and User B both use `https://caleum.me/os`, but User A's browser connects ONLY to User A's machine (`127.0.0.1`), and User B's browser connects ONLY to User B's machine.
- **Zero Cloud Proxying**: The `caleum.me` backend never sees, routes, or stores your Docker containers, images, volumes, Kubernetes pods, kubeconfig, or credentials.
- **Protected by Local Token**: A secure pairing token is generated and stored locally in `~/.caelum/connector-token.json`. Requests from CaelumOS include this token via the `X-Caelum-Token` header.
- **Chrome Private Network Access (PNA)**: Includes full support for W3C Private Network Access preflights (`Access-Control-Allow-Private-Network: true`).
- **Safe Operation Whitelisting**: Only safe Docker and Kubernetes read/management commands are supported. Arbitrary shell command execution (`POST /exec`) is strictly prohibited.

---

## Quick Start

### Prerequisites
- Node.js 18+ installed on your machine
- Docker Desktop (optional, if you want to manage local containers)
- `kubectl` / Minikube (optional, if you want to manage local Kubernetes)

### Windows
Double-click `start-connector.bat` in the repository root or run:
```cmd
.\start-connector.bat
```

### macOS / Linux
```bash
chmod +x desktop-agent/start-connector.sh
./desktop-agent/start-connector.sh
```

### Or using Node.js directly
```bash
node desktop-agent/src/index.js
```

---

## How Pairing Works

1. When the connector starts for the first time, it generates a unique secure token (e.g. `caelum_935244...`) and prints it in the terminal.
2. In CaelumOS (`https://caleum.me/os`), open the **Docker** or **Kubernetes** app.
3. If not already paired, click **Connect Local Docker** or **Install / Start Connector**.
4. Paste your pairing token (or verify the pre-detected token).
5. CaelumOS connects directly to `http://127.0.0.1:48721` and shows your live local containers and pods!
