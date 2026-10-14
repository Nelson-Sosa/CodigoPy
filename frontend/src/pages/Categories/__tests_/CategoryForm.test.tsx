import { render, screen, fireEvent } from "@testing-library/react";
import CategoryForm from "../../../components/Categories/CategoryForm";
import '@testing-library/jest-dom';

describe("CategoryForm", () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("debe renderizar los campos accesibles correctamente", () => {
    render(<CategoryForm onSave={mockOnSave} />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear categoría/i })).toBeInTheDocument();
  });

  test("muestra error de validación cuando el nombre está vacío", () => {
    render(<CategoryForm onSave={mockOnSave} />);

    const submitBtn = screen.getByRole("button", { name: /crear categoría/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("permite enviar datos correctamente en modo creación", () => {
    render(<CategoryForm onSave={mockOnSave} />);

    const nombreInput = screen.getByLabelText(/nombre/i);
    const descripcionInput = screen.getByLabelText(/descripción/i);
    const submitBtn = screen.getByRole("button", { name: /crear categoría/i });

    fireEvent.change(nombreInput, { target: { value: "Laptops" } });
    fireEvent.change(descripcionInput, { target: { value: "Equipos portátiles" } });

    fireEvent.click(submitBtn);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      name: "Laptops",
      description: "Equipos portátiles",
    });
  });

  test("pre-popula datos y permite actualizar en modo edición", () => {
    const existingCategory = {
      id: "cat-123",
      name: "Smartphones",
      description: "Teléfonos inteligentes",
    };

    render(
      <CategoryForm
        onSave={mockOnSave}
        editingCategory={existingCategory}
        onCancel={mockOnCancel}
      />
    );

    const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    const descripcionInput = screen.getByLabelText(/descripción/i) as HTMLInputElement;
    const updateBtn = screen.getByRole("button", { name: /actualizar/i });
    const cancelBtn = screen.getByRole("button", { name: /cancelar/i });

    expect(nombreInput.value).toBe("Smartphones");
    expect(descripcionInput.value).toBe("Teléfonos inteligentes");
    expect(updateBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.change(nombreInput, { target: { value: "Celulares" } });
    fireEvent.click(updateBtn);

    expect(mockOnSave).toHaveBeenCalledWith({
      name: "Celulares",
      description: "Teléfonos inteligentes",
    });

    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});