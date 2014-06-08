varying vec3 enterPoint;
varying vec3 camPos; 
varying vec3 dirLuz;
varying vec3 camDir;

struct Objeto
{
	bool intercepta; //O raio intercepta esse objeto?
	int nIntercepta; //Quantas vezes o raio intercepta o objeto
	float entra; //t quando o raio entra no objeto no ponto p=camPos+t*camDir
	float sai; //t quando o raio sai do objeto no ponto p=camPos+t*camDir
	float entra2; //segundo ponto de entrada quando intercepta o objeto duas vezes
	float sai2; //segundo ponto de saida quando intercepta o objeto duas vezes
	float entra3; //terceiro ponto de entrada quando intercepta o objeto tres vezes
	float sai3; //terceiro ponto de saida quando intercepta o objeto duas vezes
	vec3 normalIn;  //Normal para fora do objeto no ponto de entrada
	vec3 normalOut; //Normal para fora do objeto no ponto de saida
	vec3 cor; //Cor do Objeto
}; 
 
struct Esfera
{
	float raio; //Raio da esfera
	vec3 centro; //Centro da esfera
	Objeto o; //Inofrmações de objeto da esfera
};

struct Cuboid
{
	vec3 v1;//Primeiro v
	vec3 v2;
	vec3 v3;
	vec3 v4;
	vec3 v5;
	vec3 v6;
	vec3 v7;
	vec3 v8;//v oposto ao primeiro
	Objeto o; //Inofrmações de objeto da esfera
};

void pinta(vec3 normal, vec3 cor, vec3 p) {
    float difusa = dot(dirLuz, normal);
    difusa = max(difusa, 0.0);
		vec3 vetorLuz = p - dirLuz;
		vec3 vetorLuzRefletido = reflect(-dirLuz, normalize(normal));
		float cos_especular = max(0.0,dot(normalize(vetorLuzRefletido), normalize(camPos)));
		float compEspecular = 32.0;
		float valorReflexaoEspecular = pow(cos_especular,compEspecular);
		vec3 corEspecular = valorReflexaoEspecular * vec3(1.0, 1.0, 1.0);
    gl_FragColor.xyz = cor * 0.2 + cor * difusa * 0.5+0.3*corEspecular;
    //gl_FragColor.xyz = cor;
    gl_FragColor.a = 1.;
}

vec3 getP(float t){
	return camPos+t*camDir;
}

//####################################################################
//#############################Esfera#################################
//####################################################################
Esfera inicializaEsfera (Esfera esfera){
	
	float a;
	float b;
	float c;
	float delta;
	vec3 centro=esfera.centro;
	float raio=esfera.raio;
	a = dot(camDir,camDir);
	b = dot(camDir,camPos-centro);
 	c = dot(camPos-centro,camPos-centro) - (raio*raio);
	delta = b*b - a*c;

	float tIn = (-b-sqrt(delta))/a;
	float tOut = (-b+sqrt(delta))/a;
	esfera.o.entra = tIn;
	esfera.o.sai = tOut;
	vec3 pIn = camPos+tIn*camDir;
	vec3 pOut = camPos+tOut*camDir;
	esfera.o.normalIn=normalize(pIn-centro);
	esfera.o.normalOut=normalize(pOut-centro);
	//delta < 0 está fora da esfera
	if (delta>0.0){
		esfera.o.intercepta=true;
	}else{
		esfera.o.intercepta=false;
	}
	
 	return esfera;

}


