<script>
  import { Slider, Container, Row, Col } from 'svelte-materialify/src';
  
  export let activeItem;

  
</script>
  
{#if activeItem}
  <div>
    <Container>
      <Row>
        <Col cols={12} sm={12} md={12}>
          <h5>Importance of item</h5>
          <Slider thumb persistentThumb min={0} max={10} step={1} bind:value={activeItem.importance} color="white">Importance</Slider>
        </Col>
      </Row>
    </Container>    
  </div>
{/if}
  
<style>
</style>
