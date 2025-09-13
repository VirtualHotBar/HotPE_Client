import { Aria2Attrib } from './aria2';

interface HPMClass {
  class: string;
  list: Array<HPM>;
}

interface HPM {
  fileName: string;
  size: number;
  name: string;
  maker: string;
  version: string;
  description: string;
  time: Date;
  dlLink?: string;
  state?: 'without' | 'downloading' | 'installed';
}

interface HPMDl {
  HPMInfo: HPM;
  taskId: string; // 替换 dlClass 为 taskId
  dlInfo: Aria2Attrib;
}

interface HPMDLRenderType {
  callRefreshPage: Function;
  callRefreshNav: Function;
  callRefreshResult: Function; //任务结束时更新
  callRefreshDlTab: Array<Function>;
}

export { HPMClass, HPM, HPMDl, HPMDLRenderType };
