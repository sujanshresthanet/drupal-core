<?php

namespace Drupal\workflows;

use Drupal\Component\Plugin\ConfigurablePluginInterface;
use Drupal\Component\Plugin\DerivativeInspectionInterface;
use Drupal\Component\Plugin\PluginInspectionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * An interface for Workflow type plugins.
 *
 * @internal
 *   The workflow system is currently experimental and should only be leveraged
 *   by experimental modules and development releases of contributed modules.
 */
interface WorkflowTypeInterface extends PluginInspectionInterface, DerivativeInspectionInterface, ConfigurablePluginInterface {

  /**
   * Gets the label for the workflow type.
   *
   * @return string
   *   The workflow type label.
   */
  public function label();

  /**
   * Performs access checks.
   *
   * @param \Drupal\workflows\WorkflowInterface $entity
   *   The workflow entity for which to check access.
   * @param string $operation
   *   The entity operation. Usually one of 'view', 'view label', 'update' or
   *   'delete'.
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user for which to check access.
   *
   * @return \Drupal\Core\Access\AccessResultInterface
   *   The access result.
   */
  public function checkWorkflowAccess(WorkflowInterface $entity, $operation, AccountInterface $account);

  /**
   * Determines if the workflow is being has data associated with it.
   *
   * @internal
   *   Marked as internal until it's validated this should form part of the
   *   public API in https://www.drupal.org/node/2897148.
   *
   * @param \Drupal\workflows\WorkflowInterface $workflow
   *   The workflow to check.
   *
   * @return bool
   *   TRUE if the workflow is being used, FALSE if not.
   */
  public function workflowHasData(WorkflowInterface $workflow);

  /**
   * Determines if the workflow state has data associated with it.
   *
   * @internal
   *   Marked as internal until it's validated this should form part of the
   *   public API in https://www.drupal.org/node/2897148.
   *
   * @param \Drupal\workflows\WorkflowInterface $workflow
   *   The workflow to check.
   * @param \Drupal\workflows\StateInterface $state
   *   The workflow state to check.
   *
   * @return bool
   *   TRUE if the workflow state is being used, FALSE if not.
   */
  public function workflowStateHasData(WorkflowInterface $workflow, StateInterface $state);

  /**
   * Gets the initial state for the workflow.
   *
   * @param \Drupal\workflows\WorkflowInterface $workflow
   *   The workflow entity.
   *
   * @return \Drupal\workflows\StateInterface
   *   The initial state.
   */
  public function getInitialState(WorkflowInterface $workflow);

  /**
   * Builds a form to be added to the Workflow state edit form.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param \Drupal\workflows\WorkflowInterface $workflow
   *   The workflow the state is attached to.
   * @param \Drupal\workflows\StateInterface|null $state
   *   The workflow state being edited. If NULL, a new state is being added.
   *
   * @return array
   *   Form elements to add to a workflow state form for customisations to the
   *   workflow.
   *
   * @see \Drupal\workflows\Form\WorkflowStateAddForm::form()
   * @see \Drupal\workflows\Form\WorkflowStateEditForm::form()
   */
  public function buildStateConfigurationForm(FormStateInterface $form_state, WorkflowInterface $workflow, StateInterface $state = NULL);

  /**
   * Builds a form to be added to the Workflow transition edit form.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   * @param \Drupal\workflows\WorkflowInterface $workflow
   *   The workflow the state is attached to.
   * @param \Drupal\workflows\TransitionInterface|null $transition
   *   The workflow transition being edited. If NULL, a new transition is being
   *   added.
   *
   * @return array
   *   Form elements to add to a workflow transition form for customisations to
   *   the workflow.
   *
   * @see \Drupal\workflows\Form\WorkflowTransitionAddForm::form()
   * @see \Drupal\workflows\Form\WorkflowTransitionEditForm::form()
   */
  public function buildTransitionConfigurationForm(FormStateInterface $form_state, WorkflowInterface $workflow, TransitionInterface $transition = NULL);

  /**
   * Gets the required states of workflow type.
   *
   * This are usually configured in the workflow type annotation.
   *
   * @return array[]
   *   The required states.
   *
   * @see \Drupal\workflows\Annotation\WorkflowType
   */
  public function getRequiredStates();

  /**
   * Informs the plugin that a dependency of the workflow will be deleted.
   *
   * @param array $dependencies
   *   An array of dependencies that will be deleted keyed by dependency type.
   *
   * @return bool
   *   TRUE if the workflow settings have been changed, FALSE if not.
   *
   * @see \Drupal\Core\Config\ConfigEntityInterface::onDependencyRemoval()
   *
   * @todo https://www.drupal.org/node/2579743 make part of a generic interface.
   */
  public function onDependencyRemoval(array $dependencies);

  /**
   * Adds a state to the workflow.
   *
   * @param string $state_id
   *   The state's ID.
   * @param string $label
   *   The state's label.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if a state already exists or state ID is invalid.
   */
  public function addState($state_id, $label);

  /**
   * Determines if the workflow has a state with the provided ID.
   *
   * @param string $state_id
   *   The state's ID.
   *
   * @return bool
   *   TRUE if the workflow has a state with the provided ID, FALSE if not.
   */
  public function hasState($state_id);

