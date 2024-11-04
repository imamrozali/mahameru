FROM node:20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .
RUN npm run build

FROM node:20 AS runner

WORKDIR /app

COPY --from=builder /app .

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
