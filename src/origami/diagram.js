import math from "../../include/math";
import { get_boundary_face } from "../graph/make";

/*

an axiom frame is signified by the key "re:axiom" and contains:
- "number", the axiom number,
- "marks", optional, array of arrays specifying points

this is a definition frame:

"re:axiom"
{
  number: 6,
  parameters: {
    marks: [
      [0.97319, 0.05149],
      [0.93478, 0.93204]
    ],
    lines: [
      [[0.36585, 0.01538], [0.707, 0.707]],
      [[0.16846, 0.64646], [1, 0]]
    ]
  }
}

this is a solution frame. same as definition but includes a "solution"

"re:axiom"
{
  number: 2,
  parameters: {
    marks: [[0, 0.25], [1, 1]]
  },
  solutions: [{
    line: [[0.5, 0.625], [0.6, -0.8]]
  }]
}

*/


export const axiom_operation = function(axiomNumber, marks, lines) {

}

export const fold_operation = function(isValley, ) {

}

/** 
 *  generate a graph["re:construction"] section 
 */
export const construction_frame = function(type, parameters) {
  return {
    "re:construction_type": type,
    "re:construction_parameters": parameters
  };
  // Object.keys(parameters)
  //  .filter(key => key !== type)
  //  .forEach(key => o["re:construction_parameters"][key] = parameters[key]);
  // return o;
}

/*



"re:construction" example

{
  axiom: 2,
  type: "valley",
  direction: [0.0435722, -0.999050],
  edge: [[0, 0.45016], [1, 0.49377]],
  parameters: { marks: [[0.97319, 0.05149], [0.93478, 0.93204]] }
}


"re:axiom"
{
  number: 2,
  parameters: { marks: [[0.97319, 0.05149], [0.93478, 0.93204]] }
}

*/

// "re:diagrams" example (these are objects inside arrays):
// [{
//  "re:diagram_lines": [{
//    "re:diagram_line_classes": ["valley"],
//    "re:diagram_line_coords": [[0,0.2], [1,0.5]]
//  }],
//  "re:diagram_arrows": [{
//    "re:diagram_arrow_classes": [],
//    "re:diagram_arrow_coords": [[0.6,0], [0.3,1]]
//  }]
// }]

const instructions_for_axiom = {
  en:[null,
    "make a crease that passes through two points",
    "make a crease by bringing one point to another",
    "make a crease by bringing one line onto another",
    "make a crease by bringing one line onto itself and passing through a point",
    "make a crease",
    "make a crease",
    "make a crease"
  ]
};

export const build_diagram_frame = function(graph) {
  let c = graph["re:construction"];
  if (c == null) {
    console.warn("couldn't build diagram. construction info doesn't exist");
    return;
  }
  switch (c["re:construction_type"]) {
    case "flip":
      return {
        "re:diagram_arrows": [{
          "re:diagram_arrow_classes": ["flip"],
          "re:diagram_arrow_coords": []
        }],
        "re:instructions": { "en": "flip over" }
      };
      break;
    case "mountain":
    case "valley":
      return {
        "re:diagram_lines": [{
          "re:diagram_line_classes": [c["re:construction_type"]],
          "re:diagram_line_coords": c["re:construction_parameters"].edge,
        }],
        "re:diagram_arrows": [{
          "re:diagram_arrow_classes": [],
          "re:diagram_arrow_coords": make_arrow_coords(c, graph)
        }],
        "re:instructions": {
          "en": instructions_for_axiom.en[c.axiom] || (c["re:construction_type"] + " fold")
        }
      };
      break;
    default:
      return {"error": "could not determine construction type"};
      break;
  }
}

// todo: make_arrow_coords is asking for graph to calculate the
// bounding box, to clip the arrow nicely in frame. this should be
// pre-calculated


// intersect is a point on the line,
// the point which the arrow should be cast perpendicularly across
// when left undefined, intersect will be the midpoint of the line.
// const drawArrowAcross = function(crease, crossing){
// "construction" is an object that contains {
//  axiom: #number#          // which axiom was used
//  edge: [[x,y], [x,y]]     // the fold line
//  direction: [x,y]         // the normal to the fold line, direction of fold
// }
export const make_arrow_coords = function(construction, graph) {

  let p = construction["re:construction_parameters"];
  let axiom = "re:axiom" in construction === true
    ? construction["re:axiom"].number
    : 0;
  let axiom_frame = construction["re:axiom"];
  // axiom 2, simplest case
  if (axiom === 2) {
    // todo: these are reversed
    return [axiom_frame.parameters.points[1], axiom_frame.parameters.points[0]];
  }
  if (axiom === 7) {
    // todo: these are reversed
    // axiom_frame.test.points_reflected[0]
    return [axiom_frame.test.points_reflected[0], axiom_frame.parameters.points[0]];
  }
  let crease_vector = [
    p.edge[1][0] - p.edge[0][0],
    p.edge[1][1] - p.edge[0][1]
  ];
  let arrow_vector = p.direction;
  let crossing;
  switch (axiom) {
    case 4: 
      crossing = math.core.intersection.nearest_point(
        p.edge[0], crease_vector, axiom_frame.parameters.lines[0][0], ((a)=>a));
      break;
    case 7:
      crossing = math.core.intersection.nearest_point(
        p.edge[0], crease_vector, axiom_frame.parameters.points[0], ((a)=>a));
      break;
    default:
        crossing = math.core.average(p.edge);
        break;
  }
  let perpLine = { point: crossing, vector: arrow_vector };

  let boundary = get_boundary_face(graph).vertices
    .map(v => graph.vertices_coords[v]);
  let perpClipEdge = math.core.intersection.convex_poly_line(
    boundary, crossing, arrow_vector);
  if (perpClipEdge === undefined) {
    // todo: something is causing this to happen. when you flip over the page, far from where it started, then perform folds. when your fold starts and ends outside the bounds of the piece on one side of it.
    return [];
  }
  let short_length = [perpClipEdge[0], perpClipEdge[1]]
    .map(n => math.core.distance2(n, crossing))
    .sort((a,b) => a-b)
    .shift();
  if (p.axiom === 7) {
    short_length = math.core.distance2(p.marks[0], crossing);
  }
  let short_vector = arrow_vector.map(v => v * short_length);
  return [
    crossing.map((c, i) => c - short_vector[i]),
    crossing.map((c, i) => c + short_vector[i])
  ];
}