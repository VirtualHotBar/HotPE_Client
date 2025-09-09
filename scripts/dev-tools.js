/**
 * 开发工具脚本 - 提供各种开发辅助功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出工具
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

/**
 * 分析项目结构
 */
function analyzeProject() {
  colorLog('cyan', '🔍 分析项目结构...');
  
  const stats = {
    totalFiles: 0,
    totalLines: 0,
    fileTypes: {},
    directories: [],
  };

  function analyzeDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          stats.directories.push(path.join(relativePath, item));
          analyzeDirectory(fullPath, path.join(relativePath, item));
        }
      } else {
        const ext = path.extname(item);
        stats.totalFiles++;
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
        
        // 计算代码行数
        if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            stats.totalLines += content.split('\n').length;
          } catch (error) {
            // 忽略读取错误
          }
        }
      }
    }
  }

  analyzeDirectory(SRC_DIR);
  
  colorLog('green', '📊 项目分析结果:');
  console.log(`  总文件数: ${stats.totalFiles}`);
  console.log(`  总代码行数: ${stats.totalLines}`);
  console.log(`  目录数: ${stats.directories.length}`);
  console.log('  文件类型分布:');
  
  Object.entries(stats.fileTypes)
    .sort(([,a], [,b]) => b - a)
    .forEach(([ext, count]) => {
      console.log(`    ${ext || '无扩展名'}: ${count} 个文件`);
    });
}

/**
 * 检查代码质量
 */
function checkCodeQuality() {
  colorLog('cyan', '🔍 检查代码质量...');
  
  try {
    // TypeScript 类型检查
    colorLog('yellow', '正在进行 TypeScript 类型检查...');
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    colorLog('green', '✅ TypeScript 类型检查通过');
  } catch (error) {
    colorLog('red', '❌ TypeScript 类型检查失败');
  }

  try {
    // ESLint 检查
    colorLog('yellow', '正在进行 ESLint 检查...');
    execSync('npx eslint src --ext .ts,.tsx', { stdio: 'inherit' });
    colorLog('green', '✅ ESLint 检查通过');
  } catch (error) {
    colorLog('red', '❌ ESLint 检查发现问题');
  }
}

/**
 * 生成组件模板
 */
function generateComponent(componentName, componentType = 'functional') {
  if (!componentName) {
    colorLog('red', '❌ 请提供组件名称');
    return;
  }

  const componentDir = path.join(SRC_DIR, 'view', 'components', componentName);
  
  if (fs.existsSync(componentDir)) {
    colorLog('red', `❌ 组件 ${componentName} 已存在`);
    return;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  // 生成组件文件
  const componentContent = componentType === 'class' ? 
    generateClassComponent(componentName) : 
    generateFunctionalComponent(componentName);
  
  fs.writeFileSync(
    path.join(componentDir, 'index.tsx'),
    componentContent
  );

  // 生成样式文件
  const styleContent = generateComponentStyles(componentName);
  fs.writeFileSync(
    path.join(componentDir, 'index.module.scss'),
    styleContent
  );

  // 生成类型定义文件
  const typeContent = generateComponentTypes(componentName);
  fs.writeFileSync(
    path.join(componentDir, 'types.ts'),
    typeContent
  );

  colorLog('green', `✅ 组件 ${componentName} 创建成功`);
  colorLog('cyan', `📁 位置: ${componentDir}`);
}

function generateFunctionalComponent(name) {
  return `/**
 * ${name} 组件
 */

import React from 'react';
import { ${name}Props } from './types';
import styles from './index.module.scss';

/**
 * ${name} 组件
 */
export default function ${name}({ className, ...props }: ${name}Props) {
  return (
    <div className={\`\${styles.container} \${className || ''}\`}>
      <h2>${name} 组件</h2>
      <p>这是一个新创建的组件</p>
    </div>
  );
}

${name}.displayName = '${name}';
`;
}

function generateClassComponent(name) {
  return `/**
 * ${name} 组件
 */

import React, { Component } from 'react';
import { ${name}Props, ${name}State } from './types';
import styles from './index.module.scss';

/**
 * ${name} 组件
 */
export default class ${name} extends Component<${name}Props, ${name}State> {
  constructor(props: ${name}Props) {
    super(props);
    
    this.state = {
      // 初始状态
    };
  }

  render() {
    const { className } = this.props;
    
    return (
      <div className={\`\${styles.container} \${className || ''}\`}>
        <h2>${name} 组件</h2>
        <p>这是一个新创建的组件</p>
      </div>
    );
  }
}
`;
}

function generateComponentStyles(name) {
  return `.container {
  /* ${name} 组件样式 */
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  
  h2 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333333;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    color: #666666;
  }
}

/* 暗色主题支持 */
:global(.theme-dark) .container {
  background-color: #1a1a1a;
  border-color: #333333;
  
  h2 {
    color: #ffffff;
  }
  
  p {
    color: #cccccc;
  }
}
`;
}

function generateComponentTypes(name) {
  return `/**
 * ${name} 组件类型定义
 */

import { ReactNode } from 'react';

// 基础属性接口
export interface ${name}Props {
  /** 自定义类名 */
  className?: string;
  /** 子元素 */
  children?: ReactNode;
  /** 其他属性 */
  [key: string]: any;
}

// 状态接口（类组件使用）
export interface ${name}State {
  // 状态属性
}
`;
}

/**
 * 清理项目
 */
function cleanProject() {
  colorLog('cyan', '🧹 清理项目...');
  
  const dirsToClean = [
    'node_modules',
    'dist',
    'build',
    '.next',
    'out',
  ];

  const filesToClean = [
    'package-lock.json',
    'yarn.lock',
    '*.log',
  ];

  dirsToClean.forEach(dir => {
    const fullPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(fullPath)) {
      colorLog('yellow', `删除目录: ${dir}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });

  colorLog('green', '✅ 项目清理完成');
}

/**
 * 构建项目
 */
function buildProject() {
  colorLog('cyan', '🔨 构建项目...');
  
  try {
    // 清理旧的构建文件
    const distDir = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }

    // 执行构建
    execSync('npm run build', { stdio: 'inherit' });
    colorLog('green', '✅ 项目构建成功');
  } catch (error) {
    colorLog('red', '❌ 项目构建失败');
    process.exit(1);
  }
}

/**
 * 运行测试
 */
function runTests() {
  colorLog('cyan', '🧪 运行测试...');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    colorLog('green', '✅ 测试通过');
  } catch (error) {
    colorLog('red', '❌ 测试失败');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  colorLog('cyan', '🛠️  HotPE Client 开发工具');
  console.log('');
  console.log('用法: node scripts/dev-tools.js <命令> [参数]');
  console.log('');
  console.log('可用命令:');
  console.log('  analyze              分析项目结构');
  console.log('  check               检查代码质量');
  console.log('  component <name>    生成组件模板');
  console.log('  clean               清理项目');
  console.log('  build               构建项目');
  console.log('  test                运行测试');
  console.log('  help                显示帮助信息');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/dev-tools.js analyze');
  console.log('  node scripts/dev-tools.js component MyButton');
  console.log('  node scripts/dev-tools.js check');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'analyze':
      analyzeProject();
      break;
    case 'check':
      checkCodeQuality();
      break;
    case 'component':
      generateComponent(args[1], args[2]);
      break;
    case 'clean':
      cleanProject();
      break;
    case 'build':
      buildProject();
      break;
    case 'test':
      runTests();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  analyzeProject,
  checkCodeQuality,
  generateComponent,
  cleanProject,
  buildProject,
  runTests,
};