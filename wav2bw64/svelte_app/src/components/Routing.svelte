<script>
  import { ADMStore, fileInfo } from '../stores.js';
  import { Select, Container, Row, Col } from 'svelte-materialify/src';
  import { getLayoutRoutingPairs } from '../adm_utils.js';

  export let activeItem;
  let routings = [];
  $: if(typeof(activeItem) !== "undefined"){
    routings = getLayoutRoutingPairs(activeItem.type, $fileInfo.channels);
  }

</script>

{#if activeItem}
<div class="routing">
  <Container>
  <Row>
    <Col cols={12} sm={8} md={8}>  
      Select channel routing for item
    </Col>
    <Col cols={12} sm={4} md={4}>
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
