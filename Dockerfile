# Imported from: https://github.com/oclif/docker/blob/master/Dockerfile
FROM node:24-alpine

MAINTAINER Francois Gerthoffert

# Add bash
RUN apk add --no-cache bash

COPY ./startup.sh /usr/share/zencrepes/

WORKDIR /usr/share/zencrepes/
RUN chmod +x ./startup.sh

# sqlite3 has no prebuilt binary for the Node 24 musl ABI, so provide a
# build toolchain just for the install, then remove it to keep the image lean.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm install -g zindexer@latest \
    && apk del .build-deps

CMD ["/bin/bash", "-c", "/usr/share/zencrepes/startup.sh"]