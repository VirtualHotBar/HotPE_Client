import { getAllLetter, getUsableLetter } from "../utils/disk/diskInfo";

export async function AppTest(){
    console.log(await getUsableLetter());
    console.log(await getAllLetter());
    
}