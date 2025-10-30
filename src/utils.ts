export function timeDiff(startTime: number, endTime: number) {
  return `${endTime - startTime} ms`;
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
