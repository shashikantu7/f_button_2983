import FE from '../index.js'

FE.PLUGINS.trimVideoPlugin = function (editor) {

  let trim_file;
  let trim_file_index
  let trim_video_duration
  let video_edit_httprequest
  let sValue
  let sPosition
  let eValue
  let ePosition
  let file_list_trim
  function _init() {
     
  }
function trimVideo(file, index,file_list) {
    trim_file = file;
    trim_file_index = index;
    file_list_trim=file_list
    renderTrimDiv();
  }
   /**
   * Trim Video Popup 
   */
  function renderTrimDiv() {
    const fileURL = URL.createObjectURL(trim_file);
    const body = editor.o_doc.body;
    const videoTrimContainer = editor.o_doc.createElement('div');
    videoTrimContainer.setAttribute('id', 'videoTrimContainer');
    videoTrimContainer.style.cssText ='position: fixed; top: 0;left: 0;padding: 0;overflow-y:auto;width: 100%;height: 100%;background: rgba(0,0,0,0.4);z-index: 9998;display:block';
    body.appendChild(videoTrimContainer);
    const div = document.createElement("div");
    div.setAttribute('id', 'fr-form-container');
    div.innerHTML = `
    <h3 class="fr-trim-video-name"> ${trim_file.name.replace(/\.[^.]*$/,'')}</h3>
    <div style='display:block;text-align: center; margin-left:50%;' id='trim-file-loader'></div>
      <video id='fr-video-edit'  controls>
       <source src=${fileURL} >
        Your browser does not support the video tag.
    </video> 
  `;
    document.getElementById('videoTrimContainer').appendChild(div);
    document.getElementById('fr-video-edit').addEventListener('loadedmetadata', function () {
        trim_video_duration = document.getElementById('fr-video-edit').duration;
        div.innerHTML += ` 
        
        <form>
        <center>
         <section class="fr-range-slider ">
          <div id="startTimeValue" class=" fr-range-value-start"> </div>
            <input type="range"  class="fr-slider" value='0' min="0" max=${trim_video_duration} id='startTime' >
          <div  id="endTimeValue" class="fr-range-value-end" ></div>
            <input type="range"class="fr-slider" value=${trim_video_duration} min='0' max=${trim_video_duration} id='endTime'>
         <div id="selectedRange"style=" pointer-events: none; position: absolute;left: 0;top: 12px;width: 100%;
         outline: none;
         height: 6px;
         border-radius: 10px;"></div>
            </section>
        </center>
        <div class="fr-video-trim-buttons" >
          <button id='convert' class='fr-trim-button'>${editor.language.translate('Trim')}</button>               
          <button id='cancel' class='fr-trim-button' onsubmit='cancel()'>${editor.language.translate('Cancel')}</button>
        </div>
    </form>
  `;
      //for start time bubble
    const range = document.getElementById('startTime'),
    rangeV = document.getElementById('startTimeValue'),
    setValue = ()=>{
      sValue = Number( (range.value - range.min) * 100 / (range.max - range.min) )
      sPosition = 10 - (sValue * 0.2);
      eValue = Number( (range2.value - range2.min) * 100 / (range2.max - range2.min) )
      ePosition = 10 - (eValue * 0.2);
      rangeV.innerHTML = `<span>${toHHMMSS(range.value)}</span>`;
      rangeV.style.left = `calc(${sValue}% + (${sPosition}px))`;
      // show background ground if on input of start-time
      selectedRange.style.left=rangeV.style.left
      selectedRange.style.width=`calc((${eValue}% + (${ePosition}px)) - (${sValue}% + (${sPosition}px)))`
      selectedRange.style.backgroundColor='#03A9F4'
    };
    //for end time bubble
    document.addEventListener("DOMContentLoaded", setValue);
    const range2 = document.getElementById('endTime'),
    rangeV2 = document.getElementById('endTimeValue'),
    setValue2 = ()=>{
      sValue = Number( (range.value - range.min) * 100 / (range.max - range.min) )
      sPosition = 10 - (sValue * 0.2);
      eValue = Number( (range2.value - range2.min) * 100 / (range2.max - range2.min) ),
      ePosition = 10 - (eValue * 0.2);
      rangeV2.innerHTML = `<span>${toHHMMSS(range2.value)}</span>`;
      rangeV2.style.left = `calc(${eValue}% + (${ePosition}px))`;
           
      // show background ground if on input of end-time
      const selectedRange=document.getElementById('selectedRange')
      selectedRange.style.left= `calc(${sValue}% + (${sPosition}px))`;
      selectedRange.style.width=`calc((${eValue}% + (${ePosition}px)) - (${sValue}% + (${sPosition}px)))`
      selectedRange.style.backgroundColor='#03A9F4'
    };

    document.addEventListener("DOMContentLoaded", setValue2);
    document.getElementById('convert').addEventListener('click', trim);
    document.getElementById('cancel').addEventListener('click', closeContainer);
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
   
   //check startTime < endTime 
    startTime.oninput = function (e) {
      if( Number(startTime.value) >= Number(endTime.value) ){
        e.preventDefault()
        startTime.value=String(Number(endTime.value)-1)
        return false
      }else{
        setValue()
      } 
    }
      endTime.oninput = function (e) {
      if(Number(endTime.value) <= Number(startTime.value)){
        e.preventDefault()
        endTime.value=String(Number(startTime.value) + 1)
        return false
      }else{
        setValue2()
      }
     };
  });

  }

  /**
   * Close Trim Video Popup
   */
  function closeContainer(event) {
    event.preventDefault();
      if(video_edit_httprequest!=null){
        video_edit_httprequest.abort();
      }
      video_edit_httprequest=null
    let container = document.getElementById('videoTrimContainer');
    container.parentNode.removeChild(container);
    editor.filesManager.setChildWindowState(false)
  } 
   
  /**
   * Return time in required format
   */
  function toHHMMSS(secs) {
    const sec_num = parseInt(secs, 10);
    let hours = Math.floor(sec_num / 3600)?String(Math.floor(sec_num / 3600)):'00';
    let minutes = Math.floor(sec_num / 60) % 60?String(Math.floor(sec_num / 60) % 60):'00';
    let seconds = sec_num % 60? String(sec_num % 60):'00';
    
    seconds=seconds.length<2?'0'+seconds:seconds
    minutes=minutes.length<2?'0'+minutes:minutes
    hours=hours.length<2?'0'+hours:hours

    return hours+":"+minutes+":"+seconds
  }
/**
   * Send Trim request
   */
  function trim(event) {
    const backedndUrl='http://localhost:3000/convert'
    event.preventDefault();
    let startTime = toHHMMSS(document.getElementById("startTime").value);
    let endTime = toHHMMSS(document.getElementById("endTime").value);

    if(trim_file.constructor === Blob){
     trim_file = new File([trim_file], trim_file.name, {type:trim_file.type || '', lastModified: trim_file.lastModified});
    }

    const formData = new FormData();
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('file', trim_file);
    const xhr = new XMLHttpRequest();
    document.getElementById('trim-file-loader').classList.add('fr-file-loader');
    document.getElementsByClassName('fr-trim-button')[0].style.display = 'none';

    xhr.onload = function () {
      if (this.status == 200) {
        let file = new Blob([this.response], {
          type: this.response.type || '',
        });

        file.name = trim_file.name;
        file.lastModified = trim_file.lastModified;
        file.lastModifiedDate = trim_file.lastModifiedDate;
        file_list_trim.set(trim_file_index, file);
          editor.filesManager.upload(
            file,
            [],
            null,
            trim_file_index
          ); 

        document.getElementById('trim-file-loader').classList.remove('fr-file-loader');
        document.getElementsByClassName('fr-trim-button')[0].style.display = 'block';
        let container = document.getElementById('videoTrimContainer');
        container.parentNode.removeChild(container);
        editor.filesManager.setChildWindowState(false)
      }     
    };
    xhr.open('POST', backedndUrl, true);
    xhr.responseType = 'blob';
    video_edit_httprequest=xhr
    xhr.send(formData);
  }
  return {
    _init: _init,
    trimVideo: trimVideo
  }
}
