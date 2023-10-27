import { config, roConfig } from "../services/config";
import {  getUsableLetter } from "../utils/disk/diskInfo";

export async function AppTest(){
    console.log(config);
    console.log(roConfig);
    console.log(await getUsableLetter());
}