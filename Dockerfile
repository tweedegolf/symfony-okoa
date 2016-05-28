FROM debian:jessie

# Install dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ruby ruby-dev libsqlite3-dev sqlite3 git htop \
    dnsutils tmux curl wget apt-transport-https python-pip \
    nano vim postgresql-client-9.4
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    php5-fpm php5-cli php5-curl php5-gd php5-intl php5-imagick \
    php5-memcached php5-sqlite php5-pgsql php5-dev php-pear php5-apcu

RUN curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    echo 'deb https://deb.nodesource.com/node_4.x jessie main' > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

RUN npm install -g 'npm@3.9.*'
RUN npm install -g 'gulp-cli@1.2.*'

RUN curl -o /usr/local/bin/composer https://getcomposer.org/download/1.1.1/composer.phar && \
    chmod a+x /usr/local/bin/composer

# Setup tg user and sudo access
ARG USER_ID=1000
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y sudo
RUN groupadd nopwsudo && \
    echo "%nopwsudo      ALL=(ALL:ALL) NOPASSWD: ALL" > /etc/sudoers.d/nopwsudo && \
    useradd tg -u ${USER_ID} -G nopwsudo,sudo,adm -m

VOLUME /app

USER tg
WORKDIR /app
