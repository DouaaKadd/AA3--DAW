import { crearHtmlPaisos } from "/compartit/render.js";

const contenidorLlista = document.getElementById("llista-paisos");
const elementMeta = document.getElementById("meta");

const campCerca = document.getElementById("cerca");
const campRegio = document.getElementById("regio");
const campPoblacioMinima = document.getElementById("poblacio-minima");

const botoAplicar = document.getElementById("aplicar");
const botoReiniciar = document.getElementById("reiniciar");

botoAplicar.addEventListener("click", carregaPaisos);
botoReiniciar.addEventListener("click", () => {
  campCerca.value = "";
  campRegio.value = "";
  campPoblacioMinima.value = "0";
  carregaPaisos();
});

function actualitzaMeta(paisos) {
  const comptador = Array.isArray(paisos) ? paisos.length : 0;
  elementMeta.textContent = `${comptador} països`;
}

function renderitzaPaisos(paisos) {
  actualitzaMeta(paisos);
  contenidorLlista.innerHTML = crearHtmlPaisos(paisos);
}

async function carregaPaisos() {
  const paràmetres = new URLSearchParams();
  const textCerca = campCerca.value.trim();
  const regio = campRegio.value.trim();
  const poblacioMinima = campPoblacioMinima.value;

  if (textCerca) paràmetres.set("cerca", textCerca);
  if (regio) paràmetres.set("regio", regio);
  if (poblacioMinima && poblacioMinima !== "0") {
    paràmetres.set("poblacioMinima", poblacioMinima);
  }

  elementMeta.textContent = "Carregant…";

  try {
    const resposta = await fetch(`/api/paisos?${paràmetres.toString()}`);
    const dades = await resposta.json();
    if (Array.isArray(dades)) {
      renderitzaPaisos(dades);
    } else {
      renderitzaPaisos([]);
    }
  } catch (error) {
    console.error("Error carregant països:", error);
    elementMeta.textContent = "No s'han pogut carregar els països.";
    contenidorLlista.innerHTML = "";
  }
}

if (Array.isArray(window.__PAISOS_INICIALS__)) {
  renderitzaPaisos(window.__PAISOS_INICIALS__);
} else {
  carregaPaisos();
}


