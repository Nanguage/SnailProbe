<template>
  <div class=ProbePlot :id="'pp'+this.id">
  </div>
</template>

<script>
import * as d3 from "d3"

let primersToGraph = (primer1, primer2) => {
  let g = {
    nodes: [],
    links: []
  }

  // add primer's nodes and intra-molecular links
  for (let p of [1, 2]) {
    let primer = (p === 1 ? primer1 : primer2)
    let label = "p"+p
    for (let idx=0; idx<primer.length; idx++) {
      let node = {id: label+idx, base: primer[idx], rna: label}
      g['nodes'].push(node)
      if (idx == 0) continue
      let link = {source: label+(idx-1), target: label+idx, type: "intra"}
      g['links'].push(link)
    }
  }

  return g
}

export default {
  name: 'ProbePlot',
  props: ['id', 'primer1', 'primer2'],

  data: () => ({
  }),

  methods: {
    plot() {
      let width = 350, height = 250
      let G = primersToGraph(this.primer1, this.primer2)

      let simulation = d3.forceSimulation(G.nodes)
        .force("link", d3.forceLink(G.links).id(d => d.id).distance(20))
        .force("charge", d3.forceManyBody().strength(-3))
        .force("center", d3.forceCenter(width / 2, height / 2));

      let svg = d3.select("#pp"+this.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      let link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(G.links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

      let drag = (simulation) => {
        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }

      let node = svg.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .selectAll("circle")
          .data(G.nodes)
          .join("circle")
          .attr("r", 10)
          .attr("fill", (n) => (n.rna === 'p1' ? "#ff9c9c" : "#66ccff"))
          .call(drag(simulation));

      let label = svg.append("g")
        .attr("class", "label")
        .selectAll("text")
        .data(G.nodes)
        .enter().append("text")
          .attr("class", "label")
          .text((d) => d.base)

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)

        label
          .attr("x", d => d.x-5)
          .attr("y", d => d.y+5)
          .style("font-size", "13px")
          .style("fill", "#4393c3")
      });

    }
  },

  mounted() {
    this.plot()
  }
}
</script>

<style scoped>
</style>