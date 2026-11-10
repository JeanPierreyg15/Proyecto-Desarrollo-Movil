import './LinkCard.css';

const LinkCard = ({ titulo, url, imagen, tiempo, etiquetas, onEliminar }) => {
    return (
        <article className="card animar-entrada">
            {imagen ? (
                <img src={imagen} alt={`Vista previa de ${titulo}`} />
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
                        aria-label={`Eliminar el link ${titulo}`}
                        onClick={onEliminar ?? (() => {})}
                    >
                        ⋮
                    </button>
                </div>
                <div className="card-footer">
                    <div className="tags-container">
                        {(etiquetas ?? []).map((nombre) => (
                            <button key={nombre} type="button">{nombre}</button>
                        ))}
                    </div>
                    {tiempo ? <p>Hace {tiempo}</p> : null}
                </div>
            </header>
        </article>
    );
};

export default LinkCard;
