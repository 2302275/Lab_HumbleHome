# ICT2216_SSD_HumbleHome

Team 33 HumbleHome
Team Members:
ALTIUS CHUA WEN XIANG - 2301845
BRANDON HII QING RONG - 2301916
CHAN JUN XIANG JORDAN - 2302141
CHEE POH CHUAN        - 2302068
LEE TING HOW JUSTIN   - 2302275
TAN WENG HONG ISAAC   - 2302088

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
