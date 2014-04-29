<?php

use Composer\Script\Event;
use Composer\Factory;
use Composer\Json\JsonFile;
use Composer\Util\SpdxLicenseIdentifier;

class ScriptHandler
{
    public static function formatQuestion($question, $default = null)
    {
        if ($default === null) {
            return sprintf("<question>%s</question>: ", $question);
        } else {
            return sprintf("<question>%s</question> (<comment>%s</comment>): ", $question, $default);
        }
    }

    private static function determineProjectName()
    {
        if (function_exists('posix_geteuid')) {
            $user = posix_getpwuid(posix_geteuid())['name'];
        } else {
            $user = get_current_user();
        }
        $user = strtolower($user);
        $dir = strtolower(basename(getcwd()));
        return "${user}/${dir}";
    }

    private static function determineProjectTitle()
    {
        return ucfirst(basename(getcwd()));
    }

    private static function determineDatabaseName()
    {
        return strtolower(basename(getcwd()));
    }

    public static function createProject(Event $event)
    {
        $io = $event->getIO();
        $json = new JsonFile("./composer.json");
        $config = $json->read();
        $name = self::determineProjectName();
        $io->write("<info>Updating project properties...</info>");

        // update composer project name
        $name = $io->askAndValidate(
            self::formatQuestion("Composer project name", $name), function ($val) {
                $val = trim($val);
                if (strlen($val) < 3 || substr_count($val, '/') !== 1) {
                    throw new RuntimeException("Correct project names follow the 'company/project' structure");
                }
                return $val;
            },
            false,
            $name
        );
        $config['name'] = $name;

        // composer project description
        $config['description'] = $io->askAndValidate(
            self::formatQuestion("Description of the project", ""), function ($val) {
                if (strlen(trim($val)) < 1) {
                    throw new RuntimeException("Description may not be empty");
                }

                return trim($val);
            },
            false,
            ""
        );

        // composer project license
        $licenseValidator = new SpdxLicenseIdentifier();
        $oldLicense = $config['license'];
        $config['license'] = $io->askAndValidate(
            self::formatQuestion("Project license", $config['license']), function ($val) use ($licenseValidator) {
                $val = trim($val);
                if (strlen($val) < 1 || ($val !== 'proprietary' && !$licenseValidator->validate($val))) {
                    throw new RuntimeException(
                        "Please provide a license, either use 'proprietary' or one from http://www.spdx.org/licenses/"
                    );
                }

                return $val;
            },
            false,
            $config['license']
        );

        unset($config['scripts']['post-root-package-install']);
        unlink('./src/ScriptHandler.php');

        // save config
        $io->write("<info>Updating composer.json</info>");
        $json->write($config);

        // remove license file if the license has changed
        if ($config['license'] !== $oldLicense && is_file('LICENSE')) {
            $io->write("<info>Found a LICENSE file, but you have changed the license.</info>");
            if ($io->askConfirmation("<question>Remove LICENSE file?</question>", false)) {
                $io->write("<info>Removing LICENSE file</info>");
                unlink('LICENSE');
            } else {
                $io->write("<info>Please check if the LICENSE file is still up to date</info>");
            }
        }

        // update parameters.yml.dist
        if (isset($config['extra']['incenteev-parameters']['file'])) {
            $dist = $config['extra']['incenteev-parameters']['file'] . '.dist';
            if (file_exists($dist)) {
                $sitename = self::determineProjectTitle();
                $sitename = $io->ask(self::formatQuestion("Sitename", $sitename), $sitename);
                $database_name = self::determineDatabaseName();
                $secret = hash('sha1', uniqid(time(), true));

                $io->write("<info>Updating parameters dist file</info>");
                file_put_contents(
                    $dist,
                    str_replace(
                        [
                            '%sitename%',
                            '%secret%',
                            '%database_name%'
                        ],
                        [
                            $sitename,
                            $secret,
                            $database_name,
                        ],
                        file_get_contents($dist)
                    )
                );
            }
        }

        // update package.json
        $json = new JsonFile("./package.json");
        $config = $json->read();
        $config['name'] = $name;

        $io->write("<info>Updating package.json</info>");
        $json->write($config);

        // update bower.json
        $json = new JsonFile("./bower.json");
        $config = $json->read();
        $config['name'] = $name;

        $io->write("<info>Updating bower.json</info>");
        $json->write($config);
    }
}
