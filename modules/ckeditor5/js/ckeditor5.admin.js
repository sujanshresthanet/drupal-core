/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

((Drupal, drupalSettings, $, JSON, once, Sortable, _ref) => {
  let {
    tabbable
  } = _ref;
  const toolbarHelp = [{
    message: Drupal.t("The toolbar buttons that don't fit the user's browser window width will be grouped in a dropdown. If multiple toolbar rows are preferred, those can be configured by adding an explicit wrapping breakpoint wherever you want to start a new row.", null, {
      context: 'CKEditor 5 toolbar help text, default, no explicit wrapping breakpoint'
    }),
    button: 'wrapping',
    condition: false
  }, {
    message: Drupal.t('You have configured a multi-row toolbar by using an explicit wrapping breakpoint. This may not work well in narrow browser windows. To use automatic grouping, remove any of these divider buttons.', null, {
      context: 'CKEditor 5 toolbar help text, with explicit wrapping breakpoint'
    }),
    button: 'wrapping',
    condition: true
  }];
  const Observable = class {
    constructor(value) {
      this._listeners = [];
      this._value = value;
    }

    notify() {
      this._listeners.forEach(listener => listener(this._value));
    }

    subscribe(listener) {
      this._listeners.push(listener);
    }

    get value() {
      return this._value;
    }

    set value(val) {
      if (val !== this._value) {
        this._value = val;
        this.notify();
      }
    }

  };

  const getSelectedButtons = (selected, dividers, available) => {
    return selected.map(id => ({ ...[...dividers, ...available].find(button => button.id === id)
    }));
  };

  const updateSelectedButtons = (selection, textarea) => {
    const newValue = JSON.stringify(selection);
    const priorValue = textarea.innerHTML;
    textarea.value = newValue;
    textarea.innerHTML = newValue;
    textarea.dispatchEvent(new CustomEvent('change', {
      detail: {
        priorValue
      }
    }));
  };

  const addToSelectedButtons = (selection, element, announceChange) => {
    const list = [...selection.value];
    list.push(element.dataset.id);
    selection.value = list;

    if (announceChange) {
      setTimeout(() => {
        announceChange(element.dataset.label);
      });
    }
  };

  const removeFromSelectedButtons = (selection, element, announceChange) => {
    const list = [...selection.value];
    const index = Array.from(element.parentElement.children).findIndex(child => {
      return child === element;
    });
    list.splice(index, 1);
    selection.value = list;

    if (announceChange) {
      setTimeout(() => {
        announceChange(element.dataset.label);
      });
    }
  };

  const moveWithinSelectedButtons = (selection, element, dir) => {
    const list = [...selection.value];
    const index = Array.from(element.parentElement.children).findIndex(child => {
      return child === element;
    });
    const condition = dir < 0 ? index > 0 : index < list.length - 1;

    if (condition) {
      list.splice(index + dir, 0, list.splice(index, 1)[0]);
      selection.value = list;
    }
  };

  const copyToActiveButtons = (selection, element, announceChange) => {
    const list = [...selection.value];
    list.push(element.dataset.id);
    selection.value = list;
    setTimeout(() => {
      if (announceChange) {
        announceChange(element.dataset.label);
      }
    });
  };

  const render = (root, selectedButtons, availableButtons, dividerButtons) => {
    const toolbarHelpText = toolbarHelp.filter(helpItem => selectedButtons.value.includes(helpItem.button) === helpItem.condition).map(helpItem => helpItem.message);
    const existingToolbarHelpText = document.querySelector('[data-drupal-selector="ckeditor5-admin-help-message"]');

    if (existingToolbarHelpText && toolbarHelpText.join('').trim() !== existingToolbarHelpText.textContent.trim()) {
      Drupal.announce(toolbarHelpText.join(' '));
    }

    root.innerHTML = Drupal.theme.ckeditor5Admin({
      availableButtons: Drupal.theme.ckeditor5AvailableButtons({
        buttons: availableButtons.filter(button => !selectedButtons.value.includes(button.id))
      }),
      dividerButtons: Drupal.theme.ckeditor5DividerButtons({
        buttons: dividerButtons
      }),
      activeToolbar: Drupal.theme.ckeditor5SelectedButtons({
        buttons: getSelectedButtons(selectedButtons.value, dividerButtons, availableButtons)
      }),
      helpMessage: toolbarHelpText
    });
    new Sortable(root.querySelector('[data-button-list="ckeditor5-toolbar-active-buttons"]'), {
      group: {
        name: 'toolbar',
        put: ['divider', 'available']
      },
      sort: true,
      store: {
        set: sortable => {
          selectedButtons.value = sortable.toArray();
        }
      }
    });
    const toolbarAvailableButtons = new Sortable(root.querySelector('[data-button-list="ckeditor5-toolbar-available-buttons"]'), {
      group: {
        name: 'available',
        put: ['toolbar']
      },
      sort: false,
      onAdd: event => {
        if (dividerButtons.find(dividerButton => dividerButton.id === event.item.dataset.id)) {
          const {
            newIndex
          } = event;
          setTimeout(() => {
            document.querySelectorAll('.ckeditor5-toolbar-available__buttons li')[newIndex].remove();
          });
        }
      }
    });
    new Sortable(root.querySelector('[data-button-list="ckeditor5-toolbar-divider-buttons"]'), {
      group: {
        name: 'divider',
        put: false,
        pull: 'clone',
        sort: 'false'
      }
    });
    root.querySelectorAll('[data-drupal-selector="ckeditor5-toolbar-button"]').forEach(element => {
      const expandButton = event => {
        event.currentTarget.querySelectorAll('.ckeditor5-toolbar-button').forEach(buttonElement => {
          buttonElement.setAttribute('data-expanded', true);
        });
      };

      const retractButton = event => {
        event.currentTarget.querySelectorAll('.ckeditor5-toolbar-button').forEach(buttonElement => {
          buttonElement.setAttribute('data-expanded', false);
        });
      };

      element.addEventListener('mouseenter', expandButton);
      element.addEventListener('focus', expandButton);
      element.addEventListener('mouseleave', retractButton);
      element.addEventListener('blur', retractButton);
      element.addEventListener('keyup', event => {
        const supportedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        const dir = document.documentElement.dir;

        if (supportedKeys.includes(event.key)) {
          if (event.currentTarget.dataset.divider.toLowerCase() === 'true') {
            switch (event.key) {
              case 'ArrowDown':
                {
                  const announceChange = name => {
                    Drupal.announce(Drupal.t('Button @name has been copied to the active toolbar.', {
                      '@name': name
                    }));
                  };

                  copyToActiveButtons(selectedButtons, event.currentTarget, announceChange);
                  root.querySelector('[data-button-list="ckeditor5-toolbar-active-buttons"] li:last-child').focus();
                  break;
                }
            }
          } else if (selectedButtons.value.includes(event.currentTarget.dataset.id)) {
            const index = Array.from(element.parentElement.children).findIndex(child => {
              return child === element;
            });

            switch (event.key) {
              case 'ArrowLeft':
                {
                  const leftOffset = dir === 'ltr' ? -1 : 1;
                  moveWithinSelectedButtons(selectedButtons, event.currentTarget, leftOffset);
                  root.querySelectorAll('[data-button-list="ckeditor5-toolbar-active-buttons"] li')[index + leftOffset].focus();
                  break;
                }

              case 'ArrowRight':
                {
                  const rightOffset = dir === 'ltr' ? 1 : -1;
                  moveWithinSelectedButtons(selectedButtons, event.currentTarget, rightOffset);
                  root.querySelectorAll('[data-button-list="ckeditor5-toolbar-active-buttons"] li')[index + rightOffset].focus();
                  break;
                }

              case 'ArrowUp':
                {
                  const announceChange = name => {
                    Drupal.announce(Drupal.t('Button @name has been removed from the active toolbar.', {
                      '@name': name
                    }));
                  };

                  removeFromSelectedButtons(selectedButtons, event.currentTarget, announceChange);

                  if (!dividerButtons.find(dividerButton => event.currentTarget.dataset.id === dividerButton.id)) {
                    root.querySelector(`[data-button-list="ckeditor5-toolbar-available-buttons"] [data-id="${event.currentTarget.dataset.id}"]`).focus();
                  }

                  break;
                }
            }
          } else if (toolbarAvailableButtons.toArray().includes(event.currentTarget.dataset.id)) {
            switch (event.key) {
              case 'ArrowDown':
                {
                  const announceChange = name => {
                    Drupal.announce(Drupal.t('Button @name has been moved to the active toolbar.', {
                      '@name': name
                    }));
                  };

                  addToSelectedButtons(selectedButtons, event.currentTarget, announceChange);
                  root.querySelector('[data-button-list="ckeditor5-toolbar-active-buttons"] li:last-child').focus();
                  break;
                }
            }
          }
        }
      });
    });
  };

  Drupal.behaviors.ckeditor5Admin = {
    attach(context) {
      once('ckeditor5-admin-toolbar', '#ckeditor5-toolbar-app').forEach(container => {
        const selectedTextarea = context.querySelector('#ckeditor5-toolbar-buttons-selected');
        const available = Object.entries(JSON.parse(context.querySelector('#ckeditor5-toolbar-buttons-available').innerHTML)).map(_ref2 => {
          let [name, attrs] = _ref2;
          return {
            name,
            id: name,
            ...attrs
          };
        });
        const dividers = [{
          id: 'divider',
          name: '|',
          label: Drupal.t('Divider')
        }, {
          id: 'wrapping',
          name: '-',
          label: Drupal.t('Wrapping')
        }];
        const selected = new Observable(JSON.parse(selectedTextarea.innerHTML).map(name => {
          return [...dividers, ...available].find(button => {
            return button.name === name;
          }).id;
        }));

        const mapSelection = selection => {
          return selection.map(id => {
            return [...dividers, ...available].find(button => {
              return button.id === id;
            }).name;
          });
        };

        selected.subscribe(selection => {
          updateSelectedButtons(mapSelection(selection), selectedTextarea);
          render(container, selected, available, dividers);
        });
        [context.querySelector('#ckeditor5-toolbar-buttons-available'), context.querySelector('[class*="editor-settings-toolbar-items"]')].filter(el => el).forEach(el => {
          el.classList.add('visually-hidden');
        });
        render(container, selected, available, dividers);
      });
      once('safari-focus-fix', '.ckeditor5-toolbar-item').forEach(item => {
        item.addEventListener('keydown', e => {
          const keyCodeDirections = {
            9: 'tab',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
          };

          if (['tab', 'left', 'up', 'right', 'down'].includes(keyCodeDirections[e.keyCode])) {
            let hideTip = false;
            const isActive = e.target.closest('[data-button-list="ckeditor5-toolbar-active__buttons"]');

            if (isActive) {
              if (['tab', 'left', 'up', 'right'].includes(keyCodeDirections[e.keyCode])) {
                hideTip = true;
              }
            } else if (['tab', 'down'].includes(keyCodeDirections[e.keyCode])) {
              hideTip = true;
            }

            if (hideTip) {
              e.target.querySelector('[data-expanded]').setAttribute('data-expanded', 'false');
            }
          }
        });
      });

      const updateUiStateStorage = states => {
        const form = document.querySelector('#filter-format-edit-form, #filter-format-add-form');
        const currentStates = form.hasAttribute('data-drupal-ui-state') ? JSON.parse(form.getAttribute('data-drupal-ui-state')) : {};
        form.setAttribute('data-drupal-ui-state', JSON.stringify({ ...currentStates,
          ...states
        }));
      };

      const getUiStateStorage = property => {
        const form = document.querySelector('#filter-format-edit-form, #filter-format-add-form');

        if (form === null) {
          return;
        }

        return form.hasAttribute('data-drupal-ui-state') ? JSON.parse(form.getAttribute('data-drupal-ui-state'))[property] : null;
      };

      once('ui-state-storage', '#filter-format-edit-form, #filter-format-add-form').forEach(form => {
        form.setAttribute('data-drupal-ui-state', JSON.stringify({}));
      });

      const maintainActiveVerticalTab = verticalTabs => {
        const id = verticalTabs.id;
        const activeTab = getUiStateStorage(`${id}-active-tab`);

        if (activeTab) {
          setTimeout(() => {
            const activeTabLink = document.querySelector(activeTab);
            activeTabLink.click();

            if (id !== 'plugin-settings-wrapper') {
              return;
            }

            if (document.activeElement !== document.body) {
              return;
            }

            const targetTabPane = document.querySelector(activeTabLink.getAttribute('href'));

            if (targetTabPane) {
              const tabbableElements = tabbable(targetTabPane);

              if (tabbableElements.length) {
                tabbableElements[0].focus();
              }
            }
          });
        }

        verticalTabs.querySelectorAll('.vertical-tabs__menu').forEach(tab => {
          tab.addEventListener('click', e => {
            const state = {};
            const href = e.target.closest('[href]').getAttribute('href').split('--')[0];
            state[`${id}-active-tab`] = `#${id} [href^='${href}']`;
            updateUiStateStorage(state);
          });
        });
      };

      once('maintainActiveVerticalTab', '#plugin-settings-wrapper, #filter-settings-wrapper').forEach(maintainActiveVerticalTab);
      const selectedButtons = document.querySelector('#ckeditor5-toolbar-buttons-selected');
      once('textarea-listener', selectedButtons).forEach(textarea => {
        textarea.addEventListener('change', e => {
          const buttonName = document.activeElement.getAttribute('data-id');

          if (!buttonName) {
            return;
          }

          let focusSelector = '';

          if (['divider', 'wrapping'].includes(buttonName)) {
            const oldConfig = JSON.parse(e.detail.priorValue);
            const newConfig = JSON.parse(e.target.innerHTML);

            if (oldConfig.length > newConfig.length) {
              for (let item = 0; item < newConfig.length; item++) {
                if (newConfig[item] !== oldConfig[item]) {
                  focusSelector = `[data-button-list="ckeditor5-toolbar-active-buttons"] li:nth-child(${Math.min(item - 1, 0)})`;
                  break;
                }
              }
            } else if (oldConfig.length < newConfig.length) {
              focusSelector = '[data-button-list="ckeditor5-toolbar-active-buttons"] li:last-child';
            } else {
              document.querySelectorAll(`[data-button-list="ckeditor5-toolbar-active-buttons"] [data-id='${buttonName}']`).forEach((divider, index) => {
                if (divider === document.activeElement) {
                  focusSelector = `${buttonName}|${index}`;
                }
              });
            }
          } else {
            focusSelector = `[data-id='${buttonName}']`;
          }

          updateUiStateStorage({
            focusSelector
          });
        });
        textarea.addEventListener('focus', () => {
          const focusSelector = getUiStateStorage('focusSelector');

          if (focusSelector) {
            if (focusSelector.includes('|')) {
              const [buttonName, count] = focusSelector.split('|');
              document.querySelectorAll(`[data-button-list="ckeditor5-toolbar-active-buttons"] [data-id='${buttonName}']`).forEach((item, index) => {
                if (index === parseInt(count, 10)) {
                  item.focus();
                }
              });
            } else {
              const toFocus = document.querySelector(focusSelector);

              if (toFocus) {
                toFocus.focus();
              }
            }
          }
        });
      });
    }

  };

  Drupal.theme.ckeditor5SelectedButtons = _ref3 => {
    let {
      buttons
    } = _ref3;
    return `
      <ul class="ckeditor5-toolbar-tray ckeditor5-toolbar-active__buttons" data-button-list="ckeditor5-toolbar-active-buttons" role="listbox" aria-orientation="horizontal" aria-labelledby="ckeditor5-toolbar-active-buttons-label">
        ${buttons.map(button => Drupal.theme.ckeditor5Button({
      button,
      listType: 'active'
    })).join('')}
      </ul>
    `;
  };

  Drupal.theme.ckeditor5DividerButtons = _ref4 => {
    let {
      buttons
    } = _ref4;
    return `
      <ul class="ckeditor5-toolbar-tray ckeditor5-toolbar-divider__buttons" data-button-list="ckeditor5-toolbar-divider-buttons" role="listbox" aria-orientation="horizontal" aria-labelledby="ckeditor5-toolbar-divider-buttons-label">
        ${buttons.map(button => Drupal.theme.ckeditor5Button({
      button,
      listType: 'divider'
    })).join('')}
      </ul>
    `;
  };

  Drupal.theme.ckeditor5AvailableButtons = _ref5 => {
    let {
      buttons
    } = _ref5;
    return `
      <ul class="ckeditor5-toolbar-tray ckeditor5-toolbar-available__buttons" data-button-list="ckeditor5-toolbar-available-buttons" role="listbox" aria-orientation="horizontal" aria-labelledby="ckeditor5-toolbar-available-buttons-label">
        ${buttons.map(button => Drupal.theme.ckeditor5Button({
      button,
      listType: 'available'
    })).join('')}
      </ul>
    `;
  };

  Drupal.theme.ckeditor5Button = _ref6 => {
    let {
      button: {
        label,
        id
      },
      listType
    } = _ref6;
    const visuallyHiddenLabel = Drupal.t(`@listType button @label`, {
      '@listType': listType !== 'divider' ? listType : 'available',
      '@label': label
    });
    return `
      <li class="ckeditor5-toolbar-item ckeditor5-toolbar-item-${id}" role="option" tabindex="0" data-drupal-selector="ckeditor5-toolbar-button" data-id="${id}" data-label="${label}" data-divider="${listType === 'divider'}">
        <span class="ckeditor5-toolbar-button ckeditor5-toolbar-button-${id}">
          <span class="visually-hidden">${visuallyHiddenLabel}</span>
        </span>
        <span class="ckeditor5-toolbar-tooltip" aria-hidden="true">${label}</span>
      </li>
    `;
  };

  Drupal.theme.ckeditor5Admin = _ref7 => {
    let {
      availableButtons,
      dividerButtons,
      activeToolbar,
      helpMessage
    } = _ref7;
    return `
    <div data-drupal-selector="ckeditor5-admin-help-message">
      <p>${helpMessage.join('</p><p>')}</p>
    </div>
    <div class="ckeditor5-toolbar-disabled">
      <div class="ckeditor5-toolbar-available">
        <label id="ckeditor5-toolbar-available-buttons-label">${Drupal.t('Available buttons')}</label>
        ${availableButtons}
      </div>
      <div class="ckeditor5-toolbar-divider">
        <label id="ckeditor5-toolbar-divider-buttons-label">${Drupal.t('Button divider')}</label>
        ${dividerButtons}
      </div>
    </div>
    <div class="ckeditor5-toolbar-active">
      <label id="ckeditor5-toolbar-active-buttons-label">${Drupal.t('Active toolbar')}</label>
      ${activeToolbar}
    </div>
    `;
  };

  const originalFilterStatusAttach = Drupal.behaviors.filterStatus.attach;

  Drupal.behaviors.filterStatus.attach = (context, settings) => {
    const filterStatusCheckboxes = document.querySelectorAll('#filters-status-wrapper input.form-checkbox');
    once.remove('filter-status', filterStatusCheckboxes);
    $(filterStatusCheckboxes).off('click.filterUpdate');
    originalFilterStatusAttach(context, settings);
  };

  Drupal.behaviors.tabErrorsVisible = {
    attach(context) {
      context.querySelectorAll('details .form-item .error').forEach(item => {
        const details = item.closest('details');

        if (details.style.display === 'none') {
          const tabSelect = document.querySelector(`[href='#${details.id}']`);

          if (tabSelect) {
            tabSelect.click();
          }
        }
      });
    }

  };
})(Drupal, drupalSettings, jQuery, JSON, once, Sortable, tabbable);