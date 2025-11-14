import { aStar } from "./algorithms/aStar";
import { bfs } from "./algorithms/bfs";
import { dfs } from "./algorithms/dfs";
import type { Grid } from "./Grid";
import { createMaze } from "./maze";
import type { NodeType, Node } from "./Node";
import type { Speed, View } from "./View";

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

    console.log(algorithm);
    let result: { path: Node[]; visited: number };
    switch (algorithm) {
      case "bfs":
        result = bfs(this.grid, nodesToAnimate);
        break;
      case "dfs":
        result = dfs(this.grid, nodesToAnimate);
        break;
      case "aStar":
        result = aStar(this.grid, nodesToAnimate);
        break;
    }

    this.view.animate(nodesToAnimate, 0, () => {
      this.view.drawPath(result.path);

      onFinish();
    });
  }

  createMaze(onFinish: () => void) {
    const nodesToAnimate: Node[] = [];
    createMaze(this.grid, nodesToAnimate);
    console.log(nodesToAnimate);

    for (const node of nodesToAnimate) {
      this.grid.setNode(node.row, node.col, node.type);
    }

    console.log(this.grid);
    this.view.animateCreateMaze(nodesToAnimate, 0, onFinish);
  }

  clearPath() {
    this.view.drawGrid(this.grid.rows, this.grid.cols);
    this.view.drawNodes(this.grid.nodes);
  }

  reset() {
    this.grid.reset();
    this.view.stopAnimation();
    this.clearPath();
  }

  setSpeed(name: Speed) {
    this.view.speed = name;
  }
}
