import './LinkCard.css';

const LinkCard = ({ titulo, url, imagen, tiempo, etiquetas, onAbrir, onAcciones }) => {
    const manejarTecla = (evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            onAbrir?.();
        }
    };

    return (
        <article
            className="card animar-entrada"
            role="link"
            tabIndex={0}
            aria-label={`Abrir el enlace ${titulo}`}
            onClick={() => onAbrir?.()}
            onKeyDown={manejarTecla}
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
                    <button
                        type="button"
                        className="card-menu"
                        aria-label={`Acciones de ${titulo}`}
                        onClick={(evento) => {
                            evento.stopPropagation();
                            onAcciones?.();
                        }}
                    >
                        ⋮
                    </button>
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
        </article>
    );
};

export default LinkCard;
