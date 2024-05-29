import { elements } from '../elements.js';
import { getStartTime, getEndTime, setStartTime, setEndTime } from '../store.js';


const timeline = (() => {
  let startTime;
  let endTime;
  let dragType;
  let isDragging;
  let relativePosition;
  let durationTextElement;
  let videoElement;
  let timelineElement;
  let currentTimeBarElement;
  let leftHandleElement;
  let rightHandleElement;
  let activeAreaElement;
  let leftInactiveAreaElement;
  let rightInactiveAreaElement;

  function init() {
    dragType = null;
    isDragging = false;
    activeAreaElement = elements.activeArea;
    videoElement = elements.videoPlayer;
    timelineElement = elements.videoTrack;
    currentTimeBarElement = elements.currentTimeBar;
    leftHandleElement = elements.leftHandle;
    rightHandleElement = elements.rightHandle;
    activeAreaElement = elements.activeArea;
    leftInactiveAreaElement = elements.leftInactiveArea;
    rightInactiveAreaElement = elements.rightInactiveArea;
    durationTextElement = elements.durationText;
    registerEvents();
  }

  function registerEvents() {
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    leftHandleElement.addEventListener('mousedown', handleLeftHandleMouseDown);
    rightHandleElement.addEventListener('mousedown', handleRightHandleMouseDown);
    activeAreaElement.addEventListener('click', handleTimelineClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleLoadedMetadata() {
    startTime = getStartTime();
    endTime = getEndTime();
  }

  function handleLeftHandleMouseDown(e) {
    e.preventDefault();
    dragType = 'left';
    isDragging = true;
    relativePosition = e.clientX - leftHandleElement.getBoundingClientRect().right;
  }

  function handleRightHandleMouseDown(e) {
    e.preventDefault();
    dragType = 'right';
    isDragging = true;
    relativePosition = e.clientX - rightHandleElement.getBoundingClientRect().left;
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const timelineRect = timelineElement.getBoundingClientRect();
    let positionAtTimeline = e.clientX - (timelineRect.left + timelineElement.clientLeft) - relativePosition; // timelineRect 의 border | padding 경계 부터 클릭한 위치까지의 거리

    if (dragType === 'left') {
      const leftPosition = positionAtTimeline < 0 ? 0 : positionAtTimeline;
      leftInactiveAreaElement.style.width = `${leftPosition}px`;
      activeAreaElement.style.left = `${leftPosition}px`;
      activeAreaElement.style.width = `${timelineElement.clientWidth - rightInactiveAreaElement.clientWidth - leftPosition}px`;
      currentTimeBarElement.style.left = `${leftPosition}px`;
      startTime = Math.round((leftPosition / timelineElement.clientWidth) * videoElement.duration * 100) / 100;
      setStartTime(startTime);
      videoElement.currentTime = startTime;
    } else if (dragType === 'right') {
      const rightPosition = positionAtTimeline > timelineElement.clientWidth ? timelineElement.clientWidth : positionAtTimeline;
      rightInactiveAreaElement.style.width = `${timelineElement.clientWidth - rightPosition}px`;
      activeAreaElement.style.right = `${timelineElement.clientWidth - rightPosition}px`;
      activeAreaElement.style.width = `${rightPosition - leftInactiveAreaElement.clientWidth}px`;
      currentTimeBarElement.style.left = `${rightPosition}px`;
      endTime = Math.round((rightPosition / timelineElement.clientWidth) * videoElement.duration * 100) / 100;
      setEndTime(endTime);
      videoElement.currentTime = endTime;
    }

    if (dragType === 'left' && endTime - startTime < 0) {
      startTime = endTime;
      setStartTime(startTime);
      const leftPosition = (startTime / videoElement.duration) * timelineElement.clientWidth;
      leftInactiveAreaElement.style.width = `${leftPosition}px`;
      activeAreaElement.style.left = `${leftPosition}px`;
      activeAreaElement.style.width = '0px';
      currentTimeBarElement.style.left = `${leftPosition}px`;
    } else if (dragType === 'right' && endTime - startTime < 0) {
      endTime = startTime;
      setEndTime(endTime);
      const rightPosition = (endTime / videoElement.duration) * timelineElement.clientWidth;
      rightInactiveAreaElement.style.width = `${timelineElement.clientWidth - rightPosition}px`;
      activeAreaElement.style.right = `${timelineElement.clientWidth - rightPosition}px`;
      activeAreaElement.style.width = '0px';
      currentTimeBarElement.style.left = `${rightPosition}px`;
    }

    const duration = endTime - startTime;
    durationTextElement.textContent = `${duration.toFixed(2)}s`;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleTimelineClick(e) {
    if (isDragging) return;
    const timelineRect = timelineElement.getBoundingClientRect();
    const positionAtTimeline = e.clientX - (timelineRect.left + timelineElement.clientLeft);
    const clickedTime = (positionAtTimeline / timelineElement.clientWidth) * videoElement.duration;

    if (clickedTime < startTime || clickedTime > endTime) return;
    videoElement.currentTime = clickedTime;
    currentTimeBarElement.style.left = `${positionAtTimeline}px`;
  }
    
  return {
    init,
  };
})()

export default timeline;