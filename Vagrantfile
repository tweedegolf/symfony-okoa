is_windows = (/cygwin|mswin|mingw|bccwin|wince|emx/ =~ RUBY_PLATFORM) != nil

mount_options = ["nolock", "vers=3", "udp", "noatime", "actimeo=1"]
if is_windows
    mount_options = []
end

Vagrant.configure(2) do |config|
    config.ssh.forward_agent = true

    config.vm.define "app" do |node|
        node.vm.box = "debian/jessie64"
        node.vm.synced_folder ".", "/vagrant", disabled: true
        node.vm.synced_folder ".", "/app", type: "nfs", mount_options: mount_options
        node.vm.synced_folder "~/.composer", "/home/vagrant/.composer", type: "nfs", mount_options: mount_options

        node.vm.network :private_network, type: "dhcp"
        node.vm.network :forwarded_port, guest: 80, host: 8880
        node.vm.network :forwarded_port, guest: 8080, host: 8080
        node.vm.network :forwarded_port, guest: 1080, host: 1080
        node.vm.network :forwarded_port, guest: 2080, host: 2080
        node.vm.network :forwarded_port, guest: 5432, host: 5432
        node.vm.network :forwarded_port, guest: 4444, host: 4444
        node.vm.network :forwarded_port, guest: 6379, host: 6379
        node.vm.network :forwarded_port, guest: 15900, host: 15900
        node.vm.network :forwarded_port, guest: 15901, host: 15901
        node.vm.network :forwarded_port, guest: 35729, host: 35729

        node.vm.provider "virtualbox" do |virtualbox|
            virtualbox.cpus = 2
            virtualbox.memory = 4096
        end

        node.vm.provision :shell,
            inline: "echo 'export USER_ID=`stat -c '%u' /app`' > /etc/profile.d/user_id.sh"
        node.vm.provision :shell,
            inline: "grep -q -F 'cd /app' /home/vagrant/.bashrc || echo 'cd /app' >> /home/vagrant/.bashrc"
        node.vm.provision :docker
        node.vm.provision :shell,
            inline: "
                rm -f /usr/local/bin/docker-compose && \
                curl -s -L -o /usr/local/bin/docker-compose \
                    'https://github.com/docker/compose/releases/download/1.7.1/docker-compose-Linux-x86_64' && \
                chmod +x /usr/local/bin/docker-compose
            "
    end
end
