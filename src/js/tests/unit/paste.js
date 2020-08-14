import $ from '../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function () {
        QUnit.module('paste')

        const test_cases = {
            '<pre>    This is some text in a pre tag,\n    With new lines and tabs.\n      Indented text is here.\n  It should be properly indented</pre>': 
            '<pre>    This is some text in a pre tag,\n    With new lines and tabs.\n      Indented text is here.\n  It should be properly indented</pre>'
        }

        function pasteWithBreak_test(input, expected, t) {

            QUnit.test(`${t}. pasteWithBreak_test ${input}`, function (assert) {
                const done = assert.async()
                const $editor = $(document.createElement('div')).attr('id', 'edit')
                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function () {
                            const instance = this
                            const clipboard_html = instance.paste.clipboard_html = input
                            instance.paste.clean(clipboard_html, null, undefined)
                            const output = clipboard_html
                            assert.expect(1)
                            assert.equal(output, expected, 'OK')

                            done()

                            instance.destroy()
                            $editor.remove()
                        }
                    }
                })
            })
        }

        let t = 0
        for (const input in test_cases) {
            pasteWithBreak_test(input, test_cases[input], ++t)
        }
    })