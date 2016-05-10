#!/usr/bin/env bash

# Install Ansible and its dependencies if it's not installed already.
if ! command -v ansible >/dev/null; then
  echo "Installing Ansible dependencies"
  apt-get update
  apt-get install -y python python-dev python-setuptools build-essential libffi-dev openssl ca-certificates libssl-dev

  echo "Installing pip."
  easy_install pip

  echo "Installing required python modules."
  pip install paramiko pyyaml jinja2 markupsafe

  echo "Installing Ansible."
  pip install ansible
fi

ANSIBLE_PLAYBOOK=$1

if [ ! -z "$ANSIBLE_PLAYBOOK" ]; then
    # Make sure Ansible playbook exists.
    if [ ! -f "$ANSIBLE_PLAYBOOK" ]; then
      echo "Cannot find Ansible playbook '$ANSIBLE_PLAYBOOK'."
      exit 1
    fi

    [[ $DOCKER = "1" ]] && DOCKER_BOOL="yes" || DOCKER_BOOL="no"

    # Run the playbook.
    echo "Running Ansible provisioner"
    ansible-playbook -i 'localhost,' "${ANSIBLE_PLAYBOOK}" --connection=local --extra-vars "docker=$DOCKER_BOOL"
fi


