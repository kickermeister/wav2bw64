<script>
    import { ADMStore, fileInfo } from '../stores.js';
    import { Select, Container, Row, Col } from 'svelte-materialify/src';
  
    export let activeItem;
    let active = false;
    let routings = [];
    $: if(typeof(activeItem) !== "undefined" && activeItem.type === "Object"){
        //   routings = getLayoutRoutingPairs(activeItem.type, $fileInfo.channels);
        active = true;
    }
  
  </script>
  
  {#if activeItem}
  <div class="routing">
    <Container>
    <Row>
      <Col cols={12} sm={9} md={9}>  
        Set Object Parameter
      </Col>
      <Col cols={12} sm={3} md={3}>
        <div class="routing-select">
          <!-- <Select solo items={routings} placeholder="Routing" bind:value={activeItem.routing} /> -->
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
  