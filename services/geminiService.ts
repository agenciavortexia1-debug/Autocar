
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export async function getBusinessInsights(state: AppState) {
  // Always use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const inventorySummary = state.inventory.map(car => ({
    model: `${car.brand} ${car.model}`,
    cost: car.purchasePrice + car.repairs.reduce((acc, r) => acc + r.cost, 0),
    status: car.status
  }));

  const expensesTotal = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  const prompt = `
    Como um consultor sênior de gestão automotiva, analise os seguintes dados da minha loja de carros:
    Inventário: ${JSON.stringify(inventorySummary)}
    Despesas Operacionais Totais: R$ ${expensesTotal}
    
    Forneça 3 insights estratégicos curtos sobre:
    1. Rentabilidade do estoque.
    2. Gestão de custos de reparo.
    3. Sugestão de precificação baseada no volume de despesas.
    
    Retorne em português, de forma executiva e profissional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing the .text property directly as it returns the string output.
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão e tente novamente.";
  }
}
