<script>
  import { Card, CardText, CardActions, ProgressLinear } from 'svelte-materialify/src';
  import { ADMStore, fileInfo } from '../stores.js';
  import Alert from './Alert.svelte';


  let wavFile;
  let lastFile = "";
  let showProgress = false;
  let alertActive = false;
  let alertMessage;
  let alertTitle;

  $: if (wavFile) {
    // binding to "files" attribute is triggered twice for some reasons, so catching it here
    if (lastFile !== wavFile){
      // Note that `files` is of type `FileList`, not an Array:
      // https://developer.mozilla.org/en-US/docs/Web/API/FileList
      console.log(wavFile);
      let files = [...wavFile];
      showProgress = true;
      uploadFile(files[0]);
      lastFile = wavFile;
    }
	}


let uploadProgress = [];
let progressBar = document.getElementById('progress-bar');

// function updateProgress(fileNumber, percent) {
//   uploadProgress[fileNumber] = percent
//   let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
//   console.debug('update', fileNumber, percent, total)
//   progressBar.value = total
// }

function json(response) {
  return response.json()
}

function uploadFile(file) {
  let url = '/';
  let formData = new FormData();
  formData.append('file', file);
  fetch(url, {
    method: 'POST',
    body: formData,
    redirect: 'follow',
  })
  .then(function(response) {
    if (!response.ok) {
      alertMessage = "Error during WAV upload: " + response.statusText;
      alertTitle = "Upload Error";
      alertActive = true;
    }
    return response;})
  .then(json)
  .then((e) => {
    console.log("Received: ", e);
    fileInfo.update(info => {
      info.filename = e.filename;
      info.path = e.path;
      info.channels = e.wav_info["Channels"];
      return info;
    });
    ADMStore.addAP();
  })
  .catch((e) => { 
    console.log('Received Error: ', e);
  });
}

</script>

{#if $fileInfo.channels === 0}
<Alert bind:active={alertActive} bind:message={alertMessage} bind:title={alertTitle} />
<div class="d-flex justify-center mt-4 mb-4">
  <Card hover style="max-width:500px;">
    <div class="pl-4 pr-4 pt-3">
      <span class="text-h5 mb-2">Upload WAV File</span>
      <br />
    </div>
    <CardText>
      Currently, only plain WAV files are supported. When a BW64 file inlcuding an "axml" chunk is uploaded, the axml chunk will be ignored for now.
    </CardText>
    <CardActions>
      <form method="post" enctype="multipart/form-data">
        <label for="file-upload" class="d-flex s-btn primary-color size-default justify-center"> Upload File
        </label>
        <input
          id="file-upload"
          accept="audio/wav"
          bind:files={wavFile}
          type="file"
          name="file"
        />
      </form>
    </CardActions>
    {#if showProgress}
      <ProgressLinear height="16px" indeterminate></ProgressLinear>
    {/if}
  </Card>
</div>
{/if}

<style>
  input[type="file"] {
    display: none;
  }
</style>
