
Table of Contents
=================

* [Introduction](#introduction)
* [Main flow](#main-flow)
  * [Toolbar navigation](#toolbar-navigation)
  * [Dropdown navigation](#dropdown-navigation)
  * [Popup navigation](#popup-navigation)
  * [Modal navigation](#modal-navigation)
* [Methods](#methods)
* [Add accessibility to a plugin or module](#add-accessibility-to-a-plugin-or-module)
  * [Triggered events](#triggered-events)
  * [Custom popup content](#custom-popup-content)
  * [Custom modal body](#custom-modal-body)
  * [Custom new element](#custom-new-element)


# Introduction

Accessibility module is located in `src/js/modules/accessibility.js` and provides keyboard navigation on toolbars, dropdowns, popups and modals.

You use the existing functionality on new modules and plugins and you can also extend the functionality by listening to some events as you will see in the next sections.


# Main flow

On `_init` function a handler is registered on the editor `keydown` function. The handler checks for `Alt + F10` key combination and tries to focus if exists:

1. The content of a popup.
2. The toolbar of a popup.
3. The main toolbar.


## Toolbar navigation

`registerToolbar` function will initialize accessiblity on a toolbar by:

- Register a handler on toolbar's `keydown` event from where it calls `exec` function to handle key navigation.
- Register a handler on toolbar's `mouseenter` event to all elements that have `tabindex` to unfocus the toolbar and focus the editor.



`exec` function has the following flow based on which key is pressed:

1. `Left` and `Right` arrows or `Tab` for moving horizontally (`moveForeward`, `moveBackward` functions):
   1. Focus the next/previous sibling button. If last or first button is reached:
      1. If the toolbar is on a popup focus popup's content if exists using `focusContent` function.
      2. Focus the opposite first or last button.
2. `Up` and `Down` arrows for moving vertically in dropdowns (`moveUp`, `moveDown` functions):
   1. If the button is a dropdown open the dropdown. Arrow down will focus first dropdown item and arrow up will focus the last dropdown item.
   2. If we are in a dropdown then focus the next/last sibling item. If last or first item is reached focus the opposite first of last item.
3. `Enter` for executing action (`enter` function):
   1. If the current button is a dropdown button then execute the command and focus the first dropdown item.
   2. If the current button is a `.fr-back` button then execute the command and focus back the button from which the popup was showed.
   3. If normal button then execute the command and if popup button or modal button then save into the popup/modal instance the current button.
4. `Esc` for unfocus (`esc` function):
   1. If dropdown item then close the dropdown and focus back the dropdown button.
   2. If toolbar contains `.fr-back` button then execute it and focus back the button from which the popup was showed.
   3. If normal toolbar then trigger `'toolbar.esc'` event. If the event was not used then hide the popup and focus back the button from which the popup was showed.
   4. Else focus the editor.
5. `Alt + F10` to focus another visible toolbar (`focusToolbars` function) in the following order:
   1. An unfocused toolbar from current editor instance.
   2. A toolbar from another editor instance.
   3. The main toolbar.


## Dropdown navigation

Registering a toolbar will enable keyboard navigation using `enter`, `esc`, `arrow up` and `arrow down` as is described in Toolbar navigation section.

## Popup navigation

`registerPopup` function will initialize accessibility on a popup by:

- Register the toolbar from it with `registerToolbar` function.
- Register a handler on toolbar's `mouseenter` event to all elements that have `tabindex` to unfocus the toolbar and focus the editor.
- Register a handler on popups's `keydown` event from where it calls `_tiKeydown` function to handle key navigation on popup content (without the toolbar).

`_tiKeydown` function has the following flow based on which key is pressed:

1. `Tab` for moving alongside elements with tabindex in their order. If last or first element is reached:
   1. If toolbar exists focus first or last toolbar button using `focusToolbar` function.
   2. Else focus first or last element from the popup content.
2. `Enter` for executing only the action of a `.fr-submit` or `.fr-dismiss` element if exists.
3. `Esc` for unfocus:
   1. Execute command of `.fr-back` toolbar button if exists.
   2. Execute command of `.fr-dismiss` element if exists.
   3. Else hide the popup. If previous popup exists then focus that popup with `focusPopupButton`.
4. `Space` will execute the element command only if the focused element is a `.fr-submit` or a `.fr-dismiss` button.
5. `Any other key` will stop its propagation to the window except:
   1. Key event is a browser action. Eg: `Ctrl + R`.
   2. Focused element is a `text input` or a `texarea`.
   3. The key is `Space` and the focused element is a `.fr-link-attr` or a ` file input`.

## Modal navigation

The modal accessibility is initialized in the `modals` module on `create` function by registering a handler on modal's `keydown` event that has the following flow based in which key is pressed:

1. `Esc` will hide the modal and focus the button from which the modal was showed.
2. `Any other key` will stop its propagation to the window except:
   1. Key event is a browser action. Eg: `Ctrl + R`.
   2. Focused element is a `text input` or a `texarea`.
   3. `Arrow up` and `Arrow down` as it is used for scrolling the modal content.

Custom behaviour from the modal body is treated separately by adding a key handler for `keydown` event on modal body.

# Methods

**registerPopup(id)** Register a pupup to key events. More information on Popup navigation section.

**registerToolbar($tb)** Register a toolbar to key events. More information on Toolbar navigation section.

**focusToolbarElement($el)** Focuses the specified element on a toolbar.

**focusToolbar($tb, last)** Focuses the first or last element on a toolbar.

**focusContent($content, backward)** Tries to focus the first or last visible element on a popup content in the following order:

1. First/Last `input`, `textarea`, `button` and `select`.
2. First `.fr-active-item` element.
3. First element with `tabindex`.

**focusPopup($popup)** Focuses a popup. The flow is exaplained in the Popup navigation section.

**focusModal($modal)** Tries to focus an element from a modal in the following order:

1. First `.fr-command` element with `tabindex`.
2. First element with `tabindex`.

**focusEditor()**  Focuses the editable area.

**focusPopupButton($popup)**  Focus back the button from which the popup was showed.

**focusModalButton($modal)** Focus back the button from which the modal was showed.

**hasFocus()** Tells if there is a focused accessibility element.

**exec(e, $tb)** Provides toolbar navigation. The flow is explained in Toolbar navigation section.

**saveSelection()** Saves editor selection. You need to save selection if you focus another editable area like `input`.

**restoreSelection()** Returns editor selection without triggering editor `blur` event.

# Add custom accessibility to a plugin or module

If you create a custom button, dropdown, popup or modal the accessibility will be available by default like is described in the above sections.

## Triggered events

There are events that are triggered from accessibility at different steps and you can register a handler to provide custom behaviour. You can disable default behaviour by returning `false` in the handler.

- **toolbar.focusEditor** is triggered before the editor gets focus. Editor focus from accessibility can be achieved with `focusEditor` function.
- **toolbar.esc** is triggered on `Esc` key before the popup is hid and the button from which the popup was opened is refocused.
- **popup.tab** is triggered right after a key is pressed on an element that have `tabindex` from the popup content (popup without toolbar). The key event is provided as an argument.

## Custom popup content

It is sufficient to listen for `popup.tab` event and add custom behaviour. As an example you can look at `_addAccessibility` function from `colors` or `emoticons` plugins.

```javascript
// Keydown handler.
editor.events.on('popup.tab', function (e) {
    var $focused_item = $(e.currentTarget);

    var key_code = e.which;
    var status = true;

    // Enter key.
	if ($.FE.KEYCODE.ENTER == key_code) {

      editor.button.exec($focused_item);
      status = false;
    }

    // Prevent propagation.
    if (status === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    return status;
  }, true);
}
```
## Custom modal body

You have to store the `$body` when the modal is created and then register a `keydown` handler on it. As an example you can look at `_addAccessibility` function from `specialCharacters` or `help` plugins.

```javascript
var modalHash = editor.modals.create(modal_id, head, body);
$body = modalHash.$body;

// Keydown handler.
editor.events.$on($body, 'keydown', function (e) {
  var keycode = e.which;
  var $focused_char = $body.find('span.fr-name:first');

  // Alt + F10.
  if (!$focused_char.length && keycode == $.FE.KEYCODE.F10 && !editor.keys.ctrlKey(e) && !e.shiftKey && e.altKey) {
    // Focus first element.

    return false;
  }

  // Tab and arrows.
  else if (keycode == $.FE.KEYCODE.TAB || keycode == $.FE.KEYCODE.ARROW_LEFT || keycode == $.FE.KEYCODE.ARROW_RIGHT) {

  // Enter on a focused item.
  else if (keycode == $.FE.KEYCODE.ENTER && $focused_char.length) {
    // Do something with $focused_char.
  }
  else {

    return true;
  }
}, true);
```
## Custom new element

You simply create a handler and implement as you want:

- Editor is focused:

  ```javascript
  // Keydown event.
  editor.events.on('keydown', function (e) {
    var ctrlKey = navigator.userAgent.indexOf('Mac OS X') != -1 ? e.metaKey : e.ctrlKey;
    var keycode = e.which;

    // Implementation...

    // Return false to stop propagation.
  }, true);
  ```
  One example can be found in `_initImageResizer` function from `image` plugin.

- Editor is not focused:

  ```javascript
  // Keydown handler.
  editor.events.$on($body, 'keydown', function (e) {
    var keycode = e.which;

    // Implementation...

    // Return false to stop propagation.
  }, true);
  ```
