import { assertIsDefined } from "./util";
export { drawKeyPoints, initCanvas };

const fingerLookupIndices: {
  [index: string]: any;
} = {
  thumb: [0, 1, 2, 3, 4],
  indexFinge: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  rinfFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawKeyPoints(
  ctx: CanvasRenderingContext2D | null,
  keypoints: Array<Array<number>> | null
): void {
  assertIsDefined(ctx);
  assertIsDefined(keypoints);

  for (let i = 0; i < keypoints.length; i++) {
    const y: number = keypoints[i][0];
    const x: number = keypoints[i][1];
    drawPoint(ctx, x - 2, y - 2, 3);
  }

  const fingers: Array<string> = Object.keys(fingerLookupIndices);
  for (let i = 0; i < fingers.length; i++) {
    const finger: any = fingers[i];
    const points: Array<Array<number>> = fingerLookupIndices[finger].map(
      (index: number) => keypoints[index]
    );
    drawPath(ctx, points, false);
  }
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  points: Array<Array<number>>,
  closePath: boolean
) {
  const region: Path2D = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

function initCanvas(
  video: HTMLVideoElement | null,
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null
): void {
  assertIsDefined(video);
  assertIsDefined(canvas);
  assertIsDefined(ctx);
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  canvas.width = videoWidth;
  canvas.height = videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  ctx.clearRect(0, 0, videoWidth, videoHeight);
  ctx.strokeStyle = "red";
  ctx.fillStyle = "red";
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
}
