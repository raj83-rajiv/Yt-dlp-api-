# Official Puppeteer image use kar rahe hain taaki dependency ka error na aaye
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Environment variables set karo
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Pehle sirf package files copy karo
COPY package*.json ./

# Install dependencies
RUN npm ci

# Baaki code copy karo
COPY . .

# Port expose karo
EXPOSE 8000

# Server start karo
CMD [ "node", "index.js" ]
