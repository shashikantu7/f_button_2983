import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('list/list_format')

    const list_format_testcases = {
      '<ul><li>A<ul><li>B<ul><li>C#</li><li>Abcd</li><li>jsgdj</li></ul></li></ul></li></ul>': 
      '<ul><li>A<ul><li>B</li><li>C#<ul><li>Abcd</li><li>jsgdj</li></ul></li></ul></li></ul>'
    }

    const orderedlist_format_testcases = {
      '<ol><li>A<ol><li>B<ol><li>C#</li><li>Abcd</li><li>jsgdj</li></ol></li></ol></li></ol>': 
      '<ol><li>A<ol><li>B</li><li>C#<ol><li>Abcd</li><li>jsgdj</li></ol></li></ol></li></ol>'
    }

    const list_format = (input, output, t) => {

      QUnit.test(`${t} . LISTS and FORMAT ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.$el.focus()

              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')
              instance.lists.format('UL')

              assert.expect(1)
              assert.equal(instance.$el.html(), output, 'OK')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
      })
    }

    let t = 0
    for (const input in list_format_testcases) {
      list_format(input, list_format_testcases[input], ++t)
    }


    function list_format_orderedList(input, output, t) {

      QUnit.test(`${t}. LISTS and FORMAT ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.$el.focus()

              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')
              instance.lists.format('OL')

              assert.expect(1)
              assert.equal(instance.$el.html(), output, 'OK')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
      })
    }

    t = 0
    for (const input in orderedlist_format_testcases) {
      list_format_orderedList(input, orderedlist_format_testcases[input], ++t)
    }
  })