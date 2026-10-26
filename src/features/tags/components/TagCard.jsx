import React from "react"

const TagCard = ({titulo,imagen,cantidad,onClick}) =>{
    return(
        <div className="tag-card" onClick={onClick}>
                <div className="icon-container">
                    <span>{imagen}</span>
                </div>
                <h2> {titulo}</h2>
                <p> {cantidad} links </p>
        </div>
    )
}

export default TagCard