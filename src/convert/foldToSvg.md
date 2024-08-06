# FOLD to SVG conversion

render a FOLD object into an SVG. This includes interpreting the origami as a crease pattern or of a folded model, and will style the rendering accordingly.

## API

main entry point

```javascript
ear.convert.foldToSvg(FOLD, options)
```

create as a child of an SVG that was initialized using this library.

```javascript
const mySVG = ear.svg()
mySVG.origami(FOLD)
```

this is the main draw subroutine which draws and appends the components onto the `element`:

```javascript
ear.convert.foldToSvg.drawInto(element, FOLD, options)
```

these subroutines are made available to the user which draw individual components and return one `<g>` group container:

```javascript
ear.convert.foldToSvg.boundaries(FOLD, options)
ear.convert.foldToSvg.faces(FOLD, options)
ear.convert.foldToSvg.edges(FOLD, options)
ear.convert.foldToSvg.vertices(FOLD, options)
```

convenience method, return the string value for a viewBox which contains the FOLD object, for example: "-10 -15 310 310"

```javascript
ear.convert.foldToSvg.getViewBox(FOLD)
```

## options object

```javascript
options = {
	// component level
	vertices: false,
	edges: {},
	faces: {},
	boundaries: {},
	// top level
	viewBox: true,
	strokeWidth: 0.01,
	radius: 0.2,
};
```

All top level methods accept the same options object. The subroutines which draw individual components take the individual component entries from this example options object (for example, drawing edges takes the "edges:" options entry only).

### component level

vertices, edges, faces, boundaries: these can be either an `object` or a `boolean`

- `boolean` with a "false" will turn skip rendering this layer
- `object` with css-style tags (kebab-case keys) will apply style as attribute tags.

"edges" and "faces" contains special subcategories. Edges can target any of the FOLD-spec edges_assignment classes: mountain, valley, boundary, flat, unassigned. Faces can target front and back, which

```javascript
options = {
	edges: {
		mountain: { stroke: "red" },
		valley: { stroke: "blue" },
	},
	faces: {
		front: { fill: "#369" },
		back: { fill: "white" },
	},
};
```

### top level

viewBox: `boolean`, if this is present, the SVG viewbox will be reset to fit the x-y coordinates from the FOLD object. If the element being draw into is not an `<svg>` (like a `<g>` for example), this will crawl up the parent-tree until it finds an `<svg>`, there the viewBox is set.

strokeWidth, radius: either `number` or `boolean`. "radius" means the radius of all circles (vertices):

- `number`: set this attribute to be a scale of the vmax (max length of x or y axis) of the FOLD object. I remember it as a "percentage of the longest length".
- `boolean`: set the attribute to its default: `stroke-width: 1/100` `radius: 1/50` factors of vmax, the longest side-length of the FOLD object.

stroke-width will be set to the top level group, radius needs to be set on each individual `<circle>` element.
