var translate = require('google-translate-api');
const replace = require('replace-in-file');
global.$ = {};

FE = {};
FE.LANGUAGE = {};

var lang = process.argv[2]
var glang = lang
var capitalize = require('capitalize-first-letter')

require('./src/js/languages/' + lang);

var translations = FE.LANGUAGE[lang].translation;

function translateLang (key) {
  if (translations[key] === '') {
    console.log ('"' + key + '": ""')

    if (lang == 'he') {
      glang = 'iw'
    }
    else if (lang == 'me') {
      glang = 'sr-ME'
    }
    else if (lang == 'nb') {
      glang = 'no'
    }
    else if (lang == 'zh_cn') {
      glang = 'zh-CN'
    }
    else if (lang == 'zh_tw') {
      glang = 'zh-TW'
    }
    else if (lang == 'pt_pt') {
      glang = 'pt'
    }
    else if (lang == 'pt_br') {
      glang = 'pt'
    }

    translate(key.toLowerCase(), {from: 'en', to: glang}).then(res => {
      const options = {
        files: './src/js/languages/' + lang + '.js',
        from: '"' + key + '": ""',
        to: '"' + key + '": "' + capitalize(res.text) + '"',
      };

      replace.sync(options)
    })
  }
}

for (var key in translations) {
  translateLang(key);
}