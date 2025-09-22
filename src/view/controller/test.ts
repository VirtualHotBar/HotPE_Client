import { createLogger } from '../services/logger';
import { runCmd } from '../utils/command';

const logger = createLogger('TestController');

/**
 * 简单的测试函数
 */
export async function AppTest() {
  logger.info('测试功能被调用');
  // 这里可以添加一些测试逻辑

  console.log(await runCmd('dir'));
  
  alert('测试功能已执行，请查看控制台输出');


}
