<script>
  import { Container, Row, Col, Slider, Switch } from 'svelte-materialify/src';

  export let activeItem;  
</script>
  
{#if activeItem}
  <Container>
    <Row>
      <Col cols={12} sm={12} md={12}>
        <Switch bind:checked={activeItem.interactivity.onOffInteract}>onOffInteraction</Switch>

        <!-- <Slider thumb persistentThumb min={0} max={1} step={0.01} precision={2} bind:value={activeItem.object_parameter.position.distance} color="white">Distance</Slider> -->
        <span></span>
      </Col>
    </Row>
  </Container>    
{/if}

<style>
</style>
  