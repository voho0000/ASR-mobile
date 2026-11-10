const fs = require('fs');
const vm = require('vm');
const assert = require('assert/strict');
const ts = require('typescript');
const path = require('path');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/services/webRecording.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
async function scenario({mime='audio/webm;codecs=opus',error=false,empty=false,unsupported=false,startFails=false,observeLevel=false,meterFails=false}={}) {
 let releases=0,stops=0,requestedConstraints,meterTick,sampleValue=0;const levels=[];
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
 class Context {
  constructor(){if(meterFails)throw Error('Meter unavailable');this.state='running';}
  createAnalyser(){return {fftSize:2048,getFloatTimeDomainData:values=>values.fill(sampleValue)};}
  createMediaStreamSource(){return {connect(){}};}
  resume(){return Promise.resolve();}
  close(){this.state='closed';return Promise.resolve();}
 }
 const sandbox={exports:{},Blob,AudioContext:Context,setInterval:callback=>{meterTick=callback;return 1;},clearInterval(){},MediaRecorder:Recorder,navigator:{mediaDevices:{getUserMedia:async options=>{requestedConstraints=options;return {getTracks:()=>[{stop(){releases++;}}],getAudioTracks:()=>[{label:'Synthetic physical microphone'}]}}}}};
 vm.runInNewContext(code,sandbox);
 try {
  const capture=await sandbox.exports.startWebRecording({deviceId:'physical-test-id',onLevel:observeLevel?level=>levels.push(level):undefined});
  if(meterTick){meterTick();sampleValue=.05;meterTick();sampleValue=1;meterTick();}
  const first=capture.stop(),second=capture.stop();
  const [blob,again]=await Promise.all([first,second]);
  return {blob,again,releases,stops,requestedConstraints,levels};
 } catch(e){return {error:e.message,releases,stops};}
}
(async()=>{
 const success=await scenario();
 assert.equal(await success.blob.text(),'firstlast','Wait for all final dataavailable chunks before resolving');
 assert.equal(success.requestedConstraints.audio.deviceId.exact,'physical-test-id');
 assert.equal(success.blob.type,'audio/webm;codecs=opus');
 assert.equal(success.blob,success.again);assert.equal(success.stops,1);assert.ok(success.releases);
 const metered=await scenario({observeLevel:true});assert.equal(metered.levels[0],0);assert.ok(metered.levels.some(level=>level>0));assert.ok(metered.levels.every(level=>level>=0&&level<=100));assert.equal(metered.levels.at(-1),0);
 const unavailable=await scenario({observeLevel:true,meterFails:true});assert.ok(unavailable.blob);assert.ok(unavailable.levels.includes(null));
 const mp4=await scenario({mime:'audio/mp4'});assert.equal(mp4.blob.type,'audio/mp4');
 for(const options of [{error:true},{empty:true},{unsupported:true},{startFails:true}]){
  const result=await scenario(options);assert.ok(result.error);assert.ok(result.releases);
 }
 console.log('PASS: final chunk, MIME selection, single stop, empty/error/start-failure cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1});
