const fs   = window.require('fs')


//接口
interface Aria2 {
    state:string,//状态
    speed: string, //速度
    percentage: number ,//百分比
     
    }

//内部变量
//let aria2Path;



class Aria2 {
    #aria2Path:string;

     constructor(path: string) {//下载参数
        //创建aria2文件
        this.#aria2Path =process.env.TEMP+'\\aria2c_'+Math.random().toString(36).substr(5)+'.exe'//temp目录+aria2c_随机字符.exe
        //复制
         fs.copyFile(path,this.#aria2Path,(err:any)=>{if(err){Error('aria2:Copying aria2 file failed')}else(console.log('copy')
         )})

         console.log(this.#aria2Path);
         
        

    };
    start(url:string,savePath:string,thread:number = 8,callback:Function){//开始下载，回调

    }
    stop(){//停止下载
        

    };
    
}

//let site = new Aria2(".\\ClientTools\\aria2c.exe");
export {Aria2}