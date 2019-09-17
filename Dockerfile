FROM node:10

ENV PATH=$PATH:/app/node_modules/.bin
WORKDIR /app
COPY . .
RUN npm i --production

ENTRYPOINT ["probot", "receive"]
CMD ["/app/index.js"]