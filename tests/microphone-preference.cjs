const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict'),ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/services/microphonePreference.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
const storage=new Map();const localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
function load(storageApi=localStorage){const scope={exports:{},localStorage:storageApi};vm.runInNewContext(code,scope);return scope.exports;}
const first=load();first.saveMicrophonePreference({deviceId:'physical-mic',label:'Test microphone'});
assert.equal(load().readMicrophonePreference().deviceId,'physical-mic','Keep the choice after a new page/module mount');
storage.set('asr.microphone','{"deviceId":7,"label":false}');assert.equal(load().readMicrophonePreference().deviceId,'');
storage.set('asr.microphone','not JSON');assert.equal(load().readMicrophonePreference().deviceId,'');
const blocked=load({getItem(){throw Error('Blocked')},setItem(){throw Error('Blocked')}});assert.equal(blocked.readMicrophonePreference().deviceId,'');assert.throws(()=>blocked.saveMicrophonePreference({deviceId:'x',label:'x'}));
console.log('PASS: local persistence, malformed storage fallback, blocked writes report failure.');
