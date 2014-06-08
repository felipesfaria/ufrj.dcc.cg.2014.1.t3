varying vec3 enterPoint;
varying vec3 camPos;
varying vec3 dirLuz;
varying vec3 camDir;
uniform sampler2D sampler2d0;
uniform sampler2D sampler2d1;
uniform sampler2D sampler2d2;

struct Objeto {
    int intercepta; //Quantas vezes o raio intercepta o objeto
    float entra; //t quando o raio entra no objeto no ponto p=camPos+t*camDir
    float sai; //t quando o raio sai do objeto no ponto p=camPos+t*camDir
    float entra2; //segundo ponto de entrada quando intercepta o objeto duas vezes
    float sai2; //segundo ponto de saida quando intercepta o objeto duas vezes
    float entra3; //terceiro ponto de entrada quando intercepta o objeto tres vezes
    float sai3; //terceiro ponto de saida quando intercepta o objeto duas vezes
    vec3 normalIn; //Normal para fora do objeto no ponto de entrada
    vec3 normalOut; //Normal para fora do objeto no ponto de saida
    vec3 normalIn2; //Normal para fora do objeto no segundo ponto de entrada
    vec3 normalOut2; //Normal para fora do objeto no segundo ponto de saida
    vec3 normalIn3; //Normal para fora do objeto no terceiro ponto de entrada
    vec3 normalOut3; //Normal para fora do objeto no terceiro ponto de saida
    vec3 cor; //Cor do Objeto
    vec3 corInt; //Cor interna do objeto
};

struct Esfera {
    float raio; //Raio da esfera
    vec3 centro; //Centro da esfera
    Objeto o; //Inofrmações de objeto da esfera
};

struct Cuboid {
    vec3 v1; //Primeiro v
    vec3 v2;
    vec3 v3;
    vec3 v4;
    vec3 v5;
    vec3 v6;
    vec3 v7;
    vec3 v8; //v oposto ao primeiro
    int texture;
    Objeto o; //Inofrmações de objeto da esfera
};

vec3 getP(float t) {
    return camPos + t * camDir;
}

void mostrar(Objeto objeto) {
    if (objeto.intercepta > 0) {
        vec3 normal = objeto.normalIn;
        vec3 cor = objeto.cor;
        vec3 p = getP(objeto.entra);
        float difusa = dot(dirLuz, normal);
        difusa = max(difusa, 0.0);
        vec3 vetorLuz = p - dirLuz;
        vec3 vetorLuzRefletido = reflect(-dirLuz, normalize(normal));
        float cos_especular = max(0.0, dot(normalize(vetorLuzRefletido), normalize(camPos)));
        float compEspecular = 32.0;
        float valorReflexaoEspecular = pow(cos_especular, compEspecular);
        vec3 corEspecular = valorReflexaoEspecular * vec3(1.0, 1.0, 1.0);
        gl_FragColor.xyz = cor * 0.2 + cor * difusa * 0.5 + 0.3 * corEspecular;
        gl_FragColor.a = 1.;
    } else {
        gl_FragColor.a = 0.;
    }
}

vec3 getTexture(vec2 coord_texture, int n) {
    vec3 cor;
    if (n == 1) {
        cor = texture2D(sampler2d0, coord_texture).rgb;
        return cor;
    }
    if (n == 2) {
        cor = texture2D(sampler2d1, coord_texture).rgb;
        return cor;
    }
    if (n == 3) {
        cor = texture2D(sampler2d2, coord_texture).rgb;
        return cor;
    }
    return vec3(0.0);
}


