import {useState} from 'react'
import './cards.css'
const LinkCard=({titulo,url,imagen,tiempo,etiquetas})=>{
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
                    <div className='tags-container'>
                        {etiquetas?.map((tipos,index)=>(
                        <button key={index}> {tipos} </button>))}
                    </div>
                    <p> Hace {tiempo} </p>
                </div>   
            </header>
        </article>
    )
}

export default LinkCard