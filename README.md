# ICT2216_SSD_HumbleHome

## Prerequisites

Make sure you have the following installed on your system:
- Docker
- Python

## Getting Started

If you have cloned or copied the project directory:

```bash
# 1. Navigate into the project folder
cd humblehome-app

# 2. Build the Docker image
docker build -t humblehome .

# 3. Run the container
docker run -d -p 3000:3000 humblehome
