export interface FinderRenderOptions {
  x: number;
  y: number;
  moduleSize: number;
  color: string;
  ctx?: CanvasRenderingContext2D;
}

export interface QRFinderRenderer {
  render(options: FinderRenderOptions): string;
}
