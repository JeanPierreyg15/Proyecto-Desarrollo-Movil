const linksDemostracion = [
    {
        id: 1,
        titulo: 'Java',
        url: 'react.dev',
        imagen: 'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        tiempo: '2h',
        etiquetas: ['Dev'],
    },
    {
        id: 2,
        titulo: 'React',
        url: 'react.dev',
        imagen: 'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        tiempo: '2h',
        etiquetas: ['Diseño', 'Dev'],
    },
    {
        id: 3,
        titulo: 'React',
        url: 'react.dev',
        imagen: 'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        tiempo: '2h',
        etiquetas: ['Diseño', 'Dev'],
    },
    {
        id: 4,
        titulo: 'React',
        url: 'react.dev',
        imagen: 'https://ionicframework.com/docs/img/demos/thumbnail.svg',
        tiempo: '2h',
        etiquetas: ['Diseño', 'Dev'],
    },
];

export const linkService = {
    async listar() {
        return linksDemostracion;
    },
};
