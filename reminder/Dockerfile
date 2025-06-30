FROM node:24.3-bookworm as build

WORKDIR /app

COPY tsconfig.json .
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY src/. src/.

RUN npm run build

FROM node:24.3-bookworm as deploy
WORKDIR /app

COPY --from=build /app/lib /app/lib
COPY --from=build /app/node_modules /app/node_modules

ENTRYPOINT "node" "/app/lib/index.js"