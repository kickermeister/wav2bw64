<script>
  import Alert from './Alert.svelte';
  import { Container, Row, Col, Slider, Button, Icon } from 'svelte-materialify/src';
  import { mdiInformationOutline } from '@mdi/js';

  export let activeItem;
  
  let active = false;
  let alertActive = false;

  const showInfo = () => {
    alertActive = true;
  }

  $: if(typeof(activeItem) !== "undefined" && activeItem.type === "Object"){
    active = true;
  } else {
    active = false;
  }
  
</script>
  
{#if active}
  <Alert bind:active={alertActive} title={"Info"} message={"Note that all object parameters here will be valid for the whole duration of the wav file!"}></Alert>
  <Container>
    <div class="float-right">
      <Button fab size="x-small" on:click={() => showInfo()}>
        <Icon path={mdiInformationOutline} />
      </Button>
    </div>
    <Row>
      <Col cols={12} sm={12} md={12}>
        <h5>Position</h5>
        <Slider thumb min={-180} max={180} step={1} bind:value={activeItem.object_parameter.position.azimuth}>Azimuth</Slider>
        <Slider thumb min={-90} max={90} step={1} bind:value={activeItem.object_parameter.position.elevation}>Elevation</Slider>
        <Slider thumb min={0} max={1} step={0.01} bind:value={activeItem.object_parameter.position.distance}>Distance</Slider>
        <span></span>
      </Col>
    </Row>
  </Container>    
{/if}

<style>
</style>
  