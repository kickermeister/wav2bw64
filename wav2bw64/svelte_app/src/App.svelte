
<script>
	import AudioProgramme from './components/AudioProgramme.svelte';
	import { ADMStore } from './stores.js';
  import { MaterialApp, Tabs, Tab, TabContent, Button } from 'svelte-materialify';
	
</script>
  
  
 <main>
  <MaterialApp theme='dark'>
    <Tabs>
      <div slot="tabs">
        {#each $ADMStore as ap (ap.name)}
          <Tab>{ap.name}</Tab>
        {/each}
        <Button class="addAudioProgrammeBtn">+</Button>
      </div>
      {#each $ADMStore as ap (ap.name)} 
        <TabContent>
          <AudioProgramme activeAP={ap}/>
        </TabContent>
      {/each}
      
    </Tabs>
  </MaterialApp>
 </main>
  



<style>
	main {
		padding: 100px;
	}

  .addAudioProgrammeBtn {
    flex-grow: 1;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
      height: 500px;
		}
	}
</style>