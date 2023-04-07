import './App.css'
import './normal.css'
import { useState, useEffect } from 'react'
import axios from 'axios'



const App = () => {
  // STATE
  const [newQuestion, setNewQuestion] = useState("");
  const [gptArray, setGptArray] = useState([]);

  // EDITING ANSWERS STATE 
  const [isEditing, setIsEditing] = useState({});
  const [editedAnswer, setEditedAnswer] = useState({});

  // EDIT ANSWER HANDLERS

  const editAnswer = (index) => {
    setIsEditing({ ...isEditing, [index]: true });
  };

  const saveEditedAnswer = (index) => {
    // Update the answer in gptArray (and optionally update the backend server)
    const updatedGptArray = gptArray.map((gpt, i) => {
      if (i === index) {
        return { ...gpt, answer: editedAnswer[index] };
      }
      return gpt;
    });
    setGptArray(updatedGptArray);
    setIsEditing({ ...isEditing, [index]: false });
  };

  // HANDLERS

  //handleChange
  const handleChange = (e) => {
    setNewQuestion(e.target.value);
    console.log(newQuestion);
  };

  // handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(newQuestion);
    axios
      .post("http://localhost:3080/gpt", {
        question: newQuestion,
      })
      .then((response) => {
        axios.get("http://localhost:3080/gpt").then((response) => {
          setGptArray(response.data);
        });
      });
  };

  // THE getData() Function
  // Retrieves all the data in the DB
  // Fills our Array with Data Objects

  const getData = () => {
    axios.get("http://localhost:3080/gpt").then((response) => {
      setGptArray(response.data);
    });
  };

  // USE EFFECT
  // Have GPT Array in the Dependency Array so when it is updated, callAPI() is called and page refreshes!!

  useEffect(() => {
    getData();
  }, [gptArray]);

  return (
    <div className="App">
      {/* SIDEBAR - Questions and Answers */}
      <aside className="sidemenu">
        <h1 className="title">Q&A</h1>
        <hr />
        <section>
          {/* Mapping through Array to display Questions and Answers  */}
          {gptArray.map((gpt, i) => {
            return (
              <>
                <section>
                  <p className="question" key={i}>
                    {gpt.question}
                  </p>
                </section>
                <section>
                  {isEditing[i] ? (
                    <>
                      <input
                        value={editedAnswer[i] || gpt.answer}
                        onChange={(e) =>
                          setEditedAnswer({
                            ...editedAnswer,
                            [i]: e.target.value,
                          })
                        }
                      />
                      <button onClick={() => saveEditedAnswer(i)}>Save</button>
                    </>
                  ) : (
                    <>
                      <p key={i}>{gpt.answer}</p>
                      <button onClick={() => editAnswer(i)}>Edit</button>
                    </>
                  )}
                </section>

                <hr />
              </>
            );
          })}
        </section>
      </aside>
      {/* BODY */}
      <section className="chatbox">
        <div className="chat-input-holder">
          {/* Our Question Input Field --- All to be asked will go here..... */}
          <form onSubmit={handleSubmit}>
            <input
              onChange={handleChange}
              rows="1"
              className="chat-input-textarea"
            ></input>
          </form>
        </div>
      </section>
    </div>
  );
}

export default App

