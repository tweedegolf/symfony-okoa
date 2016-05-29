<?php

namespace Test;

use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Filesystem\Filesystem;

trait SymfonyAppTrait
{
    /**
     * @var \AppKernel
     */
    private $symfony;

    /**
     * @param string $environment
     */
    public function clearCache($environment = 'prod', $warm = true)
    {
        $cacheDir = $this->getContainer($environment)->getParameter('kernel.cache_dir');
        $this->getContainer($environment)->get('cache_clearer')->clear($cacheDir);
        
        if ($warm) {
            $this->getContainer($environment)->get('cache_warmer')->warmUp($cacheDir);
        }
    }

    /**
     * @param string $environment
     * @return \AppKernel
     */
    public function getKernel($environment = 'test')
    {
        if (!isset($this->symfony)) {
            $this->symfony = [];
        }

        if (!isset($this->symfony[$environment])) {
            require_once __DIR__.'/../var/bootstrap.php.cache';
            $this->symfony[$environment] = new \AppKernel($environment, true);
            $this->symfony[$environment]->loadClassCache();
            $this->symfony[$environment]->boot();
        }

        return $this->symfony[$environment];
    }

    /**
     * @param string $environment
     * @return ContainerInterface
     */
    public function getContainer($environment = 'test')
    {
        return $this->getKernel($environment)->getContainer();
    }

    /**
     * @param string $environment
     * @return ManagerRegistry
     */
    public function getDoctrine($environment = 'test')
    {
        return $this->getContainer($environment)->get('doctrine');
    }
}
