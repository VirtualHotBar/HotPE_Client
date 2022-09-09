import React,{useState} from 'react';
import { Layout } from 'antd';
import 'antd/dist/antd.css';

import './index.css';
import Topbar from './layout/topbar';
import Mainmenu from './modular/mian-menu';
import Home from './modular/homePage';

//import { Button } from 'antd';

const { Header, Content, Sider } = Layout;


export default function Mian_window() {
  //const [page,stePage] = useState (<Home type="SetOK"/>)
  const [page,stePage] = useState (<></>)

    return(
<>
<Layout style={{height:"100%"}}>
      <Header   className="header" >
      <Topbar />
      </Header>
  
      <Layout >
  
      <Sider width={145} className="Sider">
        <div style={{height:"100%"}} ><Mainmenu stePage={stePage}/></div>
      </Sider>
  
        <Layout >
          <Content className="Content" id='Content'>
          {page}

          </Content>
        </Layout>
  
      </Layout>
    </Layout>
    </>
    )
    
}



/* export  function stePage_(value: React.SetStateAction<JSX.Element>){
  stePage(value)
} */
