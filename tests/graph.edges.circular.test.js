const ear = require("../rabbit-ear");

const arraysMatch = (a, b) => a.forEach((_, i) => expect(a[i]).toBe(b[i]));

test("circular edges", () => {
  const graph = {
    edges_vertices: [
      [0, 1], [1, 3], [2, 2], [4, 1], [3, 0]
    ],
    faces_edges: [
      [0, 1, 2, 3], [0, 3, 4]
    ]
  };
  const res = ear.graph.remove_circular_edges(graph);
  expect(res[2]).toBe(undefined);
  arraysMatch(graph.faces_edges[0], [0, 1, 2]);
  arraysMatch(graph.faces_edges[1], [0, 2, 3]);
});
