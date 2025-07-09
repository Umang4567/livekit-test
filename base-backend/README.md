# Python Voice Agent

A basic example of a voice agent using LiveKit and Python.

## Dev Setup

Clone the repository and install dependencies to a virtual environment:

```console
# Linux/macOS
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 agent.py download-files
```

<details>
  <summary>Windows instructions (click to expand)</summary>
  
```cmd
:: Windows (CMD/PowerShell)
python3 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python3 agent.py download-files
```

</details>

## Environment Variables

Create a `.env` file in this directory and add the following environment variables:

```
# LiveKit Configuration
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# OpenAI Configuration
OPENAI_API_KEY=
```

You can get these from your [LiveKit Cloud](https://cloud.livekit.io/) and [OpenAI](https://platform.openai.com/) dashboards.

## Deployment with Docker

### Prerequisites

Before deploying, ensure you have:

- Docker installed on your machine.
- The required API keys and configuration values set in a `.env` file.

### Build the Docker image

```bash
docker build -t livekit-agent .
```

_You can replace `livekit-agent` with any name you like for your Docker image._

### Run the Docker container

```bash
docker run -d \
  --name livekit-agent-container \
  --env-file .env \
  --restart unless-stopped \
  -p 8081:8081 \
  livekit-agent
```

_You can also choose any name for your container._

### Check container status

```bash
# View running containers
docker ps

# Check logs
docker logs livekit-agent-container

# Follow logs in real-time
docker logs -f livekit-agent-container
```
