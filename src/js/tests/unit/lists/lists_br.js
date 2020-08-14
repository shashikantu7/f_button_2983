import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('lists/lists_br')

    const fooEvent = function (which) {
      return {
        which: which,
        preventDefault: function () { },
        stopPropagation: function () { }
      }
    }

    /****************************
     * Lists and Backspace tests.
     ****************************/
    const lists_backspace_br_cases = {
      // 1.
      '<ul><li>#foo bar</li></ul>':
        '#foo bar',

      // 2.
      '<ul><li>#foo</li><li>bar</li></ul>':
        '#foo<ul><li>bar</li></ul>',

      // 3.
      '<ul><li>foo</li><li>#bar</li></ul>':
        '<ul><li>foo#bar</li></ul>',

      // 4.
      '<ul><li>foo</li><li>bar</li></ul>#foo bar':
        '<ul><li>foo</li><li>bar#foo bar</li></ul>',

      // 5.
      '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>':
        '<ul><li>foo#</li><li>bar</li></ul>',

      // 6.
      '<ul><li>foo</li></ul>#<br><ul><li>bar</li></ul>':
        '<ul><li>foo#</li><li>bar</li></ul>',

      // 7.
      '<ul><li>foo</li><li>#<br></li></ul>':
        '<ul><li>foo#</li></ul>',

      // 8.
      '<ul><li><br></li><li>#foo bar</li></ul>':
        '<ul><li>#foo bar</li></ul>',

      // 9.
      '<ul><li><br></li></ul>#foo bar':
        '<ul><li>#foo bar</li></ul>',

      // Nested
      // 10.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li></ol></li></ul>#<br>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar#</li></ol></li></ul>',

      // 11.
      '<ul><li>foo</li><li>bar<ol><li>#foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar#foo<ol><li>bar</li></ol></li></ul>',

      // 12.
      '<ul><li>foo</li><li>bar</li><li>#foo<ol><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar#foo<ol><li>bar</li></ol></li></ul>',

      // 13.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>#<br></li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo#</li><li>bar</li></ol></li></ul>',

      // 14.
      '<ul><li>foo</li><li>b#<ol><li>foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>#<br><ol><li>foo</li><li>bar</li></ol></li></ul>',

      // 15.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li></ol></li><li>#<br></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar#<br></li></ol></li></ul>',

      // Selection
      // 16.
      '<ul><li>fo#o</li><li>bar<ol><li>foo bar$</li></ol></li></ul>':
        '<ul><li>fo#</li></ul>',

      // 17.
      '<ul><li>fo#o</li><li>bar<ol><li>foo $bar</li></ol></li></ul>':
        '<ul><li>fo#bar</li></ul>',

      // 18.
      '<ul><li>foo</li><li>#bar$<ol><li>foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>#<br><ol><li>foo</li><li>bar</li></ol></li></ul>',

      // 19.
      '<ul><li>foo<br>#<br>bar</li></ul>':
        '<ul><li>foo#<br>bar</li></ul>'
    }

    const listsBackspaceTest = (input, output, t) => {
      QUnit.test(`${t}. LISTS and BACKSPACE ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          enter: FE.ENTER_BR,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.BACKSPACE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.BACKSPACE)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    let t = 0
    for (const input in lists_backspace_br_cases) {
      listsBackspaceTest(input, lists_backspace_br_cases[input], ++t)
    }

    /****************************
     * Lists and Enter tests.
     ****************************/
    const lists_enter_br_cases = {
      // 1.
      '<ul><li>#foo bar</li></ul>':
        '<ul><li><br></li><li>#foo bar</li></ul>',

      // 2.
      '<ul><li><br></li><li>#foo bar</li></ul>':
        '<ul><li><br></li><li><br></li><li>#foo bar</li></ul>',

      // 3.
      '<ul><li>#<br></li><li>foo bar</li></ul>':
        '#<br><ul><li>foo bar</li></ul>',

      // 4.
      '<ul><li>foo #bar</li></ul>':
        '<ul><li>foo&nbsp;</li><li>#bar</li></ul>',

      // 5.
      '<ul><li>foo</li><li>#bar</li></ul>':
        '<ul><li>foo</li><li><br></li><li>#bar</li></ul>',

      // 6.
      '<ul><li>foo bar#</li></ul>':
        '<ul><li>foo bar</li><li>#<br></li></ul>',

      // 7.
      '<ul><li>foo bar</li><li>#<br></li></ul>':
        '<ul><li>foo bar</li></ul>#<br>',

      // 8.
      '<ul><li>foo#</li><li>bar</li></ul>':
        '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>',

      // 9.
      '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>':
        '<ul><li>foo</li></ul>#<br><ul><li>bar</li></ul>',

      // 10.
      '<ul><li>foo <strong>bar#</strong></li></ul>':
        '<ul><li>foo <strong>bar</strong></li><li><strong>_#</strong><br></li></ul>',

      // Nested
      // 11.
      '<ul><li>foo</li><li>bar<ol><li>#foo bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li><br></li><li>#foo bar</li></ol></li></ul>',

      // 12.
      '<ul><li>foo</li><li>bar<ol><li><br></li><li>#foo bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li><br></li><li><br></li><li>#foo bar</li></ol></li></ul>',

      // 13.
      '<ul><li>foo</li><li>bar<ol><li>foo #bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo&nbsp;</li><li>#bar</li></ol></li></ul>',

      // 14.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar#</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li><li>#<br></li></ol></li></ul>',

      // 15.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li><li>#<br></li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li></ol></li><li>#<br></li></ul>',

      // 16.
      '<ul><li>foo</li><li>bar<ol><li>foo#</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li><li>#<br></li><li>bar</li></ol></li></ul>',

      // 17.
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>#<br></li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar<ol><li>foo</li></ol></li><li>#<br><ol><li>bar</li></ol></li></ul>',

      // Selection
      // 18.
      '<ul><li>fo#o</li><li>bar<ol><li>foo bar$</li></ol></li></ul>':
        '<ul><li>fo</li><li>#<br></li></ul>',

      // 19.
      '<ul><li>foo</li><li>bar<ol><li>#foo$</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar</li><li>#<br><ol><li>bar</li></ol></li></ul>'
    }

    const listsEnterTest = (input, output, t) => {
      QUnit.test(`${t}. LISTS and ENTER ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)


        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          enter: FE.ENTER_BR,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate enter
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    t = 0
    for (const input in lists_enter_br_cases) {
      listsEnterTest(input, lists_enter_br_cases[input], ++t)
    }

    /****************************
     * Lists and DELETE tests.
     ****************************/
    const lists_delete_br_cases = {
      // 1.
      '#<br><ul><li>foo bar</li></ul>':
        '<ul><li>#foo bar</li></ul>',

      // 2.
      'foo#<ul><li>bar</li></ul>':
        'foo#bar',

      // 3.
      '<ul><li>foo#</li><li>bar</li></ul>':
        '<ul><li>foo#bar</li></ul>',

      // 4.
      '<ul><li>foo#</li></ul>bar':
        '<ul><li>foo#bar</li></ul>',

      // 5.
      '<ul><li>foo bar#</li><li><br></li></ul>':
        '<ul><li>foo bar#</li></ul>',

      // 6.
      '<ul><li>foo#</li><li><strong>bar</strong></li></ul>':
        '<ul><li>foo#<strong>bar</strong></li></ul>',

      // 7.
      '<ul><li>#<br></li></ul>foo bar':
        '<ul><li>#foo bar</li></ul>',

      // 8.
      '<ul><li>#<br></li></ul><strong>foo</strong><br>bar':
        '<ul><li>#<strong>foo</strong></li></ul><br>bar',

      // Nested
      // 9.
      '<ul><li>foo#<ol><li>bar</li></ol></li></ul>':
        '<ul><li>foo#bar</li></ul>',

      // 10.
      '<ul><li>foo#<ol><li>foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo#foo<ol><li>bar</li></ol></li></ul>',

      // 11.
      '<ul><li>foo#<ol><li><br></li><li>bar</li></ol></li></ul>':
        '<ul><li>foo#<ol><li>bar</li></ol></li></ul>',

      // 12.
      '<ul><li>foo bar#<ol><li><br></li></ol></li></ul>':
        '<ul><li>foo bar#<br></li></ul>',

      // Selection
      // 13.
      '<ul><li>fo#o</li><li>bar<ol><li>foo bar$</li></ol></li></ul>':
        '<ul><li>fo#</li></ul>',

      // 14.
      '<ul><li>fo#o</li><li>bar<ol><li>foo $bar</li></ol></li></ul>':
        '<ul><li>fo#bar</li></ul>',

      // 15.
      '<ul><li>foo</li><li>#bar$<ol><li>foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>#<br><ol><li>foo</li><li>bar</li></ol></li></ul>'
    }

    function listsDeleteTest(input, output, t) {
      QUnit.test(`${t}. LISTS and DELETE ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)


        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          enter: FE.ENTER_BR,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate Delete
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.DELETE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.DELETE)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    t = 0
    for (const input in lists_delete_br_cases) {
      listsDeleteTest(input, lists_delete_br_cases[input], ++t)
    }
  })