//####################################################################
//#############################Cuboid#################################
//####################################################################
Cuboid inicializaCuboid (Cuboid cubo){
	cubo.v2=cubo.v1;
	cubo.v2.x=cubo.v8.x;
	cubo.v3=cubo.v1;
	cubo.v3.y=cubo.v8.y;
	cubo.v4=cubo.v1;
	cubo.v4.xy=cubo.v8.xy;
	cubo.v5=cubo.v1;
	cubo.v5.z=cubo.v8.z;
	cubo.v6=cubo.v1;
	cubo.v6.xz=cubo.v8.xz;
	cubo.v7=cubo.v1;
	cubo.v7.yz=cubo.v8.yz;
	
	
	float delta=0.1;
	vec3 t1;
	vec3 t2;
  vec3 pIn;
  vec3 pOut;
	t1.x= (cubo.v1.x-camPos.x)/camDir.x;
	t1.y= (cubo.v1.y-camPos.y)/camDir.y;
	t1.z= (cubo.v1.z-camPos.z)/camDir.z;
	t2.x= (cubo.v8.x-camPos.x)/camDir.x;
	t2.y= (cubo.v8.y-camPos.y)/camDir.y;
	t2.z= (cubo.v8.z-camPos.z)/camDir.z;

	if (t1.x < t2.x) { //face 1357 antes da face 2468
	    pIn = getP(t1.x);
	    //face 1,3,5,7
	    if (pIn.y > cubo.v1.y && pIn.y < cubo.v7.y && pIn.z > cubo.v1.z && pIn.z < cubo.v7.z) {
	        cubo.o.intercepta = true;
	        cubo.o.entra = t1.x;
	        cubo.o.normalIn = normalize(cubo.v1 - cubo.v2);

	    }
	    pOut = getP(t2.x);
	    //face 2,4,6,8
	    if (pOut.y < cubo.v8.y && pOut.y > cubo.v2.y && pOut.z < cubo.v8.z && pOut.z > cubo.v2.z) {
					cubo.o.sai=t2.x;
					cubo.o.normalOut = normalize(cubo.v2 - cubo.v1);
					
			}
	} else { //face 2468 antes da face 1357
	    pOut = getP(t2.x);
	    //face 2,4,6,8
	    if (pOut.y < cubo.v8.y && pOut.y > cubo.v2.y && pOut.z < cubo.v8.z && pOut.z > cubo.v2.z) {
	        cubo.o.intercepta = true;
	        cubo.o.entra = t2.x;
	        cubo.o.normalIn = normalize(cubo.v2 - cubo.v1);

	    }
	    pIn = getP(t1.x);
	    //face 1,3,5,7
	    if (pIn.y > cubo.v1.y && pIn.y < cubo.v7.y && pIn.z > cubo.v1.z && pIn.z < cubo.v7.z) {
	        cubo.o.sai = t1.x;
	        cubo.o.normalOut = normalize(cubo.v1 - cubo.v2);
					 
	    }
	}
	if (t1.y < t2.y) { //face 1256 antes da face 3478
	    pIn = getP(t1.y);
	    //face 1 , 2 , 5 , 6
	    if (pIn.x > cubo.v1.x && pIn.x < cubo.v6.x && pIn.z > cubo.v1.z && pIn.z < cubo.v6.z) {
	        cubo.o.intercepta = true;
	        cubo.o.entra = t1.y;
	        cubo.o.normalIn = normalize(cubo.v1 - cubo.v3);
	    }
	    pOut = getP(t2.y);
			//face 3,4,7,8
	    if (pOut.x < cubo.v8.x && pOut.x > cubo.v3.x && pOut.z < cubo.v8.z && pOut.z > cubo.v3.z) { 
	        cubo.o.sai = t2.y;
	        cubo.o.normalOut = normalize(cubo.v3 - cubo.v1);
					 
	    }
	} else { //face 3478 antes da face 1256
	    pOut = getP(t2.y);
			//face 3,4,7,8
	    if (pOut.x < cubo.v8.x && pOut.x > cubo.v3.x && pOut.z < cubo.v8.z && pOut.z > cubo.v3.z) { 
	        cubo.o.intercepta = true;
	        cubo.o.entra = t2.y;
	        cubo.o.normalIn = normalize(cubo.v3 - cubo.v1);
	    }
	    pIn = getP(t1.y);
	    //face 1 , 2 , 5 , 6
	    if (pIn.x > cubo.v1.x && pIn.x < cubo.v6.x && pIn.z > cubo.v1.z && pIn.z < cubo.v6.z) {
	        cubo.o.sai = t1.y;
	        cubo.o.normalOut = normalize(cubo.v1 - cubo.v3);
					 
	    }
	}
	 if (t1.z < t2.z) { //face 1234 antes da face 5678
	    pIn = getP(t1.z);
			//face 1 , 2 , 3 , 4
	    if (pIn.x > cubo.v1.x && pIn.x < cubo.v4.x && pIn.y > cubo.v1.y && pIn.y < cubo.v4.y) { 
	        cubo.o.intercepta = true;
	        cubo.o.entra = t1.z;
	        cubo.o.normalIn = normalize(cubo.v1 - cubo.v5);
	    }
	    pOut = getP(t2.z);
			//face 5,6,7,8
	    if (pOut.x < cubo.v8.x && pOut.x > cubo.v5.x && pOut.y < cubo.v8.y && pOut.y > cubo.v5.y) { 
	        cubo.o.sai = t2.z;
	        cubo.o.normalOut = normalize(cubo.v5 - cubo.v1);
					 
	    }
	} else { //face 5678 antes da face 1234
	    pOut = getP(t2.z);
			//face 5,6,7,8
	    if (pOut.x < cubo.v8.x && pOut.x > cubo.v5.x && pOut.y < cubo.v8.y && pOut.y > cubo.v5.y) { 
	        cubo.o.intercepta = true;
	        cubo.o.entra = t2.z;
	        cubo.o.normalIn = normalize(cubo.v5 - cubo.v1);
	    }
	    pIn = getP(t1.z);
			//face 1 , 2 , 3 , 4
	    if (pIn.x > cubo.v1.x && pIn.x < cubo.v4.x && pIn.y > cubo.v1.y && pIn.y < cubo.v4.y) { 
	        cubo.o.sai = t1.z;
	        cubo.o.normalOut = normalize(cubo.v1 - cubo.v5);
					 
	    }
	}

	return cubo;
}

