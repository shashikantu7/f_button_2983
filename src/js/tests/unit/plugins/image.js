import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('plugins/image')

    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {

          const binStr = atob(this.toDataURL(type, quality).split(',')[1]),
            len = binStr.length,
            arr = new Uint8Array(len)

          for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i)
          }

          callback(new Blob([arr], { type: type || 'image/png' }))
        }
      })
    }

    QUnit.test('Image inserted.', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      this.server = sinon.fakeServer.create()
      this.server.respondImmediately = true
      this.server.respondWith('POST', 'https://i.froala.com/upload-foo', [200, 'application/json', '{"link":"/src/img/photo1.jpg","foo":"bar"}'])

      const that = this

      const image = new Image()
      image.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(this, 0, 0)

        canvas.toBlob(function (blob) {

          new FroalaEditor('#edit', {
            imageUploadURL: 'https://i.froala.com/upload-foo',
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this

                instance.image.showInsertPopup()

                instance.image.upload([blob])
                setTimeout(function () {
                  that.server.respond()
                }, 500)

              },
              'image.inserted': function ($img, response) {

                const instance = this

                assert.expect(2)
                assert.equal($img.attr('src'), '/src/img/photo1.jpg', 'Expected SRC.')
                assert.equal(response, JSON.stringify({ 'link': '/src/img/photo1.jpg', 'foo': 'bar' }), 'Response.')
                
                that.server.restore()

                instance.destroy()
                $editor.remove()

                done()

              }
            }
          })

        })
      }
      image.src = '/src/img/photo1.jpg'

    })

    QUnit.test('Image error BAD_LINK', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this

            instance.image.showInsertPopup()
            instance.image.insert('foo')

          },
          'image.error': function (error, response) {
            const instance = this

            assert.expect(2)
            assert.equal(error.code, 1, 'BAD_LINK code')
            assert.ok(response == undefined, 'BAD_LINK response')

            instance.destroy()
            $editor.remove()

            done()

          }
        }
      })

    })

    QUnit.test('Image error MISSING_LINK', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      this.server = sinon.fakeServer.create()
      this.server.respondWith('POST', 'https://i.froala.com/upload-foo', [200, 'application/json', '{"foo": "bar"}'])

      const that = this

      const image = new Image()
      image.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(this, 0, 0)

        canvas.toBlob(function (blob) {

          new FroalaEditor('#edit', {
            imageUploadURL: 'https://i.froala.com/upload-foo',
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this

                instance.image.showInsertPopup()

                instance.image.upload([blob])
                setTimeout(function () {
                  that.server.respond()
                }, 500)

              },
              'image.error': function (error, response) {
                const instance = this

                assert.expect(2)
                assert.equal(error.code, 2, 'MISSING_LINK code')
                assert.ok(response == '{"foo": "bar"}', 'MISSING_LINK response')

                that.server.restore()

                instance.destroy()
                $editor.remove()

                done()

              }
            }
          })

        })
      }
      image.src = '/src/img/photo1.jpg'

    })

    QUnit.test('Image error ERROR_DURING_UPLOAD', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      this.server = sinon.fakeServer.create()
      this.server.respondWith('POST', 'https://i.froala.com/upload-foo', [404, {}, '{}'])

      const that = this

      const image = new Image()
      image.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(this, 0, 0)

        canvas.toBlob(function (blob) {

          new FroalaEditor('#edit', {
            imageUploadURL: 'https://i.froala.com/upload-foo',
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this

                instance.image.showInsertPopup()

                instance.image.upload([blob])
                setTimeout(function () {
                  that.server.respond()
                }, 500)

              },
              'image.error': function (error, response) {
                const instance = this

                assert.expect(2)
                assert.equal(error.code, 3, 'ERROR_DURING_UPLOAD code')
                assert.ok(response == '{}', 'ERROR_DURING_UPLOAD response')

                that.server.restore()

                instance.destroy()
                $editor.remove()

                done()

              }
            }
          })

        })
      }
      image.src = '/src/img/photo1.jpg'

    })

    QUnit.test('Image error BAD_RESPONSE', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      this.server = sinon.fakeServer.create()
      this.server.respondWith('POST', 'https://i.froala.com/upload-foo', [200, {}, 'asd'])

      const that = this

      const image = new Image()
      image.onload = function () {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(this, 0, 0)

        canvas.toBlob(function (blob) {

          new FroalaEditor('#edit', {
            imageUploadURL: 'https://i.froala.com/upload-foo',
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this

                instance.image.showInsertPopup()

                instance.image.upload([blob])
                setTimeout(function () {
                  that.server.respond()
                }, 500)

              },
              'image.error': function (error, response) {
                const instance = this

                assert.expect(2)
                assert.equal(error.code, 4, 'BAD_RESPONSE code')
                assert.ok(response == 'asd', 'BAD_RESPONSE response')

                that.server.restore()

                instance.destroy()
                $editor.remove()

                done()

              }
            }
          })

        })
      }
      image.src = '/src/img/photo1.jpg'

    })

    QUnit.test('Image error MAX_SIZE_EXCEEDED', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        imageUploadURL: 'foo',
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this

            instance.image.showInsertPopup()
            const param = [{
              foo: 'bar',
              type: 'image/png',
              size: 1024 * 1024 * 50
            }]
            instance.image.upload(param)

          },
          'image.error': function (error, response) {
            const instance = this

            assert.expect(2)
            assert.equal(error.code, 5, 'MAX_SIZE_EXCEEDED code')
            assert.ok(response == undefined, 'MAX_SIZE_EXCEEDED response')

            instance.destroy()
            $editor.remove()

            done()

          }
        }
      })

    })

    QUnit.test('Image error BAD_FILE_TYPE', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        imageUploadURL: 'foo',
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this

            instance.image.showInsertPopup()
            const param = [{
              foo: 'bar',
              type: 'image/ttf',
              size: 1024 * 1024 * 50
            }]
            instance.image.upload(param)

          },
          'image.error': function (error, response) {
            const instance = this

            assert.expect(2)
            assert.equal(error.code, 5, 'BAD_FILE_TYPE code')
            assert.ok(response == undefined, 'BAD_FILE_TYPE response')

            instance.destroy()
            $editor.remove()

            done()

          }
        }
      })

    })
  })
