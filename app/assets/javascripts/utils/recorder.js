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