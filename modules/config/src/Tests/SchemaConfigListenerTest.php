<?php

/**
 * @file
 * Contains \Drupal\config\Tests\SchemaConfigListenerTest.
 */

namespace Drupal\config\Tests;

use Drupal\Core\Config\Schema\SchemaCheckTrait;
use Drupal\Core\Config\Schema\SchemaIncompleteException;
use Drupal\simpletest\KernelTestBase;

/**
 * Tests the functionality of ConfigSchemaChecker in KernelTestBase tests.
 *
 * @group config
 */
class SchemaConfigListenerTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = array('config_test');

  /**
   * {@inheritdoc}
   */
  protected $strictConfigSchema = TRUE;

  /**
   * Tests \Drupal\Core\Config\Testing\ConfigSchemaChecker.
   */
  public function testConfigSchemaChecker() {
    // Test a non-existing schema.
    $message = 'Expected SchemaIncompleteException thrown';
    try {
      \Drupal::config('config_schema_test.noschema')->set('foo', 'bar')->save();
      $this->fail($message);
    }
    catch (SchemaIncompleteException $e) {
      $this->pass($message);
      $this->assertEqual('No schema for config_schema_test.noschema', $e->getMessage());
    }

    // Test a valid schema.
    $message = 'Unexpected SchemaIncompleteException thrown';
    $config = \Drupal::config('config_test.types')->set('int', 10);
    try {
      $config->save();
      $this->pass($message);
    }
    catch (SchemaIncompleteException $e) {
      $this->fail($message);
    }

    // Test an invalid schema.
    $message = 'Expected SchemaIncompleteException thrown';
    $config = \Drupal::config('config_test.types')
      ->set('foo', 'bar')
      ->set('array', 1);
    try {
      $config->save();
      $this->fail($message);
    }
    catch (SchemaIncompleteException $e) {
      $this->pass($message);
      $this->assertEqual('Schema errors for config_test.types with the following errors: config_test.types:foo missing schema, config_test.types:array variable type is integer but applied schema class is Drupal\Core\Config\Schema\Sequence', $e->getMessage());
    }
  }

}
