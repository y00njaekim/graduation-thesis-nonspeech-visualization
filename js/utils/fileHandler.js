import { elements } from '../elements.js';

export const fileHandler = (() => {
  function showEditorPage() {
    const dropzonePage = elements.dropzonePage;
    const editorPage = elements.editorPage;
  
    dropzonePage.style.display = 'none';
    editorPage.style.display = 'block';
  }
  
  function loadFileIntoEditor(file) {
    const videoPlayer = elements.videoPlayer;
    videoPlayer.src = URL.createObjectURL(file);
    document.dispatchEvent(new CustomEvent('fileloaded'));
  }
  
  function processFile(file) {
    if (file.type.includes('video')) {
      showEditorPage();
      loadFileIntoEditor(file);
    } else {
      alert('Please select a video file');
    }
  }


  return {
    processFile,
  };
})();

export default fileHandler;

