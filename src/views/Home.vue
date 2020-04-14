<template>
  <div class="home">
    <BestTable path="/primers/best_primer.csv"/>
  </div>
</template>

<script>
import BestTable from '@/components/BestTable.vue'

export default {
  name: 'Home',
  components: {
    BestTable
  }
}
</script>
