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

vec4 calculanormal (vec3 pontoA,vec3 pontoB, vec3 pontoC,vec3 pontoD, int face){

	vec3 vetorAB;
	vetorAB.x = pontoB.x - pontoA.x;
	vetorAB.y = pontoB.y - pontoA.y;
	vetorAB.z = pontoB.z - pontoA.z;

	vec3 vetorAC;
	vetorAC.x = pontoC.x - pontoA.x;
	vetorAC.y = pontoC.y - pontoA.y;
	vetorAC.z = pontoC.z - pontoA.z;

	vec4 normal;
	//normal.x = vetorAB.y*vetorAC.z - vetorAC.y*vetorAB.z;
	//normal.y = vetorAB.z*vetorAC.x - vetorAC.z*vetorAB.x; 
	//normal.z = vetorAB.x*vetorAC.y - vetorAC.x*vetorAB.y;
	normal.xyz = cross(vetorAB,vetorAC);
	if(face == 1)
		normal.xyz = -normal.xyz;
	if(face == 4)
		normal.xyz = -normal.xyz;
	if(face == 6)
		normal.xyz = -normal.xyz;
	
	normal.w = -(normal.x*pontoA.x + normal.y*pontoA.y + normal.z*pontoA.z);
	return normal;

}

vec3 verificanornal(vec4 normalface1,vec4 normalface2,vec4 normalface3,vec4 normalface4,vec4 normalface5,vec4 normalface6,vec3 ponto){
	
	if(ponto.x*normalface1.x + ponto.y*normalface1.y + ponto.z*normalface1.z + normalface1.w == 0.){
			//float difusa = dot(dirLuz, normalface1.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz = normalface1.xyz* 0.2 + normalface1.xyz * difusa * 0.8;
			return normalface1.xyz;
}
	if(ponto.x*normalface2.x + ponto.y*normalface2.y + ponto.z*normalface2.z + normalface2.w == 0.){
			//float difusa = dot(dirLuz, normalface2.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz =normalface2.xyz* 0.2 + normalface2.xyz * difusa * 0.8;
			return normalface2.xyz;
}
	if(ponto.x*normalface3.x + ponto.y*normalface3.y + ponto.z*normalface3.z + normalface3.w == 0.){
			//float difusa = dot(dirLuz, normalface3.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz = normalface3.xyz * 0.2 + normalface3.xyz * difusa * 0.8;
			return normalface3.xyz;
}
	if(ponto.x*normalface4.x + ponto.y*normalface4.y + ponto.z*normalface4.z + normalface4.w == 0.){
			//float difusa = dot(dirLuz, normalface4.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz = normalface4.xyz * 0.2 + normalface4.xyz * difusa * 0.8;
			return normalface4.xyz;
}
	if(ponto.x*normalface5.x + ponto.y*normalface5.y + ponto.z*normalface5.z + normalface5.w == 0.){
			//float difusa =  dot(dirLuz, normalface5.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz = normalface5.xyz * 0.2 + normalface5.xyz * difusa * 0.8;
			return normalface5.xyz;
}
	if(ponto.x*normalface6.x + ponto.y*normalface6.y + ponto.z*normalface6.z + normalface6.w == 0.){
			//float difusa = dot(dirLuz, normalface6.xyz);
			//difusa = max(difusa,0.);
			//gl_FragColor.xyz = normalface6.xyz * 0.2 + normalface6.xyz * difusa * 0.8;
			return normalface6.xyz;
}
}

Cuboid inicializaCubo (Cuboid cubo){
	cubo.v2=vec3(0);
	cubo.v2.x=cubo.v8.x-cubo.v1.x;
	cubo.v3=vec3(0);
	cubo.v3.y=cubo.v8.y-cubo.v1.y;
	cubo.v4=vec3(0);
	cubo.v4.xy=cubo.v8.xy-cubo.v1.xy;
	cubo.v5=vec3(0);
	cubo.v5.z=cubo.v8.z-cubo.v1.z;
	cubo.v6=vec3(0);
	cubo.v6.xz=cubo.v8.xz-cubo.v1.xz;
	cubo.v7=vec3(0);
	cubo.v7.yz=cubo.v8.yz-cubo.v1.yz;


	vec4 normalface1 = calculanormal(cubo.v1,cubo.v2,cubo.v3,cubo.v4,1);
	vec4 normalface2 = calculanormal(cubo.v2,cubo.v4,cubo.v6,cubo.v8,2); 
	vec4 normalface3 = calculanormal(cubo.v5,cubo.v6,cubo.v7,cubo.v8,3); 
	vec4 normalface4 = calculanormal(cubo.v1,cubo.v3,cubo.v5,cubo.v7,4); 
	vec4 normalface5 = calculanormal(cubo.v1,cubo.v2,cubo.v5,cubo.v6,5); 
	vec4 normalface6 = calculanormal(cubo.v3,cubo.v4,cubo.v7,cubo.v8,6);  

	cubo.o.cor = normalface6.xyz;
	vec3 omin = (cubo.v1 - camPos)/camDir;
	vec3 omax = (cubo.v8 - camPos)/camDir;
	vec3 MAX = max(omin,omax);
	vec3 MIN = min(omin,omax);
	float final = min(MAX.x,min(MAX.y,MAX.z));
	float start = max(max(MIN.x,0.0),max(MIN.y,MIN.z));
	//final > start está dentro do cubo
	if(final>start)
		cubo.o.intercepta = true;
	else{
		cubo.o.intercepta = false;
		//return cubo;
	}
	cubo.o.entra = start;
	cubo.o.sai = final;

	//verifica normal da face que o raio entra
	vec3 p=camPos+start*camDir; //ponto de entrada
	cubo.o.normalIn = verificanornal(normalface1,normalface2,normalface3,normalface4,normalface5,normalface6,p);
	//verifica normal da face que o raio sai
	vec3 s=camPos+final*camDir; //ponto de saida
	cubo.o.normalOut = verificanornal(normalface1,normalface2,normalface3,normalface4,normalface5,normalface6,s);

	return cubo;
}

Objeto escala(Objeto obj, float s){
	obj.entra=0.0;
	obj.sai=0.0;
	return obj;
}

void main(void){
Cuboid cubo1;
	cubo1.v1=vec3(-0.9,-0.9,-0.9);
	cubo1.v8=vec3(0.9,0.9,0.9);
	
	cubo1.o.cor=vec3(0.0,0.0,1.0);
	cubo1 = inicializaCubo(cubo1);



	Esfera esfera1;
	esfera1.centro=vec3(0.0,0.0,0.0);
	esfera1.raio=1.1;
	esfera1.o.cor=vec3(0.0,1.0,0.0);
	esfera1 = inicializaEsfera(esfera1);

	Esfera esfera2;
	esfera2.centro=vec3(1.0,0.0,0.0);
	esfera2.raio=0.7;
	esfera2.o.cor=vec3(0.0,0.0,1.0);
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

	Objeto obj_1=intersecao(esfera1.o,cubo1.o,false);

	Objeto obj_2=diferenca(obj_1,esfera2.o,true);
}
