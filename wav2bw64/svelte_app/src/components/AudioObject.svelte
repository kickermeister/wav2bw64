<script>
  import { Tabs, Tab, TabContent } from 'svelte-materialify';
  
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
          <h4>{tab}</h4>
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
