import { elements } from '../elements.js';
import { setStartTime, setEndTime, getStartTime, getEndTime, getData } from '../store.js';

const videoPlayer = (() => {
  let startTime;
  let endTime;
  let currentSubtitle;
  let subtitleInterval;
  let durationTextElement;
  let videoPlayerElement;
  let thumbnailContainerElement;
  let timelineElement;
  let currentTimeBarElement;
  let subtitleElement;
  let soundWordElement;
  let descriptionElement;
  
  
  function init() {
    currentSubtitle = null;
    subtitleInterval = null;
    durationTextElement = elements.durationText;
    videoPlayerElement = elements.videoPlayer;
    timelineElement = elements.videoTrack;
    currentTimeBarElement = elements.currentTimeBar;
    thumbnailContainerElement = elements.thumbnailContainer;
    subtitleElement = elements.subtitle;
    soundWordElement = elements.soundWord;
    descriptionElement = elements.description;
    registerEvents();
  }

  function registerEvents() {
    videoPlayerElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoPlayerElement.addEventListener('timeupdate', handleTimeUpdate);
    videoPlayerElement.addEventListener('play', startSubtitleUpdate);
    videoPlayerElement.addEventListener('pause', stopSubtitleUpdate);
    videoPlayerElement.addEventListener('ended', stopSubtitleUpdate);
    videoPlayerElement.addEventListener('seeked', updateSubtitle);
    document.addEventListener('subtitleupdate', resetSubtitle);
    document.addEventListener('stylechange', (e) => {
      const style = e.detail;
      updateStyle(style);
    });
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

    if (
      videoPlayerElement.currentTime < getStartTime() ||
      videoPlayerElement.currentTime > getEndTime()
    ) {
      videoPlayerElement.currentTime = getStartTime();
    }
  }

  function binarySearch(data, currentTime) {
    let left = 0;
    let right = data.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item = data[mid];

      if (currentTime >= item.start_time && currentTime <= item.end_time) {
        return item;
      } else if (currentTime < item.start_time) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return null;
  }

  function updateStyle(style) {
    if (style.text_stroke) {
      soundWordElement.style.webkitTextStroke = style.text_stroke;
    }
    if (style.font_family) {
      soundWordElement.style.fontFamily = style.font_family;
    }
    if (style.font_weight) {
      soundWordElement.style.fontWeight = style.font_weight;
    }
    if (style.font_size) {
      soundWordElement.style.fontSize = style.font_size;
    }
    if (style.font_color) {
      soundWordElement.style.color = style.font_color;
    }
    if (style.letter_spacing) {
      soundWordElement.style.letterSpacing = style.letter_spacing;
    }
    if (style.text_shadow) {
      soundWordElement.style.textShadow = style.text_shadow;
    }
    if (style.sound_word) {
      soundWordElement.textContent = style.sound_word;
    }
    if (style.description) {
      descriptionElement.textContent = `(${style.description})`;
    }
  }


  function resetSubtitle() {
    const currentTime = videoPlayerElement.currentTime;
 
    const data = getData();
    const subtitle = binarySearch(data, currentTime);
    if (subtitle) {
      currentSubtitle = subtitle;
      soundWordElement.textContent = subtitle.sound_word;
      descriptionElement.textContent = `(${subtitle.description})`;
      updateStyle(subtitle);
      subtitleElement.style.display = 'flex';
    } else {
      currentSubtitle = null;
      subtitleElement.style.display = 'none';
    }
  }

  function updateSubtitle() {
    const currentTime = videoPlayerElement.currentTime;
    
    if (
      currentSubtitle &&
      currentTime >= currentSubtitle.start_time &&
      currentTime <= currentSubtitle.end_time
    ) {
      return;
    }
    
    resetSubtitle();
  }

  function startSubtitleUpdate() {
    stopSubtitleUpdate();
    subtitleInterval = setInterval(updateSubtitle, 100);
  }

  function stopSubtitleUpdate() {
    if (subtitleInterval) {
      clearInterval(subtitleInterval);
      subtitleInterval = null;
    }
  }

  return {
    init,
  };
})();

export default videoPlayer;