//####################################################################
//#############################Esfera#################################
//####################################################################
Esfera inicializaEsfera(Esfera esfera, int texture) {

		 esfera.o.corInt=esfera.o.cor;
    float a;
    float b;
    float c;
    float delta;
    float alpha;
    float phi;
    vec3 centro = esfera.centro;
    vec2 v1, v2;
    float raio = esfera.raio;
    a = dot(camDir, camDir);
    b = dot(camDir, camPos - centro);
    c = dot(camPos - centro, camPos - centro) - (raio * raio);
    delta = b * b - a * c;

    float tIn = (-b - sqrt(delta)) / a;
    float tOut = (-b + sqrt(delta)) / a;
    esfera.o.entra = tIn;
    esfera.o.sai = tOut;
    vec3 pIn = camPos + tIn * camDir;
    vec3 pOut = camPos + tOut * camDir;
    esfera.o.normalIn = normalize(pIn - centro);
    esfera.o.normalOut = normalize(pOut - centro);
    //delta < 0 está fora da esfera
    if (delta > 0.0) {
        esfera.o.intercepta = 1;
    } else {
        esfera.o.intercepta = 0;
    }
    v1 = vec2(raio, 0) - centro.xy;
    v2 = pIn.xy - centro.xy;
    if (texture == 1) {
        alpha = acos(dot(v1, v2));
        v1 = vec2(raio, 0) - centro.yz;
        v2 = pIn.yz - centro.yz;
        phi = acos(dot(v1, v2));
        esfera.o.cor = getTexture(vec2(alpha, phi), 1);
    }

    return esfera;

}


