import {useState} from 'react'
import './cards.css'
const LinkCard=({titulo,url,imagen,tiempo})=>{
    return(
        <article className='card'>
            <header className='card-header'>
                <img src={imagen}/>
                <div className='card-header-info'>
                    <strong>{titulo}</strong>
                    <span> {url} </span>
                </div>
                <button type = 'submit' className='card-menu-button'>
                        ⋮
                </button>   
            </header>
            <div className='card-footer'>
                    <button> Dev </button>
                    <p> Hace {tiempo} </p>
            </div>
        </article>
    )
}

export default LinkCard