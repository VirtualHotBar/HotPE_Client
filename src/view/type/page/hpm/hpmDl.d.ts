import { HPM } from "../../hpm";

interface HPMTab{
    HPM:HPM,
    Row: {
        index: number,
        style: React.CSSProperties | undefined
    }
}

export{HPMTab}