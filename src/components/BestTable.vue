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
              :color=color
              :armLength=armLength
            />
          </td>
          <td>
            <p><b>pad-probe:</b></p>
            <p v-html="coloringPrimer(item['primer1'], 'p1', color, armLength)"></p>
            <p><b>amp-probe:</b></p>
            <p v-html="coloringPrimer(item['primer2'], 'p2', color, armLength)"></p>
            <p><b>tm-region: </b>{{parseFloat(item['tm_region']).toFixed(2)}}</p>
            <p><b>RNA-fold score: </b>{{parseFloat(item['RNAfold_score']).toFixed(2)}}</p>
            <p>
              <a href="#">see all</a>
              <a href="#" style="padding-left:30px">secondary sctructure</a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
 </div>
</template>

<script>
import {parseCSV, coloringPrimer} from '@/utils.js'
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
    items: [],
    color: {
        'leftArm': '#ff9c9c',
        'rightArm': '#66ccff',
        'common': '#ffb356',
        'single': '#33ff33',
        'default': '#aaa',
    },
    armLength: 13,
    coloringPrimer: coloringPrimer,
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