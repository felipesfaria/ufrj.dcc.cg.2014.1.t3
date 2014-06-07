varying vec3 enterPoint;
varying vec3 camPos; 
varying vec3 dirLuz;
varying vec3 camDir;

vec3 normalIn;
vec3 normalOut;
float tIn;
float tOut;

struct Objeto
{
	bool intercepta;
	vec3 normalIn;
	vec3 normalOut;
	vec3 cor;
	float entra;
	float sai;
};

struct Esfera
{
	float raio;
	vec3 centro;
	Objeto o;
};


vec4 interceptaEsfera (vec3 camDir,vec3 camPos, vec3 centro, float radius){
	
	float a;
	float b;
	float c;
	float delta;
	vec4 retorno;
	a = dot(camDir,camDir);
	b = dot(camDir,camPos-centro);
 	c = dot(camPos-centro,camPos-centro) - (radius*radius);
	delta = b*b - a*c;

//calcula difusa
	vec3 p;
	float t = (-b-sqrt(delta))/a;
	retorno.y=t;
	retorno.z=(-b+sqrt(delta))/a;
	p = camPos+t*camDir;
	vec3 normal=normalize(centro-p);
//	normal=vec3(0)-normal;
	float difusa = dot(dirLuz,normal);
	retorno.w=difusa;
	//delta < 0 está fora da esfera
	if (delta>0)
		retorno.x=1.;
	else
		retorno.x=0.;
	
 	return retorno;

}

