/**
 * Traditional Chinese spoken in Taiwan.
 */

import FE from '../index.js'

FE.LANGUAGE['zh_tw'] = {
  translation: {
    // Place holder
    'Type something': '\u8f38\u5165\u4e00\u4e9b\u5167\u5bb9',

    // Basic formatting
    'Bold': '粗體',
    'Italic': '斜體',
    'Underline': '下劃線',
    'Strikethrough': '刪除線',

    // Main buttons
    'Insert': '插入',
    'Delete': '刪除',
    'Cancel': '取消',
    'OK': '好的',
    'Back': '後退',
    'Remove': '去掉',
    'More': '更多',
    'Update': '更新',
    'Style': '樣式',

    // Font
    'Font Family': '字体系列',
    'Font Size': '\u5b57\u578b\u5927\u5c0f',

    // Colors
    'Colors': '顏色',
    'Background': '背景',
    'Text': '文字',
    'HEX Color': '十六進制顏色',

    // Paragraphs
    'Paragraph Format': '段落格式',
    'Normal': '正常',
    'Code': '代碼',
    'Heading 1': '標題1',
    'Heading 2': '標題2',
    'Heading 3': '標題3',
    'Heading 4': '標題4',

    // Style
    'Paragraph Style': '段落樣式',
    'Inline Style': '內聯樣式',

    // Alignment
    'Align': '对齐',
    'Align Left': '左對齊',
    'Align Center': '\u7f6e\u4e2d\u5c0d\u9f4a',
    'Align Right': '\u7f6e\u53f3\u5c0d\u9f4a',
    'Align Justify': '兩端對齊',
    'None': '没有',

    // Lists
    'Ordered List': '有序列表',
    'Unordered List': '无序列表',

    // Indent
    'Decrease Indent': '減少縮進量',
    'Increase Indent': '增加縮進量',

    // Links
    'Insert Link': '\u63d2\u5165\u9023\u7d50',
    'Open in new tab': '在新標籤頁中打開',
    'Open Link': '\u958b\u555f\u9023\u7d50',
    'Edit Link': '\u7de8\u8f2f\u9023\u7d50',
    'Unlink': '\u79fb\u9664\u9023\u7d50',
    'Choose Link': '\u9078\u64c7\u9023\u7d50',

    // Images
    'Insert Image': '插入圖片',
    'Upload Image': '上傳圖片',
    'By URL': '\u7db2\u5740\u4e0a\u50b3',
    'Browse': '瀏覽',
    'Drop image': '\u5716\u7247\u62d6\u66f3',
    'or click': '或點擊',
    'Manage Images': '管理圖片',
    'Loading': '加載中',
    'Deleting': '刪除中',
    'Tags': '標籤',
    'Are you sure? Image will be deleted.': '\u78ba\u5b9a\u522a\u9664\u5716\u7247\uff1f',
    'Replace': '替換',
    'Uploading': '上傳中',
    'Loading image': '圖片加載中',
    'Display': '顯示',
    'Inline': '\u5d4c\u5165',
    'Break Text': '打破文字',
    'Alternative Text': '替換文字',
    'Change Size': '改變大小',
    'Width': '寬度',
    'Height': '高度',
    'Something went wrong. Please try again.': '發生錯誤，請重試。',
    'Image Caption': '圖片標題',
    'Advanced Edit': '高級編輯',

    // Video
    'Insert Video': '插入影片',
    'Embedded Code': '嵌入式代码',
    'Paste in a video URL': '粘貼在視頻網址',
    'Drop video': '放下視頻',
    'Your browser does not support HTML5 video.': '您的瀏覽器不支持html5視頻。',
    'Upload Video': '上傳影片',

    // Tables
    'Insert Table': '插入表格',
    'Table Header': '表頭',
    'Remove Table': '\u522a\u9664\u8868',
    'Table Style': '表格樣式',
    'Horizontal Align': '水平對齊方式',
    'Row': '行',
    'Insert row above': '在上方插入',
    'Insert row below': '在下方插入',
    'Delete row': '刪除行',
    'Column': '列',
    'Insert column before': '\u5411\u5de6\u63d2\u5165\u4e00\u5217',
    'Insert column after': '\u5411\u53f3\u63d2\u5165\u4e00\u5217',
    'Delete column': '刪除列',
    'Cell': '單元格',
    'Merge cells': '合併單元格',
    'Horizontal split': '水平分割',
    'Vertical split': '垂直分割',
    'Cell Background': '單元格背景',
    'Vertical Align': '垂直對齊方式',
    'Top': '\u4e0a',
    'Middle': '\u4e2d',
    'Bottom': '底部',
    'Align Top': '靠上對齊',
    'Align Middle': '\u4e2d\u9593\u5c0d\u9f4a',
    'Align Bottom': '靠下對齊',
    'Cell Style': '單元格樣式',

    // Files
    'Upload File': '上傳文件',
    'Drop file': '拖入文件',

    // Emoticons
    'Emoticons': '表情符號',
    'Grinning face': '\u81c9\u4e0a\u7b11\u563b\u563b',
    'Grinning face with smiling eyes': '\u7b11\u563b\u563b\u7684\u81c9\uff0c\u542b\u7b11\u7684\u773c\u775b',
    'Face with tears of joy': '\u81c9\u4e0a\u5e36\u8457\u559c\u6085\u7684\u6dda\u6c34',
    'Smiling face with open mouth': '\u7b11\u81c9\u5f35\u958b\u5634',
    'Smiling face with open mouth and smiling eyes': '\u7b11\u81c9\u5f35\u958b\u5634\u5fae\u7b11\u7684\u773c\u775b',
    'Smiling face with open mouth and cold sweat': '帶冷汗的張嘴微笑',
    'Smiling face with open mouth and tightly-closed eyes': '\u7b11\u81c9\u5f35\u958b\u5634\uff0c\u7dca\u7dca\u9589\u8457\u773c\u775b',
    'Smiling face with halo': '帶光環微笑',
    'Smiling face with horns': '帶牛角的微笑',
    'Winking face': '\u7728\u773c\u8868\u60c5',
    'Smiling face with smiling eyes': '\u9762\u5e36\u5fae\u7b11\u7684\u773c\u775b',
    'Face savoring delicious food': '\u9762\u5c0d\u54c1\u5690\u7f8e\u5473\u7684\u98df\u7269',
    'Relieved face': '如釋重負',
    'Smiling face with heart-shaped eyes': '\u5fae\u7b11\u7684\u81c9\uff0c\u5fc3\u81df\u5f62\u7684\u773c\u775b',
    'Smiling face with sunglasses': '\u7b11\u81c9\u592a\u967d\u93e1',
    'Smirking face': '\u9762\u5c0d\u9762\u5e36\u7b11\u5bb9',
    'Neutral face': '中性臉',
    'Expressionless face': '无表情的脸',
    'Unamused face': '\u4e00\u81c9\u4e0d\u5feb\u7684\u81c9',
    'Face with cold sweat': '\u9762\u5c0d\u51b7\u6c57',
    'Pensive face': '\u6c89\u601d\u7684\u81c9',
    'Confused face': '\u9762\u5c0d\u56f0\u60d1',
    'Confounded face': '\u8a72\u6b7b\u7684\u81c9',
    'Kissing face': '接吻的脸',
    'Face throwing a kiss': '扔一个吻',
    'Kissing face with smiling eyes': '带着微笑的眼睛接吻的脸',
    'Kissing face with closed eyes': '閉眼接吻',
    'Face with stuck out tongue': '舌头伸出来的脸',
    'Face with stuck out tongue and winking eye': '眨眼吐舌\'',
    'Face with stuck out tongue and tightly-closed eyes': '脸上伸出舌头和眨眼的眼睛',
    'Disappointed face': '失望',
    'Worried face': '担心的脸',
    'Angry face': '生氣的',
    'Pouting face': '撅嘴',
    'Crying face': '\u54ed\u6ce3\u7684\u81c9',
    'Persevering face': '\u600e\u5948\u81c9',
    'Face with look of triumph': '胜利的脸',
    'Disappointed but relieved face': '失望但释然的脸',
    'Frowning face with open mouth': '皺眉',
    'Anguished face': '痛苦的脸',
    'Fearful face': '害怕',
    'Weary face': '\u9762\u5c0d\u53ad\u5026',
    'Sleepy face': '困了',
    'Tired face': '累了',
    'Grimacing face': '鬼脸',
    'Loudly crying face': '大声哭泣的脸',
    'Face with open mouth': '張開嘴',
    'Hushed face': '\u5b89\u975c\u7684\u81c9',
    'Face with open mouth and cold sweat': '\u9762\u5c0d\u5f35\u958b\u5634\uff0c\u4e00\u8eab\u51b7\u6c57',
    'Face screaming in fear': '\u9762\u5c0d\u5c16\u53eb\u5728\u6050\u61fc\u4e2d',
    'Astonished face': '\u9762\u5c0d\u9a5a\u8a1d',
    'Flushed face': '臉紅',
    'Sleeping face': '\u719f\u7761\u7684\u81c9',
    'Dizzy face': '\u9762\u5c0d\u7729',
    'Face without mouth': '沒有嘴的臉',
    'Face with medical mask': '\u9762\u5c0d\u91ab\u7642\u53e3\u7f69',

    // Line breaker
    'Break': '換行',

    // Math
    'Subscript': '下標',
    'Superscript': '上標',

    // Full screen
    'Fullscreen': '全屏',

    // Horizontal line
    'Insert Horizontal Line': '插入水平線',

    // Clear formatting
    'Clear Formatting': '清除格式',

    // Save
    'Save': '保存',

    // Undo, redo
    'Undo': '撤消',
    'Redo': '重做',

    // Select all
    'Select All': '全選',

    // Code view
    'Code View': '代码视图',

    // Quote
    'Quote': '引用',
    'Increase': '\u7e2e\u6392',
    'Decrease': '\u53bb\u9664\u7e2e\u6392',

    // Quick Insert
    'Quick Insert': '快速插入',

    // Spcial Characters
    'Special Characters': '特殊字符',
    'Latin': '拉丁',
    'Greek': '希臘語',
    'Cyrillic': '西里爾',
    'Punctuation': '標點',
    'Currency': '貨幣',
    'Arrows': '箭頭',
    'Math': '數學',
    'Misc': '雜項',

    // Print.
    'Print': '列印',

    // Spell Checker.
    'Spell Checker': '拼寫檢查器',

    // Help
    'Help': '幫助',
    'Shortcuts': '快捷鍵',
    'Inline Editor': '內聯編輯器',
    'Show the editor': '顯示編輯器',
    'Common actions': '常用操作',
    'Copy': '複製',
    'Cut': '切',
    'Paste': '貼上',
    'Basic Formatting': '基本格式',
    'Increase quote level': '增加报价水平',
    'Decrease quote level': '降低报价水平',
    'Image / Video': '圖像/影片',
    'Resize larger': '調整大小更大',
    'Resize smaller': '調整大小更小',
    'Table': '表',
    'Select table cell': '選擇表單元格',
    'Extend selection one cell': '增加選中的單元格',
    'Extend selection one row': '增加選中的行',
    'Navigation': '導航',
    'Focus popup / toolbar': '焦點彈出/工具欄',
    'Return focus to previous position': '將焦點返回到上一個位置',

    // Embed.ly
    'Embed URL': '嵌入網址',
    'Paste in a URL to embed': '貼上要嵌入的網址',

    // Word Paste.
    'The pasted content is coming from a Microsoft Word document. Do you want to keep the format or clean it up?': '粘貼的內容來自微軟Word文檔。你想保留格式還是清理它？',
    'Keep': '保留',
    'Clean': '清潔',
    'Word Paste Detected': '檢測到貼上自 Word 的內容',

    // Character Counter
    'Characters': '人物',
	
	// More Buttons
    'More Text': '更多文字',
    'More Paragraph': '更多段落',
    'More Rich': '更多豐富',
    'More Misc': '更多雜項'
  },
  direction: 'ltr'
};
