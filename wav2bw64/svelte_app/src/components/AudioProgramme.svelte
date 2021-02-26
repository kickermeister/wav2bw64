<script>
  import { ADMStore } from '../stores.js';
  import { Select, Row, Col, TextField } from 'svelte-materialify';

  export let activeAP;
  const languages = [
    { name: 'DE', value: 'DE' },
    { name: 'FR', value: 'FR' },
    { name: 'EN', value: 'EN' },
  ];

</script>

<div class="audioProgramme">
  <Row>
    <Col>
      <TextField dense outlined bind:value={ activeAP.name }>Name</TextField>
    </Col>
    <Col>
      Language <Select solo items={languages}>{ activeAP.language }</Select>
    </Col>
  </Row>
  The name of this AudioProgramme is: { activeAP.name }
</div>


<style>
  .audioProgramme{

  }

</style>