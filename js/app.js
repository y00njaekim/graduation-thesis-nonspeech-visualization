import videoPlayer from './ui/videoPlayer.js';
import timeline from './ui/timeline.js';
import dropzone from './ui/dropzone.js';
import fileHandler from './utils/fileHandler.js';
import { elements } from './elements.js';
import trimVideo from './utils/trimVideo.js';
import { getStartTime, getEndTime } from './store.js';

function handleFileSelect(e) {
  const file = e.detail;
  fileHandler.processFile(file);
}

function handleFileLoaded() {
  videoPlayer.init();
  timeline.init();
  elements.generateButton.addEventListener('click', () => {
    const startTime = getStartTime();
    const endTime = getEndTime();
    trimVideo(startTime, endTime, elements.videoPlayer);
  })
}

document.addEventListener('DOMContentLoaded', () => {
  dropzone.init();
  document.addEventListener('fileselect', handleFileSelect);
  document.addEventListener('fileloaded', handleFileLoaded);
});
