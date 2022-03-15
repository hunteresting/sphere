varying vec3 vertexNormal; // (0, 0, 0)
void main() {
  float intensity = pow(0.6 - dot(vertexNormal, vec3(0, 0, 1.0)), 2.0);
  gl_FragColor = vec4(0.02,0.01,0.9, 1.0) * intensity;
}