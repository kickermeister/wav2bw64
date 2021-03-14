<script>
  import { Container, Row, Col, Slider, Switch } from 'svelte-materialify/src';

  export let activeItem;  
</script>
  
{#if activeItem}
  <Container>
    <Row>
      <Col cols={12} sm={12} md={12}>
        <Switch bind:checked={activeItem.interactivity.onOffInteract}>On/Off Interaction</Switch>
        <Switch bind:checked={activeItem.interactivity.gainInteract}>Gain Interaction</Switch>
        {#if activeItem.interactivity.gainInteract}
          <Slider thumb 
                  persistentThumb 
                  min={-60} 
                  max={20} 
                  step={0.5} 
                  precision={1} 
                  bind:value={activeItem.interactivity.gainInteractionRange} 
                  color="white"
          >Gain Interaction Range</Slider>
        {/if}
        <Switch bind:checked={activeItem.interactivity.positionInteract}>Position Interaction</Switch>
        {#if activeItem.interactivity.positionInteract}
          <Slider thumb 
                  persistentThumb 
                  min={-180} 
                  max={180} 
                  step={1} 
                  bind:value={activeItem.interactivity.azRange} 
                  color="white"
          >Azimuth Range</Slider>
          <Slider thumb 
                  persistentThumb 
                  min={-90} 
                  max={90} 
                  step={1} 
                  bind:value={activeItem.interactivity.elRange} 
                  color="white"
          >Elevation Range</Slider>
        {/if}
      </Col>
    </Row>
  </Container>    
{/if}

<style>
</style>
  