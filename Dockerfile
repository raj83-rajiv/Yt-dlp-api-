# Official Puppeteer image (Chrome pre-installed)
FROM ghcr.io/puppeteer/puppeteer:21.5.2

# Skip downloading Chrome again (Use installed one)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# 🔥 CHANGE HERE: 'npm ci' ki jagah 'npm install' (Fixes Build Error)
RUN npm install

# Copy rest of the code
COPY . .

# Expose Port
EXPOSE 8000

# Start Server
CMD [ "node", "index.js" ]
