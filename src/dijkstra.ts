import { TGrid, TNode } from './App';
import { TPosition } from './App'

const isNeighborValid = (neighborPos: TPosition, grid: TGrid) => {

  // Check if row is valid
  if (neighborPos.row >= 0 && neighborPos.row < grid.length) {

    // Check if col is valid
    if (neighborPos.col >= 0 && neighborPos.col < grid[neighborPos.row]?.length) {
      const neighbor = grid[neighborPos.row][neighborPos.col];

      // Check if neighbor is alredy processed
      if (neighbor.processed) 
        return false

      return true
    }      

  }

  return false
}

const getNeighbors = (nodePos: TPosition | TNode, grid: TGrid) => {
  const neighborsPos = [
    { row: nodePos.row+1, col: nodePos.col }, // Top
    { row: nodePos.row-1, col: nodePos.col }, // Bottom
    { row: nodePos.row, col: nodePos.col+1}, // Right
    { row: nodePos.row, col: nodePos.col-1 } // Left
  ].filter(neighborPos => isNeighborValid(neighborPos, grid));

  const neighbors = neighborsPos.map(({row, col}) => grid[row][col])

  return neighbors;
}

const getLowestWeightNode = (nodes: TNode[]) => {
  let lowestWeightNode = null;
  let lowestWeightNodeValue = Infinity;
  let lowestWeightNodeIndex = null
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Check if node is already processed
    if (node.processed) {
      continue
    }

    // Check if node is a wall 
    if (node.state === 'wall')
      continue
    
    // Check if node has a lower weight
    else if (node.totalWeight < lowestWeightNodeValue) {
      lowestWeightNode = node;
      lowestWeightNodeValue = node.totalWeight;
      lowestWeightNodeIndex = i;
    }
  }

  return { lowestWeightNode, lowestWeightNodeIndex};
}

// Get all path nodes in their appearing order
const getNodesInPathOrder = (targetNode: TNode) => {
  const nodesInPathOrder = [];
  let currentNode: TNode | null = targetNode;

  while (currentNode !== null) {
    nodesInPathOrder.unshift(currentNode);
    currentNode = currentNode.parentNode;
  }

  return nodesInPathOrder;
}

type Params = {
  grid: TGrid,
  startPos: TPosition
}

const dijkstra = ({ grid, startPos }: Params) => {
  // Get start node neighbors positions
  // The list of nodes for the algorithm to start the search. 
  let initialNeighbors = getNeighbors(startPos, grid);
  let visitedNodesInOrder: TNode[] = [];

  // Set totalWeight of initialNeighbors
  initialNeighbors = initialNeighbors.map(neighbor => ({ ...neighbor, totalWeight: neighbor.initialWeight }));

  // nodes: Each new neighbor found is added to nodes.
  // @ts-ignore
  const findPath = (nodes: TNode[]) => {
    // Get node with lowest total weight
    const { lowestWeightNode, lowestWeightNodeIndex } = getLowestWeightNode(nodes);

    // If it is null, all nodes were processed, there's no other node to process.
    if (lowestWeightNode === null || lowestWeightNodeIndex === null)
      return null;

    // FINISH ALGO
    // Check if lowestWeightNode is the target node
    if (lowestWeightNode.state === 'target') {
      const nodesInPathOrder = getNodesInPathOrder(lowestWeightNode);
      return { visitedNodesInOrder, nodesInPathOrder };
    }
  
    // Get lowestWeightNode neighbors 
    const neighbors = getNeighbors(lowestWeightNode, grid);

    // Calculate new total weight for neighbors
    for (let neighbor of neighbors) {
      const newTotalWeight = lowestWeightNode.totalWeight + neighbor.initialWeight;
  
      // Check if new totalWeight is lower
      if (newTotalWeight < neighbor.totalWeight) {
        // Update neighbor totalWeight
        neighbor.totalWeight = newTotalWeight;
        // Update neighbor parent
        neighbor.parentNode = lowestWeightNode; 
      }
    }
  
    // Mark node as processed
    lowestWeightNode.processed = true;
    // Add to visited nodes
    visitedNodesInOrder.push(lowestWeightNode);
  
    // Update node state
    // lowestWeightNode.state = 'touched'
  
    // The nodes of the next function call
    let nextNodes = nodes.slice()

    // Remove lowestWeightNode from next nodes
    nextNodes.splice(lowestWeightNodeIndex, 1);

    // Set next nodes. The neighbors of the current node will
    // be part of the next nodes.
    nextNodes = nextNodes.concat(neighbors);

    // Call method again
    return findPath(nextNodes);
  }

  return findPath(initialNeighbors);
}

export default dijkstra;
