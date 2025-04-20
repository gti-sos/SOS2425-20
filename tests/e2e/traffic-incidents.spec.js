// @ts-check
import { test, expect } from '@playwright/test';

// TEST: Página principal tiene título correcto
test('has title', async ({ page }) => {
  await page.goto('http://localhost:16078');
  await expect(page).toHaveTitle(/Incidentes de Tráfico/);
});

// TEST: Navegación a traffic-accidents y verificación de título
test('get traffic-accidents', async ({ page }) => {
  await page.goto('http://localhost:16078');
  await page.getByRole('link', { name: 'traffic-accidents' }).click();
  await expect(page).toHaveTitle(/Accidentes de Tráfico/);
});

// TEST: Crear y eliminar un recurso de accidentes
test('create and delete traffic-accident', async ({ page }) => {
  const community = "prueba";
  const year = "2099";
  const fatal = "1";
  const deceased = "2";
  const noItv = "3";

  await page.goto('http://localhost:16078');
  await page.getByRole('link', { name: 'traffic-accidents' }).click();

  // Rellenar formulario
  // HEMOS AÑADIDO UN IDENTIFICADOR EN EL +PAGE.SVELTE EN EL FORM PARA PODER ACCEDER A LOS CAMPOS DE UNA MANERA MAS PROFESIONAL
  const inputs = await page.locator('input');
  await page.locator('[data-testid="input-community"]').fill(community);
  await page.locator('[data-testid="input-year"]').fill(year);
  await page.locator('[data-testid="input-fatal"]').fill(fatal);
  await page.locator('[data-testid="input-deceased"]').fill(deceased);
  await page.locator('[data-testid="input-noitv"]').fill(noItv);

  // Pulsar crear
  await page.getByRole('button', { name: 'Crear' }).click();

  // Esperar a que aparezca una fila con esa comunidad
  const row = page.locator('tr', { hasText: community });

  // Esperar hasta 10 segundos a que aparezca y contenga el año
  await expect(row).toContainText(year, { timeout: 10000 });

  // Eliminar la fila
  const deleteBtn = row.getByRole('button', { name: 'Eliminar' });
  await deleteBtn.click();

  // Comprobar que ha desaparecido
  await expect(row).toHaveCount(0);
});

//PARTE CARLOS

// TEST: Navegación a fines y verificación de título
test('get fines', async ({ page }) => {
  await page.goto('http://localhost:16078');
  await page.getByRole('link', { name: 'fines' }).click();
  await expect(page).toHaveTitle(/Multas/);
});


// TEST: Crear y eliminar una multa
test('create and delete fine', async ({ page }) => {
  const city = "PruebaCity";
  const year = "2099";
  const itv = "123";
  const alcoholRate = "1.5";
  const fixedRadar = "321";

  await page.goto('http://localhost:16078');

  // Ir a la vista de multas si fuera necesario
  await page.getByRole('link', { name: 'fines' }).click();

  // Rellenar formulario usando los identificadores
  await page.locator('[data-testid="input-city"]').fill(city);
  await page.locator('[data-testid="input-year"]').fill(year);
  await page.locator('[data-testid="input-itv"]').fill(itv);
  await page.locator('[data-testid="input-alcohol"]').fill(alcoholRate);
  await page.locator('[data-testid="input-radar"]').fill(fixedRadar);

  // Pulsar "Crear"
  await page.getByRole('button', { name: 'Crear' }).click();

  // Buscar la fila creada
  const row = page.locator('tr', { hasText: city });

  // Esperar a que esté visible y contenga el año
  await expect(row).toContainText(year, { timeout: 10000 });

  // Pulsar el botón de eliminar
  const deleteBtn = row.getByRole('button', { name: 'Eliminar' });
  await deleteBtn.click();

  // Verificar que la fila ha desaparecido
  await expect(row).toHaveCount(0);
});

// TEST: Navegación a traffic-accidents y verificación de título
test('get accidents-with-animals', async ({ page }) => {
  await page.goto('http://localhost:16078');
  await page.getByRole('link', { name: 'accidents-with-animals' }).click();
  await expect(page).toHaveTitle(/Accidentes con animales/);
});


// TEST: Crear y eliminar accidente con animales
test('create and delete animal accident', async ({ page }) => {
  const accidentId = "999999999999";
  const community = "prueba";
  const province = "testland";
  const accidentDate = "01/01/2099";
  const accidentHour = "12:00";
  const ineMunicipality = "1234";
  const road = "T-999";
  const km = "1";
  const typeOfRoad = "2";
  const animalGroup = "10";
  const otherAnimalGroup = "1";
  const deceased = "1";
  const hospInjured = "2";
  const nonHospInjured = "3";
  const anyo = "2099"

  await page.goto('http://localhost:16078');
  await page.getByRole('link', { name: 'accidents-with-animals' }).click();

  // Rellenar formulario con data-testid
  await page.locator('[data-testid="input-id"]').fill(accidentId);
  await page.locator('[data-testid="input-community"]').fill(community);
  await page.locator('[data-testid="input-province"]').fill(province);
  await page.locator('[data-testid="input-date"]').fill(accidentDate);
  await page.locator('[data-testid="input-hour"]').fill(accidentHour);
  await page.locator('[data-testid="input-ine"]').fill(ineMunicipality);
  await page.locator('[data-testid="input-road"]').fill(road);
  await page.locator('[data-testid="input-km"]').fill(km);
  await page.locator('[data-testid="input-type"]').fill(typeOfRoad);
  await page.locator('[data-testid="input-animal"]').fill(animalGroup);
  await page.locator('[data-testid="input-other-animal"]').fill(otherAnimalGroup);
  await page.locator('[data-testid="input-deceased"]').fill(deceased);
  await page.locator('[data-testid="input-hosp"]').fill(hospInjured);
  await page.locator('[data-testid="input-nonhosp"]').fill(nonHospInjured);
  await page.locator('[data-testid="input-anyo"]').fill(anyo);

  // Pulsar botón Crear
  await page.getByTestId("btn-create").click();

  // Esperar a que la fila con el ID esté visible
  const row = page.locator(`tr:has-text("${accidentId}")`);
  await expect(row).toBeVisible({ timeout: 10000 });

  // Eliminar el recurso
  const deleteBtn = row.getByRole('button', { name: 'Eliminar' });
  await deleteBtn.click();

  // Verificar que ha desaparecido
  await expect(row).toHaveCount(0);
});


