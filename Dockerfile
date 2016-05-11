FROM debian:jessie

# Setup vagrant user and sudo access
ARG USER_ID=2345
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y sudo
RUN groupadd nopwsudo && \
    echo "%nopwsudo      ALL=(ALL:ALL) NOPASSWD: ALL" > /etc/sudoers.d/nopwsudo && \
    useradd vagrant -u ${USER_ID} -G nopwsudo,sudo,adm -m

# Run ansible setup
VOLUME /app
COPY tasks/ansible/ansible.sh /var/ansible/ansible.sh
RUN DOCKER=1 /var/ansible/ansible.sh

USER vagrant
COPY tasks/ansible /var/ansible
RUN DOCKER=1 /var/ansible/ansible.sh /var/ansible/playbook.yml

WORKDIR /app
CMD /app/bin/docker_run
