import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('paragraph_format')

    const basic_tests_H1 = {
      name: 'paragraph_format',
      config: {},
      tests: {
        '<p>hello</p>':'<h1>hello</h1>',
      }
    }
    const basic_tests_H2 = {
        name: 'paragraph_format',
        config: {},
        tests: {
          '<p>hello</p>':'<h2>hello</h2>'
          
        }
      }
      const basic_tests_H3= {
        name: 'paragraph_format',
        config: {},
        tests: {
          '<p>hello</p>':'<h3>hello</h3>',
          }
      }
      const basic_tests_H4 = {
        name: 'paragraph_format',
        config: {},
        tests: {
          '<p>hello</p>':'<h4>hello</h4>'
            }
      }
      const basic_tests_H5 = {
        name: 'paragraph_format',
        config: {},
        tests: {
          '<p>hello</p>':'<h5>hello</h5>'
        }
      }
    

    function testFormat_H1(id, config, input, expected) {
      QUnit.test(id, function (assert) {

        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          enter: FE.ENTER_BR,
          config,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.$el.html(input)
              instance.html.wrap()
              instance.doc.execCommand('selectAll', false, false)
              instance.selection.save()
              instance.paragraphFormat.apply('H1')
              const output = instance.$el.html()
              assert.expect(1)
              assert.equal(output, expected, 'OK.')
              instance.destroy()
              $editor.remove()
              done()
              }
            }
          })
        })
      }
    function testFormat_H2(id, config, input, expected) {
        QUnit.test(id, function (assert) {
  
          const done = assert.async()
          const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
          $(document.body).append($editor)
  
          const editorInstance = new FroalaEditor('#edit', {
            enter: FE.ENTER_BR,
            config,
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this
                instance.$el.html(input)
                instance.html.wrap()
                instance.doc.execCommand('selectAll', false, false)
                instance.selection.save()
                instance.paragraphFormat.apply('H2')
                const output = instance.$el.html()
                assert.expect(1)
                assert.equal(output, expected, 'OK.')
                instance.destroy()
                $editor.remove()
                done()
              }
            }
          })
        })
      }
      function testFormat_H3(id, config, input, expected) {
        QUnit.test(id, function (assert) {
  
          const done = assert.async()
          const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
          $(document.body).append($editor)
  
          const editorInstance = new FroalaEditor('#edit', {
            enter: FE.ENTER_BR,
            config,
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this
                instance.$el.html(input)
                instance.html.wrap()
                instance.doc.execCommand('selectAll', false, false)
                instance.selection.save()
                instance.paragraphFormat.apply('H3')
                const output = instance.$el.html()
                assert.expect(1)
                assert.equal(output, expected, 'OK.')
                instance.destroy()
                $editor.remove()
                done()
              }
            }
          })
        })
      }
      function testFormat_H4(id, config, input, expected) {
        QUnit.test(id, function (assert) {
  
          const done = assert.async()
          const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
          $(document.body).append($editor)
  
          const editorInstance = new FroalaEditor('#edit', {
            enter: FE.ENTER_BR,
            config,
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this
                instance.$el.html(input)
                instance.html.wrap()
                instance.doc.execCommand('selectAll', false, false)
                instance.selection.save()
                instance.paragraphFormat.apply('H4')
                const output = instance.$el.html()
                assert.expect(1)
                assert.equal(output, expected, 'OK.')
                instance.destroy()
                $editor.remove()
                 done()
              }
            }
          })    
        })
      }
      function testFormat_H5(id, config, input, expected) {
        QUnit.test(id, function (assert) {
  
          const done = assert.async()
          const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
          $(document.body).append($editor)
  
          const editorInstance = new FroalaEditor('#edit', {
            enter: FE.ENTER_BR,
            config,
            QUnitCommonConfig,
            events: {
              initialized: function () {
                const instance = this
                instance.$el.html(input)
                instance.html.wrap()
                instance.doc.execCommand('selectAll', false, false)
                instance.selection.save()
                instance.paragraphFormat.apply('H5')
                const output = instance.$el.html()
                assert.expect(1)
                assert.equal(output, expected, 'OK.')
                instance.destroy()
                $editor.remove()
                done()
              }
            }
          })
        })
      }

    function runTest(obj) {
        if(obj==basic_tests_H1)
        {
      let t = 0
      for (const input in obj.tests) {
        testFormat_H1(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
        }
        }
        else if(obj==basic_tests_H2)
        {
                let t = 0
                for (const input in obj.tests) {
                  testFormat_H2(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
                  }
                  
        }
        else if(obj==basic_tests_H3)
        {
            let t = 0
            for (const input in obj.tests) {
              testFormat_H3(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
              }
        }
        else if(obj==basic_tests_H4)
        {
            let t = 0
            for (const input in obj.tests) {
              testFormat_H4(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
              }
        }
        else if (obj==basic_tests_H5)
        {
            let t = 0
            for (const input in obj.tests) {
              testFormat_H5(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
              }
        }    
    }

    runTest(basic_tests_H1)
    runTest(basic_tests_H2)
    runTest(basic_tests_H3)
    runTest(basic_tests_H4)
    runTest(basic_tests_H5)
  })