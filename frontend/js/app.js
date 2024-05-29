import videoPlayer from './ui/videoPlayer.js';
import timeline from './ui/timeline.js';
import dropzone from './ui/dropzone.js';
import styleList from './ui/styleList.js';
import fileHandler from './utils/fileHandler.js';
import { elements } from './elements.js';
import trimVideo from './utils/trimVideo.js';
import { getStartTime, getEndTime, appendData } from './store.js';

function handleFileSelect(e) {
  const file = e.detail;
  fileHandler.processFile(file);
}

function handleFileLoaded() {
  const epsilon = 0.1;
  videoPlayer.init();
  timeline.init();
  elements.generateButton.addEventListener('click', () => {
    const startTime = getStartTime();
    const endTime = getEndTime();
    // SMELL: Dependency 너무 크다.
    elements.generateButton.disabled = true;
    elements.generateButton.textContent = 'Analyzing...';
    elements.generateButton.style.backgroundColor = 'gray';
    elements.generateButton.style.cursor = 'not-allowed';
    trimVideo(startTime, endTime, elements.videoPlayer)
      .then((response) => {
        const updatedResponse = response.map((item) => ({
          ...item,
          start_time: startTime > epsilon ? startTime - epsilon : 0,
          end_time: endTime + epsilon,
        }));
        appendData(updatedResponse);
        styleList.update();
        elements.generateButton.dispatchEvent(new CustomEvent('subtitleupdate', { bubbles: true }));
        elements.generateButton.disabled = false;
        elements.generateButton.textContent = 'Generate';
        elements.generateButton.style.backgroundColor = '#3562E3';
        elements.generateButton.style.cursor = 'pointer';
      })
      .catch((error) => {
        elements.generateButton.disabled = false;
        elements.generateButton.textContent = 'Generate';
        elements.generateButton.style.backgroundColor = '#3562E3';
        elements.generateButton.style.cursor = 'pointer';
        console.error('Error during trimming or updating:', error);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  dropzone.init();
  document.addEventListener('fileselect', handleFileSelect);
  document.addEventListener('fileloaded', handleFileLoaded);
});
