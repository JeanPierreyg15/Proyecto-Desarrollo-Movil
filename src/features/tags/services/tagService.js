const etiquetasDemostracion = [
    { id: 1, titulo: 'Dev', cantidad: 3, icono: '💻' },
    { id: 2, titulo: 'Diseño', cantidad: 2, icono: '🎨' },
];

export const tagService = {
    async listar() {
        return etiquetasDemostracion;
    },
};
