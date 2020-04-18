<template>
  <div class="BestTable">
    <h1>Best primers</h1>
    <table>
      <tbody>
        <tr>
          <th>plot</th>
          <th>Information</th>
        </tr>
        <tr v-for="(item, i) in items" v-bind:key="i">
          <td>
            <ProbePlot
              :id=i
              :primer1=item.primer1
              :primer2=item.primer2
            />
          </td>
          <td>
            <p>{{ item['primer1'] }}</p>
            <p>{{ item['primer2'] }}</p>
          </td>
        </tr>
      </tbody>
    </table>
 </div>
</template>

<script>
import {parseCSV} from '@/utils.js'
import ProbePlot from '@/components/ProbePlot.vue'

export default {
  name: 'BestTable',

  props: {
    path: String
  },

  components: {
    ProbePlot,
  },

  data: () => ({
    items: []
  }),

  methods: {
    loadFile () {
      fetch(this.path).then((resp) => (
        resp.text()
      )).then((text) => {
        this.items = parseCSV(text)
      })    
    },
  },

  beforeMount() {
    this.loadFile()
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
  max-width: 500px;
  margin: auto;
}

th, td {
  text-align: left;
  padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2}

th {
  background-color: #56b981;
  color: white;
}


</style>