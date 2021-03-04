<script>
  import { Card, CardText, CardActions, Button } from 'svelte-materialify/src';
  import { wav_channels } from '../stores.js';

  let wavFile;
  let lastFile = "";

  $: if (wavFile) {
    // binding to "files" attribute is triggered twice for some reasons, so catching it here
    if (lastFile !== wavFile){
      // Note that `files` is of type `FileList`, not an Array:
      // https://developer.mozilla.org/en-US/docs/Web/API/FileList
      console.log(wavFile);
      let files = [...wavFile];
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
  .then(json)
  .then((e) => {
    console.log("Received: ", e);
    wav_channels.update(n => n = e.wav_info["Channels"]);
  }) // <- Add `progressDone` call here
  .catch((e) => { console.log('Received Error: ', e);});
}

</script>

{#if !wavFile}
<div class="d-flex justify-center mt-4 mb-4">
  <Card hover style="max-width:300px;">
    <div class="pl-4 pr-4 pt-3">
      <span class="text-h5 mb-2">Upload WAV File</span>
      <br />
    </div>
    <CardText>
      Currently, only plain WAV files are supported. When a BW64 file inlcuding an "axml" chunk is uploaded, the axml chunk will be ignored for now.
    </CardText>
    <CardActions>
      <form method="post" enctype="multipart/form-data">
        <label for="file-upload" class="s-btn primary-color size-default"> Upload File
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
  </Card>
</div>
{/if}

<style>
  input[type="file"] {
    display: none;
  }

  .custom-file-upload {
    display: inline-block;
    padding: 6px 12px;
    /* width: 50px;
    height: 20px; */
    background-color: #1A5D9F;
    color: white;
    cursor: pointer;
  }
</style>
