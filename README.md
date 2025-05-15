# ICT2216_SSD_HumbleHome

## Team 33 — HumbleHome

| Name                    | Student ID |
|-------------------------|------------|
| Altius Chua Wen Xiang  | 2301845    |
| Brandon Hii Qing Rong  | 2301916    |
| Chan Jun Xiang Jordan  | 2302141    |
| Chee Poh Chuan         | 2302068    |
| Lee Ting How Justin    | 2302275    |
| Tan Weng Hong Isaac    | 2302088    |


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
