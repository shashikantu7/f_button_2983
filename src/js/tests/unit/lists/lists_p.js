import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('lists/lists_p')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () { },
        stopPropagation: function () { }
      }
    }

    /****************************
     * Lists and Backspace tests.
     ****************************/
    const lists_backspace_p_cases = {
      // 1.
      '<ul><li>#foo bar</li></ul>':
        '<p>#foo bar</p>',

      // 2.
      '<ul><li>#foo</li><li>bar</li></ul>':
        '<p>#foo</p><ul><li>bar</li></ul>',

      // 3.
      '<ul><li>foo</li><li>#bar</li></ul>':
        '<ul><li>foo#bar</li></ul>',

      // 4.
      '<ul><li>foo</li><li>bar</li></ul><p>#foo bar</p>':
        '<ul><li>foo</li><li>bar#foo bar</li></ul>',

      // 5.
      '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>':
        '<ul><li>foo#</li><li>bar</li></ul>',

      // 6.
      '<ul><li>foo</li></ul><p>#<br></p><ul><li>bar</li></ul>':
        '<ul><li>foo#</li><li>bar</li></ul>',

      // 7.
      '<ul><li>foo</li><li>#<br></li></ul>':
        '<ul><li>foo#</li></ul>',

      // 8.
      '<ul><li><br></li><li>#foo bar</li></ul>':
        '<ul><li>#foo bar</li></ul>',

      // 9.
      '<ul><li><br></li></ul><p>#foo bar</p>':
        '<ul><li>#foo bar</li></ul>',

      // 10. Nested
      '<ul><li>foo</li><li>bar<ol><li>foo</li><li>bar</li></ol></li></ul><p>#<br></p>':
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

      // 16. Selection
      '<ul><li>fo#o</li><li>bar<ol><li>foo bar$</li></ol></li></ul>':
        '<ul><li>fo#</li></ul>',

      // 17.
      '<ul><li>fo#o</li><li>bar<ol><li>foo $bar</li></ol></li></ul>':
        '<ul><li>fo#bar</li></ul>',

      // 18.
      '<ul><li>foo</li><li>#bar$<ol><li>foo</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>#<br><ol><li>foo</li><li>bar</li></ol></li></ul>',

      // 19.
      '<ul><li><h1>#foo</h1></li><li>bar</li></ul>':
        '<h1>#foo</h1><ul><li>bar</li></ul>',

      // 20.
      '<ul><li><h1>foo</h1></li><li><h1>#bar</h1></li></ul>':
        '<ul><li><h1>foo#bar<br></h1></li></ul>',

      // 21.
      '<ul><li><h1>foo</h1></li><li>#bar<ol><li>froala</li></ol></li></ul>':
        '<ul><li><h1>foo#bar</h1><ol><li>froala</li></ol></li></ul>',

      // 22.
      '<ul><li><h1>foo</h1><ol><li><h1>#bar</h1></li><li><h1>froala</h1></li></ol></li></ul>':
        '<ul><li><h1>foo#bar<br></h1><ol><li><h1>froala</h1></li></ol></li></ul>',

      // 23. https://github.com/froala/wysiwyg-editor/issues/1553
      '<ul><li>foo<p>#<br></p><p>bar</p></li></ul>':
        '<ul><li>foo#<p>bar</p></li></ul>'
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
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate backspace
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
    for (const input in lists_backspace_p_cases) {
      listsBackspaceTest(input, lists_backspace_p_cases[input], ++t)
    }

    /****************************
     * Lists and Enter tests.
     ****************************/
    const lists_enter_p_cases = {
      // 1.
      '<ul><li>#foo bar</li></ul>':
        '<ul><li><br></li><li>#foo bar</li></ul>',

      // 2.
      '<ul><li><br></li><li>#foo bar</li></ul>':
        '<ul><li><br></li><li><br></li><li>#foo bar</li></ul>',

      // 3.
      '<ul><li>#<br></li><li>foo bar</li></ul>':
        '<p>#<br></p><ul><li>foo bar</li></ul>',

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
        '<ul><li>foo bar</li></ul><p>#<br></p>',

      // 8.
      '<ul><li>foo#</li><li>bar</li></ul>':
        '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>',

      // 9.
      '<ul><li>foo</li><li>#<br></li><li>bar</li></ul>':
        '<ul><li>foo</li></ul><p>#<br></p><ul><li>bar</li></ul>',

      // 10
      '<ul><li>foo <strong>bar#</strong></li></ul>':
        '<ul><li>foo <strong>bar</strong></li><li><strong>_#</strong><br></li></ul>',

      // 11. Nested
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

      // 18.
      '<ul><li>foo</li><li>bar<ol><li>#<br></li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar</li><li>#<br><ol><li>bar</li></ol></li></ul>',

      // 19. Selection
      '<ul><li>fo#o</li><li>bar<ol><li>foo bar$</li></ol></li></ul>':
        '<ul><li>fo</li><li>#<br></li></ul>',

      // 20.
      '<ul><li>foo</li><li>bar<ol><li>#foo$</li><li>bar</li></ol></li></ul>':
        '<ul><li>foo</li><li>bar</li><li>#<br><ol><li>bar</li></ol></li></ul>',

      // 21.
      '<ul><li><h1>foo#</h1></li></ul>':
        '<ul><li><h1>foo</h1></li><li><h1>#<br></h1></li></ul>',

      // 22.
      '<ul><li><h1>foo#bar</h1><ol><li>froala</li></ol></li></ul>':
        '<ul><li><h1>foo</h1></li><li><h1>#bar</h1><ol><li>froala</li></ol></li></ul>',

      // 23.
      '<ul><li><a href="foo">bar#</a></li></ul>':
        '<ul><li><a href="foo">bar</a></li><li>#<br></li></ul>',

      // 24.
      '<ul><li><a href="foo">bar#</a> froala</li></ul>':
        '<ul><li><a href="foo">bar</a></li><li>#&nbsp;froala</li></ul>'
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
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate enter
              instance.$el.html().replace(/\u200B/g, '_')
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
    for (const input in lists_enter_p_cases) {
      listsEnterTest(input, lists_enter_p_cases[input], ++t)
    }

    /****************************
     * Lists and DELETE tests.
     ****************************/
    const lists_delete_p_cases = {
      // 1.
      '<p>#<br></p><ul><li>foo bar</li></ul>':
        '<ul><li>#foo bar</li></ul>',

      // 2.
      '<p>foo#</p><ul><li>bar</li></ul>':
        '<p>foo#bar</p>',

      // 3.
      '<ul><li>foo#</li><li>bar</li></ul>':
        '<ul><li>foo#bar</li></ul>',

      // 4.
      '<ul><li>foo#</li></ul><p>bar</p>':
        '<ul><li>foo#bar</li></ul>',

      // 5.
      '<ul><li>foo bar#</li><li><br></li></ul>':
        '<ul><li>foo bar#</li></ul>',

      // 6.
      '<ul><li>foo#</li><li><strong>bar</strong></li></ul>':
        '<ul><li>foo#<strong>bar</strong></li></ul>',

      // 7.
      '<ul><li>#<br></li></ul><p>foo bar</p>':
        '<ul><li>#foo bar</li></ul>',

      // 8.
      '<ul><li>#<br></li></ul><strong>foo</strong><p>bar</p>':
        '<ul><li>#<strong>foo</strong></li></ul><p>bar</p>',

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
        '<ul><li>foo</li><li>#<br><ol><li>foo</li><li>bar</li></ol></li></ul>',

      // 16.
      '<p>foo#</p><ul><li><h1>bar</h1></li></ul>':
        '<p>foo#bar<br></p>',

      // 17.
      '<ul><li>foo#</li><li><h1>bar</h1><ol><li>fro</li><li>ala</li></ol></li></ul>':
        '<ul><li>foo#bar<ol><li>fro</li><li>ala</li></ol></li></ul>',

      // 18.
      '<ul><li><h1>foo#</h1></li><li><h2>bar</h2><ol><li>fro</li><li>ala</li></ol></li></ul>':
        '<ul><li><h1>foo#bar<br></h1><ol><li>fro</li><li>ala</li></ol></li></ul>',

      // 19.
      '<ul><li><h1>foo#</h1><ol><li>bar</li><li>froala</li></ol></li></ul>':
        '<ul><li><h1>foo#bar</h1><ol><li>froala</li></ol></li></ul>'
    }

    const listsDeleteTest = (input, output, t) => {
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
    for (const input in lists_delete_p_cases) {
      listsDeleteTest(input, lists_delete_p_cases[input], ++t)
    }

    /****************************
     * Lists and INDENT tests.
     ****************************/
    const lists_indent_p_cases = {
      // 1.
      '<ul><li>foo<ul><li>a</li></ul></li><li>#b<ul><li>c</li></ul></li></ul>':
        '<ul><li>foo<ul><li>a</li><li>#b</li><li>c</li></ul></li></ul>',
    }

    function listsIndendTest(input, output, t) {
      QUnit.test(`${t}. LISTS and INDENT ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate Delete
              instance.commands.indent()

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
    for (const input in lists_indent_p_cases) {
      listsIndendTest(input, lists_indent_p_cases[input], ++t)
    }
  })
