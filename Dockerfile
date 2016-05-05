FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# ReadOnly database access
RUN echo "{\"database\" : {\"username\": \"cellmap\",\"password\": \"readonly+123\",\"port\": \"13280\",\"uri\": \"ds013280.mlab.com\",\"collection\": \"guided\"}}" > config.json

RUN apt-get update

RUN apt-get install -y imagemagick

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]