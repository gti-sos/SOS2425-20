<script>
    import Header from "./Header.svelte";
    import Footer from "./Footer.svelte";
    let name = "jose";
</script>

<Header></Header>
<hr>
    <slot></slot>
<hr>

<Footer></Footer>