//####################################################################
//#############################Cuboid#################################
//####################################################################
Cuboid inicializaCuboid(Cuboid cuboid, int texture) {
		
    cuboid.v2 = cuboid.v1;
    cuboid.v2.x = cuboid.v8.x;
    cuboid.v3 = cuboid.v1;
    cuboid.v3.y = cuboid.v8.y;
    cuboid.v4 = cuboid.v1;
    cuboid.v4.xy = cuboid.v8.xy;
    cuboid.v5 = cuboid.v1;
    cuboid.v5.z = cuboid.v8.z;
    cuboid.v6 = cuboid.v1;
    cuboid.v6.xz = cuboid.v8.xz;
    cuboid.v7 = cuboid.v1;
    cuboid.v7.yz = cuboid.v8.yz;

    cuboid.o.intercepta = 0;
    cuboid.o.corInt = cuboid.o.cor;

    float delta = 0.1;
    vec3 t1;
    vec3 t2;
    vec3 pIn;
    vec3 pOut;
    t1.x = (cuboid.v1.x - camPos.x) / camDir.x;
    t1.y = (cuboid.v1.y - camPos.y) / camDir.y;
    t1.z = (cuboid.v1.z - camPos.z) / camDir.z;
    t2.x = (cuboid.v8.x - camPos.x) / camDir.x;
    t2.y = (cuboid.v8.y - camPos.y) / camDir.y;
    t2.z = (cuboid.v8.z - camPos.z) / camDir.z;

    if (t1.x < t2.x) { //face 1357 antes da face 2468
        pIn = getP(t1.x);
        //face 1,3,5,7
        if (pIn.y > cuboid.v1.y && pIn.y < cuboid.v7.y && pIn.z > cuboid.v1.z && pIn.z < cuboid.v7.z) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t1.x;
            cuboid.o.normalIn = normalize(cuboid.v1 - cuboid.v2);
            if (texture > 0)
                cuboid.o.cor = getTexture(pIn.yz, texture);
        }
        pOut = getP(t2.x);
        //face 2,4,6,8
        if (pOut.y < cuboid.v8.y && pOut.y > cuboid.v2.y && pOut.z < cuboid.v8.z && pOut.z > cuboid.v2.z) {
            cuboid.o.sai = t2.x;
            cuboid.o.normalOut = normalize(cuboid.v2 - cuboid.v1);

        }
    } else { //face 2468 antes da face 1357
        pOut = getP(t2.x);
        //face 2,4,6,8
        if (pOut.y < cuboid.v8.y && pOut.y > cuboid.v2.y && pOut.z < cuboid.v8.z && pOut.z > cuboid.v2.z) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t2.x;
            cuboid.o.normalIn = normalize(cuboid.v2 - cuboid.v1);
            if (texture > 0)
                cuboid.o.cor = getTexture(pOut.yz, texture);
        }
        pIn = getP(t1.x);
        //face 1,3,5,7
        if (pIn.y > cuboid.v1.y && pIn.y < cuboid.v7.y && pIn.z > cuboid.v1.z && pIn.z < cuboid.v7.z) {
            cuboid.o.sai = t1.x;
            cuboid.o.normalOut = normalize(cuboid.v1 - cuboid.v2);
        }
    }
    if (t1.y < t2.y) { //face 1256 antes da face 3478
        pIn = getP(t1.y);
        //face 1 , 2 , 5 , 6
        if (pIn.x > cuboid.v1.x && pIn.x < cuboid.v6.x && pIn.z > cuboid.v1.z && pIn.z < cuboid.v6.z) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t1.y;
            cuboid.o.normalIn = normalize(cuboid.v1 - cuboid.v3);
            if (texture > 0)
                cuboid.o.cor = getTexture(pIn.xz, texture);
        }
        pOut = getP(t2.y);
        //face 3,4,7,8
        if (pOut.x < cuboid.v8.x && pOut.x > cuboid.v3.x && pOut.z < cuboid.v8.z && pOut.z > cuboid.v3.z) {
            cuboid.o.sai = t2.y;
            cuboid.o.normalOut = normalize(cuboid.v3 - cuboid.v1);
        }
    } else { //face 3478 antes da face 1256
        pOut = getP(t2.y);
        //face 3,4,7,8
        if (pOut.x < cuboid.v8.x && pOut.x > cuboid.v3.x && pOut.z < cuboid.v8.z && pOut.z > cuboid.v3.z) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t2.y;
            cuboid.o.normalIn = normalize(cuboid.v3 - cuboid.v1);
            if (texture > 0)
                cuboid.o.cor = getTexture(pOut.xz, texture);
        }
        pIn = getP(t1.y);
        //face 1 , 2 , 5 , 6
        if (pIn.x > cuboid.v1.x && pIn.x < cuboid.v6.x && pIn.z > cuboid.v1.z && pIn.z < cuboid.v6.z) {
            cuboid.o.sai = t1.y;
            cuboid.o.normalOut = normalize(cuboid.v1 - cuboid.v3);
        }
    }
    if (t1.z < t2.z) { //face 1234 antes da face 5678
        pIn = getP(t1.z);
        //face 1 , 2 , 3 , 4
        if (pIn.x > cuboid.v1.x && pIn.x < cuboid.v4.x && pIn.y > cuboid.v1.y && pIn.y < cuboid.v4.y) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t1.z;
            cuboid.o.normalIn = normalize(cuboid.v1 - cuboid.v5);
            if (texture > 0)
                cuboid.o.cor = getTexture(pIn.xy, texture);
        }
        pOut = getP(t2.z);
        //face 5,6,7,8
        if (pOut.x < cuboid.v8.x && pOut.x > cuboid.v5.x && pOut.y < cuboid.v8.y && pOut.y > cuboid.v5.y) {
            cuboid.o.sai = t2.z;
            cuboid.o.normalOut = normalize(cuboid.v5 - cuboid.v1);
        }
    } else { //face 5678 antes da face 1234
        pOut = getP(t2.z);
        //face 5,6,7,8
        if (pOut.x < cuboid.v8.x && pOut.x > cuboid.v5.x && pOut.y < cuboid.v8.y && pOut.y > cuboid.v5.y) {
            cuboid.o.intercepta = 1;
            cuboid.o.entra = t2.z;
            cuboid.o.normalIn = normalize(cuboid.v5 - cuboid.v1);
            if (texture > 0)
                cuboid.o.cor = getTexture(pOut.xy, texture);
        }
        pIn = getP(t1.z);
        //face 1 , 2 , 3 , 4
        if (pIn.x > cuboid.v1.x && pIn.x < cuboid.v4.x && pIn.y > cuboid.v1.y && pIn.y < cuboid.v4.y) {
            cuboid.o.sai = t1.z;
            cuboid.o.normalOut = normalize(cuboid.v1 - cuboid.v5);
        }
    }

    return cuboid;
}

