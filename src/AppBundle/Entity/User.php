<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use FOS\UserBundle\Model\User as BaseUser;

/**
 * NOTE: This is only an example implementation.
 * You may remove this implementation and add your own. Do not forget to adjust the
 * fos_user config to reflect your own user class.
 *
 * @ORM\Entity(repositoryClass="AppBundle\EntityRepository\UserRepository")
 * @ORM\Table(name="users")
 */
class User extends BaseUser
{
    /**
     * @var int
     *
     * @ORM\Column(type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue
     */
    protected $id;

    /**
     * Construct a new user.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Retrieve the identifier.
     *
     * @return int
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
