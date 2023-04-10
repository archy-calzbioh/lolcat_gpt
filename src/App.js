import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { CopyBlock, dracula } from "react-code-blocks";



function MyCoolCodeBlock({
  code,
  language,
  showLineNumbers,
  startingLineNumber,
}) {
  return (
    <div className="code-block">
      <CopyBlock
        text={code}
        language={language}
        showLineNumbers={showLineNumbers}
        startingLineNumber={startingLineNumber}
        theme={dracula}
        codeBlock
      />
    </div>
  );
}

 


const App = () => {
  // Create a new state to store the generated image URL
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);

  //select an element in the sidebar
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Handler function for when an element in the sidebar is clicked
  const handleElementClick = (elementId) => {
    setSelectedElementId(elementId);
  };


  const generateImage = () => {
    axios
      .post("http://localhost:3080/generate-image", {})
      .then((response) => {
        console.log(response.data); // check response data
        const imageUrl = response.data.data[0].url;
        console.log(imageUrl); // check imageUrl

        setGeneratedImageUrl(imageUrl);
      })
      .catch((error) => {
        console.error(error);
      });
  };

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
    // Extract the ID and new content of the answer to update
    const answerId = gptArray[index]._id; // Assuming each answer has a unique _id property
    const newContent = editedAnswer[index];

    // Send an HTTP request to the backend API endpoint to update the answer
    axios
      .put(`http://localhost:3080/gpt/${answerId}`, { answer: newContent })
      .then((response) => {
        // Update the gptArray with the updated answer received from the backend
        const updatedGptArray = gptArray.map((gpt) =>
          gpt._id === answerId ? response.data : gpt
        );
        setGptArray(updatedGptArray);
        setIsEditing({ ...isEditing, [index]: false });
      })
      .catch((error) => {
        // Handle any errors that occur during the request
        console.error(error);
      });
  };

  // HANDLERS

  //handleChange
  const handleChange = (e) => {
    setNewQuestion(e.target.value);
    console.log(newQuestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3080/gpt", {
        question: newQuestion,
        imageUrl: generatedImageUrl, // Add the generated image URL to the request body
      })
      .then((response) => {
        // Update the gptArray with the new entry received from the backend
        setGptArray([...gptArray, response.data]);

        // Clear the new question and generated image URL
        setNewQuestion("");
        setGeneratedImageUrl(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDelete = (answerId) => {
    // Send a DELETE request to the backend with the ID of the entry to be deleted
    axios
      .delete(`http://localhost:3080/gpt/${answerId}`)
      .then((response) => {
        // Handle successful deletion
        // For example, you can update the state to remove the deleted entry from the UI
        setGptArray(gptArray.filter((gpt) => gpt._id !== answerId));
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
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
      <div className="sidebar-container">
  
      <aside className="sidemenu">
        <h1 className="title">Q&A</h1>
        <hr />
        <section>
          {/* Render the elements in the sidebar */}
          {gptArray.map((gpt) => (
            <div key={gpt._id} onClick={() => handleElementClick(gpt._id)}>
              <p className="question">{gpt.question}</p>
            </div>
          ))}
        </section>
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
                      <MyCoolCodeBlock
                        code={editedAnswer[i] || gpt.answer}
                        language="javascript"
                        showLineNumbers={true}
                        startingLineNumber={1}
                      />
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
                      <MyCoolCodeBlock
                        code={gpt.answer}
                        language="javascript"
                        showLineNumbers={true}
                        startingLineNumber={1}
                      />
                      <button onClick={() => editAnswer(i)}>Edit</button>
                    </>
                  )}
                </section>
                <section>
                  <button onClick={() => handleDelete(gpt._id)}>Delete</button>
                </section>
                <hr />
              </>
            );
          })}
        </section>
      </aside>
        </div>
      {/* BODY */}
      <section className="chatbox">
        <div className="chatbox-container">
          {/* Render the first answer in the chatbox area */}
          {gptArray.length > 0 && (
            <div className="chat-output-holder">
              {gptArray[gptArray.length - 1].answer && (
                <MyCoolCodeBlock
                  code={gptArray[gptArray.length - 1].answer}
                  language="javascript"
                  showLineNumbers={true}
                  startingLineNumber={1}
                />
              )}
              {generatedImageUrl && (
                <img
                  src={generatedImageUrl}
                  alt="Generated Image"
                  style={{
                    width: "300px",
                    height: "300px",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                />
              )}
            </div>
          )}
          <div className="chat-input-holder">
            {/* Our Question Input Field --- All to be asked will go here..... */}
            <form onSubmit={handleSubmit}>
              <textarea
                onChange={handleChange}
                value={newQuestion}
                rows="3"
                className="chat-input-textarea"
              ></textarea>
              <button type="submit" className="submit-button">
                Submit
              </button>
              <button
                type="button"
                onClick={generateImage}
                className="generate-image-button"
              >
                Generate Image
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
