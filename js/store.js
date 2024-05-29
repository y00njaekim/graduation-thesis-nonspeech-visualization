let startTime = 0;
let endTime = 0;

export function getStartTime() {
  return startTime;
}

export function setStartTime(time) {
  startTime = time;
}

export function getEndTime() {
  return endTime;
}

export function setEndTime(time) {
  endTime = time;
}

let data = [];

export function getData() {
  return data;
}

export function appendData(newData) {
  data = [...data, ...newData];
  data.sort((a, b) => a.start_time - b.start_time);
}

export function removeData(index) {
  data.splice(index, 1);
}
export function updateData(index, updatedItem) {
  data[index] = { ...data[index], ...updatedItem };
}
