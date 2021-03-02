<script>
  import { ADMStore } from '../stores.js';
  import { Select, Container, Row, Col } from 'svelte-materialify/src';
  import { getLayoutRoutingPairs } from '../adm_utils.js';

  export let activeItem;
  const wav_channels = 16;  //FIXME: DUMMY VALUE
  let routings = [];
  $: if(typeof(activeItem) !== "undefined"){
    routings = getLayoutRoutingPairs(activeItem.type, wav_channels);
  }

</script>

{#if activeItem}
<div class="routing">
  <Container>
  <Row>
    <Col cols={12} sm={9} md={9}>  
      Select channel routing for item:
    </Col>
    <Col cols={12} sm={3} md={3}>
      <div class="routing-select">
        <Select solo items={routings} placeholder="Routing" bind:value={activeItem.routing} />
      </div>
    </Col>
  </Row>
</Container>
</div>
{/if}

<style>
  .routing {
    /* min-height: 100%; */
  }

  .routing-select {
    height: 400px;
  }
</style>
