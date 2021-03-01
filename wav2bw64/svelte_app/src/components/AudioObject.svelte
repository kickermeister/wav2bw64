<script>
  import { Tabs, Tab, TabContent } from 'svelte-materialify/src';
  import { ADMStore } from '../stores.js';
  import Routing from './Routing.svelte';
  
  export let activeItem;
  let activeItemSettings = 0;
  let tabs = ["Routing", "Interactivity", "Importance", "Loudness"];
</script>

<div class="audioObjectArea">

  <Tabs fixedTabs bind:value={activeItemSettings}>
    <div slot="tabs">
      {#each tabs as tab}
        <Tab>{tab}</Tab>
      {/each}
    </div>
    {#each tabs as tab}
      <TabContent>
        <div>
          {#if tab === "Routing"}
            <Routing activeItem={activeItem}/>
            {activeItem.type}
            {activeItem.routing}  
            <h4>Routing</h4>
            <!-- <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4> -->
          {:else if tab === "Interactivity"}
            <h4>Interactivity</h4>
          {:else if tab === "Importance"}
            <h4>Importance</h4>
          {:else if tab === "Loudness"}
            <h4>Loudness</h4>
          {/if}
        </div>
      </TabContent>
    {/each}
  </Tabs>
  
</div>

<style>
  .audioObjectArea {
    height: 400px;
    background: #222222;
    /* padding: 12px; */
    margin-left: 20px;
  }
</style>
