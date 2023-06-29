import React, { useState } from 'react';
import Home from './Home';


export default function Page(props: any) {
    if (props.navKey == 'Home') {
        return (<Home></Home>)
    } else {

    }

};