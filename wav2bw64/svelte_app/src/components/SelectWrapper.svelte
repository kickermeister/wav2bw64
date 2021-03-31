<script>
	import { Select } from "svelte-materialify/src";
	const format = (val) => items.find(i => i.value == val).name;
	
	export let items;
	export let value;
    export let solo;
    export let placeholder;
    export let mandatory = false;

</script>

<Select {mandatory} {solo} {placeholder} {items} bind:value {format} on:change>
	<slot/>
</Select>