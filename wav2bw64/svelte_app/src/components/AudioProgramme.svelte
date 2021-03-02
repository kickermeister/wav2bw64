<script>
  import { ADMStore } from '../stores.js';
  import AudioObject from './AudioObject.svelte'
  import { Select, Container, Row, Col, TextField, ListItemGroup, ListItem, ExpansionPanels, ExpansionPanel, Chip, Icon } from 'svelte-materialify/src';
  import { mdiDeleteForever, mdiPlusCircle } from '@mdi/js';
  import { getValidLayouts } from '../adm_utils.js';
  import { mapISO6391 } from '../utils.js';

  export let activeAP;

  let activeItem = 0;

  const languages = mapISO6391();
  const audioBlockItems = getValidLayouts(8);
  const addItemStr = "Add Item";
  let selectedAudioBlockItem = addItemStr;  // Do not change unless you know what you do!

  const handleAudioBlockItemSeleced = (e) => {
    if (e.detail !== undefined && typeof(e.detail) === "string" && e.detail !== addItemStr){
      ADMStore.update(adm => {
        let ap = adm.find(ap => ap.id === activeAP.id);
        ap.items.push({type: selectedAudioBlockItem, routing: [], id: Math.random()});
        return adm;
      })
      // activeAP.items.push({type: e.detail, routing: []}); // this seems to store the new object but the list is not updated in this component.
      // Otherwise, the Select component would always display the selected value which would be odd in our case
      selectedAudioBlockItem = addItemStr;
    }
  };

  const handleDeleteItem = (id) => {
    ADMStore.update(adm => {
      let ap = adm.find(ap => ap.id === activeAP.id);
      let items = ap.items.filter(item => item.id != id);
      ap.items = items;
      return adm;
    });
  }

</script>

<div class="audioProgramme">
  <Container>
  <Row>
    <Col cols={4}>
      <TextField dense outlined bind:value={activeAP.name}>Name</TextField>
    </Col>
    <Col cols={4} offset={4}>
      <Select solo items={languages} bind:value={activeAP.language} class="darken-1">Language</Select>
    </Col>
  </Row>

  <Row class="mb-6">
    <Col cols={12} sm={12} md={12}>
      <ExpansionPanels class="eps-area">
        <ExpansionPanel>
          <span slot="header">Loudness</span>  
          <h4>Loudness Settings</h4>
        </ExpansionPanel>
      </ExpansionPanels>
    </Col>
  </Row>

  <!-- <Row>
    <Col cols={12} sm={3} md={3}>
      <Select solo items={audioBlockItems} bind:value={selectedAudioBlockItem} on:change={handleAudioBlockItemSeleced} class="eps-area"></Select>
    </Col>
  </Row> -->
  <Row>
    <Col cols={12} sm={5} md={5}>
      <div class="eps-area audioProgrammeItems">
        <ListItemGroup mandatory bind:value={activeItem} class="font-weight-bold">
          <Select solo items={audioBlockItems} bind:value={selectedAudioBlockItem} on:change={handleAudioBlockItemSeleced} class="audioProgrammeItemsSelect default-color">
          </Select>
          {#each activeAP.items as item (item.id)}
            <ListItem dense>
              <TextField dense solo class="float-left" bind:value={item.name}>Name</TextField>
              <span slot="append">
                <Chip>{item.type}</Chip>
                <a href="#" on:click={() => handleDeleteItem(item.id)}><Icon path={mdiDeleteForever} /></a>
              </span>  
            </ListItem>
          {/each}
        </ListItemGroup>
      </div>
    </Col>
    <Col cols={12} sm={7} md={7}>
      <AudioObject activeItem={activeAP.items[activeItem]}/>
    </Col>
  </Row>
</Container>
</div>


<style>
  .audioProgramme{
    border: 2px solid rgba(255, 255, 255, 0.15);
    /* background: rgba(255, 255, 255, 0.53) */
  }

  :global(.audioProgrammeItemsSelect) {
    border-radius: 2px;
    border: 0px solid rgba(255, 255, 255, 0.15);
    border-bottom-width: 2px;
  }

  .audioProgrammeItems {
    height: 400px;
  }
</style>