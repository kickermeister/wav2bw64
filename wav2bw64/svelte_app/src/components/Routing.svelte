<script>
  import { ADMStore } from '../stores.js';
  import { Select, Container, Row, Col } from 'svelte-materialify/src';
  import { getLayoutRoutingPairs } from '../adm_utils.js';

  export let activeItem;
  const wav_channels = 8;  //FIXME: DUMMY VALUE
  $: routings = getLayoutRoutingPairs(activeItem.type, wav_channels);

</script>

<div class="routing">
  <Container>
  <Row>
    <Col>  
      Select channel routing for item:
    </Col>
    <Col>
      <div class="routing-select">
        <Select items={routings} placeholder="Routing" />
      </div>
    </Col>
  </Row>
</Container>
</div>

<style>
  .routing {
    /* min-height: 100%; */
  }

  .routing-select {
    height: 200px;
  }
</style>
