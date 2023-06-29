import React from 'react'
import ReactDOM from 'react-dom/client'
import Header_ from './layout/header.tsx'
import './index.css'

import { Layout, Nav, Button} from '@douyinfe/semi-ui';
import { IconAppCenter, IconHelpCircle, IconPaperclip ,IconHome, IconSetting} from '@douyinfe/semi-icons';


const { Header, Sider, Content } = Layout;


const root = ReactDOM.createRoot(document.querySelector('#app') as HTMLElement)


let naviItems = [
  { itemKey: 'Home', text: '首页', icon: <IconHome /> },
  {
    text: '安装',
    icon: <IconPaperclip />,
    itemKey: 'Setup',
    items: [{ itemKey: 'SetupToSys', text: '安装到系统' }, { itemKey: 'SetupToUDisk', text: '安装到U盘' }, { itemKey: 'MakeISO', text: '生成ISO镜像' }],
  },
  {
    text: '模块',
    icon: <IconAppCenter />,
    itemKey: 'HPM',
    items: [{ itemKey: 'HPMDl', text: '下载模块' }, { itemKey: 'HPMMgr', text: '模块管理' }, { itemKey: 'TaskMgr', text: '任务管理' }],
  },
  { itemKey: 'Docs', text: '文档', icon: <IconHelpCircle /> },
  { itemKey: 'Setting', text: '设置', icon:<IconSetting />}
]


root.render(
  /* Layout 布局 */
  <React.StrictMode>
    <Layout style={{ border: '1px solid var(--semi-color-border)', height: "100%", width: "100%" }}>
      <Header style={{ backgroundColor: 'var(--semi-color-bg-1)', height: "40px", width: "100%" }}>
        <Header_></Header_>
      </Header>
      <Layout>
        <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
          <Nav
            style={{ maxWidth: 170, height: '100%' }}
            defaultSelectedKeys={['Home']}
            defaultOpenKeys={['Setup','HPM']}
            items={naviItems}
            onClick={(e) => { console.log(e.itemKey) }}
            footer={{
              collapseButton: true,
            }}
          />
        </Sider>
        <Content
          style={{
            padding: '24px',
            backgroundColor: 'var(--semi-color-bg-0)',
            height: "100%"
          }}
        >

          <Button>主要按钮</Button>

        </Content>
      </Layout>

    </Layout>






  </React.StrictMode>,
)
