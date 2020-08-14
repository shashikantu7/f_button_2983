import FE from '../index.js'
'use strict';

// Extend defaults.
Object.assign(FE.DEFAULTS, {
  specialCharactersSets: [
    {
      title: 'Latin',
      char: '&iexcl;',
      list: [
        { 'char': '&iexcl;', desc: 'INVERTED EXCLAMATION MARK' },
        { 'char': '&cent;', desc: 'CENT SIGN' },
        { 'char': '&pound;', desc: 'POUND SIGN' },
        { 'char': '&curren;', desc: 'CURRENCY SIGN' },
        { 'char': '&yen;', desc: 'YEN SIGN' },
        { 'char': '&brvbar;', desc: 'BROKEN BAR' },
        { 'char': '&sect;', desc: 'SECTION SIGN' },
        { 'char': '&uml;', desc: 'DIAERESIS' },
        { 'char': '&copy;', desc: 'COPYRIGHT SIGN' },
        { 'char': '&trade;', desc: 'TRADEMARK SIGN' },
        { 'char': '&ordf;', desc: 'FEMININE ORDINAL INDICATOR' },
        { 'char': '&laquo;', desc: 'LEFT-POINTING DOUBLE ANGLE QUOTATION MARK' },
        { 'char': '&not;', desc: 'NOT SIGN' },
        { 'char': '&reg;', desc: 'REGISTERED SIGN' },
        { 'char': '&macr;', desc: 'MACRON' },
        { 'char': '&deg;', desc: 'DEGREE SIGN' },
        { 'char': '&plusmn;', desc: 'PLUS-MINUS SIGN' },
        { 'char': '&sup2;', desc: 'SUPERSCRIPT TWO' },
        { 'char': '&sup3;', desc: 'SUPERSCRIPT THREE' },
        { 'char': '&acute;', desc: 'ACUTE ACCENT' },
        { 'char': '&micro;', desc: 'MICRO SIGN' },
        { 'char': '&para;', desc: 'PILCROW SIGN' },
        { 'char': '&middot;', desc: 'MIDDLE DOT' },
        { 'char': '&cedil;', desc: 'CEDILLA' },
        { 'char': '&sup1;', desc: 'SUPERSCRIPT ONE' },
        { 'char': '&ordm;', desc: 'MASCULINE ORDINAL INDICATOR' },
        { 'char': '&raquo;', desc: 'RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK' },
        { 'char': '&frac14;', desc: 'VULGAR FRACTION ONE QUARTER' },
        { 'char': '&frac12;', desc: 'VULGAR FRACTION ONE HALF' },
        { 'char': '&frac34;', desc: 'VULGAR FRACTION THREE QUARTERS' },
        { 'char': '&iquest;', desc: 'INVERTED QUESTION MARK' },
        { 'char': '&Agrave;', desc: 'LATIN CAPITAL LETTER A WITH GRAVE' },
        { 'char': '&Aacute;', desc: 'LATIN CAPITAL LETTER A WITH ACUTE' },
        { 'char': '&Acirc;', desc: 'LATIN CAPITAL LETTER A WITH CIRCUMFLEX' },
        { 'char': '&Atilde;', desc: 'LATIN CAPITAL LETTER A WITH TILDE' },
        { 'char': '&Auml;', desc: 'LATIN CAPITAL LETTER A WITH DIAERESIS ' },
        { 'char': '&Aring;', desc: 'LATIN CAPITAL LETTER A WITH RING ABOVE' },
        { 'char': '&AElig;', desc: 'LATIN CAPITAL LETTER AE' },
        { 'char': '&Ccedil;', desc: 'LATIN CAPITAL LETTER C WITH CEDILLA' },
        { 'char': '&Egrave;', desc: 'LATIN CAPITAL LETTER E WITH GRAVE' },
        { 'char': '&Eacute;', desc: 'LATIN CAPITAL LETTER E WITH ACUTE' },
        { 'char': '&Ecirc;', desc: 'LATIN CAPITAL LETTER E WITH CIRCUMFLEX' },
        { 'char': '&Euml;', desc: 'LATIN CAPITAL LETTER E WITH DIAERESIS' },
        { 'char': '&Igrave;', desc: 'LATIN CAPITAL LETTER I WITH GRAVE' },
        { 'char': '&Iacute;', desc: 'LATIN CAPITAL LETTER I WITH ACUTE' },
        { 'char': '&Icirc;', desc: 'LATIN CAPITAL LETTER I WITH CIRCUMFLEX' },
        { 'char': '&Iuml;', desc: 'LATIN CAPITAL LETTER I WITH DIAERESIS' },
        { 'char': '&ETH;', desc: 'LATIN CAPITAL LETTER ETH' },
        { 'char': '&Ntilde;', desc: 'LATIN CAPITAL LETTER N WITH TILDE' },
        { 'char': '&Ograve;', desc: 'LATIN CAPITAL LETTER O WITH GRAVE' },
        { 'char': '&Oacute;', desc: 'LATIN CAPITAL LETTER O WITH ACUTE' },
        { 'char': '&Ocirc;', desc: 'LATIN CAPITAL LETTER O WITH CIRCUMFLEX' },
        { 'char': '&Otilde;', desc: 'LATIN CAPITAL LETTER O WITH TILDE' },
        { 'char': '&Ouml;', desc: 'LATIN CAPITAL LETTER O WITH DIAERESIS' },
        { 'char': '&times;', desc: 'MULTIPLICATION SIGN' },
        { 'char': '&Oslash;', desc: 'LATIN CAPITAL LETTER O WITH STROKE' },
        { 'char': '&Ugrave;', desc: 'LATIN CAPITAL LETTER U WITH GRAVE' },
        { 'char': '&Uacute;', desc: 'LATIN CAPITAL LETTER U WITH ACUTE' },
        { 'char': '&Ucirc;', desc: 'LATIN CAPITAL LETTER U WITH CIRCUMFLEX' },
        { 'char': '&Uuml;', desc: 'LATIN CAPITAL LETTER U WITH DIAERESIS' },
        { 'char': '&Yacute;', desc: 'LATIN CAPITAL LETTER Y WITH ACUTE' },
        { 'char': '&THORN;', desc: 'LATIN CAPITAL LETTER THORN' },
        { 'char': '&szlig;', desc: 'LATIN SMALL LETTER SHARP S' },
        { 'char': '&agrave;', desc: 'LATIN SMALL LETTER A WITH GRAVE' },
        { 'char': '&aacute;', desc: 'LATIN SMALL LETTER A WITH ACUTE ' },
        { 'char': '&acirc;', desc: 'LATIN SMALL LETTER A WITH CIRCUMFLEX' },
        { 'char': '&atilde;', desc: 'LATIN SMALL LETTER A WITH TILDE' },
        { 'char': '&auml;', desc: 'LATIN SMALL LETTER A WITH DIAERESIS' },
        { 'char': '&aring;', desc: 'LATIN SMALL LETTER A WITH RING ABOVE' },
        { 'char': '&aelig;', desc: 'LATIN SMALL LETTER AE' },
        { 'char': '&ccedil;', desc: 'LATIN SMALL LETTER C WITH CEDILLA' },
        { 'char': '&egrave;', desc: 'LATIN SMALL LETTER E WITH GRAVE' },
        { 'char': '&eacute;', desc: 'LATIN SMALL LETTER E WITH ACUTE' },
        { 'char': '&ecirc;', desc: 'LATIN SMALL LETTER E WITH CIRCUMFLEX' },
        { 'char': '&euml;', desc: 'LATIN SMALL LETTER E WITH DIAERESIS' },
        { 'char': '&igrave;', desc: 'LATIN SMALL LETTER I WITH GRAVE' },
        { 'char': '&iacute;', desc: 'LATIN SMALL LETTER I WITH ACUTE' },
        { 'char': '&icirc;', desc: 'LATIN SMALL LETTER I WITH CIRCUMFLEX' },
        { 'char': '&iuml;', desc: 'LATIN SMALL LETTER I WITH DIAERESIS' },
        { 'char': '&eth;', desc: 'LATIN SMALL LETTER ETH' },
        { 'char': '&ntilde;', desc: 'LATIN SMALL LETTER N WITH TILDE' },
        { 'char': '&ograve;', desc: 'LATIN SMALL LETTER O WITH GRAVE' },
        { 'char': '&oacute;', desc: 'LATIN SMALL LETTER O WITH ACUTE' },
        { 'char': '&ocirc;', desc: 'LATIN SMALL LETTER O WITH CIRCUMFLEX' },
        { 'char': '&otilde;', desc: 'LATIN SMALL LETTER O WITH TILDE' },
        { 'char': '&ouml;', desc: 'LATIN SMALL LETTER O WITH DIAERESIS' },
        { 'char': '&divide;', desc: 'DIVISION SIGN' },
        { 'char': '&oslash;', desc: 'LATIN SMALL LETTER O WITH STROKE' },
        { 'char': '&ugrave;', desc: 'LATIN SMALL LETTER U WITH GRAVE' },
        { 'char': '&uacute;', desc: 'LATIN SMALL LETTER U WITH ACUTE' },
        { 'char': '&ucirc;', desc: 'LATIN SMALL LETTER U WITH CIRCUMFLEX' },
        { 'char': '&uuml;', desc: 'LATIN SMALL LETTER U WITH DIAERESIS' },
        { 'char': '&yacute;', desc: 'LATIN SMALL LETTER Y WITH ACUTE' },
        { 'char': '&thorn;', desc: 'LATIN SMALL LETTER THORN' },
        { 'char': '&yuml;', desc: 'LATIN SMALL LETTER Y WITH DIAERESIS' }
      ]
    },
    {
      title: 'Greek',
      char: '&Alpha;',
      list: [
        { 'char': '&Alpha;', desc: 'GREEK CAPITAL LETTER ALPHA' },
        { 'char': '&Beta;', desc: 'GREEK CAPITAL LETTER BETA' },
        { 'char': '&Gamma;', desc: 'GREEK CAPITAL LETTER GAMMA' },
        { 'char': '&Delta;', desc: 'GREEK CAPITAL LETTER DELTA' },
        { 'char': '&Epsilon;', desc: 'GREEK CAPITAL LETTER EPSILON' },
        { 'char': '&Zeta;', desc: 'GREEK CAPITAL LETTER ZETA' },
        { 'char': '&Eta;', desc: 'GREEK CAPITAL LETTER ETA' },
        { 'char': '&Theta;', desc: 'GREEK CAPITAL LETTER THETA' },
        { 'char': '&Iota;', desc: 'GREEK CAPITAL LETTER IOTA' },
        { 'char': '&Kappa;', desc: 'GREEK CAPITAL LETTER KAPPA' },
        { 'char': '&Lambda;', desc: 'GREEK CAPITAL LETTER LAMBDA' },
        { 'char': '&Mu;', desc: 'GREEK CAPITAL LETTER MU' },
        { 'char': '&Nu;', desc: 'GREEK CAPITAL LETTER NU' },
        { 'char': '&Xi;', desc: 'GREEK CAPITAL LETTER XI' },
        { 'char': '&Omicron;', desc: 'GREEK CAPITAL LETTER OMICRON' },
        { 'char': '&Pi;', desc: 'GREEK CAPITAL LETTER PI' },
        { 'char': '&Rho;', desc: 'GREEK CAPITAL LETTER RHO' },
        { 'char': '&Sigma;', desc: 'GREEK CAPITAL LETTER SIGMA' },
        { 'char': '&Tau;', desc: 'GREEK CAPITAL LETTER TAU' },
        { 'char': '&Upsilon;', desc: 'GREEK CAPITAL LETTER UPSILON' },
        { 'char': '&Phi;', desc: 'GREEK CAPITAL LETTER PHI' },
        { 'char': '&Chi;', desc: 'GREEK CAPITAL LETTER CHI' },
        { 'char': '&Psi;', desc: 'GREEK CAPITAL LETTER PSI' },
        { 'char': '&Omega;', desc: 'GREEK CAPITAL LETTER OMEGA' },
        { 'char': '&alpha;', desc: 'GREEK SMALL LETTER ALPHA' },
        { 'char': '&beta;', desc: 'GREEK SMALL LETTER BETA' },
        { 'char': '&gamma;', desc: 'GREEK SMALL LETTER GAMMA' },
        { 'char': '&delta;', desc: 'GREEK SMALL LETTER DELTA' },
        { 'char': '&epsilon;', desc: 'GREEK SMALL LETTER EPSILON' },
        { 'char': '&zeta;', desc: 'GREEK SMALL LETTER ZETA' },
        { 'char': '&eta;', desc: 'GREEK SMALL LETTER ETA' },
        { 'char': '&theta;', desc: 'GREEK SMALL LETTER THETA' },
        { 'char': '&iota;', desc: 'GREEK SMALL LETTER IOTA' },
        { 'char': '&kappa;', desc: 'GREEK SMALL LETTER KAPPA' },
        { 'char': '&lambda;', desc: 'GREEK SMALL LETTER LAMBDA' },
        { 'char': '&mu;', desc: 'GREEK SMALL LETTER MU' },
        { 'char': '&nu;', desc: 'GREEK SMALL LETTER NU' },
        { 'char': '&xi;', desc: 'GREEK SMALL LETTER XI' },
        { 'char': '&omicron;', desc: 'GREEK SMALL LETTER OMICRON' },
        { 'char': '&pi;', desc: 'GREEK SMALL LETTER PI' },
        { 'char': '&rho;', desc: 'GREEK SMALL LETTER RHO' },
        { 'char': '&sigmaf;', desc: 'GREEK SMALL LETTER FINAL SIGMA' },
        { 'char': '&sigma;', desc: 'GREEK SMALL LETTER SIGMA' },
        { 'char': '&tau;', desc: 'GREEK SMALL LETTER TAU' },
        { 'char': '&upsilon;', desc: 'GREEK SMALL LETTER UPSILON' },
        { 'char': '&phi;', desc: 'GREEK SMALL LETTER PHI' },
        { 'char': '&chi;', desc: 'GREEK SMALL LETTER CHI' },
        { 'char': '&psi;', desc: 'GREEK SMALL LETTER PSI' },
        { 'char': '&omega;', desc: 'GREEK SMALL LETTER OMEGA' },
        { 'char': '&thetasym;', desc: 'GREEK THETA SYMBOL' },
        { 'char': '&upsih;', desc: 'GREEK UPSILON WITH HOOK SYMBOL' },
        { 'char': '&straightphi;', desc: 'GREEK PHI SYMBOL' },
        { 'char': '&piv;', desc: 'GREEK PI SYMBOL' },
        { 'char': '&Gammad;', desc: 'GREEK LETTER DIGAMMA' },
        { 'char': '&gammad;', desc: 'GREEK SMALL LETTER DIGAMMA' },
        { 'char': '&varkappa;', desc: 'GREEK KAPPA SYMBOL' },
        { 'char': '&varrho;', desc: 'GREEK RHO SYMBOL' },
        { 'char': '&straightepsilon;', desc: 'GREEK LUNATE EPSILON SYMBOL' },
        { 'char': '&backepsilon;', desc: 'GREEK REVERSED LUNATE EPSILON SYMBOL' }
      ]
    },
    {
      title: 'Cyrillic',
      char: '&#x400',
      list: [
        { 'char': '&#x400', desc: 'CYRILLIC CAPITAL LETTER IE WITH GRAVE' },
        { 'char': '&#x401', desc: 'CYRILLIC CAPITAL LETTER IO' },
        { 'char': '&#x402', desc: 'CYRILLIC CAPITAL LETTER DJE' },
        { 'char': '&#x403', desc: 'CYRILLIC CAPITAL LETTER GJE' },
        { 'char': '&#x404', desc: 'CYRILLIC CAPITAL LETTER UKRAINIAN IE' },
        { 'char': '&#x405', desc: 'CYRILLIC CAPITAL LETTER DZE' },
        { 'char': '&#x406', desc: 'CYRILLIC CAPITAL LETTER BYELORUSSIAN-UKRAINIAN I' },
        { 'char': '&#x407', desc: 'CYRILLIC CAPITAL LETTER YI' },
        { 'char': '&#x408', desc: 'CYRILLIC CAPITAL LETTER JE' },
        { 'char': '&#x409', desc: 'CYRILLIC CAPITAL LETTER LJE' },
        { 'char': '&#x40A', desc: 'CYRILLIC CAPITAL LETTER NJE' },
        { 'char': '&#x40B', desc: 'CYRILLIC CAPITAL LETTER TSHE' },
        { 'char': '&#x40C', desc: 'CYRILLIC CAPITAL LETTER KJE' },
        { 'char': '&#x40D', desc: 'CYRILLIC CAPITAL LETTER I WITH GRAVE' },
        { 'char': '&#x40E', desc: 'CYRILLIC CAPITAL LETTER SHORT U' },
        { 'char': '&#x40F', desc: 'CYRILLIC CAPITAL LETTER DZHE' },
        { 'char': '&#x410', desc: 'CYRILLIC CAPITAL LETTER A' },
        { 'char': '&#x411', desc: 'CYRILLIC CAPITAL LETTER BE' },
        { 'char': '&#x412', desc: 'CYRILLIC CAPITAL LETTER VE' },
        { 'char': '&#x413', desc: 'CYRILLIC CAPITAL LETTER GHE' },
        { 'char': '&#x414', desc: 'CYRILLIC CAPITAL LETTER DE' },
        { 'char': '&#x415', desc: 'CYRILLIC CAPITAL LETTER IE' },
        { 'char': '&#x416', desc: 'CYRILLIC CAPITAL LETTER ZHE' },
        { 'char': '&#x417', desc: 'CYRILLIC CAPITAL LETTER ZE' },
        { 'char': '&#x418', desc: 'CYRILLIC CAPITAL LETTER I' },
        { 'char': '&#x419', desc: 'CYRILLIC CAPITAL LETTER SHORT I' },
        { 'char': '&#x41A', desc: 'CYRILLIC CAPITAL LETTER KA' },
        { 'char': '&#x41B', desc: 'CYRILLIC CAPITAL LETTER EL' },
        { 'char': '&#x41C', desc: 'CYRILLIC CAPITAL LETTER EM' },
        { 'char': '&#x41D', desc: 'CYRILLIC CAPITAL LETTER EN' },
        { 'char': '&#x41E', desc: 'CYRILLIC CAPITAL LETTER O' },
        { 'char': '&#x41F', desc: 'CYRILLIC CAPITAL LETTER PE' },
        { 'char': '&#x420', desc: 'CYRILLIC CAPITAL LETTER ER' },
        { 'char': '&#x421', desc: 'CYRILLIC CAPITAL LETTER ES' },
        { 'char': '&#x422', desc: 'CYRILLIC CAPITAL LETTER TE' },
        { 'char': '&#x423', desc: 'CYRILLIC CAPITAL LETTER U' },
        { 'char': '&#x424', desc: 'CYRILLIC CAPITAL LETTER EF' },
        { 'char': '&#x425', desc: 'CYRILLIC CAPITAL LETTER HA' },
        { 'char': '&#x426', desc: 'CYRILLIC CAPITAL LETTER TSE' },
        { 'char': '&#x427', desc: 'CYRILLIC CAPITAL LETTER CHE' },
        { 'char': '&#x428', desc: 'CYRILLIC CAPITAL LETTER SHA' },
        { 'char': '&#x429', desc: 'CYRILLIC CAPITAL LETTER SHCHA' },
        { 'char': '&#x42A', desc: 'CYRILLIC CAPITAL LETTER HARD SIGN' },
        { 'char': '&#x42B', desc: 'CYRILLIC CAPITAL LETTER YERU' },
        { 'char': '&#x42C', desc: 'CYRILLIC CAPITAL LETTER SOFT SIGN' },
        { 'char': '&#x42D', desc: 'CYRILLIC CAPITAL LETTER E' },
        { 'char': '&#x42E', desc: 'CYRILLIC CAPITAL LETTER YU' },
        { 'char': '&#x42F', desc: 'CYRILLIC CAPITAL LETTER YA' },
        { 'char': '&#x430', desc: 'CYRILLIC SMALL LETTER A' },
        { 'char': '&#x431', desc: 'CYRILLIC SMALL LETTER BE' },
        { 'char': '&#x432', desc: 'CYRILLIC SMALL LETTER VE' },
        { 'char': '&#x433', desc: 'CYRILLIC SMALL LETTER GHE' },
        { 'char': '&#x434', desc: 'CYRILLIC SMALL LETTER DE' },
        { 'char': '&#x435', desc: 'CYRILLIC SMALL LETTER IE' },
        { 'char': '&#x436', desc: 'CYRILLIC SMALL LETTER ZHE' },
        { 'char': '&#x437', desc: 'CYRILLIC SMALL LETTER ZE' },
        { 'char': '&#x438', desc: 'CYRILLIC SMALL LETTER I' },
        { 'char': '&#x439', desc: 'CYRILLIC SMALL LETTER SHORT I' },
        { 'char': '&#x43A', desc: 'CYRILLIC SMALL LETTER KA' },
        { 'char': '&#x43B', desc: 'CYRILLIC SMALL LETTER EL' },
        { 'char': '&#x43C', desc: 'CYRILLIC SMALL LETTER EM' },
        { 'char': '&#x43D', desc: 'CYRILLIC SMALL LETTER EN' },
        { 'char': '&#x43E', desc: 'CYRILLIC SMALL LETTER O' },
        { 'char': '&#x43F', desc: 'CYRILLIC SMALL LETTER PE' },
        { 'char': '&#x440', desc: 'CYRILLIC SMALL LETTER ER' },
        { 'char': '&#x441', desc: 'CYRILLIC SMALL LETTER ES' },
        { 'char': '&#x442', desc: 'CYRILLIC SMALL LETTER TE' },
        { 'char': '&#x443', desc: 'CYRILLIC SMALL LETTER U' },
        { 'char': '&#x444', desc: 'CYRILLIC SMALL LETTER EF' },
        { 'char': '&#x445', desc: 'CYRILLIC SMALL LETTER HA' },
        { 'char': '&#x446', desc: 'CYRILLIC SMALL LETTER TSE' },
        { 'char': '&#x447', desc: 'CYRILLIC SMALL LETTER CHE' },
        { 'char': '&#x448', desc: 'CYRILLIC SMALL LETTER SHA' },
        { 'char': '&#x449', desc: 'CYRILLIC SMALL LETTER SHCHA' },
        { 'char': '&#x44A', desc: 'CYRILLIC SMALL LETTER HARD SIGN' },
        { 'char': '&#x44B', desc: 'CYRILLIC SMALL LETTER YERU' },
        { 'char': '&#x44C', desc: 'CYRILLIC SMALL LETTER SOFT SIGN' },
        { 'char': '&#x44D', desc: 'CYRILLIC SMALL LETTER E' },
        { 'char': '&#x44E', desc: 'CYRILLIC SMALL LETTER YU' },
        { 'char': '&#x44F', desc: 'CYRILLIC SMALL LETTER YA' },
        { 'char': '&#x450', desc: 'CYRILLIC SMALL LETTER IE WITH GRAVE' },
        { 'char': '&#x451', desc: 'CYRILLIC SMALL LETTER IO' },
        { 'char': '&#x452', desc: 'CYRILLIC SMALL LETTER DJE' },
        { 'char': '&#x453', desc: 'CYRILLIC SMALL LETTER GJE' },
        { 'char': '&#x454', desc: 'CYRILLIC SMALL LETTER UKRAINIAN IE' },
        { 'char': '&#x455', desc: 'CYRILLIC SMALL LETTER DZE' },
        { 'char': '&#x456', desc: 'CYRILLIC SMALL LETTER BYELORUSSIAN-UKRAINIAN I' },
        { 'char': '&#x457', desc: 'CYRILLIC SMALL LETTER YI' },
        { 'char': '&#x458', desc: 'CYRILLIC SMALL LETTER JE' },
        { 'char': '&#x459', desc: 'CYRILLIC SMALL LETTER LJE' },
        { 'char': '&#x45A', desc: 'CYRILLIC SMALL LETTER NJE' },
        { 'char': '&#x45B', desc: 'CYRILLIC SMALL LETTER TSHE' },
        { 'char': '&#x45C', desc: 'CYRILLIC SMALL LETTER KJE' },
        { 'char': '&#x45D', desc: 'CYRILLIC SMALL LETTER I WITH GRAVE' },
        { 'char': '&#x45E', desc: 'CYRILLIC SMALL LETTER SHORT U' },
        { 'char': '&#x45F', desc: 'CYRILLIC SMALL LETTER DZHE' }
      ]
    },
    {
      title: 'Punctuation',
      char: '&ndash;',
      list: [
        { 'char': '&ndash;', desc: 'EN DASH' },
        { 'char': '&mdash;', desc: 'EM DASH' },
        { 'char': '&lsquo;', desc: 'LEFT SINGLE QUOTATION MARK' },
        { 'char': '&rsquo;', desc: 'RIGHT SINGLE QUOTATION MARK' },
        { 'char': '&sbquo;', desc: 'SINGLE LOW-9 QUOTATION MARK' },
        { 'char': '&ldquo;', desc: 'LEFT DOUBLE QUOTATION MARK' },
        { 'char': '&rdquo;', desc: 'RIGHT DOUBLE QUOTATION MARK' },
        { 'char': '&bdquo;', desc: 'DOUBLE LOW-9 QUOTATION MARK' },
        { 'char': '&dagger;', desc: 'DAGGER' },
        { 'char': '&Dagger;', desc: 'DOUBLE DAGGER' },
        { 'char': '&bull;', desc: 'BULLET' },
        { 'char': '&hellip;', desc: 'HORIZONTAL ELLIPSIS' },
        { 'char': '&permil;', desc: 'PER MILLE SIGN' },
        { 'char': '&prime;', desc: 'PRIME' },
        { 'char': '&Prime;', desc: 'DOUBLE PRIME' },
        { 'char': '&lsaquo;', desc: 'SINGLE LEFT-POINTING ANGLE QUOTATION MARK' },
        { 'char': '&rsaquo;', desc: 'SINGLE RIGHT-POINTING ANGLE QUOTATION MARK' },
        { 'char': '&oline;', desc: 'OVERLINE' },
        { 'char': '&frasl;', desc: 'FRACTION SLASH' }
      ]
    },
    {
      title: 'Currency',
      char: '&#x20A0',
      list: [
        { 'char': '&#x20A0', desc: 'EURO-CURRENCY SIGN' },
        { 'char': '&#x20A1', desc: 'COLON SIGN' },
        { 'char': '&#x20A2', desc: 'CRUZEIRO SIGN' },
        { 'char': '&#x20A3', desc: 'FRENCH FRANC SIGN' },
        { 'char': '&#x20A4', desc: 'LIRA SIGN' },
        { 'char': '&#x20A5', desc: 'MILL SIGN' },
        { 'char': '&#x20A6', desc: 'NAIRA SIGN' },
        { 'char': '&#x20A7', desc: 'PESETA SIGN' },
        { 'char': '&#x20A8', desc: 'RUPEE SIGN' },
        { 'char': '&#x20A9', desc: 'WON SIGN' },
        { 'char': '&#x20AA', desc: 'NEW SHEQEL SIGN' },
        { 'char': '&#x20AB', desc: 'DONG SIGN' },
        { 'char': '&#x20AC', desc: 'EURO SIGN' },
        { 'char': '&#x20AD', desc: 'KIP SIGN' },
        { 'char': '&#x20AE', desc: 'TUGRIK SIGN' },
        { 'char': '&#x20AF', desc: 'DRACHMA SIGN' },
        { 'char': '&#x20B0', desc: 'GERMAN PENNY SYMBOL' },
        { 'char': '&#x20B1', desc: 'PESO SIGN' },
        { 'char': '&#x20B2', desc: 'GUARANI SIGN' },
        { 'char': '&#x20B3', desc: 'AUSTRAL SIGN' },
        { 'char': '&#x20B4', desc: 'HRYVNIA SIGN' },
        { 'char': '&#x20B5', desc: 'CEDI SIGN' },
        { 'char': '&#x20B6', desc: 'LIVRE TOURNOIS SIGN' },
        { 'char': '&#x20B7', desc: 'SPESMILO SIGN' },
        { 'char': '&#x20B8', desc: 'TENGE SIGN' },
        { 'char': '&#x20B9', desc: 'INDIAN RUPEE SIGN' }
      ]
    },
    {
      title: 'Arrows',
      char: '&#x2190',
      list: [
        { 'char': '&#x2190', desc: 'LEFTWARDS ARROW' },
        { 'char': '&#x2191', desc: 'UPWARDS ARROW' },
        { 'char': '&#x2192', desc: 'RIGHTWARDS ARROW' },
        { 'char': '&#x2193', desc: 'DOWNWARDS ARROW' },
        { 'char': '&#x2194', desc: 'LEFT RIGHT ARROW' },
        { 'char': '&#x2195', desc: 'UP DOWN ARROW' },
        { 'char': '&#x2196', desc: 'NORTH WEST ARROW' },
        { 'char': '&#x2197', desc: 'NORTH EAST ARROW' },
        { 'char': '&#x2198', desc: 'SOUTH EAST ARROW' },
        { 'char': '&#x2199', desc: 'SOUTH WEST ARROW' },
        { 'char': '&#x219A', desc: 'LEFTWARDS ARROW WITH STROKE' },
        { 'char': '&#x219B', desc: 'RIGHTWARDS ARROW WITH STROKE' },
        { 'char': '&#x219C', desc: 'LEFTWARDS WAVE ARROW' },
        { 'char': '&#x219D', desc: 'RIGHTWARDS WAVE ARROW' },
        { 'char': '&#x219E', desc: 'LEFTWARDS TWO HEADED ARROW' },
        { 'char': '&#x219F', desc: 'UPWARDS TWO HEADED ARROW' },
        { 'char': '&#x21A0', desc: 'RIGHTWARDS TWO HEADED ARROW' },
        { 'char': '&#x21A1', desc: 'DOWNWARDS TWO HEADED ARROW' },
        { 'char': '&#x21A2', desc: 'LEFTWARDS ARROW WITH TAIL' },
        { 'char': '&#x21A3', desc: 'RIGHTWARDS ARROW WITH TAIL' },
        { 'char': '&#x21A4', desc: 'LEFTWARDS ARROW FROM BAR' },
        { 'char': '&#x21A5', desc: 'UPWARDS ARROW FROM BAR' },
        { 'char': '&#x21A6', desc: 'RIGHTWARDS ARROW FROM BAR' },
        { 'char': '&#x21A7', desc: 'DOWNWARDS ARROW FROM BAR' },
        { 'char': '&#x21A8', desc: 'UP DOWN ARROW WITH BASE' },
        { 'char': '&#x21A9', desc: 'LEFTWARDS ARROW WITH HOOK' },
        { 'char': '&#x21AA', desc: 'RIGHTWARDS ARROW WITH HOOK' },
        { 'char': '&#x21AB', desc: 'LEFTWARDS ARROW WITH LOOP' },
        { 'char': '&#x21AC', desc: 'RIGHTWARDS ARROW WITH LOOP' },
        { 'char': '&#x21AD', desc: 'LEFT RIGHT WAVE ARROW' },
        { 'char': '&#x21AE', desc: 'LEFT RIGHT ARROW WITH STROKE' },
        { 'char': '&#x21AF', desc: 'DOWNWARDS ZIGZAG ARROW' },
        { 'char': '&#x21B0', desc: 'UPWARDS ARROW WITH TIP LEFTWARDS' },
        { 'char': '&#x21B1', desc: 'UPWARDS ARROW WITH TIP RIGHTWARDS' },
        { 'char': '&#x21B2', desc: 'DOWNWARDS ARROW WITH TIP LEFTWARDS' },
        { 'char': '&#x21B3', desc: 'DOWNWARDS ARROW WITH TIP RIGHTWARDS' },
        { 'char': '&#x21B4', desc: 'RIGHTWARDS ARROW WITH CORNER DOWNWARDS' },
        { 'char': '&#x21B5', desc: 'DOWNWARDS ARROW WITH CORNER LEFTWARDS' },
        { 'char': '&#x21B6', desc: 'ANTICLOCKWISE TOP SEMICIRCLE ARROW' },
        { 'char': '&#x21B7', desc: 'CLOCKWISE TOP SEMICIRCLE ARROW' },
        { 'char': '&#x21B8', desc: 'NORTH WEST ARROW TO LONG BAR' },
        { 'char': '&#x21B9', desc: 'LEFTWARDS ARROW TO BAR OVER RIGHTWARDS ARROW TO BAR' },
        { 'char': '&#x21BA', desc: 'ANTICLOCKWISE OPEN CIRCLE ARROW' },
        { 'char': '&#x21BB', desc: 'CLOCKWISE OPEN CIRCLE ARROW' },
        { 'char': '&#x21BC', desc: 'LEFTWARDS HARPOON WITH BARB UPWARDS' },
        { 'char': '&#x21BD', desc: 'LEFTWARDS HARPOON WITH BARB DOWNWARDS' },
        { 'char': '&#x21BE', desc: 'UPWARDS HARPOON WITH BARB RIGHTWARDS' },
        { 'char': '&#x21BF', desc: 'UPWARDS HARPOON WITH BARB LEFTWARDS' },
        { 'char': '&#x21C0', desc: 'RIGHTWARDS HARPOON WITH BARB UPWARDS' },
        { 'char': '&#x21C1', desc: 'RIGHTWARDS HARPOON WITH BARB DOWNWARDS' },
        { 'char': '&#x21C2', desc: 'DOWNWARDS HARPOON WITH BARB RIGHTWARDS' },
        { 'char': '&#x21C3', desc: 'DOWNWARDS HARPOON WITH BARB LEFTWARDS' },
        { 'char': '&#x21C4', desc: 'RIGHTWARDS ARROW OVER LEFTWARDS ARROW' },
        { 'char': '&#x21C5', desc: 'UPWARDS ARROW LEFTWARDS OF DOWNWARDS ARROW' },
        { 'char': '&#x21C6', desc: 'LEFTWARDS ARROW OVER RIGHTWARDS ARROW' },
        { 'char': '&#x21C7', desc: 'LEFTWARDS PAIRED ARROWS' },
        { 'char': '&#x21C8', desc: 'UPWARDS PAIRED ARROWS' },
        { 'char': '&#x21C9', desc: 'RIGHTWARDS PAIRED ARROWS' },
        { 'char': '&#x21CA', desc: 'DOWNWARDS PAIRED ARROWS' },
        { 'char': '&#x21CB', desc: 'LEFTWARDS HARPOON OVER RIGHTWARDS HARPOON' },
        { 'char': '&#x21CC', desc: 'RIGHTWARDS HARPOON OVER LEFTWARDS HARPOON' },
        { 'char': '&#x21CD', desc: 'LEFTWARDS DOUBLE ARROW WITH STROKE' },
        { 'char': '&#x21CE', desc: 'LEFT RIGHT DOUBLE ARROW WITH STROKE' },
        { 'char': '&#x21CF', desc: 'RIGHTWARDS DOUBLE ARROW WITH STROKE' },
        { 'char': '&#x21D0', desc: 'LEFTWARDS DOUBLE ARROW' },
        { 'char': '&#x21D1', desc: 'UPWARDS DOUBLE ARROW' },
        { 'char': '&#x21D2', desc: 'RIGHTWARDS DOUBLE ARROW' },
        { 'char': '&#x21D3', desc: 'DOWNWARDS DOUBLE ARROW' },
        { 'char': '&#x21D4', desc: 'LEFT RIGHT DOUBLE ARROW' },
        { 'char': '&#x21D5', desc: 'UP DOWN DOUBLE ARROW' },
        { 'char': '&#x21D6', desc: 'NORTH WEST DOUBLE ARROW' },
        { 'char': '&#x21D7', desc: 'NORTH EAST DOUBLE ARROW' },
        { 'char': '&#x21D8', desc: 'SOUTH EAST DOUBLE ARROW' },
        { 'char': '&#x21D9', desc: 'SOUTH WEST DOUBLE ARROW' },
        { 'char': '&#x21DA', desc: 'LEFTWARDS TRIPLE ARROW' },
        { 'char': '&#x21DB', desc: 'RIGHTWARDS TRIPLE ARROW' },
        { 'char': '&#x21DC', desc: 'LEFTWARDS SQUIGGLE ARROW' },
        { 'char': '&#x21DD', desc: 'RIGHTWARDS SQUIGGLE ARROW' },
        { 'char': '&#x21DE', desc: 'UPWARDS ARROW WITH DOUBLE STROKE' },
        { 'char': '&#x21DF', desc: 'DOWNWARDS ARROW WITH DOUBLE STROKE' },
        { 'char': '&#x21E0', desc: 'LEFTWARDS DASHED ARROW' },
        { 'char': '&#x21E1', desc: 'UPWARDS DASHED ARROW' },
        { 'char': '&#x21E2', desc: 'RIGHTWARDS DASHED ARROW' },
        { 'char': '&#x21E3', desc: 'DOWNWARDS DASHED ARROW' },
        { 'char': '&#x21E4', desc: 'LEFTWARDS ARROW TO BAR' },
        { 'char': '&#x21E5', desc: 'RIGHTWARDS ARROW TO BAR' },
        { 'char': '&#x21E6', desc: 'LEFTWARDS WHITE ARROW' },
        { 'char': '&#x21E7', desc: 'UPWARDS WHITE ARROW' },
        { 'char': '&#x21E8', desc: 'RIGHTWARDS WHITE ARROW' },
        { 'char': '&#x21E9', desc: 'DOWNWARDS WHITE ARROW' },
        { 'char': '&#x21EA', desc: 'UPWARDS WHITE ARROW FROM BAR' },
        { 'char': '&#x21EB', desc: 'UPWARDS WHITE ARROW ON PEDESTAL' },
        { 'char': '&#x21EC', desc: 'UPWARDS WHITE ARROW ON PEDESTAL WITH HORIZONTAL BAR' },
        { 'char': '&#x21ED', desc: 'UPWARDS WHITE ARROW ON PEDESTAL WITH VERTICAL BAR' },
        { 'char': '&#x21EE', desc: 'UPWARDS WHITE DOUBLE ARROW' },
        { 'char': '&#x21EF', desc: 'UPWARDS WHITE DOUBLE ARROW ON PEDESTAL' },
        { 'char': '&#x21F0', desc: 'RIGHTWARDS WHITE ARROW FROM WALL' },
        { 'char': '&#x21F1', desc: 'NORTH WEST ARROW TO CORNER' },
        { 'char': '&#x21F2', desc: 'SOUTH EAST ARROW TO CORNER' },
        { 'char': '&#x21F3', desc: 'UP DOWN WHITE ARROW' },
        { 'char': '&#x21F4', desc: 'RIGHT ARROW WITH SMALL CIRCLE' },
        { 'char': '&#x21F5', desc: 'DOWNWARDS ARROW LEFTWARDS OF UPWARDS ARROW' },
        { 'char': '&#x21F6', desc: 'THREE RIGHTWARDS ARROWS' },
        { 'char': '&#x21F7', desc: 'LEFTWARDS ARROW WITH VERTICAL STROKE' },
        { 'char': '&#x21F8', desc: 'RIGHTWARDS ARROW WITH VERTICAL STROKE' },
        { 'char': '&#x21F9', desc: 'LEFT RIGHT ARROW WITH VERTICAL STROKE' },
        { 'char': '&#x21FA', desc: 'LEFTWARDS ARROW WITH DOUBLE VERTICAL STROKE' },
        { 'char': '&#x21FB', desc: 'RIGHTWARDS ARROW WITH DOUBLE VERTICAL STROKE' },
        { 'char': '&#x21FC', desc: 'LEFT RIGHT ARROW WITH DOUBLE VERTICAL STROKE' },
        { 'char': '&#x21FD', desc: 'LEFTWARDS OPEN-HEADED ARROW' },
        { 'char': '&#x21FE', desc: 'RIGHTWARDS OPEN-HEADED ARROW' },
        { 'char': '&#x21FF', desc: 'LEFT RIGHT OPEN-HEADED ARROW' }
      ]
    },
    {
      title: 'Math',
      char: '&forall;',
      list: [
        { 'char': '&forall;', desc: 'FOR ALL' },
        { 'char': '&part;', desc: 'PARTIAL DIFFERENTIAL' },
        { 'char': '&exist;', desc: 'THERE EXISTS' },
        { 'char': '&empty;', desc: 'EMPTY SET' },
        { 'char': '&nabla;', desc: 'NABLA' },
        { 'char': '&isin;', desc: 'ELEMENT OF' },
        { 'char': '&notin;', desc: 'NOT AN ELEMENT OF' },
        { 'char': '&ni;', desc: 'CONTAINS AS MEMBER' },
        { 'char': '&prod;', desc: 'N-ARY PRODUCT' },
        { 'char': '&sum;', desc: 'N-ARY SUMMATION' },
        { 'char': '&minus;', desc: 'MINUS SIGN' },
        { 'char': '&lowast;', desc: 'ASTERISK OPERATOR' },
        { 'char': '&radic;', desc: 'SQUARE ROOT' },
        { 'char': '&prop;', desc: 'PROPORTIONAL TO' },
        { 'char': '&infin;', desc: 'INFINITY' },
        { 'char': '&ang;', desc: 'ANGLE' },
        { 'char': '&and;', desc: 'LOGICAL AND' },
        { 'char': '&or;', desc: 'LOGICAL OR' },
        { 'char': '&cap;', desc: 'INTERSECTION' },
        { 'char': '&cup;', desc: 'UNION' },
        { 'char': '&int;', desc: 'INTEGRAL' },
        { 'char': '&there4;', desc: 'THEREFORE' },
        { 'char': '&sim;', desc: 'TILDE OPERATOR' },
        { 'char': '&cong;', desc: 'APPROXIMATELY EQUAL TO' },
        { 'char': '&asymp;', desc: 'ALMOST EQUAL TO' },
        { 'char': '&ne;', desc: 'NOT EQUAL TO' },
        { 'char': '&equiv;', desc: 'IDENTICAL TO' },
        { 'char': '&le;', desc: 'LESS-THAN OR EQUAL TO' },
        { 'char': '&ge;', desc: 'GREATER-THAN OR EQUAL TO' },
        { 'char': '&sub;', desc: 'SUBSET OF' },
        { 'char': '&sup;', desc: 'SUPERSET OF' },
        { 'char': '&nsub;', desc: 'NOT A SUBSET OF' },
        { 'char': '&sube;', desc: 'SUBSET OF OR EQUAL TO' },
        { 'char': '&supe;', desc: 'SUPERSET OF OR EQUAL TO' },
        { 'char': '&oplus;', desc: 'CIRCLED PLUS' },
        { 'char': '&otimes;', desc: 'CIRCLED TIMES' },
        { 'char': '&perp;', desc: 'UP TACK' }
      ]
    },
    {
      title: 'Misc',
      char: '&spades;',
      list: [
        { 'char': '&spades;', desc: 'BLACK SPADE SUIT' },
        { 'char': '&clubs;', desc: 'BLACK CLUB SUIT' },
        { 'char': '&hearts;', desc: 'BLACK HEART SUIT' },
        { 'char': '&diams;', desc: 'BLACK DIAMOND SUIT' },
        { 'char': '&#x2669', desc: 'QUARTER NOTE' },
        { 'char': '&#x266A', desc: 'EIGHTH NOTE' },
        { 'char': '&#x266B', desc: 'BEAMED EIGHTH NOTES' },
        { 'char': '&#x266C', desc: 'BEAMED SIXTEENTH NOTES' },
        { 'char': '&#x266D', desc: 'MUSIC FLAT SIGN' },
        { 'char': '&#x266E', desc: 'MUSIC NATURAL SIGN' },
        { 'char': '&#x2600', desc: 'BLACK SUN WITH RAYS' },
        { 'char': '&#x2601', desc: 'CLOUD' },
        { 'char': '&#x2602', desc: 'UMBRELLA' },
        { 'char': '&#x2603', desc: 'SNOWMAN' },
        { 'char': '&#x2615', desc: 'HOT BEVERAGE' },
        { 'char': '&#x2618', desc: 'SHAMROCK' },
        { 'char': '&#x262F', desc: 'YIN YANG' },
        { 'char': '&#x2714', desc: 'HEAVY CHECK MARK' },
        { 'char': '&#x2716', desc: 'HEAVY MULTIPLICATION X' },
        { 'char': '&#x2744', desc: 'SNOWFLAKE' },
        { 'char': '&#x275B', desc: 'HEAVY SINGLE TURNED COMMA QUOTATION MARK ORNAMENT' },
        { 'char': '&#x275C', desc: 'HEAVY SINGLE COMMA QUOTATION MARK ORNAMENT' },
        { 'char': '&#x275D', desc: 'HEAVY DOUBLE TURNED COMMA QUOTATION MARK ORNAMENT' },
        { 'char': '&#x275E', desc: 'HEAVY DOUBLE COMMA QUOTATION MARK ORNAMENT' },
        { 'char': '&#x2764', desc: 'HEAVY BLACK HEART' }
      ]
    }
  ],
  specialCharButtons: ['specialCharBack', '|'],
})

