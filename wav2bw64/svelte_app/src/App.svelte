
<script>
	import AudioProgramme from './components/AudioProgramme.svelte';
  import FileUpload from './components/FileUpload.svelte';
	import { ADMStore, fileInfo } from './stores.js';
  import { exportADM } from './utils.js';
  import { MaterialApp, Tabs, Tab, TabContent, Button, Icon } from 'svelte-materialify/src';
  import { mdiDeleteForever, mdiPlusCircle } from '@mdi/js';
	
  const handleDeleteAP = (id) => {
    ADMStore.update(adm => {
      return adm.filter(ap => ap.id != id);
    });
  }

  const handleAddAP = (e) => {
    console.log("Add AP!");
    ADMStore.addAP();
  }

  const logStore = () => {
    console.log($ADMStore);
    console.log($fileInfo);
  }

</script>
  
  
 <main>
  <div class="materialApp">
  <MaterialApp theme='dark'>
    <FileUpload ></FileUpload>
    <!-- Display ADM authoring window only when the wav information has been received from backend and saved to wav_channel store -->
    {#if $fileInfo.channels > 0}    
      <Tabs >
        <div slot="tabs">
          <Button on:click={handleAddAP} size="large" class="primary-color mr-2">
            <Icon path={mdiPlusCircle} />
          </Button>
          {#each $ADMStore as ap (ap.id)}
            <Tab>
              {ap.name}
                <a href="#" on:click={() => handleDeleteAP(ap.id)}><Icon class="ml-16" path={mdiDeleteForever} /></a>
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
  <Button on:click={logStore} class="red white-text">Log Store to Console</Button>
  <Button on:click={() => exportADM($ADMStore, $fileInfo)} class="red white-text">Export ADM</Button>
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