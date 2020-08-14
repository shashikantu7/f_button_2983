import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('imageUpload')

    function image_upload_popup(input, output) {

      QUnit.test(`. Text Align ${input}`, function (assert) {
        const done = assert.async()
        let status

        if (input === 'false') {
          status = false
        }

        const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          imageManagerLoadURL: status,
          imageMaxSize: 4 * 1024 * 1024 * 1024, // 4G
          imagePaste: status,
          imageResize: status,
          imageUploadParam: 'upload',
          imageUploadRemoteUrls: status,
          imageUploadURL: status,
          imageUpload: status,
          imageInsertButtons: ['imageByURL'],
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.image.showInsertPopup()

              const $popup = instance.popups.get('image.insert')

              assert.expect(1)
              assert.equal(output, $popup[0].offsetWidth > 0, 'OK')

              instance.destroy()
              $editor.remove()

              done()

            }
          }
        })

      })
    }

    image_upload_popup('false', true)
  })