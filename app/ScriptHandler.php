<?php

use Composer\Script\Event;
use Composer\Factory;
use Composer\Json\JsonFile;
use Composer\Util\SpdxLicenseIdentifier;
use Symfony\Component\Yaml\Parser;
use Symfony\Component\Yaml\Yaml;

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

    public static function createProject(Event $event)
    {
        $io = $event->getIO();
        $file = Factory::getComposerFile();
        $json = new JsonFile($file);
        $config = $json->read();
        $io->write("<info>Updating project properties...</info>");

        // update composer project name
        $config['name'] = $io->askAndValidate(
            self::formatQuestion("Composer project name", $config['name']),
            function ($val) {
                $val = trim($val);
                if (strlen($val) < 3 || substr_count($val, '/') !== 1) {
                    throw new RuntimeException("Correct project names follow the 'company/project' structure");
                }
                return $val;
            },
            false,
            $config['name']
        );

        // composer project description
        $config['description'] = $io->askAndValidate(
            self::formatQuestion("Description of the project", $config['description']),
            function ($val) {
                if (strlen(trim($val)) < 1) {
                    throw new RuntimeException("Description may not be empty");
                }
                return trim($val);
            },
            false,
            $config['description']
        );

        // composer project license
        $licenseValidator = new SpdxLicenseIdentifier();
        $oldLicense = $config['license'];
        $config['license'] = $io->askAndValidate(
            self::formatQuestion("Project license", $config['license']),
            function ($val) use ($licenseValidator) {
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
                $parser = new Parser();
                try {
                    $data = $parser->parse(file_get_contents($dist));
                    $parameters = isset($data['parameters']) ? $data['parameters'] : [];
                    if (!is_array($parameters)) {
                        $parameters = [];
                    }

                    $parameters['sitename'] = $io->askAndValidate(
                        self::formatQuestion("Sitename", $parameters['sitename']),
                        function ($val) {
                            if (strlen(trim($val)) < 1) {
                                throw new RuntimeException("Name of the site cannot be empty");
                            }
                            return trim($val);
                        },
                        false,
                        $parameters['sitename']
                    );
                    if (!isset($parameters['secret']) || in_array(strtolower($parameters['secret']), ['', 'replace_me', 'change_me'])) {
                        $parameters['secret'] = hash('sha1', uniqid(time(), true));
                    }
                    $io->write("<info>Updating parameters dist file</info>");
                    file_put_contents($dist, Yaml::dump(['parameters' => $parameters]));

                } catch (Exception $ex) {
                    $io->write(sprintf("<error>Could not parse %s</error>", $dist));
                }
            }
        }
    }
}
