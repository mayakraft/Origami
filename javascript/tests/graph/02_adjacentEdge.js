var g02 = new Graph();
fillGraph(g02, 7);

var d3Graph02 = graphToD3(g02);
var svgCanvas02 = d3.select("#svgTest02");
makeForceDirectedGraph(d3Graph02, svgCanvas02, didTouchNode02, didTouchEdge02);

function fillGraph(graph, numNodes){
	var numEdges = numNodes*1.2;
	graph.clear();
	for(var i = 0; i < numNodes; i++) graph.addNode(i);
	for(var i = 0; i < graph.nodes.length; i++){
		// inverse relationship to scramble edges# with node#
		var first = parseInt(graph.nodes.length-1-i);
		var match;
		do{ match = Math.floor(Math.random()*graph.nodes.length);
		} while(match == first);
		graph.addEdge(first, match);
	}
	if(numEdges > numNodes){
		for(var i = 0; i < numEdges - numNodes; i++){
			var rand1 = Math.floor(Math.random()*numNodes);
			var rand2 = Math.floor(Math.random()*numNodes);
			graph.addEdge( rand1, rand2 );
		}
	}
	graph.clean();
}

function didTouchNode02(index, circles, links){
	var highlighted_id = [];
	var highlighted_indices = [];
	if(index != undefined){
		var adjacent = g02.getEdgesAdjacentToNode(index);
		for(var i = 0; i < adjacent.length; i++){
			var nameString = 'link' + adjacent[i];
			highlighted_id.push(nameString);
			highlighted_indices.push(adjacent[i]);
		}
	}
	updateSelection('node' + index, circles, links, highlighted_id);
	updateEdgesAdjacentToNode(index, highlighted_indices);
	updateEdgesAdjacentToEdge(undefined);
	return highlighted_id;
}

function didTouchEdge02(index, circles, links){
	var highlighted_id = [];
	var highlighted_indices = [];
	if(index != undefined){
		var adjacent = g02.getEdgesAdjacentToEdge(index);
		for(var i = 0; i < adjacent.length; i++){
			var nameString = 'link' + adjacent[i];
			highlighted_id.push(nameString);
			highlighted_indices.push(adjacent[i]);
		}
	}
	updateSelection('link' + index, circles, links, highlighted_id);
	updateEdgesAdjacentToEdge(index, highlighted_indices);
	updateEdgesAdjacentToNode(undefined);
	return highlighted_id;
}

function updateSelection(id, circles, links, highlighted_id){
	for(var i = 0; i < circles.length; i++){
		if(id == circles[i].id)                          circles[i].style.stroke = '#F00';
		else if(contains(circles[i].id, highlighted_id)) circles[i].style.stroke = '#09F';
		else                                             circles[i].style.stroke = '#000';
	}
	for(var i = 0; i < links.length; i++){
		if(id == links[i].id)                          links[i].style.stroke = '#F00';
		else if(contains(links[i].id, highlighted_id)) links[i].style.stroke = '#09F';
		else                                           links[i].style.stroke = '#000';
	}
}

function contains(obj, list) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] === obj)
			return true;
	}
	return false;
}