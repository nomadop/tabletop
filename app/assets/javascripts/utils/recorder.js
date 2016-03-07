import fetch from 'isomorphic-fetch';

let microm;
let __log = () => console.log(...arguments);

export function initRecording(log) {
  if (log) {
    __log = log;
  }
  const Microm = require('microm');
  microm = new Microm();
}

export function startRecording() {
  microm.record().then(function() {
    __log('recording...')
  }).catch(function() {
    __log('error recording');
  });
}

export function stopRecording(cb) {
  const callback = cb || (mp3 => __log(mp3.url, mp3.blob, mp3.buffer));
  microm.stop().then(callback);
}

export function playRecording() {
  microm.play();
}

export function downloadRecording() {
  var fileName = 'cat_voice';
  microm.download(fileName);
}

export function uploadRecording() {
  //const filename = Date.now() + '_' + (Math.random() * 0xFFFFFF << 0).toString(16) + '.mp3';
  //const audio = new File([microm.getBlob], filename, {type: 'audio/mp3'});
  //console.log(audio);
  //const formData = new FormData();
  //formData.append('audio', audio);

  microm.getBase64().then((base64) => fetch('/upload_audio', {
    credentials: 'include',
    method: 'POST',
    body: base64,
  }))
}