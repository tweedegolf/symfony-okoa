Vagrant.configure(2) do |config|
    config.hostmanager.enabled = true
    config.hostmanager.manage_host = true
    config.hostmanager.manage_guest = true
    config.hostmanager.include_offline = true
    config.ssh.forward_agent = true

    config.vm.define "app" do |node|
        node.vm.box = "debian/jessie64"
        node.vm.hostname = "app"
        node.hostmanager.aliases = ["app.dev", "admin.dev"]
        node.vm.network :private_network, ip: '192.168.142.101'
        node.vm.synced_folder ".", "/vagrant", disabled: true
        node.vm.synced_folder ".", "/app", type: "nfs", mount_options: ["nolock", "vers=3", "udp", "noatime", "actimeo=1"]

        node.vm.provider "virtualbox" do |virtualbox|
            virtualbox.memory = 2048
        end

        node.vm.provision "ansible" do |ansible|
            ansible.playbook = "tasks/ansible/playbook.yml"
        end
    end

    config.vm.define "selenium" do |node|
        node.vm.box = "ubuntu/wily64"
        node.vm.hostname = "selenium"
        node.hostmanager.aliases = ["selenium.dev"]
        node.vm.network :private_network, ip: '192.168.142.254'

        node.vm.provision "ansible" do |ansible|
            ansible.playbook = "tasks/ansible/selenium.yml"
        end
    end
end
