
<script>
	import AudioProgramme from './components/AudioProgramme.svelte';
  import FileUpload from './components/FileUpload.svelte';
  import Alert from './components/Alert.svelte';
	import { ADMStore, fileInfo } from './stores.js';
  import { getRangeFromDisplayedName } from './adm_utils.js';
  import { MaterialApp, Tabs, Tab, TabContent, Button, Icon } from 'svelte-materialify/src';
  import { mdiDeleteForever, mdiPlusCircle } from '@mdi/js';
	
  const isProd = process.env.isProd;
  let tabValue;
  let selectedAP;
  let alertActive = false;
  let alertMessage;
  let alertTitle;

  const handleDeleteAP = (id) => {
    if ($ADMStore.length > 1){
      ADMStore.update(adm => {
        return adm.filter(ap => ap.id != id);
      });
      if (selectedAP.id === id){
        tabValue = 0;
      }
    } else {
      alertActive = true;
      alertMessage = "There must be at least one Audio Programme!";
    }
  }

  const handleAPSelected = (ap) => {
    selectedAP = ap;
    console.log(ap);
  }

  const handleAddAP = (e) => {
    console.log("Add AP!");
    ADMStore.addAP();
  }

  const logStore = () => {
    console.log($ADMStore);
    console.log($fileInfo);
  }

  const exportADM = () => {
  // make deep copy of our store to avoid saving our modifications in case something happens during export / writing
  let adm = JSON.parse(JSON.stringify($ADMStore));
  for (const ap of adm){
    if (ap.apItems.length > 0) {
      for (const item of ap.apItems){
        let res = getRangeFromDisplayedName(item.routing);
        if (res !== false) {
          item.routing = res;
        } else {
          alertMessage = "Please enter valid channel routing for item \"" + item.name + "\" in AudioProgramme \"" + ap.name + "\"!";
          alertTitle = "Error";
          alertActive = true;
          return;
        }
      }
    } else {
      alertMessage = "Please add at least one item for AudioProgramme \"" + ap.name + "\"!";
      alertTitle = "Error";
      alertActive = true;
      return;
    }
  }
  let url = '/set_bw64_config';
  var out_path = $fileInfo.path.substr(0, $fileInfo.path.lastIndexOf(".")) + "_bw64.wav";
  let formData = new FormData();
  formData.append('adm_dict', JSON.stringify(adm));
  formData.append('in_wav_path', $fileInfo.path);
  formData.append('out_bwav_path', out_path);
  fetch(url, {
    method: 'POST',
    body: formData,
    redirect: 'follow',
  })
  .then(response => response.json())
  .then((e) => {
    fileInfo.update(info => {
      info.bw64_file = e.bw64_file;
      return info;
    });
  }) // <- Add `progressDone` call here
  .catch((e) => {
    console.log(e);
    alertMessage = "Error during ADM Export: " + e;
    alertTitle = "Export Error";
    alertActive = true;
  });
}


</script>
  
  
 <main>
  <div class="materialApp">
  <MaterialApp theme='dark'>
    <FileUpload ></FileUpload>
    <Alert bind:active={alertActive} bind:message={alertMessage} bind:title={alertTitle} />
    <!-- Display ADM authoring window only when the wav information has been received from backend and saved to wav_channel store -->
    {#if $fileInfo.channels > 0}    
      <Tabs bind:value={tabValue} >
        <div slot="tabs">
          <Button on:click={handleAddAP} size="large" class="primary-color mr-2">
            <Icon path={mdiPlusCircle} />
          </Button>
          {#each $ADMStore as ap (ap.id)}
            <Tab on:click={() => handleAPSelected(ap)}>
              {ap.name}
              <a href="#" on:click={() => handleDeleteAP(ap.id)} class="hover_delete"><Icon path={mdiDeleteForever} /></a>
            </Tab>
          {/each}
        </div>
        {#each $ADMStore as ap (ap.id)} 
          <TabContent>
            <AudioProgramme bind:activeAP={ap} />
          </TabContent>
        {/each}
        
      </Tabs>
    {/if}
  </MaterialApp>
  </div>
  {#if !isProd}
    <Button on:click={logStore} class="red white-text">Log Store to Console</Button>
  {/if}
  {#if $fileInfo.channels > 0 && $ADMStore.length > 0}
    <Button on:click={() => exportADM()} class="blue white-text">Export ADM</Button>
  {/if}
  {#if $fileInfo.bw64_file}
    <a href={$fileInfo.bw64_file} download={$fileInfo.bw64_file.split("/").slice(-1)[0]} style="text-decoration: none;"><Button class="green white-text">Download BW64 File</Button></a>
  {/if}

 </main>
  



<style>
	main {
    background: #121212;
  }

  .materialApp {
    padding: 50px;
    background: #121212;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
      height: 100%;
		}
	}
</style>