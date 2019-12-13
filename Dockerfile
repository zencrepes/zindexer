# Imported from: https://github.com/oclif/docker/blob/master/Dockerfile
FROM node:alpine

MAINTAINER Francois Gerthoffert

RUN npm install -g zindexer@latest

CMD ["/bin/sh"]