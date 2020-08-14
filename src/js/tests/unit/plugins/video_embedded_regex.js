import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('plugins/video_embedded_regex')
    const basic_tests = {
      name: 'embed_video',
      tests: [
        '<iframe>foo</iframe>',
        '<iframe width="560" height="315"src="https://www.youtube.com/embed/x7e2Fo2nFec"\n frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>\n</iframe>',
        '<embed width="560" height="315" src="https://www.youtube.com/embed/x7e2Fo2nFec" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>'
      ]
    }

    function testVideo(input) {
      QUnit.test('Video Embedded Insert', function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.video.showInsertPopup()
              instance.video.showLayer('video-embed')
              instance.video.insertEmbed(input)
            },
            'video.inserted': function ($video, response) {
              const instance = this
              const status = $video.hasClass('fr-video fr-deletable fr-fvc fr-dvb fr-draggable')
              assert.expect(1)
              assert.equal(status, true, 'Video inserted')

              instance.destroy()
              $editor.remove()
              
              done()

            },
            'video.codeError': function (error, response) {
              const instance = this
              assert.expect(2)
              assert.equal(error, error, 'BAD_LINK code')
              assert.ok(response == undefined, 'BAD_LINK response')

              instance.destroy()
              $editor.remove()

              done()

            }
          }
        })

      })
    }
    function runTest(obj) {
      for (const input in obj.tests) {
        testVideo(obj.tests[input])
      }
    }

    runTest(basic_tests)
  })
