//import { Link } from '@icon-park/react';
import React, { HTMLProps, useEffect, useRef, useState } from 'react';


export default function Docs() {
    const [url, setUrl] = useState('https://docs.hotpe.top/')

    const ref = useRef(null)

/*     useEffect(() => {
        let current = ref.current

        return () => {
            console.log(ref, current);
        }
    }, []); */

    return (
        <>

<iframe ref={ref} onClick={()=>{console.log('c');
        }} onChange={()=>{console.log('c');
        }} src={url} width={'100%'} height={'100%'} style={{ margin: '-5px', border: '0' }} ></iframe>

            
        </>
    )
};