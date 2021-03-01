<script>
  import { ADMStore } from '../stores.js';
  import AudioObject from './AudioObject.svelte'
  import { Select, Container, Row, Col, TextField, ListItemGroup, ListItem, ExpansionPanels, ExpansionPanel, } from 'svelte-materialify/src';
  import { getValidLayouts } from '../adm_utils.js';


  export let audioProgrammeID;
  $: activeAP = $ADMStore.filter(obj => {
    return obj.id === audioProgrammeID
  })[0];

  let activeItem = 0;

  const languages = [
    { name: 'DE', value: 'DE' },
    { name: 'FR', value: 'FR' },
    { name: 'EN', value: 'EN' },
  ];

  const audioBlockItems = [
    { name: 'Object', value: 'Object' },
    { name: '0+2+0', value: '0+2+0' },
    { name: '0+5+0', value: '0+5+0' },
  ];
  // const audioBlockItems = getValidLayouts(8);

  const saveAPName = (e) => {
    // console.log(e.target.value);
    // console.log("ADMStore from AudioProgramme component:", $ADMStore);
    // ADMStore.update(adm => {
    //   adm[0].name = e.target.value;
    //   return adm;
    // });
  }

</script>

<div class="audioProgramme">
  <Container>
  <Row>
    <Col cols={4}>
      <TextField dense outlined bind:value={ activeAP.name } on:change={saveAPName}>Name</TextField>
    </Col>
    <Col cols={4} offset={4}>
      <Select solo items={languages} bind:value={activeAP.language} class="darken-1">Language</Select>
    </Col>
  </Row>

  <Row class="mb-6">
    <ExpansionPanels>
      <ExpansionPanel>
        <span slot="header">Loudness</span>
        <h4>Loudness Settings</h4>
      </ExpansionPanel>
    </ExpansionPanels>
  </Row>

  <Row>
    <Select solo items={audioBlockItems}>Add Item</Select>
  </Row>
  <Row>
    <Col cols={12} sm={3} md={3}>
      <div class="audioProgrammeItems">
        <ListItemGroup mandatory bind:value={activeItem}>
          {#each activeAP.items as item}
            <ListItem>{item.type}</ListItem>
          {/each}
        </ListItemGroup>
      </div>
    </Col>
    <Col cols={12} sm={9} md={9}>
      <AudioObject activeItem={activeAP.items[activeItem]}/>
    </Col>
  </Row>
</Container>
</div>


<style>
  .audioProgramme{

  }

  .audioProgrammeItems {
    height: 400px;
    /* width: 250px; */
    background: #222222;
  }
</style>