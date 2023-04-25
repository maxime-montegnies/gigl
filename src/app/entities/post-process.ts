import Application from "../../spgl/application";
import Post from '../../spgl/post/'

import Saturation from '../../spgl/post/effects/saturation'
import Bloom from '../../spgl/post/effects/bloom'
import Fetch from '../../spgl/post/effects/fetch'


class PostProcess {
    app: Application;
    sat: Saturation;
    post: Post;
    bloom: Bloom;
    constructor(app:Application){
        this.app = app;
        this.post = new Post( app.gl, true );
        this.sat      = new Saturation( 1.5 );  
        const v = 1.0;
        this.bloom    = new Bloom( [v,v,v], .01 ); 
        

        this.post.add( new Fetch() );
        this.post.add( this.bloom);
        // this.post.add( this.sat );

        // this.bloom.color = [1,1,1]
        // this.bloom.size = 1.5 

        
    }

    preRender (){
        // var cDist = vec3.distance( this.scene.camera.position, dofCenter );
        // this.dof.focus = cDist + .4;
        // this.dof.near = (cDist - this.dof.focusRange/2 ) - .1
        // this.dof.far  = cDist + 2
      }
}

export default PostProcess;