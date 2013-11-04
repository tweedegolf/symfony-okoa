<?php

namespace Entity;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * NOTE: This is only an example implementation.
 * You may remove this implementation and add your own. If you remove
 * this implementation and don't use the Entity namespace it resides in,
 * you should remove that mapping from the application configuration in
 * config.yml. Do not forget to adjust the fos_user config to reflect your
 * own user class.
 * @ORM\Entity
 */
class User extends BaseUser
{
    /**
     * @var integer
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue
     */
    protected $id;

    /**
     * Construct a new user
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Retrieve the identifier
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return (string) $this->getUsername();
    }
}