//####################################################################
//#############################INTERSECAO#############################
//####################################################################
Objeto intersecao(Objeto obj_1, Objeto obj_2, bool final) {
	Objeto objNovo;
	float difusa;
	vec3 cor;
	if (!obj_1.intercepta && !obj_2.intercepta) { //Não intercepta ninguem
		gl_FragColor.a = 0.;
		objNovo.intercepta = false;
	}

	if (obj_1.intercepta && obj_2.intercepta) { // intercepta os dois
		objNovo.intercepta = true;
		objNovo.entra = max(obj_1.entra, obj_2.entra);
		objNovo.sai = min(obj_1.sai, obj_2.sai);
		if (obj_1.entra > obj_2.entra) { //entrou depois no objeto 1
			objNovo.normalIn = obj_1.normalIn;
			objNovo.cor = obj_1.cor;
		} else { //entrou depois no objeto 2
			objNovo.normalIn = obj_2.normalIn;
			objNovo.cor = obj_2.cor;
		}
		if (obj_1.sai < obj_2.sai) { //saiu antes do objeto 1
			objNovo.normalOut = obj_1.normalOut;
		} else { //saiu antes do objeto 2
			objNovo.normalOut = obj_2.normalOut;
		}
		if (final) {
					pinta(objNovo.normalIn,objNovo.cor,camPos+objNovo.entra*camDir);
		}
	} else {
		objNovo.intercepta = false;
		gl_FragColor.a = 0.;
	}

	return objNovo;
}

//####################################################################
//#############################UNIAO##################################
//####################################################################
Objeto uniao(Objeto obj_1, Objeto obj_2, bool final) {
    Objeto objNovo;
    float difusa;
    vec3 cor;
    if (!obj_1.intercepta && !obj_2.intercepta) { //Não intercepta ninguem
        gl_FragColor.a = 0.;
        objNovo.intercepta = false;
		    return objNovo;
    }

    if (obj_1.intercepta && obj_2.intercepta) { // intercepta os dois
        objNovo.intercepta = true;
        objNovo.entra = min(obj_1.entra, obj_2.entra);
        objNovo.sai = max(obj_1.sai, obj_2.sai);
        if (obj_1.entra < obj_2.entra) { //entrou antes no objeto 1
            objNovo.normalIn = obj_1.normalIn;
            objNovo.cor = obj_1.cor;
        } else { //entrou antes no objeto 2
            objNovo.normalIn = obj_2.normalIn;
            objNovo.cor = obj_2.cor;
        }
        if (obj_1.sai > obj_2.sai) { //saiu depois do objeto 1
            objNovo.normalOut = obj_1.normalOut;
        } else { //saiu depois do objeto 2
            objNovo.normalOut = obj_2.normalOut;
        }
    } else if (obj_1.intercepta) { // so intercepta objeto 1
        objNovo.intercepta = true;
        objNovo.entra = obj_1.entra;
        objNovo.sai = obj_1.sai;
        objNovo.normalIn = obj_1.normalIn;
        objNovo.normalOut = obj_1.normalOut;
        objNovo.cor = obj_1.cor;
    } else { // so intercepta objeto 2
        objNovo.intercepta = true;
        objNovo.entra = obj_2.entra;
        objNovo.sai = obj_2.sai;
        objNovo.normalIn = obj_2.normalIn;
        objNovo.normalOut = obj_2.normalOut;
        objNovo.cor = obj_2.cor;
    }
    if (final) {
					pinta(objNovo.normalIn,objNovo.cor,camPos+objNovo.entra*camDir);
    }

    return objNovo;
}

