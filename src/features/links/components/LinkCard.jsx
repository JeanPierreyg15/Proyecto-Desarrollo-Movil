import React from 'react';
import './LinkCard.css';

const LinkCard = ({ titulo, url, imagen, tiempo, etiquetas, onAbrir, onAcciones }) => {
    return (
        <article className="card animar-entrada">
            <button
                type="button"
                className="card-principal"
                aria-label={`Abrir el enlace ${titulo}`}
                onClick={() => onAbrir?.()}
            >
                {imagen ? (
                    <img
                        src={imagen}
                        alt=""
                        width="120"
                        height="120"
                        loading="lazy"
                        onError={(evento) => {
                            evento.currentTarget.style.visibility = 'hidden';
                        }}
                    />
                ) : (
                    <div className="card-img-placeholder" aria-hidden="true">🔗</div>
                )}
                <header className="card-header">
                    <div className="card-header-top">
                        <div className="card-header-info">
                            <strong>{titulo}</strong>
                            <span>{url}</span>
                        </div>
                    </div>
                    <div className="card-footer">
                        <div className="tags-container">
                            {(etiquetas ?? []).map((nombre) => (
                                <span className="card-tag" key={nombre}>{nombre}</span>
                            ))}
                        </div>
                        {tiempo ? <p>{tiempo}</p> : null}
                    </div>
                </header>
            </button>
            <button
                type="button"
                className="card-menu"
                aria-label={`Acciones de ${titulo}`}
                onClick={() => onAcciones?.()}
            >
                ⋮
            </button>
        </article>
    );
};

export default LinkCard;
