# RESPUESTAS TÉCNICAS – CodigoPy

## Pregunta 1: Arquitectura de Estado 

En CodigoPy decidí manejar el estado principalmente usando **hooks de React**, como `useState` y `useEffect`, combinados con hooks personalizados (`useProducts`, `useCategories`) para centralizar la lógica de manejo de datos y acciones CRUD.  

Esta estrategia me permitió mantener cada componente **autónomo y fácil de mantener**, mientras los hooks personalizados manejan la comunicación con el backend y la actualización del estado global de forma reactiva.  

Elegí esta solución porque el proyecto es aún de tamaño medio y no requiere un manejo de estado global complejo. Es más simple que usar Redux o Context para todo y reduce la sobrecarga de boilerplate.  

Consideraría cambiar a otra solución como **Redux Toolkit** o **React Query** si:  
- El proyecto crece y hay muchos módulos compartiendo estado entre componentes muy distantes.  
- Necesito manejar caché, sincronización de datos con el backend y revalidaciones automáticas.  
- Quiero tener herramientas de debugging más avanzadas para el estado global.

---

## Pregunta 2: Optimización de Rendimiento 

Para la tabla de productos con 10,000+ registros, implementaría o consideré estas estrategias:  

1. **Paginación o carga virtual**: Mostrar solo un subconjunto de filas visibles y cargar más según necesidad (infinite scroll o paginación clásica). Esto evita renderizar miles de elementos en el DOM.  
2. **Memoización de componentes**: Usar `React.memo` o `useMemo` para evitar renders innecesarios de filas que no cambian.  
3. **Filtrado y búsqueda en el backend**: En lugar de filtrar 10,000 registros en el frontend, hago queries al backend que devuelvan solo los resultados necesarios, reduciendo la carga de la UI y consumo de memoria.  

Opcionalmente, también consideraría **lazy loading de imágenes** y **optimización de iconos y recursos estáticos** para mantener el rendimiento.

---

## Pregunta 3: TypeScript Avanzado 

En TypeScript, **`interface`** y **`type`** son muy similares, pero tienen diferencias sutiles:  

- `interface` se suele usar para **definir la forma de un objeto** y se puede **extender** o **declarar en múltiples partes**.  
- `type` es más flexible, permite **uniones, intersecciones** y tipos primitivos, pero no se puede redeclarar.  

Ejemplo práctico:

```ts
// interface: perfecta para definir modelos de datos
interface Product {
  id: string;
  name: string;
  price: number;
}

// type: útil para uniones o combinaciones de tipos
type Status = "active" | "inactive" | "pending";
type ProductWithStatus = Product & { status: Status };

## Pregunta 4: Seguridad Frontend 

Consideré varias prácticas de seguridad en el frontend:

- **Validación de inputs**: Evitar que el usuario envíe datos vacíos o malformados antes de enviarlos al backend.

- **Uso de tokens JWT**: Autenticación mediante token que se guarda de forma segura (por ejemplo, en `localStorage` o `sessionStorage`) y se envía en headers Authorization.

- **Deshabilitar botones según permisos**: Por ejemplo, no permitir eliminar una categoría si tiene productos asociados (`disabled` en botones).

Otras consideraciones posibles: sanitizar HTML antes de mostrarlo, manejo seguro de contraseñas y limitar la exposición de datos sensibles en la UI.

---

## Pregunta 5: Escalabilidad (2 puntos)

Si el proyecto creciera a 20 módulos con 5 desarrolladores, propondría estos cambios arquitectónicos:

- **Dividir el proyecto en módulos**: Separar funcionalidades en carpetas independientes con sus componentes, hooks y servicios.

- **Manejo de estado global centralizado**: Usar Redux Toolkit o React Query para compartir datos entre módulos y mantener sincronización eficiente.

- **Establecer convenciones de desarrollo y componentes reutilizables**: Unificar estilos, formularios y layouts para que varios desarrolladores trabajen sin conflictos.

- **Testing y documentación**: Implementar tests unitarios y de integración, y documentar componentes y APIs para facilitar onboarding de nuevos devs.

----------------------------------------------------------------
-**El proyecto utiliza TypeScript en modo estricto (`strict: true`)
con interfaces bien definidas y sin uso de `any`. El tipado fue
validado ejecutando `npx tsc --noEmit`.
