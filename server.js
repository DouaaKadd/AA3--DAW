import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { crearHtmlPaisos } from "./compartit/render.js";

const aplicacio = express();
const PORT = process.env.PORT || 3000;

const __fitxer = fileURLToPath(import.meta.url);
const __directori = path.dirname(__fitxer);

aplicacio.use(express.static(path.join(__directori, "public")));
aplicacio.use(
  "/compartit",
  express.static(path.join(__directori, "compartit"))
);

const BASE_REST = "https://restcountries.com/v3.1";
const CAMPS = "name,flags,capital,population,region";

function normalitzarPaisos(respostaApi) {
  return (respostaApi || []).map((pais) => ({
    nom: pais?.name?.common ?? "Desconegut",
    bandera: pais?.flags?.png ?? pais?.flags?.svg ?? "",
    capital: Array.isArray(pais?.capital)
      ? pais.capital[0]
      : pais?.capital ?? "—",
    poblacio: Number(pais?.population ?? 0),
    regio: pais?.region ?? "Altres",
  }));
}

aplicacio.get("/api/paisos", async (peticio, resposta) => {
  try {
    const cerca = (peticio.query.cerca || "").trim();
    const regio = (peticio.query.regio || "").trim();
    const poblacioMinima = Number(peticio.query.poblacioMinima || 0);

    const url = cerca
      ? `${BASE_REST}/name/${encodeURIComponent(cerca)}?fields=${CAMPS}`
      : `${BASE_REST}/all?fields=${CAMPS}`;

    const respostaExtern = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (respostaExtern.status === 404) {
      return resposta.json([]);
    }

    if (!respostaExtern.ok) {
      return resposta
        .status(502)
        .json({ error: "Error al servei extern", codi: respostaExtern.status });
    }

    let paisos = normalitzarPaisos(await respostaExtern.json());

    if (regio) {
      paisos = paisos.filter((pais) => pais.regio === regio);
    }

    if (Number.isFinite(poblacioMinima) && poblacioMinima > 0) {
      paisos = paisos.filter((pais) => pais.poblacio >= poblacioMinima);
    }

    paisos.sort((a, b) => a.nom.localeCompare(b.nom, "ca"));
    resposta.json(paisos);
  } catch (error) {
    console.error("Error al servidor /api/paisos:", error);
    resposta.status(500).json({ error: "Error intern del servidor" });
  }
});

aplicacio.get("/", async (_peticio, resposta) => {
  try {
    const respostaExtern = await fetch(`${BASE_REST}/all?fields=${CAMPS}`, {
      headers: { Accept: "application/json" },
    });

    const dadesBrutes = respostaExtern.ok ? await respostaExtern.json() : [];
    const paisosInicials = normalitzarPaisos(dadesBrutes).sort((a, b) =>
      a.nom.localeCompare(b.nom, "ca")
    );

    const htmlLlista = crearHtmlPaisos(paisosInicials);

    let plantilla = await fs.readFile(
      path.join(__directori, "index.html"),
      "utf-8"
    );

    plantilla = plantilla.replace(
      "<!--__LLISTA_SERVIDOR__-->",
      htmlLlista || ""
    );

    plantilla = plantilla.replace(
      "<!--__DADES_INICIALS__-->",
      `<script>window.__PAISOS_INICIALS__=${JSON.stringify(
        paisosInicials
      )};</script>`
    );

    resposta.setHeader("Content-Type", "text/html; charset=utf-8");
    resposta.send(plantilla);
  } catch (error) {
    console.error("Error al SSR de /:", error);
    resposta.status(500).send("Error carregant països (SSR).");
  }
});

aplicacio.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});


