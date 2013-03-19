Vagrant.require_plugin "vagrant-symfony"

$symfonydir = "/usr/share/nginx/www/symfony"

Vagrant.configure("2") do |config|
  config.vm.box = "symfony"
  config.vm.box_url = "http://vagrant.wimbi.lan/boxes/symfony.box"

  config.symfony.root = $symfonydir
  config.symfony.web = "./web"
  config.symfony.cmd = "./app/console"
  config.symfony.entry = "app_dev.php"
  config.symfony.nginx_hostfile = "/etc/nginx/sites-enabled/default"
  config.symfony.update_nginx = true

  config.vm.network :private_network, ip: "192.168.42.42"
  config.vm.network :forwarded_port, guest: 80, host: 8000

  config.vm.synced_folder "./", $symfonydir, :nfs => true
end