  /**
   * Gets state objects for the provided state IDs.
   *
   * @param string[] $state_ids
   *   A list of state IDs to get. If NULL then all states will be returned.
   *
   * @return \Drupal\workflows\StateInterface[]
   *   An array of workflow states.
   *
   * @throws \InvalidArgumentException
   *   Thrown if $state_ids contains a state ID that does not exist.
   */
  public function getStates($state_ids = NULL);

  /**
   * Gets a workflow state.
   *
   * @param string $state_id
   *   The state's ID.
   *
   * @return \Drupal\workflows\StateInterface
   *   The workflow state.
   *
   * @throws \InvalidArgumentException
   *   Thrown if $state_id does not exist.
   */
  public function getState($state_id);

  /**
   * Sets a state's label.
   *
   * @param string $state_id
   *   The state ID to set the label for.
   * @param string $label
   *   The state's label.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   */
  public function setStateLabel($state_id, $label);

  /**
   * Sets a state's weight value.
   *
   * @param string $state_id
   *   The state ID to set the weight for.
   * @param int $weight
   *   The state's weight.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   */
  public function setStateWeight($state_id, $weight);

  /**
   * Deletes a state from the workflow.
   *
   * @param string $state_id
   *   The state ID to delete.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if $state_id does not exist.
   */
  public function deleteState($state_id);

  /**
   * Adds a transition to the workflow.
   *
   * @param string $id
   *   The transition ID.
   * @param string $label
   *   The transition's label.
   * @param array $from_state_ids
   *   The state IDs to transition from.
   * @param string $to_state_id
   *   The state ID to transition to.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if either state does not exist.
   */
  public function addTransition($id, $label, array $from_state_ids, $to_state_id);

  /**
   * Gets a transition object for the provided transition ID.
   *
   * @param string $transition_id
   *   A transition ID.
   *
   * @return \Drupal\workflows\TransitionInterface
   *   The transition.
   *
   * @throws \InvalidArgumentException
   *   Thrown if $transition_id does not exist.
   */
  public function getTransition($transition_id);

  /**
   * Determines if a transition exists.
   *
   * @param string $transition_id
   *   The transition ID.
   *
   * @return bool
   *   TRUE if the transition exists, FALSE if not.
   */
  public function hasTransition($transition_id);

  /**
   * Gets transition objects for the provided transition IDs.
   *
   * @param string[] $transition_ids
   *   A list of transition IDs to get. If NULL then all transitions will be
   *   returned.
   *
   * @return \Drupal\workflows\TransitionInterface[]
   *   An array of transition objects.
   *
   * @throws \InvalidArgumentException
   *   Thrown if $transition_ids contains a transition ID that does not exist.
   */
  public function getTransitions(array $transition_ids = NULL);

  /**
   * Gets the transition IDs for a state for the provided direction.
   *
   * @param $state_id
   *   The state to get transitions for.
   * @param string $direction
   *   (optional) The direction of the transition. Defaults to 'from'. Possible
   *   values are: 'from' and 'to'.
   *
   * @return array
   *   The transition IDs for a state for the provided direction.
   */
  public function getTransitionsForState($state_id, $direction = 'from');

  /**
   * Gets a transition from state to state.
   *
   * @param string $from_state_id
   *   The state ID to transition from.
   * @param string $to_state_id
   *   The state ID to transition to.
   *
   * @return \Drupal\workflows\TransitionInterface
   *   The transitions.
   *
   * @throws \InvalidArgumentException
   *   Thrown if the transition does not exist.
   */
  public function getTransitionFromStateToState($from_state_id, $to_state_id);

  /**
   * Determines if a transition from state to state exists.
   *
   * @param string $from_state_id
   *   The state ID to transition from.
   * @param string $to_state_id
   *   The state ID to transition to.
   *
   * @return bool
   *   TRUE if the transition exists, FALSE if not.
   */
  public function hasTransitionFromStateToState($from_state_id, $to_state_id);

  /**
   * Sets a transition's label.
   *
   * @param string $transition_id
   *   The transition ID.
   * @param string $label
   *   The transition's label.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if the transition does not exist.
   */
  public function setTransitionLabel($transition_id, $label);

  /**
   * Sets a transition's weight.
   *
   * @param string $transition_id
   *   The transition ID.
   * @param int $weight
   *   The transition's weight.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if the transition does not exist.
   */
  public function setTransitionWeight($transition_id, $weight);

  /**
   * Sets a transition's from states.
   *
   * @param string $transition_id
   *   The transition ID.
   * @param array $from_state_ids
   *   The state IDs to transition from.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if the transition does not exist or the states do not exist.
   */
  public function setTransitionFromStates($transition_id, array   $from_state_ids);

  /**
   * Deletes a transition.
   *
   * @param string $transition_id
   *   The transition ID.
   *
   * @return \Drupal\workflows\WorkflowTypeInterface
   *   The workflow type plugin.
   *
   * @throws \InvalidArgumentException
   *   Thrown if the transition does not exist.
   */
  public function deleteTransition($transition_id);

}