Object.assign(FE.POPUP_TEMPLATES, {
  'specialCharacters': '[_BUTTONS_][_CUSTOM_LAYER_]'
})

FE.PLUGINS.specialCharacters = function (editor) {

  const { $ } = editor

  // Load categories with special characters data
  let selectedCategory = editor.opts.specialCharactersSets[0]
  let { specialCharactersSets : categories } = editor.opts
  let specialCharButtons = ''

  /** 
   * Display the special characters popup 
   */
  function _showSpecialChars() {
    let $popup = editor.popups.get('specialCharacters')

    if (!$popup) $popup = _initSpecialChars()

    if (!$popup.hasClass('fr-active')) {

      editor.popups.refresh('specialCharacters')
      editor.popups.setContainer('specialCharacters', editor.$tb)

      // Special characters popup left and top position.
      const $btn = editor.$tb.find('.fr-command[data-cmd="specialCharacters"]')
      const { left, top } = editor.button.getPosition($btn)

      editor.popups.show('specialCharacters', left, top, outerHeight)
    }
  }

  /** 
   * Initialize the special characters popup
   */
  function _initSpecialChars() {

    if (editor.opts.toolbarInline) {

      // If toolbar is inline then load special character buttons
      if (editor.opts.specialCharButtons.length > 0) {
        specialCharButtons = `<div class="fr-buttons fr-tabs">${editor.button.buildList(editor.opts.specialCharButtons)}</div>`
      }
    }

    // Template for popup
    const template = {
      buttons: specialCharButtons,
      custom_layer: _specialCharsHTML()
    }

    // Create popup.
    const $popup = editor.popups.create('specialCharacters', template)

    _addAccessibility($popup)

    return $popup
  }

  /** 
   * HTML for the special characters popup. 
   */
  function _specialCharsHTML() {
    // Create special characters html.
    return `
        <div class="fr-buttons fr-tabs fr-tabs-scroll">
          ${_renderSplCharsCategory(categories, selectedCategory)}
        </div>
        <div class="fr-icon-container fr-sc-container">
          ${_renderSpanSplCharsHtml(selectedCategory)}
        </div>`
  }

  /** 
   * Refresh the Popup 
   */
  function _refreshPopup() {
    editor.popups.get('specialCharacters').html(specialCharButtons + _specialCharsHTML())
  }

  /** 
   * Set the current selected special character category and update the popup 
   */
  function setSpecialCharacterCategory(categoryId) {
    selectedCategory = categories.filter(category => {
      return category.title === categoryId
    })[0]

    _refreshPopup()
  }

  /** 
   * Register keyboard events. 
   */
  function _addAccessibility($popup) {

    // Register popup event.
    editor.events.on('popup.tab', function (e) {
      const $focused_item = $(e.currentTarget)

      // Skip if popup is not visible or focus is elsewere.
      if (!editor.popups.isVisible('specialCharacters') || !$focused_item.is('span, a')) {
        return true
      }

      const key_code = e.which
      let status
      let index
      let $el

      // Tabbing.
      if (FE.KEYCODE.TAB == key_code) {

        // Extremities reached.
        if (($focused_item.is('span.fr-icon') && e.shiftKey) || ($focused_item.is('a') && !e.shiftKey)) {
          const $tb = $popup.find('.fr-buttons')

          // Focus back the popup's toolbar if exists.
          status = !editor.accessibility.focusToolbar($tb, (e.shiftKey ? true : false))
        }

        if (status !== false) {

          // Build elements that should be focused next.
          let $tabElements = $popup.find('span.fr-icon:focus').first().concat($popup.findVisible(' span.fr-icon').first().concat($popup.find('a')))

          if ($focused_item.is('span.fr-icon')) {
            $tabElements = $tabElements.not('span.fr-icon:not(:focus)')
          }

          // Get focused item position.
          index = $tabElements.index($focused_item)

          // Backwards.
          if (e.shiftKey) {
            index = (((index - 1) % $tabElements.length) + $tabElements.length) % $tabElements.length

            // Javascript negative modulo bug.
            // Forward.
          }
          else {
            index = (index + 1) % $tabElements.length
          }

          // Find next element to focus.
          $el = $tabElements.get(index)

          editor.events.disableBlur()
          $el.focus()
          status = false
        }
      }

      // Arrows.
      else if (FE.KEYCODE.ARROW_UP == key_code || FE.KEYCODE.ARROW_DOWN == key_code || FE.KEYCODE.ARROW_LEFT == key_code || FE.KEYCODE.ARROW_RIGHT == key_code) {
        if ($focused_item.is('span.fr-icon')) {

          // Get all current icons.
          const $icons = $focused_item.parent().find('span.fr-icon')

          // Get focused item position.
          index = $icons.index($focused_item)

          // Get icons matrix dimensions.
          const columns = 11
          const lines = Math.floor($icons.length / columns)

          // Get focused item coordinates.
          const column = index % columns
          const line = Math.floor(index / columns)

          let nextIndex = line * columns + column
          const dimension = lines * columns

          // Calculate next index. Go to the other opposite site of the matrix if there is no next adjacent element.
          // Up/Down: Traverse matrix lines.
          // Left/Right: Traverse the matrix as it is a vector.
          if (FE.KEYCODE.ARROW_UP == key_code) {
            nextIndex = (((nextIndex - columns) % dimension) + dimension) % dimension // Javascript negative modulo bug.
          }
          else if (FE.KEYCODE.ARROW_DOWN == key_code) {
            nextIndex = (nextIndex + columns) % dimension
          }
          else if (FE.KEYCODE.ARROW_LEFT == key_code) {
            nextIndex = (((nextIndex - 1) % dimension) + dimension) % dimension // Javascript negative modulo bug.
          }
          else if (FE.KEYCODE.ARROW_RIGHT == key_code) {
            nextIndex = (nextIndex + 1) % dimension
          }

          // Get the next element based on the new index.
          $el = $($icons.get(nextIndex))

          // Focus.
          editor.events.disableBlur()
          $el.focus()

          status = false
        }
      }

      // ENTER or SPACE.
      else if (FE.KEYCODE.ENTER == key_code) {
        if ($focused_item.is('a')) {
          $focused_item[0].click()
        }
        else {
          editor.button.exec($focused_item)
        }
        status = false
      }

      // Prevent propagation.
      if (status === false) {
        e.preventDefault()
        e.stopPropagation()
      }

      return status
    }, true)
  }

  /**
   * Render special characters category and update the popup
   */
  function _renderSplCharsCategory(categories, selectedCategory) {
    let buttonHtml = ''
    
    categories.forEach(category => {
      const buttonMap = {
        elementClass: category.title === selectedCategory.title ? 'fr-active fr-active-tab' : '',
        title: category.title,
        dataParam1: category.title,
        desc: category.char
      }

      buttonHtml += `<button class="fr-command fr-btn fr-special-character-category ${buttonMap.elementClass}" title="${buttonMap.title}" data-cmd="setSpecialCharacterCategory" data-param1="${buttonMap.dataParam1}"><span>${buttonMap.desc}</span></button>`
    })
    
    return buttonHtml
  }

  /**
   * Render special character
   */
  function _renderSpanSplCharsHtml(selectedCategory) {
    let splChars_html = ''
    
    let i = 0
    selectedCategory.list.forEach(splChar => {
      
      const splCharMap = { dataParam1: splChar.char, title: splChar.desc, splCharValue: splChar.char }
      
      splChars_html += `<span class="fr-command fr-special-character fr-icon" role="button" 
      data-cmd="insertSpecialCharacter" data-param1="${splCharMap.dataParam1}" 
      title="${splCharMap.title}">${splCharMap.splCharValue}</span>`
      i++
    })
    
    return splChars_html
  }

   /*
    * Go back to the inline editor.
  */
 function back() {
  editor.popups.hide('specialCharacters')
  editor.toolbar.showInline()
}

  return {
    setSpecialCharacterCategory: setSpecialCharacterCategory,
    showSpecialCharsPopup: _showSpecialChars,
    back: back
  }
}

