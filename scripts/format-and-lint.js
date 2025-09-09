/**
 * 代码格式化和质量检查脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 检查必要的工具是否安装
 */
function checkTools() {
  log('cyan', '🔍 检查开发工具...');
  
  const tools = [
    { name: 'TypeScript', command: 'npx tsc --version' },
    { name: 'ESLint', command: 'npx eslint --version' },
    { name: 'Prettier', command: 'npx prettier --version' },
  ];

  for (const tool of tools) {
    try {
      execSync(tool.command, { stdio: 'pipe' });
      log('green', `✅ ${tool.name} 已安装`);
    } catch (error) {
      log('red', `❌ ${tool.name} 未安装或配置错误`);
      return false;
    }
  }
  
  return true;
}

/**
 * 格式化代码
 */
function formatCode() {
  log('cyan', '🎨 格式化代码...');
  
  try {
    // 使用 Prettier 格式化
    execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}"', {
      stdio: 'inherit'
    });
    log('green', '✅ 代码格式化完成');
    return true;
  } catch (error) {
    log('red', '❌ 代码格式化失败');
    return false;
  }
}

/**
 * 运行 ESLint 检查
 */
function runESLint(fix = false) {
  log('cyan', '🔍 运行 ESLint 检查...');
  
  try {
    const command = fix 
      ? 'npx eslint src --ext .ts,.tsx --fix'
      : 'npx eslint src --ext .ts,.tsx';
    
    execSync(command, { stdio: 'inherit' });
    log('green', '✅ ESLint 检查通过');
    return true;
  } catch (error) {
    log('red', '❌ ESLint 检查发现问题');
    return false;
  }
}

/**
 * 运行 TypeScript 类型检查
 */
function runTypeCheck() {
  log('cyan', '🔍 运行 TypeScript 类型检查...');
  
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    log('green', '✅ TypeScript 类型检查通过');
    return true;
  } catch (error) {
    log('red', '❌ TypeScript 类型检查失败');
    return false;
  }
}

/**
 * 检查代码复杂度
 */
function checkComplexity() {
  log('cyan', '🔍 检查代码复杂度...');
  
  // 这里可以集成复杂度检查工具
  // 暂时跳过
  log('yellow', '⚠️  代码复杂度检查已跳过（需要配置工具）');
  return true;
}

/**
 * 生成代码质量报告
 */
function generateReport() {
  log('cyan', '📊 生成代码质量报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      formatting: false,
      eslint: false,
      typecheck: false,
      complexity: false,
    },
    summary: {
      passed: 0,
      failed: 0,
      total: 4,
    }
  };

  // 运行各项检查
  report.checks.formatting = formatCode();
  report.checks.eslint = runESLint(true); // 自动修复
  report.checks.typecheck = runTypeCheck();
  report.checks.complexity = checkComplexity();

  // 计算统计信息
  Object.values(report.checks).forEach(passed => {
    if (passed) {
      report.summary.passed++;
    } else {
      report.summary.failed++;
    }
  });

  // 保存报告
  const reportPath = path.join(__dirname, '..', 'quality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // 显示结果
  log('cyan', '\n📋 代码质量报告:');
  console.log(`  通过: ${report.summary.passed}/${report.summary.total}`);
  console.log(`  失败: ${report.summary.failed}/${report.summary.total}`);
  console.log(`  成功率: ${Math.round(report.summary.passed / report.summary.total * 100)}%`);
  
  if (report.summary.failed === 0) {
    log('green', '\n🎉 所有检查都通过了！');
  } else {
    log('red', '\n❌ 存在需要修复的问题');
  }

  log('blue', `\n📄 详细报告已保存到: ${reportPath}`);
  
  return report.summary.failed === 0;
}

/**
 * 快速修复常见问题
 */
function quickFix() {
  log('cyan', '🔧 快速修复常见问题...');
  
  let fixed = 0;

  // 1. 格式化代码
  if (formatCode()) {
    fixed++;
  }

  // 2. 自动修复 ESLint 问题
  if (runESLint(true)) {
    fixed++;
  }

  // 3. 检查并修复常见的 TypeScript 问题
  // 这里可以添加自定义的修复逻辑

  log('green', `✅ 已修复 ${fixed} 类问题`);
  
  // 再次运行类型检查
  runTypeCheck();
}

/**
 * 预提交检查
 */
function preCommitCheck() {
  log('cyan', '🚀 运行预提交检查...');
  
  if (!checkTools()) {
    process.exit(1);
  }

  const checks = [
    { name: '代码格式化', fn: formatCode },
    { name: 'ESLint 检查', fn: () => runESLint(false) },
    { name: 'TypeScript 类型检查', fn: runTypeCheck },
  ];

  let allPassed = true;

  for (const check of checks) {
    if (!check.fn()) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    log('green', '\n🎉 预提交检查通过，可以提交代码！');
    process.exit(0);
  } else {
    log('red', '\n❌ 预提交检查失败，请修复问题后再提交');
    process.exit(1);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  log('cyan', '🛠️  代码格式化和质量检查工具');
  console.log('');
  console.log('用法: node scripts/format-and-lint.js <命令>');
  console.log('');
  console.log('可用命令:');
  console.log('  format      格式化代码');
  console.log('  lint        运行 ESLint 检查');
  console.log('  lint-fix    运行 ESLint 检查并自动修复');
  console.log('  typecheck   运行 TypeScript 类型检查');
  console.log('  report      生成完整的代码质量报告');
  console.log('  fix         快速修复常见问题');
  console.log('  pre-commit  运行预提交检查');
  console.log('  help        显示帮助信息');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/format-and-lint.js format');
  console.log('  node scripts/format-and-lint.js report');
  console.log('  node scripts/format-and-lint.js pre-commit');
}

// 主函数
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'format':
      checkTools() && formatCode();
      break;
    case 'lint':
      checkTools() && runESLint(false);
      break;
    case 'lint-fix':
      checkTools() && runESLint(true);
      break;
    case 'typecheck':
      checkTools() && runTypeCheck();
      break;
    case 'report':
      checkTools() && generateReport();
      break;
    case 'fix':
      checkTools() && quickFix();
      break;
    case 'pre-commit':
      preCommitCheck();
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
  checkTools,
  formatCode,
  runESLint,
  runTypeCheck,
  generateReport,
  quickFix,
  preCommitCheck,
};