//####################################################################
//#############################DIFERENCA##############################
//####################################################################
Objeto diferenca(Objeto obj_1, Objeto obj_2, bool final) { // obj_1 - obj_2
    Objeto objNovo;
    float difusa;
    vec3 cor;
    if (!obj_1.intercepta && !obj_2.intercepta) { //Não intercepta ninguem
        gl_FragColor.a = 0.;
        objNovo.intercepta = false;
        return objNovo;
    }

    if (obj_1.intercepta && obj_2.intercepta) { // intercepta os dois
        if (obj_1.entra < obj_2.entra) { //entrou antes no objeto 1
            objNovo.intercepta = true;
            objNovo.entra = obj_1.entra;
            objNovo.normalIn = obj_1.normalIn;
            objNovo.cor = obj_1.cor;
            if (obj_1.sai < obj_2.entra) { //sai do obj_1 antes de entrar no obj_2
                objNovo.sai = obj_1.sai;
                objNovo.normalOut = obj_1.normalOut;
            } else { //entra no obj 2 antes de sair do obj 1
                objNovo.sai = obj_2.entra;
                objNovo.normalOut = -obj_2.normalIn;
            }
        } else { //entrou antes no objeto 2
            if (obj_2.sai < obj_1.entra) { //sai do obj 2 antes de entrar no obj 1
                objNovo.intercepta = true;
                objNovo.entra = obj_1.entra;
                objNovo.normalIn = obj_1.normalIn;
                objNovo.cor = obj_1.cor;
                objNovo.sai = obj_1.sai;
                objNovo.normalOut = obj_1.normalOut;
            } else { //entra no obj 1 antes de sair do obj 2
                if (obj_1.sai > obj_2.sai) { //sai do obj 1 depois de sair do obj 2
                    objNovo.intercepta = true;
                    objNovo.entra = obj_2.sai;
                    objNovo.normalIn = -obj_2.normalOut;
                    objNovo.cor = obj_1.cor;
                    objNovo.sai = obj_1.sai;
                    objNovo.normalOut = obj_1.normalOut;
                } else { // sai do obj 1 antes de sair do obj 2
                    gl_FragColor.a = 0.;
                    objNovo.intercepta = false;
                    return objNovo;
                }
            }
        }
    } else if (obj_1.intercepta) { // so intercepta objeto 1
        objNovo.intercepta = true;
        objNovo.entra = obj_1.entra;
        objNovo.sai = obj_1.sai;
        objNovo.normalIn = obj_1.normalIn;
        objNovo.normalOut = obj_1.normalOut;
        objNovo.cor = obj_1.cor;
    } else { // so intercepta objeto 2
        gl_FragColor.a = 0.;
        objNovo.intercepta = false;
        return objNovo;
    }
    if (final) {
					pinta(objNovo.normalIn,objNovo.cor,camPos+objNovo.entra*camDir);
    }

    return objNovo;
}


Objeto escala(Objeto obj, float s){
	obj.entra=0.0;
	obj.sai=0.0;
	return obj;
}

void main(void){
	Cuboid cubo1;
	cubo1.v1=vec3(-0.5,-0.5,-0.5);
	cubo1.v8=vec3(0.5,0.5,0.5);
	cubo1.o.cor=vec3(0.0,0.0,1.0);
	cubo1 = inicializaCuboid(cubo1);

	Esfera esfera1;
	esfera1.centro=vec3(0.0,0.0,0.0);
	esfera1.raio=0.6;
	esfera1.o.cor=vec3(0.0,1.0,0.0);
	esfera1 = inicializaEsfera(esfera1);

	Esfera esfera2;
	esfera2.centro=vec3(-0.4,-0.4,0.4);
	esfera2.raio=0.3;
	esfera2.o.cor=vec3(1.0,0.0,0.0);
	esfera2 = inicializaEsfera(esfera2);

	Esfera esfera3;
	esfera3.centro=vec3(0.1,-0.1,0.0);
	esfera3.raio=0.25;
	esfera3.o.cor=vec3(1.0,0.0,0.0);
	esfera3 = inicializaEsfera(esfera3);

	Esfera esfera4;
	esfera4.centro=vec3(-0.1,0.1,0.0);
	esfera4.raio=0.25;
	esfera4.o.cor=vec3(1.0,1.0,0.0);
	esfera4 = inicializaEsfera(esfera4);

	Esfera esfera5;
	esfera5.centro=vec3(-0.1,-0.1,0.0);
	esfera5.raio=0.25;
	esfera5.o.cor=vec3(0.0,1.0,1.0);
	esfera5 = inicializaEsfera(esfera5);

	Objeto objeto1=diferenca(cubo1.o,esfera1.o,false);

	objeto1=diferenca(objeto1,esfera2.o,true);
}
