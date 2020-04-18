<template>
  <div class=ProbePlot :id="'pp'+this.id">
  </div>
</template>

<script>
import * as d3 from "d3"
import _ from 'lodash'
import { reverseComplement } from "@/utils.js"


const getTargetSeq = (primer1, primer2) => {
  let target = ""
  const armLength = 13
  target += reverseComplement(primer1.slice(0, armLength))
  target += reverseComplement(primer1.slice(primer1.length-armLength, primer1.length))
  target += reverseComplement(primer2.slice(0, 14))
  return target
}

const primersToGraph = (primer1, primer2) => {
  let g = {
    nodes: [],
    links: []
  }
  let target = getTargetSeq(primer1, primer2)
  let seqs = {"p1": primer1, "p2": primer2, "t": target}

  // add all seq's nodes and intra-molecular links
  for (let [label, seq] of Object.entries(seqs)) {
    for (let idx=0; idx<seq.length; idx++) {
      let node = {id: label+"_"+idx, base: seq[idx], label: label}
      g['nodes'].push(node)
      if (idx == 0) continue
      let link = {source: label+"_"+(idx-1),
                  target: label+"_"+idx,
                  type: "intra"}
      g['links'].push(link)
    }
  }

  const armLength = 13;
  // add inter-molecular links
  for (let idx=0; idx<armLength; idx++) {
    let link;
    // p1's head link with target
    link = {source: "p1_"+idx, target: "t_"+(armLength-1-idx), type:"inter"}
    g['links'].push(link)
    // p1's tail link with target
    let p1_len = seqs["p1"].length
    link = {source: "p1_"+(p1_len-idx-1), target: "t_"+(armLength+idx), type:"inter"}
    g['links'].push(link)
    // p2's link with target
    let t_len = seqs["t"].length
    link = {source: "p2_"+idx, target: "t_"+(t_len-1-idx), type:"inter"}
    g['links'].push(link)
  }
  const halfCommon = seqs['p2'].length - armLength - 1;
  // p2's link with p1
  for (let idx=0; idx<halfCommon; idx++) {
    let p1_len = seqs["p1"].length
    let link = {source: "p2_"+(armLength+1+idx),
                target: "p1_"+(p1_len-armLength-1-idx),
                type:"inter"}
    g['links'].push(link)
  }

  return g
}

export default {
  name: 'ProbePlot',
  props: ['id', 'primer1', 'primer2'],

  methods: {
    plot() {
      let width = 600, height = 280
      let G = primersToGraph(this.primer1, this.primer2)

      // assign t's position
      let margin = 30
      let t_nodes = _.filter(G['nodes'], (n) => (n.id.startsWith('t')))
      for (let n of t_nodes) {
        let i = parseInt(n.id.split("_")[1])
        n['fx'] = margin + i*(width - margin*2) / t_nodes.length
        n['fy'] = height - margin
      }


      let simulation = d3.forceSimulation(G.nodes)
        .force("center", d3.forceCenter(width / 2.25, height / 1.42))
        .force("link", d3.forceLink(G['links']).id(d => d.id).distance(7).strength(2))
        .force("charge", d3.forceManyBody().strength(-3))
        .force("collide", d3.forceCollide(7))

      let svg = d3.select("#pp"+this.id)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      let linkIntra = svg.append("g")
        .selectAll("line")
        .data(_.filter(G.links, (l)=>(l.type==='intra')))
        .join("line")
        .attr("stroke-width", 3)
        .attr("stroke", "blue")
        .attr("stroke-opacity", 0.6);

      let linkInter = svg.append("g")
        .selectAll("line")
        .data(_.filter(G.links, (l)=>(l.type==='inter')))
        .join("line")
        .attr("stroke-width", 3)
        .attr("stroke", "red")
        .attr("stroke-opacity", 0.6);

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
          .attr("r", 5)
          .attr("fill", (n) => {
            switch (n.label) {
              case 'p1':
                return "#ff9c9c";
              case 'p2':
                return "#66ccff";
              default:
                return "#ccff55";
            }
          })
          .call(drag(simulation));

      let label = svg.append("g")
        .attr("class", "label")
        .selectAll("text")
        .data(G.nodes)
        .enter().append("text")
          .attr("class", "label")
          .text((d) => d.base)
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .style("fill", "black")
        .call(drag(simulation))

      svg.append("g")
        .selectAll("text")
        .data([{"label": "pad-probe", "x": width/8,   "y": height/2},
               {"label": "amp-probe", "x": width/1.5, "y": height/1.3},
               {"label": "target-seq","x": width/2.4, "y": height-5}])
        .enter().append("text")
          .attr("class", "seq-label")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .text((d) => d.label)
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .style("fill", "black")

      simulation.on("tick", () => {
        linkIntra
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
        linkInter
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