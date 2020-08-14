// Languages
import '../src/js/languages/ar.js'
import '../src/js/languages/bs.js'
import '../src/js/languages/cs.js'
import '../src/js/languages/da.js'
import '../src/js/languages/de.js'
import '../src/js/languages/el.js'
import '../src/js/languages/en_ca.js'
import '../src/js/languages/en_gb.js'
import '../src/js/languages/es.js'
import '../src/js/languages/et.js'
import '../src/js/languages/fa.js'
import '../src/js/languages/fi.js'
import '../src/js/languages/fr.js'
import '../src/js/languages/he.js'
import '../src/js/languages/hr.js'
import '../src/js/languages/hu.js'
import '../src/js/languages/id.js'
import '../src/js/languages/it.js'
import '../src/js/languages/ja.js'
import '../src/js/languages/ko.js'
import '../src/js/languages/ku.js'
import '../src/js/languages/me.js'
import '../src/js/languages/nb.js'
import '../src/js/languages/nl.js'
import '../src/js/languages/pl.js'
import '../src/js/languages/pt_br.js'
import '../src/js/languages/pt_pt.js'
import '../src/js/languages/ro.js'
import '../src/js/languages/ru.js'
import '../src/js/languages/sk.js'
import '../src/js/languages/sr.js'
import '../src/js/languages/sv.js'
import '../src/js/languages/th.js'
import '../src/js/languages/tr.js'
import '../src/js/languages/uk.js'
import '../src/js/languages/vi.js'
import '../src/js/languages/zh_cn.js'
import '../src/js/languages/zh_tw.js'
import '../src/js/languages/sl.js'
// Plugins
import '../src/js/plugins/align.js'
import '../src/js/plugins/char_counter.js'
import '../src/js/plugins/code_beautifier.js'
import '../src/js/plugins/code_view.js'
import '../src/js/plugins/colors.js'
import '../src/js/plugins/draggable.js'
import '../src/js/plugins/edit_in_popup.js';
import '../src/js/third_party/embedly.js';
import '../src/js/plugins/emoticons.js';
import '../src/js/plugins/entities.js';
import '../src/js/plugins/file.js';
import '../src/js/plugins/files_manager.js';
import '../src/js/plugins/cryptojs.js';
import '../src/js/third_party/font_awesome.js';
import '../src/js/plugins/font_family.js'
import '../src/js/plugins/font_size.js'
import '../src/js/plugins/forms.js';
import '../src/js/plugins/fullscreen.js';
import '../src/js/plugins/help.js'
import '../src/js/plugins/image.js'
import '../src/js/plugins/image_manager.js'
import '../src/js/third_party/image_tui.js'
import '../src/js/plugins/trim_video.js';
import '../src/js/plugins/inline_class.js'
import '../src/js/plugins/inline_style.js'
import '../src/js/plugins/line_breaker.js'
import '../src/js/plugins/line_height.js'
import '../src/js/plugins/link.js'
import '../src/js/plugins/lists.js'
import '../src/js/plugins/paragraph_format.js'
import '../src/js/plugins/paragraph_style.js'
import '../src/js/plugins/print.js'
import '../src/js/plugins/quick_insert.js'
import '../src/js/plugins/quote.js'
import '../src/js/plugins/save.js'
import '../src/js/plugins/special_characters.js'
import '../src/js/third_party/spell_checker.js'
import '../src/js/plugins/table.js'
import '../src/js/plugins/url.js'
import '../src/js/plugins/video.js'
import '../src/js/plugins/word_paste.js'

import FroalaEditor from '../src/js/index.js';

new FroalaEditor('#edit', {
  events: {
    initialized: function () {
      var editor = this;
      editor.events.bindClick(editor.$('body'), 'button', function() {
        editor.button.addButtons(['insert', 'bold']);
      })
    }
  },
  toolbarButtons: ['bold'],
  scaytCustomerId: '1:YjSV32-KWqTc2-AICoL3-WHiWO1-gYWRJ1-T1Cye3-Z9BJX3-YoRKY2-Icrlm-FMisd4-B26CZ3-SK3'
});
