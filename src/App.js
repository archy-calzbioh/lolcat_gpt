import './App.css'
import './normal.css'
import { useState, useEffect } from 'react'
import axios from 'axios'


const App = () => {

    // STATE




    // HANDLERS





    // THE getData() Function
     // Retrieves all the data in the DB
    // Fills our Array with Data Objects



    // USE EFFECT
    // Have GPT Array in the Dependency Array so when it is updated, callAPI() is called and page refreshes!!

 

    return (
        <div className='App'>
            {/* SIDEBAR - Questions and Answers */}
            <aside className='sidemenu'>
                <h1 className="title">Q&A</h1>
                <hr />
                <section>
                    {/* Mapping through Array to display Questions and Answers  */}
                     {
                        // gptArray.map((gpt, i) => {
                        //     return (
                        //     <>
                        //     <section>
                        //         <p className="question" key={i}>{gpt.question}</p>
                        //     </section>
                        //     <section>
                        //         <p key={i}>{gpt.answer}</p>
                        //     </section>
                        //     <hr />
                        //     </>
                        //     )
                        // })
                    }
                </section>
            </aside>
            {/* BODY */}
            <section className='chatbox'>
                <div className='chat-input-holder'>
                    {/* Our Question Input Field --- All to be asked will go here..... */}
                    <form onSubmit={handleSubmit}>
                        <input onChange={handleChange} rows='1' className="chat-input-textarea"></input>
                    </form>
                </div>
            </section>
        </div>

    )
}

export default App

