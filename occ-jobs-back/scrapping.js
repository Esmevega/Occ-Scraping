const puppeteer = require("puppeteer");
const { geocodeLocationManual } = require("./manualGeocode");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scrapeJobs = async (searchTerm) => {
  let browser;
  try {
    const baseUrl = `https://www.occ.com.mx/empleos/de-${encodeURIComponent(
      searchTerm
    )}/`;

    console.log(`\n🔍 Buscando empleos de "${searchTerm}" en OCC ...`);
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-extensions",
      ],
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 60000 });

    console.log("⏳ Esperando a que se cargue la paginación...");
    await wait(3000);

    try {
      await page.waitForSelector("div.mt-6.text-center", { timeout: 5000 });
    } catch (error) {
      console.log(
        "⚠️ No se pudo esperar el selector de paginación, continuando..."
      );
    }

    console.log("🔍 Obteniendo información de paginación...");

    await page.evaluate(() => {
      console.log("🔍 DEBUG: Analizando estructura de paginación...");

      const containers = document.querySelectorAll(
        'div.mt-6.text-center, div[class*="pagination"], ul[class*="pagination"], .pagination'
      );
      console.log(
        `📋 Contenedores de paginación encontrados: ${containers.length}`
      );

      containers.forEach((container, index) => {
        console.log(
          `📦 Contenedor ${index + 1}:`,
          container.outerHTML.substring(0, 200) + "..."
        );
      });

      const allLis = document.querySelectorAll("li");
      const numberLis = Array.from(allLis).filter((li) =>
        /^\d+$/.test(li.textContent.trim())
      );
      console.log(
        `🔢 Elementos li con números encontrados: ${numberLis.length}`
      );

      numberLis.forEach((li, index) => {
        console.log(
          `📄 Li ${
            index + 1
          }: "${li.textContent.trim()}" - ${li.outerHTML.substring(0, 100)}...`
        );
      });
    });

    const totalPages = await page.evaluate(() => {
      try {
        console.log("🔍 Iniciando búsqueda de paginación...");

        const specificSelector =
          "body > main > div.sm\\:container.sm\\:mx-auto.grid.grid-cols-12.mt-4 > aside > div > div.mt-6.text-center > div > ul > li:nth-child(4)";
        const maxPageElement = document.querySelector(specificSelector);

        if (maxPageElement) {
          const pageText = maxPageElement.textContent.trim();
          console.log(
            `✅ Método 1 - Elemento específico encontrado: "${pageText}"`
          );

          if (/^\d+$/.test(pageText)) {
            return parseInt(pageText);
          }
        }

        console.log("⚠️ Método 1 falló, probando método 2...");

        const paginationContainer = document.querySelector(
          "body > main > div.sm\\:container.sm\\:mx-auto.grid.grid-cols-12.mt-4 > aside > div > div.mt-6.text-center > div > ul"
        );
        if (paginationContainer) {
          const allLiElements = paginationContainer.querySelectorAll("li");
          console.log(`📋 Encontrados ${allLiElements.length} elementos li`);

          const pageNumbers = [];
          for (let i = 0; i < allLiElements.length - 1; i++) {
            const text = allLiElements[i].textContent.trim();
            if (/^\d+$/.test(text)) {
              pageNumbers.push(parseInt(text));
            }
          }

          if (pageNumbers.length > 0) {
            const maxPage = Math.max(...pageNumbers);
            console.log(
              `✅ Método 2 - Páginas encontradas: [${pageNumbers.join(
                ", "
              )}], máximo: ${maxPage}`
            );
            return maxPage;
          }
        }

        console.log("⚠️ Método 2 falló, probando método 3...");

        const allPageElements = document.querySelectorAll("ul li");
        let maxPage = 1;
        const foundPages = [];

        for (const element of allPageElements) {
          const text = element.textContent.trim();
          if (/^\d+$/.test(text)) {
            const pageNum = parseInt(text);
            foundPages.push(pageNum);
            if (pageNum > maxPage) {
              maxPage = pageNum;
            }
          }
        }

        if (foundPages.length > 0) {
          console.log(
            `✅ Método 3 - Páginas encontradas: [${foundPages.join(
              ", "
            )}], máximo: ${maxPage}`
          );
          return maxPage;
        }

        console.log("⚠️ Método 3 falló, probando método 4...");

        const bodyText = document.body.textContent;
        const pageMatch =
          bodyText.match(/página\s+\d+\s+de\s+(\d+)/i) ||
          bodyText.match(/page\s+\d+\s+of\s+(\d+)/i);
        if (pageMatch) {
          const totalFromText = parseInt(pageMatch[1]);
          console.log(
            `✅ Método 4 - Encontrado en texto: ${totalFromText} páginas`
          );
          return totalFromText;
        }

        console.log(
          "❌ Todos los métodos fallaron, usando 1 página por defecto"
        );
        return 1;
      } catch (error) {
        console.log("❌ Error obteniendo paginación:", error.message);
        return 1;
      }
    });

    console.log(`📋 Total de páginas encontradas: ${totalPages}`);

    const allJobs = [];

    // Iterar por cada página
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`\n🔄 Procesando página ${pageNumber} de ${totalPages}...`);

      const pageUrl =
        pageNumber === 1 ? baseUrl : `${baseUrl}?page=${pageNumber}`;

      try {
        await page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 60000 });
        console.log(`🔗 Navegando a: ${pageUrl}`);

        await page.waitForSelector('div[id^="jobcard-"]', { timeout: 10000 });

        const cardIds = await page.$$eval('div[id^="jobcard-"]', (cards) =>
          cards.map((card) => card.id)
        );

        console.log(
          `📋 Tarjetas encontradas en página ${pageNumber}: ${cardIds.length}`
        );

        // Procesar cada tarjeta
        for (const cardId of cardIds) {
          try {
            console.log(`  └─ Procesando tarjeta: ${cardId}`);

            await page.click(`#${cardId}`);
            await page.waitForSelector("div.break-words", { timeout: 5000 });
            await wait(2500);

            const jobData = await page.evaluate(() => {
              const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : "No disponible";
              };

              const detailContainer = document.querySelector(
                "#job-detail-container"
              );
              if (!detailContainer) {
                console.log("No se encontró el contenedor de detalles");
                return null;
              }

              const puesto = getText("p.text-\\[24px\\]");

              // MEJORA EN EXTRACCIÓN DE EMPRESA
              const empresaElement =
                detailContainer.querySelector("span.line-clamp-1") ||
                detailContainer.querySelector("span[class*='line-clamp']") ||
                detailContainer.querySelector("div > span:first-child");

              let empresa = empresaElement
                ? empresaElement.textContent.trim()
                : "No disponible";

              // Limpiar empresa si contiene "en" + ubicación
              if (empresa.includes(" en")) {
                empresa = empresa.split(" en")[0].trim();
              }

              const salario = getText("p.text-\\[18px\\]");

              // MEJORA EN EXTRACCIÓN DE UBICACIÓN
              let ubicacion =
                getText("#job-detail-container span label") ||
                getText("#job-detail-container div:nth-child(4) span label") ||
                getText("span label");

              // Intentar extraer ubicación de múltiples lugares
              if (ubicacion === "No disponible") {
                // Buscar en diferentes selectores
                const ubicacionSelectors = [
                  'span[class*="text-gray"] label',
                  'div[class*="flex"] span label',
                  "span label",
                  '[class*="location"]',
                  '[class*="ubicacion"]',
                ];

                for (const selector of ubicacionSelectors) {
                  const element = document.querySelector(selector);
                  if (element && element.textContent.trim() !== "") {
                    ubicacion = element.textContent.trim();
                    break;
                  }
                }
              }

              // Si aún no encuentra ubicación, buscar en el texto de la empresa original
              if (ubicacion === "No disponible" && empresaElement) {
                const empresaCompleta = empresaElement.textContent.trim();
                if (empresaCompleta.includes(" en")) {
                  ubicacion = empresaCompleta.split(" en")[1].trim();
                }
              }

              const categoria = getText("div.flex.flex-col.gap-2");

              const rawDescripcion = Array.from(
                document.querySelectorAll("div.break-words")
              )
                .map((div) => div.textContent.trim())
                .join("\n\n");

              const cleanText = rawDescripcion
                .replace(/([A-ZÁÉÍÓÚÑ]{2,}):/g, "\n\n$1:")
                .replace(/\s{2,}/g, " ")
                .replace(/\n{3,}/g, "\n\n")
                .trim();

              return {
                puesto,
                empresa,
                salario,
                ubicacion,
                categoria,
                descripcion: cleanText,
              };
            });
            if (jobData) {
              jobData.pagina = pageNumber;
              jobData.fechaExtraccion = new Date().toISOString();

              // 🗺️ NUEVA FUNCIONALIDAD: Geocodificar la ubicación
              console.log(
                `    🗺️ Geocodificando ubicación: "${jobData.ubicacion}"`
              );
              try {
                const coordinates = await geocodeLocationManual(jobData.ubicacion);
                if (coordinates) {
                  jobData.coordenadas = coordinates;
                  console.log(
                    `    ✅ Coordenadas obtenidas: ${coordinates.lat}, ${coordinates.lng}`
                  );
                } else {
                  jobData.coordenadas = null;
                  console.log(
                    `    ⚠️ No se pudieron obtener coordenadas para: "${jobData.ubicacion}"`
                  );
                }

                // Pequeña pausa para no sobrecargar la API de geocodificación
                await wait(500);
              } catch (geocodeError) {
                console.log(
                  `    ❌ Error en geocodificación: ${geocodeError.message}`
                );
                jobData.coordenadas = null;
              }

              allJobs.push(jobData);
              console.log(
                `    ✔ ${jobData.puesto} - ${jobData.empresa} ${
                  jobData.coordenadas ? "📍" : "❌"
                }`
              );
            } else {
              console.log(
                `    ❌ No se pudo extraer datos de la tarjeta ${cardId}`
              );
            }
          } catch (error) {
            console.error(
              `    ❌ Error en tarjeta ${cardId}: ${error.message}`
            );
          }
        }

        console.log(
          `✔ Página ${pageNumber} completada: ${cardIds.length} tarjetas procesadas`
        );

        if (pageNumber < totalPages) {
          await wait(2000);
        }
      } catch (error) {
        console.error(
          `❌ Error procesando página ${pageNumber}:`,
          error.message
        );
        continue;
      }
    }

    console.log(`\n📌 Scraping completado!`);
    console.log(`📊 Total de empleos extraídos: ${allJobs.length}`);
    console.log(`📄 Páginas procesadas: ${totalPages}`);

    // Estadísticas de geocodificación
    const jobsWithCoords = allJobs.filter((job) => job.coordenadas !== null);
    const jobsWithoutCoords = allJobs.filter((job) => job.coordenadas === null);

    console.log(`\n🗺️ Estadísticas de geocodificación:`);
    console.log(`  ✅ Con coordenadas: ${jobsWithCoords.length}`);
    console.log(`  ❌ Sin coordenadas: ${jobsWithoutCoords.length}`);
    console.log(
      `  📊 Tasa de éxito: ${(
        (jobsWithCoords.length / allJobs.length) *
        100
      ).toFixed(1)}%`
    );

    // Mostrar resumen por página
    const jobsByPage = allJobs.reduce((acc, job) => {
      acc[job.pagina] = (acc[job.pagina] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📈 Resumen por página:");
    Object.entries(jobsByPage).forEach(([page, count]) => {
      console.log(`  Página ${page}: ${count} empleos`);
    });

    return allJobs;
  } catch (error) {
    console.error("❗ Error crítico en scraping:", error.message);
    return [];
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = scrapeJobs;
