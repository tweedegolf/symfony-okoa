<?php

use Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = [
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Bravesheep\DatabaseUrlBundle\BravesheepDatabaseUrlBundle(),
            new Bravesheep\MailerUrlBundle\BravesheepMailerUrlBundle(),
            new Bravesheep\FlysystemUrlBundle\BravesheepFlysystemUrlBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),
            new StofDoctrineExtensionsBundle(),
            new Oneup\FlysystemBundle\OneupFlysystemBundle(),
            new Vich\UploaderBundle\VichUploaderBundle(),
            new Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle(),
            new FOS\UserBundle\FOSUserBundle(),

            // project bundles
            new AppBundle\AppBundle(),
        ];

        if (in_array($this->getEnvironment(), ['dev', 'test'])) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function getRootDir()
    {
        return __DIR__;
    }

    public function getCacheDir()
    {
        $env = getenv('SYMFONY_OKOA_CACHE_DIR');
        if ($env !== false) {
            return str_replace('__ENV__', $this->getEnvironment(), $env);
        }

        return dirname(__DIR__).'/var/cache/'.$this->getEnvironment();
    }

    public function getLogDir()
    {
        $env = getenv('SYMFONY_OKOA_LOG_DIR');
        if ($env !== false) {
            return str_replace('__ENV__', $this->getEnvironment(), $env);
        }

        return dirname(__DIR__).'/var/logs';
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__ . '/config/' . $this->getEnvironment() . '/config.yml');
    }
}
