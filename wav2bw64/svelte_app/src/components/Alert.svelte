<script>
  import { Button, Dialog, Card, CardTitle, CardText, CardActions, } from 'svelte-materialify/src';

  export let active = false;
  export let title = "Warning";
  export let message = "";

  function open() {
    active = true;
  }
  function close() {
    active = false;
  }
</script>
  
<Dialog persistent bind:active>
  <Card>
    <CardTitle>{title}</CardTitle>
    <CardText>
      {message}
    </CardText>
    <CardActions>
      <Button on:click={close} class="blue white-text">Ok</Button>
    </CardActions>
  </Card>
</Dialog>