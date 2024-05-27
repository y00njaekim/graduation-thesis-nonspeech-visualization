import { elements } from '../elements.js';
import { setStartTime, setEndTime, getStartTime, getEndTime } from '../store.js';

const videoPlayer = (() => {
  let startTime;
  let endTime;
  let durationTextElement;
  let videoPlayerElement;
  let thumbnailContainerElement;
  let timelineElement;
  let currentTimeBarElement;

  function init() {
    durationTextElement = elements.durationText;
    videoPlayerElement = elements.videoPlayer;
    timelineElement = elements.videoTrack;
    currentTimeBarElement = elements.currentTimeBar;
    thumbnailContainerElement = elements.thumbnailContainer;
    registerEvents();
  }

  function registerEvents() {
    videoPlayerElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoPlayerElement.addEventListener('timeupdate', handleTimeUpdate);
  }

  function generateThumbnails() {
    const canvasWidth = 160;
    const canvasHeight = 90;
    const duration = videoPlayerElement.duration;
    const interval = duration / 10;
    const numberOfThumbnails = videoPlayerElement.offsetWidth / canvasWidth + 1;

    for (let i = 0; i < numberOfThumbnails; i++) {
      const thumbnailTime = i * interval;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const context = canvas.getContext('2d');

      videoPlayerElement.currentTime = thumbnailTime;
      videoPlayerElement.addEventListener(
        'seeked',
        () => {
          context.drawImage(videoPlayerElement, 0, 0, canvas.width, canvas.height);
          const thumbnailURL = canvas.toDataURL();
          const thumbnailImage = document.createElement('img');
          thumbnailImage.src = thumbnailURL;
          thumbnailContainerElement.appendChild(thumbnailImage);
        },
        { once: true },
      );
    }
  }

  function generateDurationText() {
    const duration = videoPlayerElement.duration;
    const formattedDuration = duration.toFixed(2);
    durationTextElement.textContent = `${formattedDuration}s`;
  }

  function handleLoadedMetadata() {
    startTime = 0;
    setStartTime(startTime);
    endTime = videoPlayerElement.duration;
    setEndTime(endTime);
    generateThumbnails();
    generateDurationText();
  }

  function handleTimeUpdate() {
    const currentPosition =
      (videoPlayerElement.currentTime / videoPlayerElement.duration) * timelineElement.clientWidth;
    currentTimeBarElement.style.left = `${currentPosition}px`;

    
    if (videoPlayerElement.currentTime < getStartTime() || videoPlayerElement.currentTime > getEndTime()) {
      videoPlayerElement.currentTime = getStartTime();
    }
  }

  return {
    init,
  };
})();

export default videoPlayer;
