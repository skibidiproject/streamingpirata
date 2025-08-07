'use client'
import Navbar from '../../_components/NavBar'


export default function Donations() {


    return (
        <>
            <Navbar />
            <div className="text-white px-4 py-8 pt-30 w-screen text-center">

                { /*page autori con dexter*/}
                <div className='w-full flex items-center justify-center '>
                    <img src="../Car/Car.jpg" className='mt-15 aspect-auto h-[20rem]' />
                </div>

                <p className="text-white mt-4 px-2">Dexter ringrazia per le donazioni &lt;3</p>


            </div>
        </>
    )
}