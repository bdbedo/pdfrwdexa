FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libreoffice \
        python3 \
        python3-pip \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 3001
CMD ["node", "server.js"]
