/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}

export function showErrorPopup(message) {
    document.getElementById('error-popup-container').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

 // Main pages to switch around in the app
const pages = ['initial', 'register', 'login', 'dashboard'];
export function switchMainPage(newPage) {
  if (['initial'].includes(newPage)) {
    document.getElementById('logout-btn').style.display = 'none';
  }
  else {
    document.getElementById('logout-btn').style.display = 'block';
  }
  for (const page of pages) {
    document.getElementById(`page-${page}`).style.display = 'none';
  }
  document.getElementById(`page-${newPage}`).style.display = 'block';
};

/**
 * Calculate the time difference between current time and given date time
 * @param {*} givenDate 
 */
export function calTime(givenDate) {
  const currentDate = new Date(Date.now());
  const createdDate = new Date(givenDate);

  let cal;
  cal = new Date(currentDate.getTime() - createdDate.getTime());

  //Retrieve the second, minute, date, month and year
  const sec = Number(Math.abs(cal.getSeconds()));
  const min = Number(Math.abs(cal.getMinutes() - 13));
  let hour = null;
  if (currentDate.getTimezoneOffset() === -660) {
    hour = Number(Math.abs(cal.getHours()- 11)); // the current date is in Australian Eastern Daylight Time
  } else {
    hour = Number(Math.abs(cal.getHours() - 10)); // the current date is in Australian Eastern Standard Time
  }   
  const day = Number(Math.abs(cal.getDate()) - 1);
  const month = Number(Math.abs(cal.getMonth() + 1) - 1);
  const year = Number(Math.abs(cal.getFullYear()) - 1970);

  const total_days = (year * 365) + (month * 30.417) + day;
  const total_secs = total_days * 24 * 60 * 60 + hour * 60 * 60 + min * 60 + sec;
  const total_mins = total_days * 24 * 60 + hour * 60 + min;
  const total_hours = total_days * 24 + hour;
  const total_weeks = ( total_days >= 7 ) ? total_days / 7 : 0;
  
  if (total_weeks > 1 && total_days > 7) {
    return `${total_weeks} weeks ago`;
  }
  else if (total_days >= 7 && total_days < 14) {
    return "1 week ago";
  }
  else if (total_days >= 1 && total_days < 7) {
    return `${total_days} days ago`;
  }
  else if (total_hours >= 1 && total_hours < 24) {
    return `${total_hours} hours ago`;
  }
  else if (total_mins >= 1 && total_mins < 60) {
    return `${total_mins} minutes ago`;
  }
  else if (total_secs >= 1 && total_secs < 60) {
    return "Just now";
  }
  else {
    return "wrong input format!";
  }
}