//####################################################################
//#############################INTERSECAO#############################
//####################################################################
Objeto intersecao(Objeto obj_1, Objeto obj_2) {
    Objeto objNovo;
    float difusa;
    vec3 cor;
    if (obj_1.intercepta == 0 && obj_2.intercepta == 0) { //Não intercepta ninguem
        objNovo.intercepta = 0;
        return objNovo;
    }

    if (obj_1.intercepta == 1 && obj_2.intercepta == 1) { // intercepta os dois
        if (obj_1.entra > obj_2.sai || obj_2.entra > obj_1.sai) {
            objNovo.intercepta = 0;
            return objNovo;
        }
        objNovo.intercepta = 1;
        objNovo.entra = max(obj_1.entra, obj_2.entra);
        objNovo.sai = min(obj_1.sai, obj_2.sai);
        if (obj_1.entra > obj_2.entra) { //entrou depois no objeto 1
            objNovo.normalIn = obj_1.normalIn;
            objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
        } else { //entrou depois no objeto 2
            objNovo.normalIn = obj_2.normalIn;
            objNovo.cor = obj_2.cor;
            objNovo.corInt = obj_2.corInt;
        }
        if (obj_1.sai < obj_2.sai) { //saiu antes do objeto 1
            objNovo.normalOut = obj_1.normalOut;
        } else { //saiu antes do objeto 2
            objNovo.normalOut = obj_2.normalOut;
        }
    } else {
        objNovo.intercepta = 0;
    }

    return objNovo;
}

//####################################################################
//#############################UNIAO##################################
//####################################################################
Objeto uniao(Objeto obj_1, Objeto obj_2) {
    Objeto objNovo;
    float difusa;
    vec3 cor;
    if (obj_1.intercepta == 0 && obj_2.intercepta == 0) { //Não intercepta ninguem
        objNovo.intercepta = 0;
        return objNovo;
    }

    if (obj_1.intercepta == 1 && obj_2.intercepta == 1) { // intercepta os dois
        objNovo.intercepta = 1;
        objNovo.entra = min(obj_1.entra, obj_2.entra);
        objNovo.sai = max(obj_1.sai, obj_2.sai);
        if (obj_1.entra <= obj_2.entra) { //entrou antes no objeto 1
            objNovo.normalIn = obj_1.normalIn;
            objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
        } else { //entrou antes no objeto 2
            objNovo.normalIn = obj_2.normalIn;
            objNovo.cor = obj_2.cor;
            objNovo.corInt = obj_2.corInt;
        }
        if (obj_1.sai >= obj_2.sai) { //saiu depois do objeto 1
            objNovo.normalOut = obj_1.normalOut;
        } else { //saiu depois do objeto 2
            objNovo.normalOut = obj_2.normalOut;
        }
    } else if (obj_1.intercepta == 1) { // so intercepta objeto 1
        objNovo.intercepta = 1;
        objNovo.entra = obj_1.entra;
        objNovo.sai = obj_1.sai;
        objNovo.normalIn = obj_1.normalIn;
        objNovo.normalOut = obj_1.normalOut;
        objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
    } else { // so intercepta objeto 2
        objNovo.intercepta = 1;
        objNovo.entra = obj_2.entra;
        objNovo.sai = obj_2.sai;
        objNovo.normalIn = obj_2.normalIn;
        objNovo.normalOut = obj_2.normalOut;
        objNovo.cor = obj_2.cor;
            objNovo.corInt = obj_2.corInt;
    }

    return objNovo;
}

//####################################################################
//#############################DIFERENCA##############################
//####################################################################
Objeto diferenca(Objeto obj_1, Objeto obj_2) { // obj_1 - obj_2
    Objeto objNovo;
    float difusa;
    vec3 cor;
    if (obj_1.intercepta == 0 && obj_2.intercepta == 0) { //Não intercepta ninguem
        objNovo.intercepta = 0;
        return objNovo;
    }

    if (obj_1.intercepta == 1 && obj_2.intercepta == 1) { // intercepta os dois
        if (obj_1.entra < obj_2.entra) { //entrou antes no objeto 1
            objNovo.intercepta = 1;
            objNovo.entra = obj_1.entra;
            objNovo.normalIn = obj_1.normalIn;
            objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
            if (obj_1.sai < obj_2.entra) { //sai do obj_1 antes de entrar no obj_2
                objNovo.sai = obj_1.sai;
                objNovo.normalOut = obj_1.normalOut;
            } else { //entra no obj 2 antes de sair do obj 1
                objNovo.sai = obj_2.entra;
                objNovo.normalOut = -obj_2.normalIn;
            }
        } else { //entrou antes no objeto 2
            if (obj_2.sai < obj_1.entra) { //sai do obj 2 antes de entrar no obj 1
                objNovo.intercepta = 1;
                objNovo.entra = obj_1.entra;
                objNovo.normalIn = obj_1.normalIn;
                objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
                objNovo.sai = obj_1.sai;
                objNovo.normalOut = obj_1.normalOut;
            } else { //entra no obj 1 antes de sair do obj 2
                if (obj_1.sai > obj_2.sai) { //sai do obj 1 depois de sair do obj 2
                    objNovo.intercepta = 1;
                    objNovo.entra = obj_2.sai;
                    objNovo.normalIn = -obj_2.normalOut;
                    objNovo.cor = obj_1.corInt;
                    objNovo.sai = obj_1.sai;
                    objNovo.normalOut = obj_1.normalOut;
                } else { // sai do obj 1 antes de sair do obj 2
                    objNovo.intercepta = 0;
                    return objNovo;
                }
            }
        }
    } else if (obj_1.intercepta == 1) { // so intercepta objeto 1
        objNovo.intercepta = 1;
        objNovo.entra = obj_1.entra;
        objNovo.sai = obj_1.sai;
        objNovo.normalIn = obj_1.normalIn;
        objNovo.normalOut = obj_1.normalOut;
        objNovo.cor = obj_1.cor;
            objNovo.corInt = obj_1.corInt;
    } else { // so intercepta objeto 2
        objNovo.intercepta = 0;
        return objNovo;
    }

    return objNovo;
}


