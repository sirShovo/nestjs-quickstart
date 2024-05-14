FROM node:18.15.0-alpine3.17
ENV PORT 8080
EXPOSE 8080
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build && npm prune --production
CMD [ "npm", "run", "start:prod" ]