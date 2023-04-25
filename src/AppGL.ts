import Application from "./app/index";

// import Application from './app'
export class AppGL{
    app:Application
    constructor (canvas:any) {
        console.log('Intantiate AppGL', canvas);
        this.app = new Application(canvas);
        this.app.load()
        const self = this;
        this.app.onReady=()=>{
            console.log('On Ready')
            self.app.play()
            // self.app.stop()
        }
    }
}