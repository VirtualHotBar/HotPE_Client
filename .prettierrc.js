/**
 * Prettier 配置文件
 * 代码格式化规则配置
 */

module.exports = {
  // 基础配置
  printWidth: 100,              // 每行最大字符数
  tabWidth: 2,                  // 缩进空格数
  useTabs: false,               // 使用空格而不是制表符
  semi: true,                   // 语句末尾添加分号
  singleQuote: true,            // 使用单引号
  quoteProps: 'as-needed',      // 对象属性引号：仅在需要时添加
  
  // JSX 配置
  jsxSingleQuote: true,         // JSX 中使用单引号
  jsxBracketSameLine: false,    // JSX 标签的 > 放在新行
  
  // 尾随逗号
  trailingComma: 'es5',         // 在 ES5 中有效的尾随逗号（对象、数组等）
  
  // 括号空格
  bracketSpacing: true,         // 对象字面量的括号间添加空格
  bracketSameLine: false,       // 将多行 HTML 元素的 > 放在最后一行的末尾
  
  // 箭头函数参数
  arrowParens: 'avoid',         // 单参数箭头函数省略括号
  
  // 换行符
  endOfLine: 'lf',              // 使用 LF 换行符
  
  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',
  
  // HTML 空白敏感性
  htmlWhitespaceSensitivity: 'css',
  
  // Vue 文件中的脚本和样式标签缩进
  vueIndentScriptAndStyle: false,
  
  // 文件覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        tabWidth: 2,
      },
    },
    {
      files: '*.{css,scss,less}',
      options: {
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
        printWidth: 100,
        tabWidth: 2,
      },
    },
  ],
};