Esfera interceptaEsferaNew (Esfera esfera){
	
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

vec4 interceptaCubo (vec3 camDir,vec3 camPos, vec3 maximo, vec3 minimo){
	
	vec4 retorno;
	vec3 omin = (minimo - camPos)/camDir;
	vec3 omax = (maximo - camPos)/camDir;
	vec3 MAX = max(omin,omax);
	vec3 MIN = min(omin,omax);
	float final = min(MAX.x,min(MAX.y,MAX.z));
	float start = max(max(MIN.x,0.0),max(MIN.y,MIN.z));
	//final > start está dentro do cubo

	//retorno.y=distance(MIN,camPos)/length(camDir);
	retorno.y=start;
	retorno.z=final;
	if(final>start)
		retorno.x=1.;
	else
		retorno.x=0.;
	
	return retorno;
}

//bool diferencaEsferaEsfera(float entrouB, float tin, float tout, float t2in, float t2out){
bool diferencaEsferaEsfera(vec4 esf1, vec4 esf2){
	if(esf1.x==0)//Não entrou no A
		discard;
	// A - B, onde A é minuendo e B é subtraendo
	if(esf2.x==1 && // entrou no B
			esf2.y < esf1.y && // entrou no B antes do A
			esf2.z > esf1.y){ // saiu do B depois que entrou no A
			if(esf1.z<esf2.z) // saiu da A antes de sair da B
				discard;
			return true;				
	}
	return false;
}

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

void main(void){


	//ESFERA 1
	vec3 centro = vec3(0.0,0.5,0.0);
	float radius = 0.75;
	vec3 coresfera = vec3(1.0,0.0,0.0);

	//ESFERA 2
	vec3 centro2 = vec3(0.0,0.0,0.0);
	float radius2 = 1.0;
	vec3 coresfera2 = vec3(0.0,1.0,0.0);

	//Objeto 2 - ESFERA U ESFERA
	vec3 Objt1normalIn;
	vec3 Objt1normalOut;
	float Objt1tIn;
	float Objt1tOut;

	//CUBO
	vec3 maximo = vec3(-0.9,-0.9,-0.9);
	vec3 minimo = vec3(0.5,0.5,0.5);
	vec3 corcubo = vec3(0.0,1.0,0.0);

	//--------------

	vec4 interceptaESF = interceptaEsfera(camDir,camPos,centro,radius);
	vec4 interceptaCUBO = interceptaCubo(camDir,camPos,maximo,minimo);
	vec4 cubo_1 = interceptaCubo(camDir,camPos,maximo,minimo);

	vec4 esfera_1 = interceptaEsfera(camDir,camPos,centro,radius);
	vec4 esfera_2 = interceptaEsfera(camDir,camPos,centro2,radius2);

	Esfera esfera1;
	esfera1.centro=vec3(0.0,0.0,0.0);
	esfera1.raio=1.0;
	esfera1.o.cor=vec3(0.0,1.0,0.0);
	esfera1 = interceptaEsferaNew(esfera1);

	Esfera esfera2;
	esfera2.centro=vec3(0.0,1.0,0.0);
	esfera2.raio=1.0;
	esfera2.o.cor=vec3(0.0,0.0,1.0);
	esfera2 = interceptaEsferaNew(esfera2);
	Objeto obj_1=intersecao(esfera1.o,esfera2.o,false);

	Esfera esfera3;
	esfera3.centro=vec3(1.0,0.0,0.0);
	esfera3.raio=1.0;
	esfera3.o.cor=vec3(1.0,0.0,0.0);
	esfera3 = interceptaEsferaNew(esfera3);

	intersecao(obj_1,esfera3.o,true);

	float interceptaA;
	float interceptaB;
	float entraA;
	float entraB;
	float saiA;
	float saiB;

	//if (interceptaCUBO || !interceptaESF) //esfera - cubo   
		//discard;

	//if (interceptaESF || !interceptaCUBO) //cubo - esfera   
		//discard;

	//Define A	
 interceptaA=esfera2.o.intercepta;
 entraA=esfera2.o.entra;
 saiA=esfera2.o.sai;

	//Define B
 interceptaB=esfera1.o.intercepta;
 entraB=esfera1.o.entra;
 saiB=esfera1.o.sai;

	if(false){ //A Intersecao B
		if ( interceptaB==0 && interceptaA==0 //Não intercepta ninguem
				)
			//discard;
			gl_FragColor.a = 0.;
		
		if(interceptaB==1 && interceptaA==1){// intercepta os dois
			tIn=max(entraA,entraB);
			tOut=min(saiA,saiB);
			float difusa = dot(dirLuz,esfera2.o.normalIn);
			if(entraA>entraB){
				gl_FragColor.xyz = esfera.o.normalIn;
			}	else {
				gl_FragColor.xyz = esfera.o.normalIn;
			}
			gl_FragColor.a = 1.;
			

		}else {
			gl_FragColor.a = 0.;
			//discard;
		}
	}	


	//Define A	
 interceptaA=gl_FragColor.a;
 entraA=tIn;
 saiA=tOut;

	//Define B
 interceptaB=esfera_2.x;
 entraB=esfera_2.y;
 saiB=esfera_2.z;

	if(false){ //A Uniao B
		if ( interceptaB==0 && interceptaA==0 //Não intercepta ninguem
				)
			discard;
		
		if(interceptaB==1 && interceptaA==1){// intercepta os dois
			tIn=min(entraA,entraB);
			tOut=max(saiA,saiB);
			gl_FragColor.xyz = corcubo;
			gl_FragColor.a = 1.;

		}else {
			gl_FragColor.xyz = corcubo;
			gl_FragColor.a = 1.;

		}
	}	



	if(false){ //A-B
		if ( interceptaB==1 && interceptaA==0 // intercepta B e Não intercepta A
				|| interceptaB==0 && interceptaA==0  //Não intercepta ninguem
				)
			discard;
		
		if(interceptaB==1 && interceptaA==1){// intercepta os dois

			if(entraB<entraA){ //entra em B antes de A
				if(saiB>saiA) //sai de B depois de A
					discard;

				if(saiB<saiA){ //sai da esfera antes do cubo
					if(saiB>entraA){ //sai da esfera depois de entrar no cubo
						//float difusa = interceptaESF.w;
						//gl_FragColor.xyz = corcubo*0.5+difusa*0.5;
						//gl_FragColor.a = 1.;
						tIn=saiB;
						tOut=saiA;
						//TODO
							//normal
					}else{//!sai da esfera depois de entrar no cubo
						//gl_FragColor.xyz = corcubo;
						//gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=saiA;
						//TODO
							//normal
					}
				}else{//!sai da esfera antes do cubo
				}
			}else{//!entra na esfera antes do cubo
					  //gl_FragColor.xyz = corcubo;
					  //gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=entraB;
						//TODO
							//normal
			}
		}else{//!intercepta os dois
				  //gl_FragColor.xyz = corcubo;
					//gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=saiA;
						//TODO
							//normal
		}
	}

	//Define A	
 interceptaA=1;
 entraA=tIn;
 saiA=tOut;

	//Define B
 interceptaB=esfera_2.x;
 entraB=esfera_2.y;
 saiB=esfera_2.z;

	if(false){ //A-B
		if ( interceptaB==1 && interceptaA==0 // intercepta B e Não intercepta A
				|| interceptaB==0 && interceptaA==0  //Não intercepta ninguem
				)
			discard;
		
		if(interceptaB==1 && interceptaA==1){// intercepta os dois

			if(entraB<entraA){ //entra em B antes de A
				if(saiB>saiA) //sai de B depois de A
					discard;

				if(saiB<saiA){ //sai da esfera antes do cubo
					if(saiB>entraA){ //sai da esfera depois de entrar no cubo
						gl_FragColor.xyz = corcubo;
						gl_FragColor.a = 1.;
						tIn=saiB;
						tOut=saiA;
						//TODO
							//normal
					}else{//!sai da esfera depois de entrar no cubo
						gl_FragColor.xyz = corcubo;
						gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=saiA;
						//TODO
							//normal
					}
				}else{//!sai da esfera antes do cubo
				}
			}else{//!entra na esfera antes do cubo
					gl_FragColor.xyz = corcubo;
					gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=entraB;
						//TODO
							//normal
			}
		}else{//!intercepta os dois
				gl_FragColor.xyz = corcubo;
					gl_FragColor.a = 1.;
						tIn=entraA;
						tOut=saiA;
						//TODO
							//normal
		}
	}	


	if(false){ //esfera intersecao cubo   
		if (interceptaESF.x==0 || interceptaCUBO.x==0) //testa esfera intersecao cubo   
			discard;

		if(interceptaESF.y>interceptaCUBO.y){
			if (interceptaCUBO.x==1){
					gl_FragColor.xyz = corcubo;
					gl_FragColor.a = 1.;
			} 
			if(interceptaESF.x==1){
					gl_FragColor.xyz = coresfera*interceptaESF.w ;
					gl_FragColor.a = 1;
			}
		}else{
			if(interceptaESF.x==1){
					gl_FragColor.xyz = coresfera*interceptaESF.w ;
					gl_FragColor.a = 1;
			}
			if (interceptaCUBO.x==1){
					gl_FragColor.xyz = corcubo;
					gl_FragColor.a = 1.;
			} 
		}
	}

	if(false){ //esfera uniao cubo   
		if (interceptaESF.x==0 && interceptaCUBO.x==0) //testa esfera uniao cubo   
			discard;

		if(interceptaESF.y<interceptaCUBO.y){
			if (interceptaCUBO.x==1){
				gl_FragColor.xyz = corcubo;
				gl_FragColor.a = 1.;
			} 
			if(interceptaESF.x==1){
				gl_FragColor.xyz = coresfera*interceptaESF.w ;
				gl_FragColor.a = 1;
			}
		}else{
			if(interceptaESF.x==1){
					gl_FragColor.xyz = coresfera*interceptaESF.w ;
					gl_FragColor.a = 1;
			}
			if (interceptaCUBO.x==1){
					gl_FragColor.xyz = corcubo;
					gl_FragColor.a = 1.;
			} 
		}
	}
}
