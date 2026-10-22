import { defineConfig } from 'vite';
import { cp, mkdir, readFile, readdir, rename } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const emitted=new Set();
export default defineConfig({publicDir:false,plugins:[{name:'public-allowlist',generateBundle(_,bundle){emitted.clear();for(const name of Object.keys(bundle))emitted.add(name);},configureServer(server){server.middlewares.use(async(req,res,next)=>{
  const pathname=new URL(req.url,'http://local').pathname;
  if(!/^\/(samples\/|detector\/|expanded\/|(?:detector|expanded)-worker\.js$|icon\.svg$|og\.png$|THIRD_PARTY\.txt$)/.test(pathname))return next();
  const root=resolve('public'),path=resolve(root,'.'+pathname);
  if(!path.startsWith(root+'/')&&!path.startsWith(root+'\\'))return next();
  try{const bytes=await readFile(path);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.txt':'text/plain'})[extname(path)]||'application/octet-stream');res.end(bytes);}catch{next();}
});},async closeBundle(){
  await mkdir('dist-detector',{recursive:true});
  // Preserve previous chunks outside the published directory; never delete them.
  if(emitted.size){
    const archive=resolve('.model-cache/previous-build-assets');await mkdir(archive,{recursive:true});
    for(const entry of await readdir('dist-detector/assets',{withFileTypes:true})){
      if(entry.isFile()&&!emitted.has('assets/'+entry.name))await rename(resolve('dist-detector/assets',entry.name),resolve(archive,Date.now()+'-'+entry.name));
    }
  }
  for(const name of ['icon.svg','og.png','_headers','THIRD_PARTY.txt','samples','detector-worker.js','detector','expanded-worker.js','expanded'])await cp('public/'+name,'dist-detector/'+name,{recursive:true,filter:path=>!path.endsWith('efficientdet_lite0.tflite')});
}}],build:{outDir:'dist-detector',sourcemap:false,emptyOutDir:false}});
