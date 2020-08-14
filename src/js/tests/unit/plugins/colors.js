import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('plugins/colors');

    QUnit.test('Multiple colors applied.', function (assert) {
      const done = assert.async();

      const $editor = $(document.createElement('div')).attr('id', 'edit').html('foo ' + FE.START_MARKER + 'bar' + FE.END_MARKER + ' x')
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.expect(1)

            instance.colors.background('#FF0000')
            instance.colors.text('#0000FF')

            assert.equal(instance.$el.html(), '<p>foo <span style="background-color: rgb(255, 0, 0); color: rgb(0, 0, 255);">bar</span> x</p>', 'OK.')

            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })

    })
  })
