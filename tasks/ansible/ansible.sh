#!/usr/bin/env bash
ANSIBLE_PLAYBOOK=$1
PLAYBOOK_DIR=${ANSIBLE_PLAYBOOK%/*}

# Make sure Ansible playbook exists.
if [ ! -f "/app/$ANSIBLE_PLAYBOOK" ]; then
  echo "Cannot find Ansible playbook."
  exit 1
fi

# Install Ansible and its dependencies if it's not installed already.
if ! command -v ansible >/dev/null; then
  echo "Installing Ansible dependencies and Git."
  apt-get update
  apt-get install -y git python python-dev python-setuptools build-essential

  echo "Installing pip."
  easy_install pip

  echo "Installing required python modules."
  pip install paramiko pyyaml jinja2 markupsafe

  echo "Installing Ansible."
  pip install ansible
fi

# Run the playbook.
echo "Running Ansible provisioner defined in Vagrantfile."
ansible-playbook -i 'localhost,' "/app/${ANSIBLE_PLAYBOOK}" --connection=loc