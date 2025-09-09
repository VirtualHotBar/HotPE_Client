/**
 * 头部组件 - 重构后的应用头部
 */

import { useState, useCallback } from 'react';
import { Nav, Button, Input } from '@douyinfe/semi-ui';
import { IconClose, IconMinus, IconSearch } from '@douyinfe/semi-icons';
import './header.css';
import { saveConfig } from '../services/config';
import { HPMSearch } from '../services/hpm';

// 组件属性类型
interface HeaderProps {
  onNavigate: (page: string) => void;
}

/**
 * 退出应用
 */
export function exitapp(): void {
  saveConfig();
  window.electronAPI.windows.exit();
}

/**
 * 最小化窗口
 */
function minimizeWindow(): void {
  window.electronAPI.windows.minimize();
}

/**
 * 头部组件
 */
export default function Header({ onNavigate }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');

  // 处理搜索输入变化
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    HPMSearch.value = value;
  }, []);

  // 处理搜索提交
  const handleSearchSubmit = useCallback(() => {
    if (HPMSearch.value.trim() !== '') {
      HPMSearch.select = true;
      onNavigate('HPMDl');
      HPMSearch.callRefres?.();
    }
  }, [onNavigate]);

  // 处理最小化按钮点击
  const handleMinimize = useCallback(() => {
    minimizeWindow();
  }, []);

  // 处理关闭按钮点击
  const handleClose = useCallback(() => {
    exitapp();
  }, []);

  return (
    <div className="topbarLeft" style={{ height: '100%', width: '100%' }}>
      <Nav 
        mode="horizontal" 
        defaultSelectedKeys={['Home']} 
        style={{ height: '100%', width: '100%' }}
      >
        <Nav.Header style={{ marginLeft: '-15px', width: '150px' }}>
          <img 
            src="img/logo256.png" 
            height={30} 
            alt="HotPE Logo"
            style={{ verticalAlign: 'middle' }}
          />
          <span 
            style={{ 
              color: 'var(--semi-color-text-0)', 
              margin: '0px 10px 0 10px',
              verticalAlign: 'middle'
            }}
          >
            HotPE Client
          </span>
        </Nav.Header>

        <Nav.Footer 
          style={{ 
            width: '100%', 
            display: 'flex', 
            textAlign: 'right', 
            justifyContent: 'flex-end' 
          }}
        >
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Input
              className="topbarSearch"
              style={{ 
                width: '50%', 
                minWidth: '250px', 
                height: '28px' 
              }}
              placeholder="输入关键词，回车搜索模块"
              prefix={<IconSearch />}
              value={searchValue}
              onChange={handleSearchChange}
              onEnterPress={handleSearchSubmit}
              showClear
            />
          </div>
          
          <Button
            onClick={handleMinimize}
            theme="borderless"
            type="tertiary"
            style={{ margin: '-8px 0px 0px 100px' }}
            aria-label="最小化窗口"
          >
            <IconMinus />
          </Button>
          
          <Button
            onClick={handleClose}
            theme="borderless"
            type="danger"
            style={{ margin: '-8px -25px 0px 0px' }}
            aria-label="关闭应用"
          >
            <IconClose />
          </Button>
        </Nav.Footer>
      </Nav>
    </div>
  );
}
/* 
function SearchBox(){
    const [stringData, setStringData] = useState([]);
    const [value, setValue] = useState('');
    const handleStringSearch = (value:string) => {
        let result;
        if (value) {
            result = ['gmail.com', '163.com', 'qq.com'].map(domain => `${value}@${domain}`);
        } else {
            result = [];
        }
        setStringData(result);
    };

    const handleChange = (value:string|number) => {
        console.log('onChange', value);
        setValue(value as string);
    };
    return (
        <AutoComplete
        className='topbarSearch'
            data={stringData}
            value={value}
            showClear
            prefix={<IconSearch />}
            placeholder="搜索... "
            onSearch={handleStringSearch}
            onChange={handleChange}
            style={{ width: 200 }}
        />
    );
} */




/* class CustomOptionDemo extends React.Component {
    constructor() {
        super();
        this.state = {
            data: [],
            color: ['amber', 'indigo', 'cyan'],
        };
    }

    search(value) {
        let HPM: Array<HPM> = []
        let result;
        if (value) {

            for (let i in HPMListOnline) {
                let HPMListTemp = HPMListOnline[i].list

                for (let i_ in HPMListTemp) {
                    let tempHPM: HPM = HPMListTemp[i_]


                    if (tempHPM.name.includes(value)) {
                        HPM.push(tempHPM)
                        //console.log(tempHPM);

                    }
                }



            }
        } else {
            HPM = [];
        }
        this.setState({ data: HPM });
    }

    renderOption(item: AutoCompleteItems) {
        console.log(1,item);
        return (
            <>

                <Avatar size="small">
                    {item.description}
                </Avatar>
                <div style={{ marginLeft: 4 }}>
                    <div style={{ fontSize: 14, marginLeft: 4 }}>{item.name}</div>
                    <div style={{ marginLeft: 4 }}>{item.fileName}</div>
                </div>
            </>
        );
    }

    render() {
        return (
            <AutoComplete
                className='topbarSearch'
                data={this.state.data}
                prefix={<IconSearch />}
                style={{ width: '250px' }}
                renderItem={this.renderOption}
                onSearch={this.search.bind(this)}
                onSelect={v => console.log(v)}
            ></AutoComplete>
        );
    }
}  */


