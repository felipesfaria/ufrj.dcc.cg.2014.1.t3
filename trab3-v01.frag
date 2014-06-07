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

	float tIn = (-b-sqrt(delta))/a;
	float tOut = (-b+sqrt(delta))/a;
	esfera.o.entra = tIn;
	esfera.o.sai = tOut;
	vec3 pIn = camPos+tIn*camDir;
	vec3 pOut = camPos+tOut*camDir;
	esfera.o.normalIn=normalize(pIn-centro);
	esfera.o.normalOut=normalize(pOut-centro);
	//delta < 0 está fora da esfera
	if (delta>0){
		esfera.o.intercepta=true;
	}else{
		esfera.o.intercepta=false;
	}
	
 	return esfera;

}

void pinta(vec3 normal, vec3 cor) {
    float difusa = dot(dirLuz, normal);
    difusa = max(difusa, 0);
    gl_FragColor.xyz = cor * 0.2 + cor * difusa * 0.8;
    gl_FragColor.a = 1.;
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
					pinta(objNovo.normalIn,objNovo.cor);
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
					pinta(objNovo.normalIn,objNovo.cor);
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
					pinta(objNovo.normalIn,objNovo.cor);
    }

    return objNovo;
}

void main(void){

	Esfera esfera1;
	esfera1.centro=vec3(0.0,0.0,0.0);
	esfera1.raio=0.7;
	esfera1.o.cor=vec3(0.0,1.0,0.0);
	esfera1 = inicializaEsfera(esfera1);

	Esfera esfera2;
	esfera2.centro=vec3(-0.3,0.4,0.0);
	esfera2.raio=0.24;
	esfera2.o.cor=vec3(0.0,0.0,1.0);
	esfera2 = inicializaEsfera(esfera2);

	Esfera esfera3;
	esfera3.centro=vec3(0.9,0.0,0.0);
	esfera3.raio=0.4;
	esfera3.o.cor=vec3(1.0,0.0,0.0);
	esfera3 = inicializaEsfera(esfera3);

	Esfera esfera4;
	esfera4.centro=vec3(-0.4,0.5,0.3);
	esfera4.raio=0.2;
	esfera4.o.cor=vec3(1.0,1.0,0.0);
	esfera4 = inicializaEsfera(esfera4);

	Esfera esfera5;
	esfera5.centro=vec3(-0.4,0.5,-0.3);
	esfera5.raio=0.2;
	esfera5.o.cor=vec3(1.0,1.0,0.0);
	esfera5 = inicializaEsfera(esfera5);

	Objeto obj_1=diferenca(esfera1.o,esfera5.o,false);

	obj_1 = uniao(obj_1,esfera3.o,false);

	obj_1 = diferenca(obj_1,esfera4.o,false);

	obj_1 = uniao(obj_1,esfera2.o,true);
}
