//import { Link } from '@icon-park/react';
import { Button } from '@douyinfe/semi-ui';
import React, { HTMLProps, useEffect, useRef, useState, useLayoutEffect } from 'react';
//import KeepAlive, { AliveScope } from 'react-activation'//引入，需要结合使用

export default function Docs() {
    const [url, setUrl] = useState('https://docs.hotpe.top/')

    const ref = useRef(null)


    useEffect(() => {
return ()=>{}


    })

    /*     useEffect(() => {
            let current = ref.current
    
            return () => {
                console.log(ref, current);
            }
        }, []); */

    return (
        <>

<iframe ref={ref} src={url} width={'100%'} height={'100%'} style={{ margin: '-5px', border: '0' }} ></iframe>

       

            



        </>
    )
};
