# Imported from: https://github.com/oclif/docker/blob/master/Dockerfile
FROM node:alpine

MAINTAINER Francois Gerthoffert

# Add bash
RUN apk add --no-cache bash

COPY ./startup.sh /usr/share/zencrepes/

WORKDIR /usr/share/zencrepes/
RUN chmod +x ./startup.sh

RUN npm install -g zindexer@latest

CMD ["/bin/bash", "-c", "/usr/share/zencrepes/startup.sh"]