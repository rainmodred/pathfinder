import type { Grid } from "./Grid";
import { Node } from "./Node";

export function createMaze(grid: Grid, nodesToAnimate: Node[]) {
  //border
  for (const row of grid.nodes) {
    for (const node of row) {
      if (
        node.row === 0 ||
        node.row === grid.rows - 1 ||
        node.col === 0 ||
        node.col === grid.cols - 1
      ) {
        nodesToAnimate.push({ ...node, type: "wall" });
      }
    }
  }

  recursiveDivision(
    2,
    2,
    grid.cols - 3,
    grid.rows - 3,
    "VERTICAL",
    nodesToAnimate,
  );
}

export function recursiveDivision(
  row: number,
  col: number,
  width: number,
  height: number,
  orientation: "HORIZONTAL" | "VERTICAL",
  nodesToAnimate: Node[],
) {
  if (width < row || height < col) {
    return;
  }

  if (orientation === "VERTICAL") {
    const wallX = getRandomEvenNumber(row, width);
    const passageY = getRandomOddNumber(col, height);

    for (let i = col - 1; i < height + 2; i++) {
      if (i !== passageY) {
        nodesToAnimate.push(new Node({ row: i, col: wallX, type: "wall" }));
      }
    }

    if (height - col > wallX - 2 - row) {
      recursiveDivision(
        row,
        col,
        wallX - 2,
        height,
        "HORIZONTAL",
        nodesToAnimate,
      );
    } else {
      recursiveDivision(
        row,
        col,
        wallX - 2,
        height,
        orientation,
        nodesToAnimate,
      );
    }

    if (height - col > width - (wallX + 2)) {
      recursiveDivision(
        wallX + 2,
        col,
        width,
        height,
        "HORIZONTAL",
        nodesToAnimate,
      );
    } else {
      recursiveDivision(
        wallX + 2,
        col,
        width,
        height,
        orientation,
        nodesToAnimate,
      );
    }
  } else {
    const wallY = getRandomEvenNumber(col, height);
    const passageX = getRandomOddNumber(row, width);

    for (let i = row - 1; i < width + 2; i++) {
      if (i !== passageX) {
        nodesToAnimate.push(new Node({ row: wallY, col: i, type: "wall" }));
      }
    }

    if (wallY - 2 - col > width - row) {
      recursiveDivision(
        row,
        col,
        width,
        wallY - 2,
        orientation,
        nodesToAnimate,
      );
    } else {
      recursiveDivision(row, col, width, wallY - 2, "VERTICAL", nodesToAnimate);
    }
    if (height - (wallY + 2) > width - row) {
      recursiveDivision(
        row,
        wallY + 2,
        width,
        height,
        orientation,
        nodesToAnimate,
      );
    } else {
      recursiveDivision(
        row,
        wallY + 2,
        width,
        height,
        "VERTICAL",
        nodesToAnimate,
      );
    }
  }
}

//min and max are inclusive
export function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomEvenNumber(from: number, to: number) {
  if (from > to) {
    throw new Error("Invalid range: from can't be greater than to");
  }

  const nums: number[] = [];
  for (let i = from; i <= to; i += 2) {
    nums.push(i);
  }

  return nums[Math.floor(Math.random() * nums.length)];
}

export function getRandomOddNumber(from: number, to: number) {
  if (from > to) {
    throw new Error("Invalid range: from can't be greater than to");
  }

  const nums: number[] = [];
  for (let i = from - 1; i <= to + 1; i += 2) {
    nums.push(i);
  }

  return nums[Math.floor(Math.random() * nums.length)];
}
