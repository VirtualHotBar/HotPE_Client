import React, { useState } from 'react';
import { Notification } from '@douyinfe/semi-ui';

import Home from './home';

import SetupToSys from './setup/setupToSys';
import SetupToUDisk from './setup/setupToUDisk';
import MakeISO from './setup/makeISO';

import HPMDl from './hpm/hpmDl';
import HPMMgr from './hpm/hpmMgr';
import TaskMgr from './hpm/taskMgr';

import Docs from './docs';
import Setting from './setting';

export default function Page(props: any) {

    if (props.navKey == 'Home') {
        return (<Home setNavKey={props.setNavKey} setLockMuen={props.setLockMuen}></Home>)

    } else if (props.navKey == 'SetupToSys') {
        return (<SetupToSys></SetupToSys>)

    } else if (props.navKey == 'SetupToUDisk') {
        return (<SetupToUDisk setLockMuen={props.setLockMuen}></SetupToUDisk>)

    } else if (props.navKey == 'MakeISO') {
        return (<MakeISO></MakeISO>)

    } else if (props.navKey == 'HPMDl') {
        return (<HPMDl></HPMDl>)

    } else if (props.navKey == 'HPMMgr') {
        return (<HPMMgr></HPMMgr>)

    } else if (props.navKey == 'TaskMgr') {
        return (<TaskMgr></TaskMgr>)

    } else if (props.navKey == 'Docs') {
        return (<Docs></Docs>)

    } else if (props.navKey == 'Setting') {
        return (<Setting setNavKey={props.setNavKey}></Setting>)
    }

    return (<></>)

};