Esfera escalaEsfera(Esfera esfera, float s) {
    esfera.raio *= s;
    return esfera;
}

Cuboid escalaCuboid(Cuboid cuboid, vec3 s) {
    vec3 delta = cuboid.v8 - cuboid.v1;
    delta = delta * s;
    cuboid.v8 = cuboid.v1 + delta;
    cuboid.v2 = cuboid.v1;
    cuboid.v2.x = cuboid.v8.x;
    cuboid.v3 = cuboid.v1;
    cuboid.v3.y = cuboid.v8.y;
    cuboid.v4 = cuboid.v1;
    cuboid.v4.xy = cuboid.v8.xy;
    cuboid.v5 = cuboid.v1;
    cuboid.v5.z = cuboid.v8.z;
    cuboid.v6 = cuboid.v1;
    cuboid.v6.xz = cuboid.v8.xz;
    cuboid.v7 = cuboid.v1;
    cuboid.v7.yz = cuboid.v8.yz;
    return cuboid;
}
void desenho1() {
    Cuboid limite;
    limite.v1 = vec3(-1.0, -1.0, -1.0);
    limite.v8 = vec3(1.0, 1.0, 1.0);
    limite.o.cor = vec3(1.0, 1.0, 1.0);
    limite = inicializaCuboid(limite, 0);

    Cuboid cubo1;
    cubo1.v1 = vec3(-0.9, -0.9, -0.9);
    cubo1.v8 = vec3(0.9, 0.9, 0.9);
    cubo1.o.cor = vec3(0.0, 0.0, 1.0);
    cubo1 = escalaCuboid(cubo1, vec3(1.0, 1.0, 0.2));
    cubo1 = inicializaCuboid(cubo1, 2);


    Cuboid cubo2;
    cubo2.v1 = vec3(-0.9, -0.9, -0.05);
    cubo2.v8 = vec3(0.9, 0.9, 0.05);
    cubo2.o.cor = vec3(0.0, 1.0, 1.0);
    cubo2 = inicializaCuboid(cubo2, 0);


    Esfera esfera1;
    esfera1.centro = vec3(0.0, 0.0, 0.0);
    esfera1.raio = 0.6;
    esfera1.o.cor = vec3(0.0, 1.0, 0.0);

    esfera1 = inicializaEsfera(esfera1, 1);

    Esfera esfera2;
    esfera2.centro = vec3(0.0, 0.0, 0.0);
    esfera2.raio = 0.9;
    esfera2.o.cor = vec3(1.0, 0.0, 0.0);
    esfera2 = inicializaEsfera(esfera2, 0);

    Esfera esfera3;
    esfera3.centro = vec3(0.0, 0.0, 0.5);
    esfera3.raio = 0.25;
    esfera3.o.cor = vec3(1.0, 0.0, 0.0);
    esfera3 = inicializaEsfera(esfera3, 0);

    Esfera esfera4;
    esfera4.centro = vec3(0.5, 0.5, -0.6);
    esfera4.raio = 0.20;
    esfera4.o.cor = vec3(1.0, 1.0, 0.0);
    esfera4 = inicializaEsfera(esfera4, 0);

    Esfera esfera5;
    esfera5.centro = vec3(-0.5, 0.5, 0.4);
    esfera5.raio = 0.20;
    esfera5.o.cor = vec3(1.0, 1.0, 0.0);
    esfera5 = inicializaEsfera(esfera5, 0);

    Objeto objeto1 = uniao(cubo1.o, esfera1.o);

    Objeto objeto2 = intersecao(esfera2.o, cubo2.o);

    objeto2 = uniao(objeto1, objeto2);

    objeto2 = diferenca(objeto2, esfera3.o);

    objeto2 = diferenca(objeto2, esfera4.o);

    objeto2 = uniao(objeto2, esfera5.o);

    Objeto objetoFinal = intersecao(objeto2, limite.o);
    mostrar(objetoFinal);
}

