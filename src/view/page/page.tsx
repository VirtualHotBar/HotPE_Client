import React, { useState } from 'react';
import Home from './home';


export default function Page(props: any) {
    if (props.navKey == 'Home') {
        return (<Home></Home>)
    } else {

    }

};