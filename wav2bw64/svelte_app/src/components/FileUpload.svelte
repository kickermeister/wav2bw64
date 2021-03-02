<script>
  import { Card, CardText, CardActions, Button } from 'svelte-materialify/src';
  
  let wavFile;

  $: if (wavFile) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		console.log(wavFile);

		for (const file of wavFile) {
			console.log(`${file.name}: ${file.size} bytes`);
		}
	}
</script>

<div class="d-flex justify-center mt-4 mb-4">
  <Card hover style="max-width:300px;">
    <div class="pl-4 pr-4 pt-3">
      <span class="text-h5 mb-2">Headline</span>
      <br />
    </div>
    <CardText>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, qui quaerat
      rerum incidunt nisi ducimus?
    </CardText>
    <CardActions>
      <label for="file-upload" class="s-btn primary-color size-default"> Upload File
      </label>
      <input
        id="file-upload"
        class=""
        accept="audio/wav"
        bind:files={wavFile}
        type="file"
      />  
    </CardActions>
  </Card>
</div>


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
