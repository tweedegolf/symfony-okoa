is_windows = (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil

mount_options = ["nolock", "vers=3", "udp", "noatime", "actimeo=1"]
if is_windows
    mount_options = []
end

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
        node.vm.synced_folder ".", "/app", type: "nfs", mount_options: mount_options

        node.vm.provider "virtualbox" do |virtualbox|
            virtualbox.memory = 2048
        end

        if is_windows
            node.vm.provision "shell" do |sh|
                sh.path = "tasks/ansible/ansible.sh"
                sh.args = "tasks/ansible/playbook.yml"
            end
        else
            node.vm.provision "ansible" do |ansible|
                ansible.playbook = "tasks/ansible/playbook.yml"
            end
        end
    end

    config.vm.define "selenium" do |node|
        node.vm.box = "ubuntu/wily64"
        node.vm.hostname = "selenium"
        node.hostmanager.aliases = ["selenium.dev"]
        node.vm.network :private_network, ip: '192.168.142.254'
        node.vm.synced_folder ".", "/app", type: "nfs", mount_options: mount_options

        if is_windows
            node.vm.provision "shell" do |sh|
                sh.path = "tasks/ansible/ansible.sh"
                sh.args = "tasks/ansible/selenium.yml"
            end
        else
            node.vm.provision "ansible" do |ansible|
                ansible.playbook = "tasks/ansible/selenium.yml"
            end
        end
    end
end
