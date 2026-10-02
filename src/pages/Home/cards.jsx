import {useState} from 'react'
import './cards.css'
const LinkCard=({titulo,url,imagen,tiempo})=>{
    return(
        <article className='card'>
            <img src={imagen}/>
            <header className='card-header'>
                <div className='card-header-top'>
                <div className='card-header-info'>
                    <strong>{titulo}</strong>
                    <span> {url} </span>
                </div>
                <button type = 'submit'>
                        ⋮
                </button>
                </div>
                <div className='card-footer'>
                    <button> Dev </button>
                    <p> Hace {tiempo} </p>
                </div>   
            </header>
        </article>
    )
}

export default LinkCard