<script>
  import { Tabs, Tab, TabContent } from 'svelte-materialify/src';
  import { ADMStore } from '../stores.js';
  import Routing from './Routing.svelte';
  import ObjectParameter from './ObjectParameter.svelte';
  
  export let activeItem;
  let activeItemSettings = 0;
  let tabs = ["Routing", "Interactivity", "Importance", "Object"];
  let hideObjectsTab = true;
  $: if (typeof(activeItem) !== "undefined"){
      if (activeItem.type === "Object"){
        hideObjectsTab = false;
      } else {
        hideObjectsTab = true;
      }
  }

</script>

<div class="eps-area audioObjectArea">

  <Tabs fixedTabs bind:value={activeItemSettings}>
    <div slot="tabs">
      {#each tabs as tab}
        {#if tab !== "Object"}
          <Tab>{tab}</Tab>
        {:else if tab === "Object"}
          <Tab bind:disabled={hideObjectsTab}>{tab}</Tab>
        {/if}
      {/each}
    </div>
    {#each tabs as tab}
      <TabContent>
        <div>
          {#if tab === "Routing"}
            <Routing activeItem={activeItem}/>
            <!-- <h4>Routing</h4> -->
            <!-- <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4>
            <h4>Bla</h4> -->
          {:else if tab === "Interactivity"}
            <h4>Interactivity</h4>
          {:else if tab === "Importance"}
            <h4>Importance</h4>
          {:else if tab === "Object"}
            <ObjectParameter activeItem={activeItem} />
          {/if}
        </div>
      </TabContent>
    {/each}
  </Tabs>
  
</div>

<style>
  .audioObjectArea {
    height: 400px;
    /* padding: 12px; */
    margin-left: 20px;
  }
</style>