void snowMan(){
    Cuboid limite;
    limite.v1 = vec3(-1.0, -1.0, -1.0);
    limite.v8 = vec3(1.0, 1.0, 1.0);
    limite.o.cor = vec3(1.0, 1.0, 1.0);
    limite = inicializaCuboid(limite, 0);

    Esfera esfera1;
    esfera1.centro = vec3(0.0, 0.0, -0.55);
    esfera1.raio = 0.6;
    esfera1.o.cor = vec3(1.5, 1.5, 1.5);
    esfera1 = inicializaEsfera(esfera1, 0);

    Esfera esfera2;
    esfera2.centro = vec3(0.0, 0.0, 0.0);
    esfera2.raio = 0.5;
    esfera2.o.cor = vec3(1.5, 1.5, 1.5);
    esfera2 = inicializaEsfera(esfera2, 0);

    Esfera esfera3;
    esfera3.centro = vec3(0.0, 0.0, 0.65);
    esfera3.raio = 0.35;
    esfera3.o.cor = vec3(1.5, 1.5, 1.5);
    esfera3 = inicializaEsfera(esfera3, 0);

    Esfera esfera4;//olho esquerdo
    esfera4.centro = vec3(-0.1, 0.3, 0.7);
    esfera4.raio = 0.08;
    esfera4.o.cor = vec3(0.0, 0.0, 1.0);
    esfera4 = inicializaEsfera(esfera4, 0);

    Esfera esfera5;//olho direito
    esfera5.centro = vec3(0.1, 0.3, 0.7);
    esfera5.raio = 0.08;
    esfera5.o.cor = vec3(0.0, 0.0, 1.0);
    esfera5 = inicializaEsfera(esfera5, 0);

    Esfera esfera6;//boca 1
    esfera6.centro = vec3(0.0, 0.3, 0.68);
    esfera6.raio = 0.2;
    esfera6.o.cor = vec3(1.0, 0.0, 0.0);
    esfera6 = inicializaEsfera(esfera6, 0);

    Esfera esfera7;//boca 2
    esfera7.centro = vec3(0.0, 0.35, 0.73);
    esfera7.raio = 0.21;
    esfera7.o.cor = vec3(1.0, 0.0, 0.0);
    esfera7 = inicializaEsfera(esfera7, 0);

		Objeto objeto1 = uniao(esfera1.o,esfera2.o);

		objeto1 = uniao(objeto1,esfera3.o);

		objeto1 = uniao(objeto1,esfera4.o);

		objeto1 = uniao(objeto1,esfera5.o);

		Objeto objeto2 = diferenca(esfera6.o,esfera7.o);

		objeto1 = uniao(objeto1,objeto2);

		Objeto objetoFinal = intersecao(limite.o,objeto1);

		mostrar(objetoFinal);
}
void desenho0(){
    Cuboid limite;
    limite.v1 = vec3(-1.0, -1.0, -1.0);
    limite.v8 = vec3(1.0, 1.0, 1.0);
    limite.o.cor = vec3(1.0, 1.0, 1.0);
    limite = inicializaCuboid(limite, 0);
		mostrar(limite.o);
}
void main(void) {
	int desenhoN=2;
	switch(desenhoN){
		case 1:
    desenho1();
		break;
		case 2:
    snowMan();
		break;
		default:
			desenho0();
	}
}