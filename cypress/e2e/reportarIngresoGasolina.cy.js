describe("Reportar Ingreso de Gasolina ", () => {
  it("deberia reportar la cantidad de gasolina ingresada", () => {
    cy.visit("/");
    cy.get("#tipo-combustible").type("premium");
    cy.get("#cantidad").type("1000");
    cy.get("#Reportar").click();
    cy.get("reporte-gasolina").should('premium' , '1000' , '2025-04-24').exist;
  });
});
