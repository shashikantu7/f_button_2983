import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/enter_p')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const enter_p_cases = {
      '<p>#foo bar</p>': 
      '<p><br></p><p>#foo bar</p>',

      '<p>foo #bar</p>': 
      '<p>foo&nbsp;</p><p>#bar</p>',

      '<p>foo bar#</p>': 
      '<p>foo bar</p><p>#<br></p>',

      '<p>foo #<strong>bar</strong></p>': 
      '<p>foo&nbsp;</p><p>#<strong>bar</strong></p>',

      '<p>foo <strong>#bar</strong></p>': 
      '<p>foo&nbsp;</p><p><strong>#bar</strong></p>',

      '<p>foo <strong>b#ar</strong></p>': 
      '<p>foo <strong>b</strong></p><p><strong>#ar</strong></p>',

      '<p>foo <strong>bar#</strong></p>': 
      '<p>foo <strong>bar</strong></p><p><strong>_#</strong><br></p>',

      '<p>foo <strong>bar</strong>#</p>': 
      '<p>foo <strong>bar</strong></p><p>#<br></p>',

      '<p>foo <strong><em>#bar</em></strong></p>': 
      '<p>foo&nbsp;</p><p><strong><em>#bar</em></strong></p>',

      '<p>foo <strong><em>b#ar</em></strong></p>': 
      '<p>foo <strong><em>b</em></strong></p><p><strong><em>#ar</em></strong></p>',

      '<p>foo <strong><em>bar#</em></strong></p>': 
      '<p>foo <strong><em>bar</em></strong></p><p><strong><em>_#</em></strong><br></p>',

      '<h1>#foo bar</h1>': 
      '<h1><br></h1><h1>#foo bar</h1>',

      '<h1>foo# bar</h1>': 
      '<h1>foo</h1><h1>#&nbsp;bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar</h1><p>#<br></p>',

      '<h1>foo <strong><em>#bar</em></strong></h1>': 
      '<h1>foo&nbsp;</h1><h1><strong><em>#bar</em></strong></h1>',

      '<h1>foo <strong><em>b#ar</em></strong></h1>': 
      '<h1>foo <strong><em>b</em></strong></h1><h1><strong><em>#ar</em></strong></h1>',

      '<h1>foo <strong><em>bar#</em></strong></h1>': 
      '<h1>foo <strong><em>bar</em></strong></h1><p><strong><em>_#</em></strong><br></p>',

      '<p><a href="foo">bar</a>#</p>': 
      '<p><a href="foo">bar</a></p><p>#<br></p>',

      '<p><a href="foo">bar</a># froala</p>': 
      '<p><a href="foo">bar</a></p><p>#&nbsp;froala</p>',

      '<p><a href="foo">bar#</a> froala</p>': 
      '<p><a href="foo">bar</a></p><p>#&nbsp;froala</p>',

      '<p><a href="foo"><strong>bar#</strong></a> froala</p>': 
      '<p><a href="foo"><strong>bar</strong></a></p><p><strong>_#</strong> froala</p>',

      '<table><tbody><tr><td>foo #bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo <br>#bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td><br>#foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo bar<br>#<br></td></tr></tbody></table>',

      '<p>froala#</p><table><tbody><tr><td>foo bar</td></tr></tbody></table>': 
      '<p>froala</p><p>#<br></p><table><tbody><tr><td>foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><p>#froala</p>': 
      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><p><br></p><p>#froala</p>',

      '<pre>foo<br>#<br></pre>': 
      '<pre>foo<br></pre><p>#<br></p>'
    }

    function enterTest(input, output, t) {
      QUnit.test(`${t}. ENTER ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)
        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.ENTER)])

              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

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

    let t = 0
    for (const input in enter_p_cases) {
      enterTest(input, enter_p_cases[input], ++t)
    }

    // ctrl+a, enter test
    /* Not working due to simulator.
    function ctrlAEnterTest() {
      test('CTRL + A, ENTER', function () {
        var $editor = $('<div><p>foo</p><p>bar</p></div>');

        $editor.appendTo('body');
        $editor.froalaEditor();

        var instance = $editor.data('froala.editor');

        instance.$el.focus();
        instance.$el.simulate("key-combo", {combo: "ctrl+a"});

        instance.events.trigger('keydown', [fooEvent(FFE.KEYCODE.ENTER)]);

        //instance.markers.insert();
        //instance.$el.find('.fr-marker').replaceWith('#');

        equal(instance.$el.html().replace(/\u200B/g, '_'), '<p><br></p><p><br></p>', 'OK.');
      });
    }

    ctrlAEnterTest()*/
  })