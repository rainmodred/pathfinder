import { bfs } from "./algorithms/bfs";
import type { Grid } from "./Grid";
import type { NodeType, Node } from "./Node";
import type { View } from "./View";

export class Controller {
  private grid: Grid;
  private view: View;

  private nodeType: NodeType;

  constructor(grid: Grid, view: View) {
    this.grid = grid;
    this.view = view;

    this.view.onMouseDown(this.handleMouseDown.bind(this));
    this.view.onMouseMove(this.handleMouseMove.bind(this));
    this.view.onMouseUp();

    this.nodeType = "wall";
  }

  setNodeType(nodeType: NodeType) {
    this.nodeType = nodeType;
  }

  render() {
    this.view.drawGrid(this.grid.rows, this.grid.cols);
    this.view.drawNodes(this.grid.nodes);
  }

  handleMouseDown(row: number, col: number) {
    this.grid.setNode(row, col, this.nodeType);
    this.view.drawNodes(this.grid.nodes);

    if (this.nodeType === "start" || this.nodeType === "end") {
      this.view.isPlacing = false;
    } else {
      this.view.isPlacing = true;
    }
  }

  handleMouseMove(row: number, col: number) {
    this.grid.setNode(row, col, this.nodeType);
    this.view.drawNodes(this.grid.nodes);
  }

  search(algorithm: string, onStart: () => void, onFinish: () => void) {
    onStart();
    const nodesToAnimate: Node[] = [];

    const { path, visited } = bfs(this.grid, nodesToAnimate);
    console.log("path:", path, nodesToAnimate);

    this.view.animate(nodesToAnimate, 0);

    onFinish();
  }
}
