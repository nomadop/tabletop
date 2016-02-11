function rayPlaneIntersection(linePoint, lineVector, planePoint, planeVector) {
  const [m1, m2, m3] = linePoint;
  const [v1, v2, v3] = lineVector;
  const [n1, n2, n3] = planePoint;
  const [vp1, vp2, vp3] = planeVector;

  const vpt = v1 * vp1 + v2 * vp2 + v3 * vp3;
  const t = ((n1 - m1) * vp1 + (n2 - m2) * vp2 + (n3 - m3) * vp3) / vpt;

  return [
    m1 + v1 * t,
    m2 + v2 * t,
    m3 + v3 * t
  ];
}

export function originalToPerspective(originalPoint, translateX, translateY, rotate, scale) {
  const translatedPoint = [
    originalPoint[0] - translateX,
    originalPoint[1] - translateY,
  ];

  const rotateRad = Math.PI * rotate / 180;
  const rotateSin = Math.sin(rotateRad);
  const rotateCos = Math.cos(rotateRad);
  const rotatedPoint = [
    translatedPoint[0] * rotateCos - translatedPoint[1] * rotateSin,
    translatedPoint[0] * rotateSin + translatedPoint[1] * rotateCos
  ];

  return rotatedPoint.map(value => value * scale);
}

export function perspectiveToOriginal(perspectivePoint, translateX, translateY, rotate, scale) {
  const unscaledPoint = perspectivePoint.map(value => value / scale);

  const unrotate = -rotate;
  const unrotateRad = Math.PI * unrotate / 180;
  const unrotateSin = Math.sin(unrotateRad);
  const unrotateCos = Math.cos(unrotateRad);
  const unrotatedPoint = [
    unscaledPoint[0] * unrotateCos - unscaledPoint[1] * unrotateSin,
    unscaledPoint[0] * unrotateSin + unscaledPoint[1] * unrotateCos
  ];

  return [
    unrotatedPoint[0] + translateX,
    unrotatedPoint[1] + translateY
  ];
}

export function perspectiveToScreen(perspectivePoint, perspective, angle) {
  const rad = Math.PI * angle / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const perspectiveX = perspectivePoint[0];
  const perspectiveY = perspectivePoint[1] * cos;
  const perspectiveZ = perspectivePoint[1] * sin;

  const viewPoint = [0, 0, perspective];
  const viewVector = [
    perspectiveX - viewPoint[0],
    perspectiveY - viewPoint[1],
    perspectiveZ - perspective
  ];
  const planePoint = [0, 0, 0];
  const planeVector = [0, 0, 1];

  const intersection = rayPlaneIntersection(viewPoint, viewVector, planePoint, planeVector);

  const [interX, interY] = intersection;
  return [interX, interY, perspectiveZ];
}

export function screenToPerspective(screenPoint, perspective, angle) {
  const rad = Math.PI * angle / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const viewPoint = [0, 0, perspective];
  const viewVector = [
    screenPoint[0] - viewPoint[0],
    screenPoint[1] - viewPoint[1],
    -perspective
  ];
  const planePoint = [0, 0, 0];
  const planeVector = [0, -sin, cos];

  const intersection = rayPlaneIntersection(viewPoint, viewVector, planePoint, planeVector);

  const [interX, interY] = intersection;
  const resultY = interY / cos;
  const resultX = interX;
  return [resultX, resultY];
}
