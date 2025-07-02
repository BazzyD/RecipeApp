declare module 'ml-knn' {
  interface KNNOptions {
    distance?: (a: number[], b: number[]) => number;
  }

  class KNN {
    constructor(data: number[][], labels: number[], options?: KNNOptions);
    predict(data: number[][], options?: { k?: number }): number[];
  }

  export default KNN;
}
