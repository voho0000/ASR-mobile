const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const ts = require('typescript');
const path = require('path');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/services/webRecording.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
async function scenario({mime='audio/webm;codecs=opus',error=false,empty=false,unsupported=false,startFails=false}={}) {
 let releases=0,stops=0;
 class Recorder {
  static isTypeSupported(type){return !unsupported && type===mime;}
  constructor(stream,options){this.mimeType=options.mimeType;this.state='inactive';}
  start(){if(startFails)throw Error('Cannot start');this.state='recording';}
  stop(){stops++;this.state='inactive';queueMicrotask(()=>{
   if(error)this.onerror();
   if(!empty){this.ondataavailable({data:new Blob(['first'])});this.ondataavailable({data:new Blob(['last'])});}
   this.onstop();
  });}
 }
 const sandbox={exports:{},Blob,MediaRecorder:Recorder,navigator:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){releases++;}}]})}}};
 vm.runInNewContext(code,sandbox);
 try {
  const capture=await sandbox.exports.startWebRecording();
  const first=capture.stop(),second=capture.stop();
  const [blob,again]=await Promise.all([first,second]);
  return {blob,again,releases,stops};
 } catch(e){return {error:e.message,releases,stops};}
}
(async()=>{
 const success=await scenario();
 assert.equal(await success.blob.text(),'firstlast','Wait for all final dataavailable chunks before resolving');
 assert.equal(success.blob.type,'audio/webm;codecs=opus');
 assert.equal(success.blob,success.again);assert.equal(success.stops,1);assert.ok(success.releases);
 const mp4=await scenario({mime:'audio/mp4'});assert.equal(mp4.blob.type,'audio/mp4');
 for(const options of [{error:true},{empty:true},{unsupported:true},{startFails:true}]){
  const result=await scenario(options);assert.ok(result.error);assert.ok(result.releases);
 }
 console.log('PASS: final chunk, MIME selection, single stop, empty/error/start-failure cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1});
