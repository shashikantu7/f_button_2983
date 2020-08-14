import FE from '../../../../src/js/editor.js'
import $ from '../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('tables')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    /******************
     * Tables + Enter *
     ******************/
    const table_enter_test_cases = {
      '<table><tbody><tr><td>#</td></tr></tbody></table>': 
      '<table><tbody><tr><td><br>#<br></td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td><td>b<span style="font-size: 10px;">ar#</span></td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo</td><td>b<span style="font-size: 10px;">ar</span><br><span style="font-size: 10px;">_#</span><br></td></tr></tbody></table>'
    }

    function tablesEnterTest(input, output, t) {
      QUnit.test(`${t}. TABLES and ENTER ${input}`, function (assert) {
        const done = assert.async()
        const $editor =
          input.indexOf('$') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)) :
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              // Simulate enter
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.ENTER)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_').replace(/\u200B/g, '_'), output, 'OK.')

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
    for (const input in table_enter_test_cases) {
      tablesEnterTest(input, table_enter_test_cases[input], ++t)
    }

    /******************
     * Tables + Backspace *
     ******************/
    const table_backspace_test_cases = {
      '<p>fo#o</p><table><tbody><tr><td>foo</td></tr></tbody></table><p>ba$r</p>': 
      '<p>fo#r</p>',

      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#bar$</p>': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#<br></p>'
    }

    function tablesBackspaceTest(input, output, t) {
      QUnit.test(`${t}. TABLES and BACKSPACE ${input}`, function (assert) {
        const done = assert.async()
        const $editor =
          input.indexOf('$0') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(
            input.replace(/#(\d)/g, function (str, a1) {
              return FE.START_MARKER.replace(/id="0"/, `id="${a1}"`)
            }).replace(/\$(\d)/g, function (str, a1) {
              return FE.END_MARKER.replace(/id="0"/, `id="${a1}"`)
            })) :
          input.indexOf('$') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)) :
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER))

        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
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
              assert.equal(instance.$el.html().replace(/\u200B/g, '_').replace(/\u200B/g, '_'), output, 'OK.')

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
    for (const input in table_backspace_test_cases) {
      tablesBackspaceTest(input, table_backspace_test_cases[input], ++t)
    }

    /****************
     * Tables + Tab *
     ****************/
    const table_tab_test_cases = {
      '<table><tbody><tr><td>#<br></td><td><br></td></tr></tbody></table>': 
      '<table><tbody><tr><td><br></td><td>#<br></td></tr></tbody></table>'
    }

    function tablesTabTest(input, output, t) {
      QUnit.test(`${t}. TABLES and TAB ${input}`, function (assert) {
        const done = assert.async()
        const $editor =
          input.indexOf('$') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)) :
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              // Simulate tab
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.TAB)])

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
    for (const input in table_tab_test_cases) {
      tablesTabTest(input, table_tab_test_cases[input], ++t)
    }

    // TODO - test ctrl+a in table cell should select all content of that cell.

    // Editor adding THEAD
    function tablesHeader() {
      QUnit.test('Editor adds thead and tbody.', function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html('<table><tr><th>asdasd</th><th>asdasdasd</th><th>asdasdasd</th><th>asdasdasd</th></tr><tr><td>asdasd</td><td>asdasdasd</td><td>asdasdasd</td><td>asdasdasd</td></tr></table>')

        $(document.body).append($editor)
        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<table><thead><tr><th>asdasd</th><th>asdasdasd</th><th>asdasdasd</th><th>asdasdasd</th></tr></thead><tbody><tr><td>asdasd</td><td>asdasdasd</td><td>asdasdasd</td><td>asdasdasd</td></tr></tbody></table>', 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
      })
    }

    tablesHeader()
  })