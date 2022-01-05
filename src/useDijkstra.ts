import { useState, useEffect } from 'react';
import { RowListType, CellType } from './components/Board/Board';
import { TPosition } from './App'

// startPos: 0-0
// Neighbors: 0-1 (row:col+1), 1-0 (row-1:col), (row+1:col), (row:col-1)

const isNeighborValid = (neighborPos: TPosition, rowList: RowListType) => {

  // Check if row is valid
  if (neighborPos.row >= 0 && neighborPos.row < rowList.length) {

    // Check if col is valid
    if (neighborPos.col >= 0 && neighborPos.col < rowList[neighborPos.row]?.length) {
      const neighbor = rowList[neighborPos.row][neighborPos.col];

      // Check if neighbor is alredy processed
      if (neighbor.processed) 
        return false

      return true
    }      

  }

  return false
}

const getNeighbors = (nodePos: TPosition | CellType, rowList: RowListType) => {
  const neighborsPos = [
    { row: nodePos.row+1, col: nodePos.col }, // Top
    { row: nodePos.row-1, col: nodePos.col }, // Bottom
    { row: nodePos.row, col: nodePos.col+1}, // Right
    { row: nodePos.row, col: nodePos.col-1 } // Left
  ].filter(neighborPos => isNeighborValid(neighborPos, rowList));

  const neighbors = neighborsPos.map(({row, col}) => rowList[row][col])

  return neighbors;
}

const getLowestWeightNode = (nodes: CellType[]) => {
  let lowestWeightNode = null;
  let lowestWeightNodeValue = Infinity;
  let lowestWeightNodeIndex = null
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Check if node is already processed
    if (node.processed)
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

class Dijkstra {
  // The initial nodes to start the algo. They are the start node neighbors.
  private initialNodes: CellType[];
  private rowList: RowListType;
  private onRowListUpdate: Function;

  constructor(startPos: TPosition, rowList: RowListType, onRowListUpdate: Function) {
    this.rowList = rowList;
    this.onRowListUpdate = onRowListUpdate;

    // Get initial nodes (start node neighbors)
    this.initialNodes = getNeighbors(startPos, rowList);
  }

  // init() {
  //   this.findPath(this.initialNodes);
  // }

  // findPath(nodes: CellType[]): Function | CellType | null {
  //   console.log(nodes);

  //   // Get node with lowest total weight
  //   const { lowestWeightNode, lowestWeightNodeIndex } = getLowestWeightNode(nodes);
  
  //   // If it is null, all nodes were processed, there's no other node to process.
  //   if (lowestWeightNode === null || lowestWeightNodeIndex === null)
  //     return null;

  //   // Check if lowestWeightNode is the finish node
  //   if (lowestWeightNode.state === 'target') 
  //   {
  //     console.log({lowestWeightNode})
  //     return lowestWeightNode;
  //   }

  //   // Get lowestWeightNode neighbors 
  //   const neighbors = getNeighbors(lowestWeightNode, this.rowList);

  //   // Calculate new total weight for neighbors
  //   for (let neighbor of neighbors) {
  //     const newTotalWeight = lowestWeightNode.totalWeight + neighbor.initialWeight;

  //     // Check if new totalWeight is lower
  //     if (newTotalWeight < neighbor.totalWeight) {
  //       // Update neighbor totalWeight
  //       neighbor.totalWeight = newTotalWeight;
  //       // Update neighbor parent
  //       neighbor.parentPos = { row: lowestWeightNode.row, col: lowestWeightNode.col } 
  //     }
  //   }

  //   // Mark node as processed
  //   lowestWeightNode.processed = true;

  //   // Update node state
  //   lowestWeightNode.state = 'touched'

  //   // Update rowList state
  //   this.onRowListUpdate(lowestWeightNode);

  //   // Remove lowestWeightNode from nodes
  //   nodes.splice(lowestWeightNodeIndex, 1);

  //   // Set next nodes. The neighbors of the current node will
  //   // be part of the next nodes.
  //   const nextNodes = nodes.concat(neighbors);

  //   return this.findPath(nextNodes);
  // }
}


type Params = {
  startPos: TPosition,
  rowList: RowListType,
  onRowListUpdate: Function,
  onFinish: Function
}

const useDijkstra = ({ startPos, rowList, onRowListUpdate, onFinish }: Params) => {
  // The list of nodes for the algorithm to search. 
  // Each new neighbor found is added to nodes.
  const initialNodes = getNeighbors(startPos, rowList)

  const findPath = (nodes: CellType[]) => {
    // Get node with lowest total weight
    const { lowestWeightNode, lowestWeightNodeIndex } = getLowestWeightNode(nodes);

    // If it is null, all nodes were processed, there's no other node to process.
    if (lowestWeightNode === null || lowestWeightNodeIndex === null)
      return null;
  
    // Check if lowestWeightNode is the finish node
    if (lowestWeightNode.state === 'target') {
      // Finish algo
      return onFinish(lowestWeightNode.parentPos);
    }
  
    // Get lowestWeightNode neighbors 
    const neighbors = getNeighbors(lowestWeightNode, rowList);

    // Calculate new total weight for neighbors
    for (let neighbor of neighbors) {
      const newTotalWeight = lowestWeightNode.totalWeight + neighbor.initialWeight;
  
      // Check if new totalWeight is lower
      if (newTotalWeight < neighbor.totalWeight) {
        // Update neighbor totalWeight
        neighbor.totalWeight = newTotalWeight;
        // Update neighbor parent
        neighbor.parentPos = { row: lowestWeightNode.row, col: lowestWeightNode.col } 
      }
    }
  
    // Mark node as processed
    lowestWeightNode.processed = true;
  
    // Update node state
    lowestWeightNode.state = 'touched'
  
    // Update rowList state
    onRowListUpdate(lowestWeightNode);
  
    // The nodes of the next render
    let nextNodes = [...nodes]

    // Remove lowestWeightNode from nodes
    nextNodes.splice(lowestWeightNodeIndex, 1);

    // Set next nodes. The neighbors of the current node will
    // be part of the next nodes.
    nextNodes = nextNodes.concat(neighbors);

    // Call method again after 1 second
    return setTimeout(() => {
      findPath(nextNodes);
    }, 80);
  }

  return { 
    run: () => findPath(initialNodes)
  }
}

export default useDijkstra;