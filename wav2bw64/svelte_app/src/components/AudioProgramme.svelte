<script>
  import { ADMStore } from '../stores.js';
  import AudioObject from './AudioObject.svelte'
  import { Select, Row, Col, TextField, ListItemGroup, ListItem, Chip } from 'svelte-materialify';


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
  <Row>
    <Col>
      <TextField dense outlined bind:value={ activeAP.name } on:change={saveAPName}>Name</TextField>
    </Col>
    <Col>
      <div style="float: right;">
        <Chip>Language</Chip>
        <Select solo items={languages}>{ activeAP.language }</Select>
      </div>
    </Col>
  </Row>
  <Row>
    <Select solo items={audioBlockItems}>Add Item</Select>
  </Row>
  <Row>
    <Col>
      <div class="audioProgrammeItems">
        <ListItemGroup mandatory bind:value={activeItem}>
          {#each activeAP.items as item}
            <ListItem>{item.type}</ListItem>
          {/each}
        </ListItemGroup>
    </div>
    </Col>
    <Col>
      <AudioObject activeItem={activeItem}/>
    </Col>
  </Row>

</div>


<style>
  .audioProgramme{

  }

  .audioProgrammeItems {
    height: 400px;
    background: #222222;
  }
</style>