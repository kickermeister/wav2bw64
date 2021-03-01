
<script>
	import AudioProgramme from './components/AudioProgramme.svelte';
	import { ADMStore } from './stores.js';
  import { MaterialApp, Tabs, Tab, TabContent, Button, Icon } from 'svelte-materialify/src';
  import { mdiDeleteForever } from '@mdi/js';
	
  const handleDeleteAP = (e) => {
    console.log(e);
  }

  const handleAddAP = (e) => {
    console.log("Add AP!");
    ADMStore.addAP();
  }

  const logStore = () => {
    console.log($ADMStore);
  }

</script>
  
  
 <main>
  <MaterialApp theme='dark'>
    <div class="materialApp">
      <Tabs grow>
        <div slot="tabs">
          {#each $ADMStore as ap (ap.id)}
            <Tab>
              {ap.name}
                <Icon class="ml-16" on:click={handleDeleteAP} path={mdiDeleteForever} />
            </Tab>
          {/each}
            <Button on:click={handleAddAP} size="large" class="primary-color float-right">+</Button>
        </div>
        {#each $ADMStore as ap (ap.id)} 
          <TabContent>
            <AudioProgramme bind:activeAP={ap} />
          </TabContent>
        {/each}
        
      </Tabs>
    </div>
  </MaterialApp>

  <Button on:click={logStore}>Log Store to Console</Button>
 </main>
  



<style>
	main {
		/* padding: 100px; */
	}

  .materialApp {
    padding: 50px;
    background: #121212;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
      height: 500px;
		}
	}
</style>