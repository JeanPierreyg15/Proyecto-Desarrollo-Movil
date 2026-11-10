import React from 'react';

const TagCard = ({ titulo, imagen, cantidad, onClick }) => {
    return (
        <button type="button" className="tag-card animar-entrada" onClick={onClick}>
            <span className="icon-container" aria-hidden="true">{imagen}</span>
            <span className="tag-card-titulo">{titulo}</span>
            <span className="tag-card-cantidad">{cantidad} {cantidad === 1 ? 'link' : 'links'}</span>
        </button>
    );
};

export default TagCard;
