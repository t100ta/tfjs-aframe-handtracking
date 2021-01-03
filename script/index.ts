import "aframe";
// import "aframe-physics-system";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
// eslint-disable-next-line
// @ts-ignore
import * as handpose from "@tensorflow-models/handpose";
import * as THREE from "three";
import { drawKeyPoints, initCanvas } from "./handPose";

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const handPoints = new Array(21);

async function loadCamera(): Promise<HTMLVideoElement> {
  const video: HTMLVideoElement = document.getElementById(
    "video"
  ) as HTMLVideoElement;
  const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      resolve(video);
    };
  });
}

function init3dObject() {
  // type:a-entity
  const handContainer: HTMLElement = document.getElementById(
    "hand"
  ) as HTMLElement;
  const len: number = handPoints?.length;

  for (let i = 0; i < len; i++) {
    // type:a-sphere
    const landmark: HTMLElement = document.createElement("a-sphere");
    landmark.setAttribute("color", "blue");
    landmark.setAttribute("scale", "8 8 8");
    handContainer.appendChild(landmark);
    handPoints[i] = landmark;
  }
}

async function main() {
  let pinchStatus = false;
  let box: HTMLElement | undefined;
  const video: HTMLVideoElement = await loadCamera();

  const subscreen: HTMLDivElement = document.getElementById(
    "subscreen"
  ) as HTMLDivElement;
  subscreen?.addEventListener("click", () => {
    subscreen.classList.toggle("large");
  });

  init3dObject();

  const canvas: HTMLCanvasElement = document.getElementById(
    "output2d"
  ) as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D | null = canvas?.getContext("2d");
  initCanvas(video, canvas, ctx);

  await tf.setBackend("webgl");
  const model = await handpose.load();

  async function frameLandmarks() {
    ctx?.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const hands: Array<any> = await model?.estimateHands(video);
    if (hands.length > 0) {
      const hand = hands[0];
      // drawKeyPoints(ctx, hand.landmarks, hand.annotations);
      drawKeyPoints(ctx, hand.landmarks);

      hand.landmarks.forEach((landmark: Array<number>, index: number) => {
        handPoints[index].setAttribute("position", {
          x: landmark[0],
          y: landmark[1],
          z: landmark[2] * 2.5,
        });
      });

      const v4 = new THREE.Vector3(
        hand.landmarks[4][0],
        hand.landmarks[4][1],
        hand.landmarks[4][2] * 2.5
      );
      const v8 = new THREE.Vector3(
        hand.landmarks[8][0],
        hand.landmarks[8][1],
        hand.landmarks[8][2] * 2.5
      );
      const pinchLength: number = v4.distanceTo(v8);

      if (pinchStatus && pinchLength > 100) {
        pinchStatus = !pinchStatus;
        box?.setAttribute("dynamic-body", "");
        box = undefined;
      } else if (!pinchStatus && pinchLength < 50) {
        console.log("enter the box creator");
        pinchStatus = !pinchStatus;

        // type:a-entity
        const handContainer: HTMLElement | null = document.getElementById(
          "hand"
        );
        box = document.createElement("a-box");
        box.id = "box";
        box.setAttribute("scale", "100 100 100");
        box.setAttribute("color", "cyan");

        console.log(`${v8.x} ${v8.y} ${v8.z}`);

        box.setAttribute("position", `${v8.x} ${v8.y} ${v8.z}`);
        box.setAttribute("shadow", "");

        handContainer?.appendChild(box);
      }
      if (box) {
        box.setAttribute("position", `${v8.x} ${v8.y} ${v8.z}`);
      }
    }
    requestAnimationFrame(frameLandmarks);
  }
  frameLandmarks();
}

window.onload = function () {
  try {
    main();
  } catch (e) {
    console.log(e);
  }
};
