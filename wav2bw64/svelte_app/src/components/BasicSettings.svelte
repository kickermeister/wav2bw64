<script>
  import { fileInfo } from '../stores.js';
  // import Importance from './Importance.svelte';
  import { Select, Container, Row, Col, Slider } from 'svelte-materialify/src';
  import SelectWrapper from './SelectWrapper.svelte';
  import { getLayoutRoutingPairs } from '../adm_utils.js';

  export let activeItem;
  let routings = [];
  $: if(typeof(activeItem) !== "undefined"){
    routings = getLayoutRoutingPairs(activeItem.type, $fileInfo.channels);
  }

  let dialogueItems = [
    {value: null, name: "Undefined"},
    {value: 0, name: "No Dialogue"},
    {value: 1, name: "Dialogue"},
    {value: 2, name: "Mixed Content"}
  ]

</script>

{#if activeItem}
<div class="routing">
  <Container>
  <Row>
    <Col cols={12} sm={7} md={7}>  
      Channel routing for item
    </Col>
    <Col cols={12} sm={5} md={5}>
      <div class="routing-select">
        <Select solo items={routings} placeholder="Routing" bind:value={activeItem.routing} />
      </div>
    </Col>
  </Row>
  <Row>
    <Col cols={12} sm={7} md={7}>  
      Dialogue type for item
    </Col>
    <Col cols={12} sm={5} md={5}>
      <div class="routing-select">
        <SelectWrapper solo items={dialogueItems} placeholder="Dialogue Type" bind:value={activeItem.dialogue} />
      </div>
    </Col>
  </Row>
  <Row class="mt-2">
    <Col cols={12} sm={12} md={12}>
      <Slider thumb persistentThumb min={0} max={10} step={1} bind:value={activeItem.importance} color="white">Importance</Slider>
    </Col>
  </Row>

</Container>
</div>
{/if}

<style>
  .routing {
    height: 400px;
  }

  .routing-select {
    /* height: 400px; */
  }
</style>
