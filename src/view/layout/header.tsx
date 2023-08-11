import React, { useState } from 'react';
import { Layout, Nav, Button, Breadcrumb, Skeleton, Avatar, Input, AutoComplete } from '@douyinfe/semi-ui';
import { IconSemiLogo, IconBell, IconHelpCircle, IconBytedanceLogo, IconHome, IconHistogram, IconLive, IconSetting, IconClose, IconMinus, IconSearch } from '@douyinfe/semi-icons';
import "./header.css"
import { config, saveConfig } from '../services/config';
import { HPMListOnline, HPMSearch } from '../services/hpm';
import { HPM } from '../type/hpm';
import { AutoCompleteItems } from '@douyinfe/semi-ui/lib/es/autoComplete';

const { shell, ipcRenderer } = require('electron')
//import {shell, ipcRenderer} from 'electron';

export function exitapp() {
    saveConfig()
    ipcRenderer.send('exitapp')
};

function windows_mini() {
    ipcRenderer.send('windows:mini')
}

export default function Header_(props: any) {
    const [value, setValue] = useState('');

    return (
        <>
            <div className='topbarLeft' style={{ height: "100%", width: "100%" }}>
                <Nav mode="horizontal" defaultSelectedKeys={['Home']} style={{ height: "100%", width: "100%" }}>
                    <Nav.Header style={{ marginLeft: "-15px", width: '150px' }}>
                        <img src="./img/logo256.png" height={30} />

                        <span style={{ color: 'var(--semi-color-text-0)', margin: '0px 10px 0 10px' }}>HotPE Client</span>
                    </Nav.Header>

                    <Nav.Footer style={{ width: '100%', display: 'flex', textAlign: 'right', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', textAlign: 'center' }}>

                            <Input className='topbarSearch' style={{ width: '50%', minWidth: '250px' ,height:'28px'}} placeholder='输入关键词，回车搜索模块' prefix={<IconSearch />} onChange={(value) => {
                                HPMSearch.value = value
                            }} onEnterPress={() => {
                                if(HPMSearch.value!=''){
                                    HPMSearch.select=true
                                    props.upNavKey('HPMDl')
                                    HPMSearch.callRefres()
                                }else{

                                }

                            }} showClear></Input>
                            {/*  <CustomOptionDemo></CustomOptionDemo> */}
                            {/* <SearchBox></SearchBox> */}
                            {/*                             <AutoComplete
                                className='topbarSearch'
                                data={data.list}
                                prefix={<IconSearch />}
                                style={{ width: '250px' }}
                                //renderSelectedItem={option => option}
                                renderItem={renderOption}
                                onSearch={(v) => {
                                    console.log(v);

                                }}
                                onSelect={(v: any) => {
                                    console.log(v)
                                    search(v)
                                }}
                            ></AutoComplete> */}

                        </div>
                        <Button onClick={windows_mini} theme='borderless' type='tertiary' style={{ margin: '-8px 0px 0px 100px' }}><IconMinus /></Button>
                        <Button onClick={exitapp} theme='borderless' type='danger' style={{ margin: '-8px -25px 0px 0px' }}><IconClose /></Button>
                    </Nav.Footer>
                </Nav>
            </div>
        </>
    )
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


