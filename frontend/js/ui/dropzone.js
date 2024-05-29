import { elements } from '../elements.js';


const dropzone = (() => {
  let dropzoneElement;
  let fileInputElement;

  function init() {
    dropzoneElement = elements.dropzone;
    fileInputElement = elements.fileInput;
    registerEvents();
  }

  function registerEvents() {
    dropzoneElement.addEventListener('click', handleClick);
    dropzoneElement.addEventListener('dragover', handleDragOver);
    dropzoneElement.addEventListener('dragleave', handleDragLeave);
    dropzoneElement.addEventListener('drop', handleDrop);
    fileInputElement.addEventListener('change', handleFileInput);
  }

  function handleClick() {
    fileInputElement.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
    dropzoneElement.style.backgroundColor = '#e0e0e0';
  }

  function handleDragLeave() {
    dropzoneElement.style.backgroundColor = 'transparent';
  }

  function handleDrop(e) {
    e.preventDefault();
    dropzoneElement.style.backgroundColor = 'transparent';

    const file = e.dataTransfer.files[0];
    dispatchFileSelectEvent(file);
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    dispatchFileSelectEvent(file);
  }

  function dispatchFileSelectEvent(file) {
    const event = new CustomEvent('fileselect', { bubbles: true, detail: file });
    dropzoneElement.dispatchEvent(event);  
  }

  return {
    init
  };
})()

export default dropzone;