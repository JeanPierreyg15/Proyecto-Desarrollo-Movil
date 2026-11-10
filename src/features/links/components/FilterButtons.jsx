import React from 'react';

/**
 * Botones de filtro reutilizables.
 * - opciones: array de textos o de objetos { valor, texto }.
 * - activas: valores seleccionados.
 * - onToggle(valor | null): null representa "todas".
 */
const FilterButtons = ({ opciones = [], activas = [], onToggle, todosLabel = 'Todas', mostrarTodos = true }) => {
    const normalizar = (opcion) =>
        typeof opcion === 'object' && opcion !== null
            ? { valor: opcion.valor, texto: opcion.texto ?? String(opcion.valor) }
            : { valor: opcion, texto: String(opcion) };

    return (
        <div className="categories">
            {mostrarTodos && (
                <button
                    type="button"
                    className={activas.length === 0 ? 'active' : ''}
                    aria-pressed={activas.length === 0}
                    onClick={() => onToggle(null)}
                >
                    {todosLabel}
                </button>
            )}
            {opciones.map((opcion) => {
                const { valor, texto } = normalizar(opcion);
                const activo = activas.includes(valor);
                return (
                    <button
                        type="button"
                        key={valor}
                        className={activo ? 'active' : ''}
                        aria-pressed={activo}
                        onClick={() => onToggle(valor)}
                    >
                        {texto}
                    </button>
                );
            })}
        </div>
    );
};

export default FilterButtons;
