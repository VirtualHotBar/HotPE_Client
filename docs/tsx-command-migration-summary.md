# TSX 项目命令执行系统迁移总结

## 迁移概述

已成功将项目的命令执行系统迁移到支持命令标识符的新架构，解决了多个命令并发执行时输出无法区分的问题。

## 已完成的迁移工作

### 1. 核心类型定义更新

**文件：** `src/types/command.ts`
- 新增 `CommandOutput` 接口，包含命令标识符和输出类型
- 新增 `CommandResult` 接口，扩展了原有结果结构

### 2. 主进程 IPC 处理器更新

**文件：** `src/main/ipc/command-handlers.ts`
- 为每个命令生成唯一标识符 (UUID)
- 输出消息现在包含命令标识符、数据和类型信息
- 支持 stdout、stderr 和 exit 三种输出类型

### 3. 预加载脚本更新

**文件：** `src/main/preload.ts`
- 更新 API 接口类型定义
- 命令输出监听器现在接收 `CommandOutput` 对象

### 4. 全局类型定义更新

**文件：** `src/types/global.d.ts`
- 导入新的命令类型
- 更新 ElectronAPI 接口定义

### 5. 安全 API 封装更新

**文件：** `src/view/utils/safeAPI.ts`
- 更新 `safeChildProcess` 以支持新的输出格式
- 添加兼容性方法 `onOutputLegacy`
- 更新 `compatChildProcess` 以正确处理 stdout/stderr 分离

### 6. 命令工具函数更新

**文件：** `src/view/utils/command.ts`
- 更新 `runCmd` 函数以使用新的输出格式
- 添加命令标识符过滤逻辑
- 保持向后兼容性

### 7. 新增命令服务

**文件：** `src/view/services/command-service.ts`
- 提供完整的命令执行和管理功能
- 支持同步/异步执行、批量执行、并行执行
- 提供活跃命令管理和输出监听
- 包含重试机制和超时控制

### 8. TSX 组件示例

**文件：** `src/view/components/CommandExecutor.tsx`
- 完整的 React 组件示例
- 展示如何在 TSX 中使用新的命令服务
- 包含实时输出显示、命令会话管理等功能

## 新功能特性

### 1. 命令标识符支持
- 每个命令都有唯一的 UUID 标识符
- 可以区分多个并发命令的输出
- 支持按命令 ID 取消输出监听

### 2. 输出类型分离
```typescript
interface CommandOutput {
  commandId: string;
  data: string;
  type: 'stdout' | 'stderr' | 'exit';
  code?: number;
}
```

### 3. 增强的命令服务
```typescript
// 基本执行
const result = await commandService.executeCommand('dir');

// 带回调的执行
await commandService.executeCommand('ping google.com', {
  onOutput: (output) => console.log(output.data),
  onExit: (code) => console.log(`退出码: ${code}`)
});

// 批量执行
const results = await commandService.executeBatch(['dir', 'systeminfo']);

// 并行执行
const results = await commandService.executeParallel(['ping google.com', 'ping baidu.com']);
```

### 4. 活跃命令管理
```typescript
// 获取当前活跃命令
const activeCommands = commandService.getActiveCommands();

// 取消特定命令的输出监听
commandService.cancelCommandOutput(commandId);

// 获取统计信息
const stats = commandService.getStats();
```

## 向后兼容性

### 1. 旧版本 API 仍然可用
```typescript
// 旧的方式仍然工作
import { runCmd, runCmdSync, runCmdAsync } from '../utils/command';

runCmd('dir', 
  (data) => console.log(data),
  (code) => console.log(`退出码: ${code}`)
);
```

### 2. 兼容性包装器
```typescript
// 使用兼容性方法
safeChildProcess.onOutputLegacy((data: string) => {
  console.log('兼容性输出:', data);
});
```

## 使用建议

### 1. 新项目推荐使用
```typescript
import { commandService } from '../services/command-service';

// 推荐的新方式
const result = await commandService.executeCommand('your-command', {
  onOutput: (output) => {
    if (output.type === 'stdout') {
      console.log('标准输出:', output.data);
    } else if (output.type === 'stderr') {
      console.error('错误输出:', output.data);
    }
  }
});
```

### 2. TSX 组件中的使用
```tsx
import React, { useEffect, useState } from 'react';
import { commandService } from '../services/command-service';

const MyComponent: React.FC = () => {
  const [output, setOutput] = useState<string>('');

  useEffect(() => {
    const executeCommand = async () => {
      await commandService.executeCommand('dir', {
        onOutput: (output) => {
          if (output.data.trim()) {
            setOutput(prev => prev + output.data);
          }
        }
      });
    };

    executeCommand();
  }, []);

  return <pre>{output}</pre>;
};
```

### 3. 错误处理
```typescript
try {
  const result = await commandService.executeCommand('invalid-command');
  console.log(result);
} catch (error) {
  console.error('命令执行失败:', error);
}
```

## 性能优化

### 1. 输出缓冲
- 组件中使用 `maxOutputLines` 限制输出行数
- 避免内存泄漏

### 2. 监听器管理
- 组件卸载时清理监听器
- 使用 `useCallback` 优化回调函数

### 3. 批量操作
- 使用 `executeBatch` 进行顺序执行
- 使用 `executeParallel` 进行并行执行

## 注意事项

### 1. 资源清理
```typescript
useEffect(() => {
  const listener = (output: CommandOutput) => {
    // 处理输出
  };
  
  commandService.addGlobalOutputListener(listener);
  
  return () => {
    commandService.removeGlobalOutputListener(listener);
  };
}, []);
```

### 2. 命令超时
```typescript
// 设置合适的超时时间
await commandService.executeCommand('long-running-command', {
  timeout: 300000, // 5分钟
});
```

### 3. 错误处理
```typescript
await commandService.executeCommand('command', {
  onOutput: (output) => {
    if (output.type === 'stderr') {
      console.error('命令错误:', output.data);
    }
  },
  onExit: (code) => {
    if (code !== 0) {
      console.error('命令执行失败，退出码:', code);
    }
  }
});
```

## 迁移检查清单

- [x] 更新核心类型定义
- [x] 更新主进程 IPC 处理器
- [x] 更新预加载脚本
- [x] 更新全局类型定义
- [x] 更新安全 API 封装
- [x] 更新命令工具函数
- [x] 创建新的命令服务
- [x] 创建 TSX 组件示例
- [x] 保持向后兼容性
- [x] 编写文档和示例

## 后续工作建议

1. **逐步迁移现有代码**：将现有的命令执行代码逐步迁移到新的 API
2. **添加单元测试**：为新的命令服务添加完整的测试覆盖
3. **性能监控**：添加命令执行性能监控和日志记录
4. **用户界面优化**：基于新的命令服务优化用户界面体验

迁移已完成，新的命令执行系统现在可以正确区分多个并发命令的输出，并提供了更强大的命令管理功能。