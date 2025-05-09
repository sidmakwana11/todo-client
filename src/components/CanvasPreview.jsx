
async function CanvasPreview(image, canvas, crop, rotate = 0) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");

  const pixelRatio = window.devicePixelRatio;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  const rotatedRads = rotate * (Math.PI / 180);
  const sin = Math.abs(Math.sin(rotatedRads));
  const cos = Math.abs(Math.cos(rotatedRads));

  const boundingWidth = cropWidth * cos + cropHeight * sin;
  const boundingHeight = cropWidth * sin + cropHeight * cos;

  canvas.width = boundingWidth * pixelRatio;
  canvas.height = boundingHeight * pixelRatio;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  ctx.translate(boundingWidth / 2, boundingHeight / 2);
  ctx.rotate(rotatedRads);

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    -cropWidth / 2,
    -cropHeight / 2,
    cropWidth,
    cropHeight
  );

  ctx.restore();
}

export default CanvasPreview;
