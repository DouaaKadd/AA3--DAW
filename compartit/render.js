export function formatarPoblacio(nombre) {
  return new Intl.NumberFormat("ca-ES").format(nombre ?? 0);
}

export function crearHtmlPaisos(paisos) {
  return (paisos || [])
    .map((pais) => {
      const nom = pais?.nom ?? "Desconegut";
      const bandera = pais?.bandera ?? "";
      const regio = pais?.regio || "Altres";
      const capital = pais?.capital || "—";
      const poblacio = formatarPoblacio(pais?.poblacio || 0);

      return `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-2">
              ${
                bandera
                  ? `<img src="${bandera}" alt="Bandera de ${nom}" class="rounded border bg-white flex-shrink-0" style="width:52px;height:34px;object-fit:cover;">`
                  : ""
              }
              <div>
                <h2 class="h6 mb-1">${nom}</h2>
                <span class="badge rounded-pill text-bg-light border text-muted small">${regio}</span>
              </div>
            </div>
            <dl class="mb-0 text-muted small">
              <div class="d-flex justify-content-between">
                <dt class="mb-0">Capital</dt>
                <dd class="mb-0 ms-2">${capital}</dd>
              </div>
              <div class="d-flex justify-content-between">
                <dt class="mb-0">Població</dt>
                <dd class="mb-0 ms-2">${poblacio}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

