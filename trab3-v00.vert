varying vec3 enterPoint;
varying vec3 camPos;
varying vec3 dirLuz;
varying vec3 camDir;
	
void main(void){
	
	enterPoint.xyz =gl_Vertex.xyz;
	camPos = ((gl_ModelViewMatrixInverse * vec4(0.0,0.0,0.0,1.0))).xyz;
	dirLuz = normalize(gl_ModelViewMatrixInverse * gl_LightSource[0].position).xyz;
	camDir = normalize(enterPoint - camPos);
	gl_Position = ftransform();
	//gl_FrontColor = vec4(1.0, 0.0, 0.0, 1.0);
}

