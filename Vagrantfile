is_windows = (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil

mount_options = ["nolock", "vers=3", "udp", "noatime", "actimeo=1"]
if is_windows
    mount_options = []
end

Vagrant.configure(2) do |config|
    config.ssh.forward_agent = true

    config.vm.define "app" do |node|
        node.vm.box = "debian/jessie64"
        node.vm.network :private_network, ip: '192.168.142.101'
        node.vm.synced_folder ".", "/vagrant", disabled: true
        node.vm.synced_folder ".", "/app", type: "nfs", mount_options: mount_options

        node.vm.network :forwarded_port, guest: 80, host: 80
        node.vm.network :forwarded_port, guest: 8080, host: 8080
        node.vm.network :forwarded_port, guest: 1080, host: 1080
        node.vm.network :forwarded_port, guest: 5432, host: 5432

        node.vm.provider "virtualbox" do |virtualbox|
            virtualbox.cpus = 2
            virtualbox.memory = 4096
        end

        node.vm.provision :shell,
            inline: "echo 'export USER_ID=$UID' | sudo tee /etc/profile.d/user_id.sh > /dev/null"
        node.vm.provision :shell,
            inline: "grep -q -F 'cd /app' /home/vagrant/.bashrc || echo 'cd /app' >> /home/vagrant/.bashrc"
        node.vm.provision :docker
        node.vm.provision :docker_compose,
            compose_version: "1.7.1"
    end
end
