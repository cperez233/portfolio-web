/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  Esconde al mini Stand desde el primer pintado, mientras el grande se
  manifiesta en el hero (ver portfolio-hero.tsx y mini-stand.tsx).

  Antes la clase `stand-manifest` la ponia un efecto de React al hidratar,
  y el chico (que se monta en esa misma pasada) ya se habia dibujado a
  opacidad 1 en un punto equivocado (el retrato aun se estaba pegando):
  la clase llegaba despues y lo apagaba con la transicion de 250ms. Ese
  era el fantasma borroso. Este script va justo despues del hero en el
  HTML del servidor, asi que corre al parsear, antes de la primera pintura
  y mucho antes de que el chico exista: nace ya escondido y nada se
  desvanece.

  Es un componente de servidor a proposito: un <script> dentro de un
  componente de cliente avisa en desarrollo y React no lo ejecuta.

  Sin red de seguridad el chico no volveria si el hero no llega a
  hidratar: a los 11.5s se suelta pase lo que pase (las entradas terminan
  hacia los 9.5s; el Stand grande se desvanece solo a los 11s). El hero lo suelta antes
  (al terminar el relevo, o en cuanto sabe que no habra relevo). Con
  reduced motion no hay grande, asi que no se esconde nada.
*/
const script = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var r=document.documentElement;r.classList.add("stand-manifest");setTimeout(function(){r.classList.remove("stand-manifest")},11500)}catch(e){}})()`;

export function StandManifestGate() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
