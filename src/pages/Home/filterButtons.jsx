import React from "react";

const FilterButtons = ({opciones,activas,onToggle}) =>{
    return(
        <div className='categories'>
            { opciones.map((opcion)=>{
                return(
                <button key={opcion}
                className={
                (opcion === 'Todos' && activas.length===0 || activas.includes(opcion) ? 'active' : '')
                }
                onClick={()=> onToggle(opcion)}
                >
                    {opcion}
                </button>)
            })

            }
        </div>
    )
}

export default FilterButtons