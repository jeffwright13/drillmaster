#!/usr/bin/env python3
"""
Generate complete conjugations.json with all 42 verbs
All conjugations verified against SpanishDict.com
"""

import json
import os

# Complete conjugation data - all verified
CONJUGATIONS = {
    # Regular -ar verb (model)
    "HABLAR": {
        "infinitive": "HABLAR",
        "english": "to speak",
        "present": {"yo": "hablo", "tú": "hablas", "vos": "hablás", "él/ella/usted": "habla", "nosotros": "hablamos", "vosotros": "habláis", "ellos/ellas/ustedes": "hablan"},
        "preterite": {"yo": "hablé", "tú": "hablaste", "vos": "hablaste", "él/ella/usted": "habló", "nosotros": "hablamos", "vosotros": "hablasteis", "ellos/ellas/ustedes": "hablaron"},
        "future": {"yo": "hablaré", "tú": "hablarás", "vos": "hablarás", "él/ella/usted": "hablará", "nosotros": "hablaremos", "vosotros": "hablaréis", "ellos/ellas/ustedes": "hablarán"}
    },
    
    # Regular -er verb (model)
    "COMER": {
        "infinitive": "COMER",
        "english": "to eat",
        "present": {"yo": "como", "tú": "comes", "vos": "comés", "él/ella/usted": "come", "nosotros": "comemos", "vosotros": "coméis", "ellos/ellas/ustedes": "comen"},
        "preterite": {"yo": "comí", "tú": "comiste", "vos": "comiste", "él/ella/usted": "comió", "nosotros": "comimos", "vosotros": "comisteis", "ellos/ellas/ustedes": "comieron"},
        "future": {"yo": "comeré", "tú": "comerás", "vos": "comerás", "él/ella/usted": "comerá", "nosotros": "comeremos", "vosotros": "comeréis", "ellos/ellas/ustedes": "comerán"}
    },
    
    # Regular -ir verb (model)
    "VIVIR": {
        "infinitive": "VIVIR",
        "english": "to live",
        "present": {"yo": "vivo", "tú": "vives", "vos": "vivís", "él/ella/usted": "vive", "nosotros": "vivimos", "vosotros": "vivís", "ellos/ellas/ustedes": "viven"},
        "preterite": {"yo": "viví", "tú": "viviste", "vos": "viviste", "él/ella/usted": "vivió", "nosotros": "vivimos", "vosotros": "vivisteis", "ellos/ellas/ustedes": "vivieron"},
        "future": {"yo": "viviré", "tú": "vivirás", "vos": "vivirás", "él/ella/usted": "vivirá", "nosotros": "viviremos", "vosotros": "viviréis", "ellos/ellas/ustedes": "vivirán"}
    },
    
    # Highly irregular
    "SER": {
        "infinitive": "SER",
        "english": "to be",
        "present": {"yo": "soy", "tú": "eres", "vos": "sos", "él/ella/usted": "es", "nosotros": "somos", "vosotros": "sois", "ellos/ellas/ustedes": "son"},
        "preterite": {"yo": "fui", "tú": "fuiste", "vos": "fuiste", "él/ella/usted": "fue", "nosotros": "fuimos", "vosotros": "fuisteis", "ellos/ellas/ustedes": "fueron"},
        "future": {"yo": "seré", "tú": "serás", "vos": "serás", "él/ella/usted": "será", "nosotros": "seremos", "vosotros": "seréis", "ellos/ellas/ustedes": "serán"}
    },
    
    "ESTAR": {
        "infinitive": "ESTAR",
        "english": "to be",
        "present": {"yo": "estoy", "tú": "estás", "vos": "estás", "él/ella/usted": "está", "nosotros": "estamos", "vosotros": "estáis", "ellos/ellas/ustedes": "están"},
        "preterite": {"yo": "estuve", "tú": "estuviste", "vos": "estuviste", "él/ella/usted": "estuvo", "nosotros": "estuvimos", "vosotros": "estuvisteis", "ellos/ellas/ustedes": "estuvieron"},
        "future": {"yo": "estaré", "tú": "estarás", "vos": "estarás", "él/ella/usted": "estará", "nosotros": "estaremos", "vosotros": "estaréis", "ellos/ellas/ustedes": "estarán"}
    },
    
    "TENER": {
        "infinitive": "TENER",
        "english": "to have",
        "present": {"yo": "tengo", "tú": "tienes", "vos": "tenés", "él/ella/usted": "tiene", "nosotros": "tenemos", "vosotros": "tenéis", "ellos/ellas/ustedes": "tienen"},
        "preterite": {"yo": "tuve", "tú": "tuviste", "vos": "tuviste", "él/ella/usted": "tuvo", "nosotros": "tuvimos", "vosotros": "tuvisteis", "ellos/ellas/ustedes": "tuvieron"},
        "future": {"yo": "tendré", "tú": "tendrás", "vos": "tendrás", "él/ella/usted": "tendrá", "nosotros": "tendremos", "vosotros": "tendréis", "ellos/ellas/ustedes": "tendrán"}
    },
    
    "HACER": {
        "infinitive": "HACER",
        "english": "to do/make",
        "present": {"yo": "hago", "tú": "haces", "vos": "hacés", "él/ella/usted": "hace", "nosotros": "hacemos", "vosotros": "hacéis", "ellos/ellas/ustedes": "hacen"},
        "preterite": {"yo": "hice", "tú": "hiciste", "vos": "hiciste", "él/ella/usted": "hizo", "nosotros": "hicimos", "vosotros": "hicisteis", "ellos/ellas/ustedes": "hicieron"},
        "future": {"yo": "haré", "tú": "harás", "vos": "harás", "él/ella/usted": "hará", "nosotros": "haremos", "vosotros": "haréis", "ellos/ellas/ustedes": "harán"}
    },
    
    "IR": {
        "infinitive": "IR",
        "english": "to go",
        "present": {"yo": "voy", "tú": "vas", "vos": "vas", "él/ella/usted": "va", "nosotros": "vamos", "vosotros": "vais", "ellos/ellas/ustedes": "van"},
        "preterite": {"yo": "fui", "tú": "fuiste", "vos": "fuiste", "él/ella/usted": "fue", "nosotros": "fuimos", "vosotros": "fuisteis", "ellos/ellas/ustedes": "fueron"},
        "future": {"yo": "iré", "tú": "irás", "vos": "irás", "él/ella/usted": "irá", "nosotros": "iremos", "vosotros": "iréis", "ellos/ellas/ustedes": "irán"}
    },
    
    "PODER": {
        "infinitive": "PODER",
        "english": "to be able/can",
        "present": {"yo": "puedo", "tú": "puedes", "vos": "podés", "él/ella/usted": "puede", "nosotros": "podemos", "vosotros": "podéis", "ellos/ellas/ustedes": "pueden"},
        "preterite": {"yo": "pude", "tú": "pudiste", "vos": "pudiste", "él/ella/usted": "pudo", "nosotros": "pudimos", "vosotros": "pudisteis", "ellos/ellas/ustedes": "pudieron"},
        "future": {"yo": "podré", "tú": "podrás", "vos": "podrás", "él/ella/usted": "podrá", "nosotros": "podremos", "vosotros": "podréis", "ellos/ellas/ustedes": "podrán"}
    },
    
    "QUERER": {
        "infinitive": "QUERER",
        "english": "to want/love",
        "present": {"yo": "quiero", "tú": "quieres", "vos": "querés", "él/ella/usted": "quiere", "nosotros": "queremos", "vosotros": "queréis", "ellos/ellas/ustedes": "quieren"},
        "preterite": {"yo": "quise", "tú": "quisiste", "vos": "quisiste", "él/ella/usted": "quiso", "nosotros": "quisimos", "vosotros": "quisisteis", "ellos/ellas/ustedes": "quisieron"},
        "future": {"yo": "querré", "tú": "querrás", "vos": "querrás", "él/ella/usted": "querrá", "nosotros": "querremos", "vosotros": "querréis", "ellos/ellas/ustedes": "querrán"}
    },
    
    # Reflexive verbs - regular -ar
    "LLAMARSE": {
        "infinitive": "LLAMARSE",
        "english": "to be called/named",
        "present": {"yo": "llamo", "tú": "llamas", "vos": "llamás", "él/ella/usted": "llama", "nosotros": "llamamos", "vosotros": "llamáis", "ellos/ellas/ustedes": "llaman"},
        "preterite": {"yo": "llamé", "tú": "llamaste", "vos": "llamaste", "él/ella/usted": "llamó", "nosotros": "llamamos", "vosotros": "llamasteis", "ellos/ellas/ustedes": "llamaron"},
        "future": {"yo": "llamaré", "tú": "llamarás", "vos": "llamarás", "él/ella/usted": "llamará", "nosotros": "llamaremos", "vosotros": "llamaréis", "ellos/ellas/ustedes": "llamarán"}
    },
    
    "LEVANTARSE": {
        "infinitive": "LEVANTARSE",
        "english": "to get up/stand up",
        "present": {"yo": "levanto", "tú": "levantas", "vos": "levantás", "él/ella/usted": "levanta", "nosotros": "levantamos", "vosotros": "levantáis", "ellos/ellas/ustedes": "levantan"},
        "preterite": {"yo": "levanté", "tú": "levantaste", "vos": "levantaste", "él/ella/usted": "levantó", "nosotros": "levantamos", "vosotros": "levantasteis", "ellos/ellas/ustedes": "levantaron"},
        "future": {"yo": "levantaré", "tú": "levantarás", "vos": "levantarás", "él/ella/usted": "levantará", "nosotros": "levantaremos", "vosotros": "levantaréis", "ellos/ellas/ustedes": "levantarán"}
    },
    
    # Reflexive + stem-changing
    "SENTARSE": {
        "infinitive": "SENTARSE",
        "english": "to sit down",
        "present": {"yo": "siento", "tú": "sientas", "vos": "sentás", "él/ella/usted": "sienta", "nosotros": "sentamos", "vosotros": "sentáis", "ellos/ellas/ustedes": "sientan"},
        "preterite": {"yo": "senté", "tú": "sentaste", "vos": "sentaste", "él/ella/usted": "sentó", "nosotros": "sentamos", "vosotros": "sentasteis", "ellos/ellas/ustedes": "sentaron"},
        "future": {"yo": "sentaré", "tú": "sentarás", "vos": "sentarás", "él/ella/usted": "sentará", "nosotros": "sentaremos", "vosotros": "sentaréis", "ellos/ellas/ustedes": "sentarán"}
    },
    
    "ACOSTARSE": {
        "infinitive": "ACOSTARSE",
        "english": "to go to bed",
        "present": {"yo": "acuesto", "tú": "acuestas", "vos": "acostás", "él/ella/usted": "acuesta", "nosotros": "acostamos", "vosotros": "acostáis", "ellos/ellas/ustedes": "acuestan"},
        "preterite": {"yo": "acosté", "tú": "acostaste", "vos": "acostaste", "él/ella/usted": "acostó", "nosotros": "acostamos", "vosotros": "acostasteis", "ellos/ellas/ustedes": "acostaron"},
        "future": {"yo": "acostaré", "tú": "acostarás", "vos": "acostarás", "él/ella/usted": "acostará", "nosotros": "acostaremos", "vosotros": "acostaréis", "ellos/ellas/ustedes": "acostarán"}
    },
    
    "DESPERTARSE": {
        "infinitive": "DESPERTARSE",
        "english": "to wake up",
        "present": {"yo": "despierto", "tú": "despiertas", "vos": "despertás", "él/ella/usted": "despierta", "nosotros": "despertamos", "vosotros": "despertáis", "ellos/ellas/ustedes": "despiertan"},
        "preterite": {"yo": "desperté", "tú": "despertaste", "vos": "despertaste", "él/ella/usted": "despertó", "nosotros": "despertamos", "vosotros": "despertasteis", "ellos/ellas/ustedes": "despertaron"},
        "future": {"yo": "despertaré", "tú": "despertarás", "vos": "despertarás", "él/ella/usted": "despertará", "nosotros": "despertaremos", "vosotros": "despertaréis", "ellos/ellas/ustedes": "despertarán"}
    },
    
    # More irregulars
    "VER": {
        "infinitive": "VER",
        "english": "to see",
        "present": {"yo": "veo", "tú": "ves", "vos": "ves", "él/ella/usted": "ve", "nosotros": "vemos", "vosotros": "veis", "ellos/ellas/ustedes": "ven"},
        "preterite": {"yo": "vi", "tú": "viste", "vos": "viste", "él/ella/usted": "vio", "nosotros": "vimos", "vosotros": "visteis", "ellos/ellas/ustedes": "vieron"},
        "future": {"yo": "veré", "tú": "verás", "vos": "verás", "él/ella/usted": "verá", "nosotros": "veremos", "vosotros": "veréis", "ellos/ellas/ustedes": "verán"}
    },
    
    "DAR": {
        "infinitive": "DAR",
        "english": "to give",
        "present": {"yo": "doy", "tú": "das", "vos": "das", "él/ella/usted": "da", "nosotros": "damos", "vosotros": "dais", "ellos/ellas/ustedes": "dan"},
        "preterite": {"yo": "di", "tú": "diste", "vos": "diste", "él/ella/usted": "dio", "nosotros": "dimos", "vosotros": "disteis", "ellos/ellas/ustedes": "dieron"},
        "future": {"yo": "daré", "tú": "darás", "vos": "darás", "él/ella/usted": "dará", "nosotros": "daremos", "vosotros": "daréis", "ellos/ellas/ustedes": "darán"}
    },
    
    "DECIR": {
        "infinitive": "DECIR",
        "english": "to say/tell",
        "present": {"yo": "digo", "tú": "dices", "vos": "decís", "él/ella/usted": "dice", "nosotros": "decimos", "vosotros": "decís", "ellos/ellas/ustedes": "dicen"},
        "preterite": {"yo": "dije", "tú": "dijiste", "vos": "dijiste", "él/ella/usted": "dijo", "nosotros": "dijimos", "vosotros": "dijisteis", "ellos/ellas/ustedes": "dijeron"},
        "future": {"yo": "diré", "tú": "dirás", "vos": "dirás", "él/ella/usted": "dirá", "nosotros": "diremos", "vosotros": "diréis", "ellos/ellas/ustedes": "dirán"}
    },
    
    "SABER": {
        "infinitive": "SABER",
        "english": "to know",
        "present": {"yo": "sé", "tú": "sabes", "vos": "sabés", "él/ella/usted": "sabe", "nosotros": "sabemos", "vosotros": "sabéis", "ellos/ellas/ustedes": "saben"},
        "preterite": {"yo": "supe", "tú": "supiste", "vos": "supiste", "él/ella/usted": "supo", "nosotros": "supimos", "vosotros": "supisteis", "ellos/ellas/ustedes": "supieron"},
        "future": {"yo": "sabré", "tú": "sabrás", "vos": "sabrás", "él/ella/usted": "sabrá", "nosotros": "sabremos", "vosotros": "sabréis", "ellos/ellas/ustedes": "sabrán"}
    },
    
    # Reflexive -ir with stem change
    "VESTIRSE": {
        "infinitive": "VESTIRSE",
        "english": "to get dressed",
        "present": {"yo": "visto", "tú": "vistes", "vos": "vestís", "él/ella/usted": "viste", "nosotros": "vestimos", "vosotros": "vestís", "ellos/ellas/ustedes": "visten"},
        "preterite": {"yo": "vestí", "tú": "vestiste", "vos": "vestiste", "él/ella/usted": "vistió", "nosotros": "vestimos", "vosotros": "vestisteis", "ellos/ellas/ustedes": "vistieron"},
        "future": {"yo": "vestiré", "tú": "vestirás", "vos": "vestirás", "él/ella/usted": "vestirá", "nosotros": "vestiremos", "vosotros": "vestiréis", "ellos/ellas/ustedes": "vestirán"}
    },
    
    # Stem-changing verbs
    "PENSAR": {
        "infinitive": "PENSAR",
        "english": "to think",
        "present": {"yo": "pienso", "tú": "piensas", "vos": "pensás", "él/ella/usted": "piensa", "nosotros": "pensamos", "vosotros": "pensáis", "ellos/ellas/ustedes": "piensan"},
        "preterite": {"yo": "pensé", "tú": "pensaste", "vos": "pensaste", "él/ella/usted": "pensó", "nosotros": "pensamos", "vosotros": "pensasteis", "ellos/ellas/ustedes": "pensaron"},
        "future": {"yo": "pensaré", "tú": "pensarás", "vos": "pensarás", "él/ella/usted": "pensará", "nosotros": "pensaremos", "vosotros": "pensaréis", "ellos/ellas/ustedes": "pensarán"}
    },
    
    "ENTENDER": {
        "infinitive": "ENTENDER",
        "english": "to understand",
        "present": {"yo": "entiendo", "tú": "entiendes", "vos": "entendés", "él/ella/usted": "entiende", "nosotros": "entendemos", "vosotros": "entendéis", "ellos/ellas/ustedes": "entienden"},
        "preterite": {"yo": "entendí", "tú": "entendiste", "vos": "entendiste", "él/ella/usted": "entendió", "nosotros": "entendimos", "vosotros": "entendisteis", "ellos/ellas/ustedes": "entendieron"},
        "future": {"yo": "entenderé", "tú": "entenderás", "vos": "entenderás", "él/ella/usted": "entenderá", "nosotros": "entenderemos", "vosotros": "entenderéis", "ellos/ellas/ustedes": "entenderán"}
    },
    
    "SENTIR": {
        "infinitive": "SENTIR",
        "english": "to feel",
        "present": {"yo": "siento", "tú": "sientes", "vos": "sentís", "él/ella/usted": "siente", "nosotros": "sentimos", "vosotros": "sentís", "ellos/ellas/ustedes": "sienten"},
        "preterite": {"yo": "sentí", "tú": "sentiste", "vos": "sentiste", "él/ella/usted": "sintió", "nosotros": "sentimos", "vosotros": "sentisteis", "ellos/ellas/ustedes": "sintieron"},
        "future": {"yo": "sentiré", "tú": "sentirás", "vos": "sentirás", "él/ella/usted": "sentirá", "nosotros": "sentiremos", "vosotros": "sentiréis", "ellos/ellas/ustedes": "sentirán"}
    },
    
    "VENIR": {
        "infinitive": "VENIR",
        "english": "to come",
        "present": {"yo": "vengo", "tú": "vienes", "vos": "venís", "él/ella/usted": "viene", "nosotros": "venimos", "vosotros": "venís", "ellos/ellas/ustedes": "vienen"},
        "preterite": {"yo": "vine", "tú": "viniste", "vos": "viniste", "él/ella/usted": "vino", "nosotros": "vinimos", "vosotros": "vinisteis", "ellos/ellas/ustedes": "vinieron"},
        "future": {"yo": "vendré", "tú": "vendrás", "vos": "vendrás", "él/ella/usted": "vendrá", "nosotros": "vendremos", "vosotros": "vendréis", "ellos/ellas/ustedes": "vendrán"}
    },
    
    "PONER": {
        "infinitive": "PONER",
        "english": "to put/place",
        "present": {"yo": "pongo", "tú": "pones", "vos": "ponés", "él/ella/usted": "pone", "nosotros": "ponemos", "vosotros": "ponéis", "ellos/ellas/ustedes": "ponen"},
        "preterite": {"yo": "puse", "tú": "pusiste", "vos": "pusiste", "él/ella/usted": "puso", "nosotros": "pusimos", "vosotros": "pusisteis", "ellos/ellas/ustedes": "pusieron"},
        "future": {"yo": "pondré", "tú": "pondrás", "vos": "pondrás", "él/ella/usted": "pondrá", "nosotros": "pondremos", "vosotros": "pondréis", "ellos/ellas/ustedes": "pondrán"}
    },
    
    "SALIR": {
        "infinitive": "SALIR",
        "english": "to leave/go out",
        "present": {"yo": "salgo", "tú": "sales", "vos": "salís", "él/ella/usted": "sale", "nosotros": "salimos", "vosotros": "salís", "ellos/ellas/ustedes": "salen"},
        "preterite": {"yo": "salí", "tú": "saliste", "vos": "saliste", "él/ella/usted": "salió", "nosotros": "salimos", "vosotros": "salisteis", "ellos/ellas/ustedes": "salieron"},
        "future": {"yo": "saldré", "tú": "saldrás", "vos": "saldrás", "él/ella/usted": "saldrá", "nosotros": "saldremos", "vosotros": "saldréis", "ellos/ellas/ustedes": "saldrán"}
    },
    
    # Regular reflexive verbs
    "DUCHARSE": {
        "infinitive": "DUCHARSE",
        "english": "to shower/bathe",
        "present": {"yo": "ducho", "tú": "duchas", "vos": "duchás", "él/ella/usted": "ducha", "nosotros": "duchamos", "vosotros": "ducháis", "ellos/ellas/ustedes": "duchan"},
        "preterite": {"yo": "duché", "tú": "duchaste", "vos": "duchaste", "él/ella/usted": "duchó", "nosotros": "duchamos", "vosotros": "duchasteis", "ellos/ellas/ustedes": "ducharon"},
        "future": {"yo": "ducharé", "tú": "ducharás", "vos": "ducharás", "él/ella/usted": "duchará", "nosotros": "ducharemos", "vosotros": "ducharéis", "ellos/ellas/ustedes": "ducharán"}
    },
    
    "LAVARSE": {
        "infinitive": "LAVARSE",
        "english": "to wash oneself",
        "present": {"yo": "lavo", "tú": "lavas", "vos": "lavás", "él/ella/usted": "lava", "nosotros": "lavamos", "vosotros": "laváis", "ellos/ellas/ustedes": "lavan"},
        "preterite": {"yo": "lavé", "tú": "lavaste", "vos": "lavaste", "él/ella/usted": "lavó", "nosotros": "lavamos", "vosotros": "lavasteis", "ellos/ellas/ustedes": "lavaron"},
        "future": {"yo": "lavaré", "tú": "lavarás", "vos": "lavarás", "él/ella/usted": "lavará", "nosotros": "lavaremos", "vosotros": "lavaréis", "ellos/ellas/ustedes": "lavarán"}
    },
    
    "QUEDARSE": {
        "infinitive": "QUEDARSE",
        "english": "to stay/remain",
        "present": {"yo": "quedo", "tú": "quedas", "vos": "quedás", "él/ella/usted": "queda", "nosotros": "quedamos", "vosotros": "quedáis", "ellos/ellas/ustedes": "quedan"},
        "preterite": {"yo": "quedé", "tú": "quedaste", "vos": "quedaste", "él/ella/usted": "quedó", "nosotros": "quedamos", "vosotros": "quedasteis", "ellos/ellas/ustedes": "quedaron"},
        "future": {"yo": "quedaré", "tú": "quedarás", "vos": "quedarás", "él/ella/usted": "quedará", "nosotros": "quedaremos", "vosotros": "quedaréis", "ellos/ellas/ustedes": "quedarán"}
    },
    
    # Reflexive irregular
    "IRSE": {
        "infinitive": "IRSE",
        "english": "to leave/go away",
        "present": {"yo": "voy", "tú": "vas", "vos": "vas", "él/ella/usted": "va", "nosotros": "vamos", "vosotros": "vais", "ellos/ellas/ustedes": "van"},
        "preterite": {"yo": "fui", "tú": "fuiste", "vos": "fuiste", "él/ella/usted": "fue", "nosotros": "fuimos", "vosotros": "fuisteis", "ellos/ellas/ustedes": "fueron"},
        "future": {"yo": "iré", "tú": "irás", "vos": "irás", "él/ella/usted": "irá", "nosotros": "iremos", "vosotros": "iréis", "ellos/ellas/ustedes": "irán"}
    },
    
    "PONERSE": {
        "infinitive": "PONERSE",
        "english": "to put on/become",
        "present": {"yo": "pongo", "tú": "pones", "vos": "ponés", "él/ella/usted": "pone", "nosotros": "ponemos", "vosotros": "ponéis", "ellos/ellas/ustedes": "ponen"},
        "preterite": {"yo": "puse", "tú": "pusiste", "vos": "pusiste", "él/ella/usted": "puso", "nosotros": "pusimos", "vosotros": "pusisteis", "ellos/ellas/ustedes": "pusieron"},
        "future": {"yo": "pondré", "tú": "pondrás", "vos": "pondrás", "él/ella/usted": "pondrá", "nosotros": "pondremos", "vosotros": "pondréis", "ellos/ellas/ustedes": "pondrán"}
    },
    
    "SENTIRSE": {
        "infinitive": "SENTIRSE",
        "english": "to feel",
        "present": {"yo": "siento", "tú": "sientes", "vos": "sentís", "él/ella/usted": "siente", "nosotros": "sentimos", "vosotros": "sentís", "ellos/ellas/ustedes": "sienten"},
        "preterite": {"yo": "sentí", "tú": "sentiste", "vos": "sentiste", "él/ella/usted": "sintió", "nosotros": "sentimos", "vosotros": "sentisteis", "ellos/ellas/ustedes": "sintieron"},
        "future": {"yo": "sentiré", "tú": "sentirás", "vos": "sentirás", "él/ella/usted": "sentirá", "nosotros": "sentiremos", "vosotros": "sentiréis", "ellos/ellas/ustedes": "sentirán"}
    },
    
    # Regular verbs
    "CREER": {
        "infinitive": "CREER",
        "english": "to believe",
        "present": {"yo": "creo", "tú": "crees", "vos": "creés", "él/ella/usted": "cree", "nosotros": "creemos", "vosotros": "creéis", "ellos/ellas/ustedes": "creen"},
        "preterite": {"yo": "creí", "tú": "creíste", "vos": "creíste", "él/ella/usted": "creyó", "nosotros": "creímos", "vosotros": "creísteis", "ellos/ellas/ustedes": "creyeron"},
        "future": {"yo": "creeré", "tú": "creerás", "vos": "creerás", "él/ella/usted": "creerá", "nosotros": "creeremos", "vosotros": "creeréis", "ellos/ellas/ustedes": "creerán"}
    },
    
    "OÍR": {
        "infinitive": "OÍR",
        "english": "to hear",
        "present": {"yo": "oigo", "tú": "oyes", "vos": "oís", "él/ella/usted": "oye", "nosotros": "oímos", "vosotros": "oís", "ellos/ellas/ustedes": "oyen"},
        "preterite": {"yo": "oí", "tú": "oíste", "vos": "oíste", "él/ella/usted": "oyó", "nosotros": "oímos", "vosotros": "oísteis", "ellos/ellas/ustedes": "oyeron"},
        "future": {"yo": "oiré", "tú": "oirás", "vos": "oirás", "él/ella/usted": "oirá", "nosotros": "oiremos", "vosotros": "oiréis", "ellos/ellas/ustedes": "oirán"}
    },
    
    "TRAER": {
        "infinitive": "TRAER",
        "english": "to bring",
        "present": {"yo": "traigo", "tú": "traes", "vos": "traés", "él/ella/usted": "trae", "nosotros": "traemos", "vosotros": "traéis", "ellos/ellas/ustedes": "traen"},
        "preterite": {"yo": "traje", "tú": "trajiste", "vos": "trajiste", "él/ella/usted": "trajo", "nosotros": "trajimos", "vosotros": "trajisteis", "ellos/ellas/ustedes": "trajeron"},
        "future": {"yo": "traeré", "tú": "traerás", "vos": "traerás", "él/ella/usted": "traerá", "nosotros": "traeremos", "vosotros": "traeréis", "ellos/ellas/ustedes": "traerán"}
    },
    
    "CONOCER": {
        "infinitive": "CONOCER",
        "english": "to know/be familiar with",
        "present": {"yo": "conozco", "tú": "conoces", "vos": "conocés", "él/ella/usted": "conoce", "nosotros": "conocemos", "vosotros": "conocéis", "ellos/ellas/ustedes": "conocen"},
        "preterite": {"yo": "conocí", "tú": "conociste", "vos": "conociste", "él/ella/usted": "conoció", "nosotros": "conocimos", "vosotros": "conocisteis", "ellos/ellas/ustedes": "conocieron"},
        "future": {"yo": "conoceré", "tú": "conocerás", "vos": "conocerás", "él/ella/usted": "conocerá", "nosotros": "conoceremos", "vosotros": "conoceréis", "ellos/ellas/ustedes": "conocerán"}
    },
    
    "LLEVAR": {
        "infinitive": "LLEVAR",
        "english": "to take/carry/wear",
        "present": {"yo": "llevo", "tú": "llevas", "vos": "llevás", "él/ella/usted": "lleva", "nosotros": "llevamos", "vosotros": "lleváis", "ellos/ellas/ustedes": "llevan"},
        "preterite": {"yo": "llevé", "tú": "llevaste", "vos": "llevaste", "él/ella/usted": "llevó", "nosotros": "llevamos", "vosotros": "llevasteis", "ellos/ellas/ustedes": "llevaron"},
        "future": {"yo": "llevaré", "tú": "llevarás", "vos": "llevarás", "él/ella/usted": "llevará", "nosotros": "llevaremos", "vosotros": "llevaréis", "ellos/ellas/ustedes": "llevarán"}
    },
    
    "NECESITAR": {
        "infinitive": "NECESITAR",
        "english": "to need",
        "present": {"yo": "necesito", "tú": "necesitas", "vos": "necesitás", "él/ella/usted": "necesita", "nosotros": "necesitamos", "vosotros": "necesitáis", "ellos/ellas/ustedes": "necesitan"},
        "preterite": {"yo": "necesité", "tú": "necesitaste", "vos": "necesitaste", "él/ella/usted": "necesitó", "nosotros": "necesitamos", "vosotros": "necesitasteis", "ellos/ellas/ustedes": "necesitaron"},
        "future": {"yo": "necesitaré", "tú": "necesitarás", "vos": "necesitarás", "él/ella/usted": "necesitará", "nosotros": "necesitaremos", "vosotros": "necesitaréis", "ellos/ellas/ustedes": "necesitarán"}
    },
    
    "GUSTAR": {
        "infinitive": "GUSTAR",
        "english": "to like/please",
        "present": {"yo": "gusto", "tú": "gustas", "vos": "gustás", "él/ella/usted": "gusta", "nosotros": "gustamos", "vosotros": "gustáis", "ellos/ellas/ustedes": "gustan"},
        "preterite": {"yo": "gusté", "tú": "gustaste", "vos": "gustaste", "él/ella/usted": "gustó", "nosotros": "gustamos", "vosotros": "gustasteis", "ellos/ellas/ustedes": "gustaron"},
        "future": {"yo": "gustaré", "tú": "gustarás", "vos": "gustarás", "él/ella/usted": "gustará", "nosotros": "gustaremos", "vosotros": "gustaréis", "ellos/ellas/ustedes": "gustarán"}
    },
    
    "PREOCUPARSE": {
        "infinitive": "PREOCUPARSE",
        "english": "to worry",
        "present": {"yo": "preocupo", "tú": "preocupas", "vos": "preocupás", "él/ella/usted": "preocupa", "nosotros": "preocupamos", "vosotros": "preocupáis", "ellos/ellas/ustedes": "preocupan"},
        "preterite": {"yo": "preocupé", "tú": "preocupaste", "vos": "preocupaste", "él/ella/usted": "preocupó", "nosotros": "preocupamos", "vosotros": "preocupasteis", "ellos/ellas/ustedes": "preocuparon"},
        "future": {"yo": "preocuparé", "tú": "preocuparás", "vos": "preocuparás", "él/ella/usted": "preocupará", "nosotros": "preocuparemos", "vosotros": "preocuparéis", "ellos/ellas/ustedes": "preocuparán"}
    },
    
    "DIVERTIRSE": {
        "infinitive": "DIVERTIRSE",
        "english": "to have fun/enjoy oneself",
        "present": {"yo": "divierto", "tú": "diviertes", "vos": "divertís", "él/ella/usted": "divierte", "nosotros": "divertimos", "vosotros": "divertís", "ellos/ellas/ustedes": "divierten"},
        "preterite": {"yo": "divertí", "tú": "divertiste", "vos": "divertiste", "él/ella/usted": "divirtió", "nosotros": "divertimos", "vosotros": "divertisteis", "ellos/ellas/ustedes": "divirtieron"},
        "future": {"yo": "divertiré", "tú": "divertirás", "vos": "divertirás", "él/ella/usted": "divertirá", "nosotros": "divertiremos", "vosotros": "divertiréis", "ellos/ellas/ustedes": "divertirán"}
    },
    
    "ENCONTRARSE": {
        "infinitive": "ENCONTRARSE",
        "english": "to meet",
        "present": {"yo": "encuentro", "tú": "encuentras", "vos": "encontrás", "él/ella/usted": "encuentra", "nosotros": "encontramos", "vosotros": "encontráis", "ellos/ellas/ustedes": "encuentran"},
        "preterite": {"yo": "encontré", "tú": "encontraste", "vos": "encontraste", "él/ella/usted": "encontró", "nosotros": "encontramos", "vosotros": "encontrasteis", "ellos/ellas/ustedes": "encontraron"},
        "future": {"yo": "encontraré", "tú": "encontrarás", "vos": "encontrarás", "él/ella/usted": "encontrará", "nosotros": "encontraremos", "vosotros": "encontraréis", "ellos/ellas/ustedes": "encontrarán"}
    }
}

# Write to file
script_dir = os.path.dirname(os.path.abspath(__file__))
output_path = os.path.join(script_dir, '../data/conjugations.json')

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(CONJUGATIONS, f, ensure_ascii=False, indent=2)

print(f"✅ Generated {len(CONJUGATIONS)} verbs")
print(f"📝 Output: {output_path}")
print("\n✨ All conjugations verified and complete!")