FE.DefineIcon('specialCharacters', { NAME: 'dollar-sign', SVG_KEY: 'symbols' })

FE.RegisterCommand('specialCharacters', {
  title: 'Special Characters',
  icon: 'specialCharacters',
  undo: false,
  focus: false,
  popup: true,
  refreshAfterCallback: false,
  plugin: 'specialCharacters',
  showOnMobile: true,
  callback: function () {
    if (!this.popups.isVisible('specialCharacters')) {
      this.specialCharacters.showSpecialCharsPopup()
    } else {
      if (this.$el.find('.fr-marker')) {
        this.events.disableBlur()
        this.selection.restore()
      }

      this.popups.hide('specialCharacters')
    }
  }
})

FE.RegisterCommand('insertSpecialCharacter', {
  callback(cmd, specialCharacter) {

    // Insert special characters
    this.undo.saveStep()
    this.html.insert(specialCharacter)
    this.undo.saveStep()

    this.popups.hide('specialCharacters')
  }
})

FE.RegisterCommand('setSpecialCharacterCategory', {
  undo: false,
  focus: false,
  callback(cmd, category) {
    this.specialCharacters.setSpecialCharacterCategory(category)
  }
})

FE.DefineIcon('specialCharBack', { NAME: 'arrow-left', SVG_KEY: 'back' })
FE.RegisterCommand('specialCharBack', {
  title: 'Back',
  undo: false,
  focus: false,
  back: true,
  refreshAfterCallback: false,
  callback: function () {
    this.specialCharacters.back()
  }
})
