import { createLogger } from '../services/logger';

const logger = createLogger('TestController');

/**
 * 简单的测试函数
 */
export function AppTest() {
  logger.info('测试功能被调用');
  // 这里可以添加一些测试逻辑
  alert('测试功能已执行，请查看控制台输出');
}
