const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const React = require('react');
const renderer = require('react-test-renderer');
const ts = require('typescript');
const source = path.resolve(__dirname, '..');
let stops = 0, uploads = [], transcribes = 0, apiFails = false, stopFails = false;
const component = name => props => React.createElement(name, props, props.children);
const native = new Proxy({StyleSheet:{create:s=>s},Platform: {OS:'web'}, Dimensions:{get:()=>({height:900})}, Alert:{alert:()=>{}}, Keyboard:{dismiss:()=>{}}}, {get:(t,k)=> t[k] || component(k)});
const paper = new Proxy({}, {get:(t,k)=>component(k)});
const firestore = {
 fetchPreferences: async()=>({gptModel:'gpt-6-luna',defaultPrompt:''}),
 fetchSinglePatientRecord:async()=>({asrResponse:'Existing text',gptResponse:'',patientInfo:''}),
 fetchPrompts:async()=>[],
 uploadDataToFirestore:async(...args)=>{uploads.push(args)},
};
class Recorder {
 async start() {}
 stop() { stops++; if(stopFails)throw Error('Synthetic stop failure'); return {getMp3: async()=>[[],new Blob(['synthetic'])]}; }
}
let hook;
function load(file, extra={}) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const sandbox={exports:{},console:{log:()=>{},error:()=>{}},Blob,URL,setInterval,clearInterval,require:n=> {
  if(n in extra)return extra[n];
  if(n==='react' || n==='react/jsx-runtime')return require(n);
  if(n==='react-native')return native;
  if(n==='react-native-paper')return paper;
  if(n==='react-native-toast-message')return {show:()=>{}};
  if(n==='mic-recorder-to-mp3')return Recorder;
  if(n==='expo-status-bar')return {StatusBar:component('StatusBar')};
  if(n==='expo-av')return {Audio:{}};
  if(n==='./transcribeAudio')return {transcribeAudio:async()=>{transcribes++;if(apiFails)throw Error('Synthetic API failure');return 'New transcript'}};
  if(n.endsWith('/FirestoreService'))return firestore;
  if(n==='react-native-keyboard-aware-scroll-view')return {KeyboardAwareScrollView:component('ScrollView')};
  if(n.endsWith('/IconButton'))return component('button');
  if(n.endsWith('/useRecording'))return hook;
  if(n.endsWith('/callGPTAPI'))return {callGPTAPI:async()=> 'Translated'};
  return component(n);
 }};
 vm.runInNewContext(code,sandbox,{filename:file});return sandbox.exports;
}
async function scenario(fails, failsToStop=false) {
 stops=0;transcribes=0;uploads=[];apiFails=fails;stopFails=failsToStop;
 hook=load(path.join(source,'src/services/useRecording.ts'));
 const Screen=load(path.join(source,'src/screens/RecordingScreen.tsx')).default;
 let root;
 await renderer.act(async()=>{root=renderer.create(React.createElement(Screen,{route:{params:{name:'SYNTHETIC-ONLY'}}}));});
 const findIcon=name=>root.root.findAll(n=>n.type==='button'&&n.props.iconName===name)[0];
 await renderer.act(async()=>{await findIcon('microphone').props.onPress();});
 await renderer.act(async()=>{await findIcon('stop').props.onPress();});
 const result=root.root.findAll(n=>n.type==='TextInput'&&n.props.placeholder==='Start recording to get ASR result')[0].props.value;
 const canRecordAgain = !!findIcon("microphone");
 await renderer.act(async()=>root.unmount());
 return {fails,stops,transcribes,result,canRecordAgain,unexpectedWrites:uploads.some(a=>String(a[2]).includes('undefined'))};
}
(async()=>{
 const success=await scenario(false),failure=await scenario(true),stopFailure=await scenario(false,true);
 console.log(JSON.stringify({source,success,failure,stopFailure},null,2));
 assert.equal(success.stops,1,'Stopping one recording must stop the recorder exactly once');
 assert.equal(success.transcribes,1,'Stopping one recording must upload exactly once');
 assert.equal(success.result,'Existing text New transcript');
 assert.equal(failure.result,'Existing text','A failed transcript must preserve existing text');
 assert.equal(stopFailure.canRecordAgain,true,'Failed stop must return to the microphone button');
 assert.equal(stopFailure.transcribes,0,'Failed encoding must not upload');
 assert.equal(failure.unexpectedWrites,false,'Do not persist undefined after a failed transcript');
})().catch(e=>{console.error(e.message);process.exitCode=1});
