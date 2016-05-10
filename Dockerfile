FROM debian:jessie
RUN apt-get update && apt-get install sudo
ARG USER_ID=0
RUN useradd vagrant -u ${USER_ID} -g sudo,adm
VOLUME /app
COPY tasks/ansible/ansible.sh /var/ansible/ansible.sh
RUN DOCKER=1 /var/ansible/ansible.sh
COPY tasks/ansible/playbook.yml /var/ansible/playbook.yml
COPY tasks/ansible/files /var/ansible/files
RUN DOCKER=1 /var/ansible/ansible.sh /var/ansible/playbook.yml
WORKDIR /app
CMD /app/bin/docker_run
