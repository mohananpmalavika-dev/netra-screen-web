/* Original on-device WebGL scene. Illustration only; never connected to research observations. */
const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;uniform vec2 resolution;uniform vec2 pointer;uniform float time;
mat2 rotate(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec2 scene(vec3 p){
 vec3 q=p;q.xz=rotate(pointer.x*.32)*q.xz;q.yz=rotate(-.15+pointer.y*.2)*q.yz;
 float eyes=min(length(q-vec3(-.64,0.,0.)),length(q-vec3(.64,0.,0.)))-.48;
 vec3 r=q;r.xz=rotate(.65+sin(time*.18)*.08)*r.xz;r.yz=rotate(.33)*r.yz;
 float ring=length(vec2(length(r.xy)-1.37,r.z))-.016;
 vec3 v=q;v.xz=rotate(-.55)*v.xz;v.yz=rotate(-.2)*v.yz;
 float orbit=length(vec2(length(v.xy)-1.53,v.z))-.009;
 vec2 result=vec2(eyes,1.);if(ring<result.x)result=vec2(ring,2.);if(orbit<result.x)result=vec2(orbit,3.);return result;
}
vec3 normal(vec3 p){vec2 e=vec2(.001,0.);return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));}
void main(){
 vec2 p=(uv-.5)*2.;p.x*=resolution.x/resolution.y;
 vec3 ro=vec3(0.,.08,3.8);vec3 rd=normalize(vec3(p*.95,-1.9));
 vec3 color=vec3(.025,.022,.075);
 color+=vec3(.24,.065,.42)*exp(-length(p-vec2(.5,.25))*2.2);
 color+=vec3(.025,.21,.23)*exp(-length(p-vec2(-.6,-.25))*2.7);
 float distance=0.;vec2 hit=vec2(1.,0.);
 for(int i=0;i<56;i++){hit=scene(ro+rd*distance);if(hit.x<.0015||distance>7.)break;distance+=hit.x*.85;}
 if(distance<7.&&hit.x<.003){
  vec3 point=ro+rd*distance;vec3 n=normal(point);vec3 material;
  if(hit.y<1.5){
   vec3 local=point;local.xz=rotate(pointer.x*.32)*local.xz;local.yz=rotate(-.15+pointer.y*.2)*local.yz;
   vec3 eye=normalize(local-vec3(local.x<0.?-.64:.64,0.,0.));
   float radius=length(eye.xy-vec2(pointer.x*.05,-pointer.y*.04));
   material=vec3(.76,.79,.91);
   if(eye.z>0.&&radius<.57){
    float angle=atan(eye.y,eye.x);float fibers=sin(angle*93.+radius*94.)*.5+sin(angle*137.-radius*51.)*.25;
    material=mix(vec3(.16,.11,.61),vec3(.06,.88,.76),.5+.5*sin(angle*4.2));
    material*=.8+fibers*.4;material+=vec3(.55,.34,.08)*exp(-abs(radius-.24)*22.);
    material*=1.-smoothstep(.49,.57,radius)*.86;
    if(radius<.18)material=vec3(.003,.008,.017);
   }
  }else{material=hit.y<2.5?vec3(.08,.91,.81):vec3(.70,.29,1.);}
  vec3 light=normalize(vec3(-2.,3.,4.));float diffuse=max(dot(n,light),0.);
  float specular=pow(max(dot(reflect(-light,n),-rd),0.),85.);
  float rim=pow(1.-max(dot(n,-rd),0.),3.);
  color=material*(.21+diffuse*.85)+vec3(.72,.95,1.)*specular*.95;
  color+=rim*(hit.y<1.5?vec3(.10,.30,.45):material*.75);
  if(hit.y>1.5)color+=material*.5;
 }
 color*=1.-smoothstep(.4,1.7,length(p))*.34;
 gl_FragColor=vec4(pow(max(color,vec3(0.)),vec3(.86)),1.);
}`;

function initStage(stage){
 const canvas=stage.querySelector('canvas'),fallback=stage.querySelector('.showcase-fallback');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true});
 if(!gl){stage.dataset.renderer='fallback';return;}
 let program;
 try{
  const shader=(type,source)=>{const value=gl.createShader(type);gl.shaderSource(value,source);gl.compileShader(value);if(!gl.getShaderParameter(value,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(value));return value;};
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Scene initialization failed');
 }catch(error){stage.dataset.renderer='fallback';stage.dataset.rendererError=error.message;return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const location=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['resolution','pointer','time'].map(name=>[name,gl.getUniformLocation(program,name)]));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let x=0,y=0,visible=true,frame=0,last=0,start=performance.now(),lost=false;
 function draw(now=performance.now()){
  if(lost)return;const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1,720/Math.max(1,box.width),620/Math.max(1,box.height));
  const width=Math.max(1,Math.round(box.width*ratio)),height=Math.max(1,Math.round(box.height*ratio));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
  gl.uniform2f(uniforms.resolution,width,height);gl.uniform2f(uniforms.pointer,x,y);gl.uniform1f(uniforms.time,reduced.matches?0:(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,6);
 }
 function animate(now){frame=0;if(!visible||document.hidden||reduced.matches||lost)return;if(now-last>40){draw(now);last=now;}frame=requestAnimationFrame(animate);}
 function resume(){if(!frame&&visible&&!document.hidden&&!reduced.matches&&!lost)frame=requestAnimationFrame(animate);}
 function move(nextX,nextY){x=Math.max(-1,Math.min(1,nextX));y=Math.max(-1,Math.min(1,nextY));stage.style.setProperty('--scene-x',`${x*8}deg`);stage.style.setProperty('--scene-y',`${-y*6}deg`);if(reduced.matches)draw();resume();}
 stage.addEventListener('pointermove',event=>{const box=stage.getBoundingClientRect();move((event.clientX-box.left)/box.width*2-1,(event.clientY-box.top)/box.height*2-1);});
 stage.addEventListener('pointerleave',()=>move(0,0));
 canvas.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)){event.preventDefault();event.stopPropagation();if(event.key==='Home')move(0,0);else move(x+(event.key==='ArrowLeft'?-.2:event.key==='ArrowRight'?.2:0),y+(event.key==='ArrowUp'?-.2:event.key==='ArrowDown'?.2:0));}});
 stage.querySelector('[data-reset-scene]')?.addEventListener('click',()=>move(0,0));
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stage.dataset.renderer='fallback';fallback?.removeAttribute('hidden');cancelAnimationFrame(frame);});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw();resume();}else{cancelAnimationFrame(frame);frame=0;}}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else resume();});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;draw();resume();});
 new ResizeObserver(()=>draw()).observe(canvas);
 stage.dataset.renderer='webgl';fallback?.setAttribute('hidden','');draw();resume();
}
document.querySelectorAll('[data-netra-3d]').forEach(initStage);
document.querySelectorAll('[data-launch-preview]').forEach(button=>button.addEventListener('click',()=>document.getElementById('btnStartDemo')?.click()));
