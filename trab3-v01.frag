varying vec3 enterPoint;
varying vec3 camPos; 
varying vec3 dirLuz;
varying vec3 camDir;

struct Objeto
{
	bool intercepta; //O raio intercepta esse objeto?
	float entra; //t quando o raio entra no objeto no ponto p=camPos+t*camDir
	float sai; //t quando o raio sai do objeto no ponto p=camPos+t*camDir
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
	vec3 vertice1;//Primeiro vertice
	vec3 vertice2;
	vec3 vertice3;
	vec3 vertice4;
	vec3 vertice5;
	vec3 vertice6;
	vec3 vertice7;
	vec3 vertice8;//Vertice oposto ao primeiro
	Objeto o; //Inofrmações de objeto da esfera
};

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

	vec3 p;
	float t = (-b-sqrt(delta))/a;
	esfera.o.entra = (-b-sqrt(delta))/a;
	esfera.o.sai = (-b+sqrt(delta))/a;
	p = camPos+t*camDir;
	vec3 normal=normalize(p-centro);
	esfera.o.normalIn=normal;
	esfera.o.normalOut=-normal;
	float difusa = dot(dirLuz,normal);
	//delta < 0 está fora da esfera
	if (delta>0){
		esfera.o.intercepta=true;
	}else{
		esfera.o.intercepta=false;
	}
	
 	return esfera;

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
			difusa = dot(dirLuz, objNovo.normalIn);
			difusa = max(difusa, 0);
			gl_FragColor.xyz = objNovo.cor * 0.2 + objNovo.cor * difusa * 0.8;
			gl_FragColor.a = 1.;
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
    } else {
        objNovo.intercepta = true;
        objNovo.entra = obj_2.entra;
        objNovo.sai = obj_2.sai;
        objNovo.normalIn = obj_2.normalIn;
        objNovo.normalOut = obj_2.normalOut;
        objNovo.cor = obj_2.cor;
    }
    if (final) {
        difusa = dot(dirLuz, objNovo.normalIn);
        difusa = max(difusa, 0);
        gl_FragColor.xyz = objNovo.cor * 0.2 + objNovo.cor * difusa * 0.8;
        gl_FragColor.a = 1.;
    }

    return objNovo;
}

void main(void){

	Esfera esfera1;
	esfera1.centro=vec3(0.0,0.0,0.0);
	esfera1.raio=1.0;
	esfera1.o.cor=vec3(0.0,1.0,0.0);
	esfera1 = inicializaEsfera(esfera1);

	Esfera esfera2;
	esfera2.centro=vec3(0.0,1.0,0.0);
	esfera2.raio=1.0;
	esfera2.o.cor=vec3(0.0,0.0,1.0);
	esfera2 = inicializaEsfera(esfera2);

	Esfera esfera3;
	esfera3.centro=vec3(1.0,0.0,0.0);
	esfera3.raio=1.0;
	esfera3.o.cor=vec3(1.0,0.0,0.0);
	esfera3 = inicializaEsfera(esfera3);

	Objeto obj_1=intersecao(esfera1.o,esfera2.o,false);

	intersecao(obj_1,esfera3.o,true);
}
