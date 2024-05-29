import { getData, updateData, removeData } from '../store.js';
import styleEditor from './styleEditor.js';
import styleList from './styleList.js';
import { formatTime } from '../utils/format.js';

const styleItem = (() => {
  let isPopoverOpen = false;

  function createItem(item, index) {
    const subtitleInfo = document.createElement('div');
    subtitleInfo.classList.add('subtitle-info');

    const subtitleTime = document.createElement('div');
    subtitleTime.classList.add('subtitle-time');
    subtitleTime.textContent = `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`;
    subtitleInfo.appendChild(subtitleTime);

    const subtitleNonspeech = document.createElement('div');
    subtitleNonspeech.classList.add('subtitle-nonspeech');
    subtitleNonspeech.textContent = item.sound_word;
    subtitleNonspeech.contentEditable = true;
    subtitleInfo.appendChild(subtitleNonspeech);

    const subtitleDescription = document.createElement('div');
    subtitleDescription.classList.add('subtitle-description');
    subtitleDescription.textContent = item.description;
    subtitleDescription.contentEditable = true;
    subtitleInfo.appendChild(subtitleDescription);

    const subtitleItem = document.createElement('div');
    subtitleItem.classList.add('subtitle-item');
    subtitleItem.appendChild(subtitleInfo);

    const subtitleActions = document.createElement('div');
    subtitleActions.classList.add('subtitle-actions');

    const editButton = createEditButton(index);
    const saveButton = createSaveButton(index, subtitleNonspeech, subtitleDescription);
    const deleteButton = createDeleteButton(index);
    
    subtitleActions.appendChild(editButton);
    subtitleActions.appendChild(saveButton);
    subtitleActions.appendChild(deleteButton);
    subtitleItem.appendChild(subtitleActions);

    return subtitleItem;
  }

  function createEditButton(index) {
    const editButton = document.createElement('button');
    editButton.classList.add('action-btn');
    editButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
        <path d="m15 5 4 4"></path>
      </svg>
    `;
    editButton.addEventListener('click', () => {
      if (isPopoverOpen) {
        return;
      }
      const item = getData()[index];
      const popover = document.createElement('div');
      popover.classList.add('popover');
      popover.style.visibility = 'hidden';
      document.body.appendChild(popover);

      const editor = styleEditor.create(
        item,
        (updatedStyle) => {
          updateData(index, updatedStyle);
          styleList.update();
          popover.remove();
        },
        (event, updatedStyle) => {
          if (editButton.contains(event.target)) {
            return false;
          } else if (popover.contains(event.target)) {
            return false;
          } else {
            updateData(index, updatedStyle);
            styleList.update();
            popover.remove();
            isPopoverOpen = false;
            return true;
          }
        }
      );
      popover.appendChild(editor);

      const buttonRect = editButton.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const popoverHeight = popoverRect.height;
      const buttonTop = buttonRect.top;
      const buttonBottom = buttonRect.bottom;

      let popoverTop;

      if (buttonTop - popoverHeight >= 0) {
        popoverTop = buttonTop - popoverHeight - 10;
      } else if (buttonBottom + popoverHeight <= viewportHeight) {
        popoverTop = buttonBottom + 10;
      } else {
        popoverTop = (viewportHeight - popoverHeight) / 2;
      }

      const popoverLeft = buttonRect.left - (popoverRect.width - buttonRect.width) / 2;

      popover.style.left = `${popoverLeft}px`;
      popover.style.top = `${popoverTop}px`;
      popover.style.visibility = 'visible';
      isPopoverOpen = true;
    });
    return editButton;
  }

  function createSaveButton(index, subtitleNonspeech, subtitleDescription) {
    const saveButton = document.createElement('button');
    saveButton.classList.add('action-btn');
    saveButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
    `;
    saveButton.addEventListener('click', () => {
      const updatedItem = {
        ...getData()[index],
        sound_word: subtitleNonspeech.textContent,
        description: subtitleDescription.textContent,
      };
      updateData(index, updatedItem);
      const changeEvent = new CustomEvent('stylechange', {
        detail: {
          sound_word: updatedItem.sound_word,
          description: updatedItem.description,
        },
        bubbles: true,
      });
      saveButton.dispatchEvent(changeEvent);
      styleList.update();
    });
    return saveButton;
  }

  function createDeleteButton(index) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('action-btn');
    deleteButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"></path>
      <line x1="18" y1="9" x2="12" y2="15"></line>
      <line x1="12" y1="9" x2="18" y2="15"></line>
    </svg>
    `;
    deleteButton.addEventListener('click', () => {
      removeData(index);
      styleList.update();
    });
    return deleteButton;
  }

  return {
    createItem,
  };
})();

export default styleItem;
