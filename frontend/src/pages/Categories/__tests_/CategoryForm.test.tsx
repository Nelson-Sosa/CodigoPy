import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "../../../components/Categories/CategoryForm";
import '@testing-library/jest-dom'; // <--- importante para toBeInTheDocument

describe("CategoryForm", () => {
  const mockOnSave = vi.fn();

  test("debe renderizar los campos correctamente", () => {
    render(<CategoryForm onSave={mockOnSave} />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/icono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /categoría/i })).toBeInTheDocument();
  });

  test("permite enviar datos correctamente", () => {
    render(<CategoryForm onSave={mockOnSave} />);

    const nombreInput = screen.getByLabelText(/nombre/i);
    const descripcionInput = screen.getByLabelText(/descripción/i);
    const button = screen.getByRole("button", { name: /categoría/i });

    fireEvent.change(nombreInput, { target: { value: "Test Cat" } });
    fireEvent.change(descripcionInput, { target: { value: "Test Desc" } });

    fireEvent.click(button);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Cat",
        description: "Test Desc",
      })
    );
  });
});