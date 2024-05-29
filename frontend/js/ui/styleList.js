import { getData } from '../store.js';
import { elements } from '../elements.js';
import styleItem from './styleItem.js';

const styleList = (() => {
  const styleList = elements.styleList;

  function update() {
    styleList.innerHTML = '';
    const data = getData();
  
    data.forEach((item, index) => {
      item = styleItem.createItem(item, index);
      styleList.appendChild(item);
    });
  }

  return {
    update,
  };
})();

export default styleList;