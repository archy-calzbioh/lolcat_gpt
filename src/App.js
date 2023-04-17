import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

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
  const selectedElement = gptArray.find((gpt) => gpt._id === elementId);
  setSelectedCodeBlock(selectedElement.answer);
};


  //add a new state to store the selected code block
  const [selectedCodeBlock, setSelectedCodeBlock] = useState(null);

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
      .put(`${process.env.REACT_APP_API_URL}/gpt/${answerId}`, {
        answer: newContent,
      })
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Remove the extra forward slash at the end of the base URL
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, '');
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/generate-image`,
      {}

      );
      const imageUrl = response.data.data[0].url;
      setGeneratedImageUrl(imageUrl);

      const gptResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/gpt`,
        {
          question: newQuestion,
          imageUrl: imageUrl,
        }
      );

      setGptArray([...gptArray, gptResponse.data]);
      setNewQuestion("");
      setGeneratedImageUrl(null);

      // Fetch the data again after successfully submitting a new question
      getData();
    } catch (error) {
      console.error(error);
    }
  };


  const handleDelete = (answerId) => {
    // Send a DELETE request to the backend with the ID of the entry to be deleted
    axios
      .delete(`${process.env.REACT_APP_API_URL}/gpt/${answerId}`)
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
    axios.get(`${process.env.REACT_APP_API_URL}/gpt`).then((response) => {
      setGptArray(response.data);
    });
  };

  // USE EFFECT
  // Have GPT Array in the Dependency Array so when it is updated, callAPI() is called and page refreshes!!

useEffect(() => {
  getData();
}, [gptArray]);

  return (
    <div className="App container">
      {/* SIDEBAR - Questions and Answers */}
      <div className="sidebar-container sidebar">
        <aside className="sidemenu">
          <h1 className="title">Q&A</h1>
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
                        {/* Replace the input element with a textarea element */}
                        <textarea
                          value={editedAnswer[i] || gpt.answer}
                          onChange={(e) =>
                            setEditedAnswer({
                              ...editedAnswer,
                              [i]: e.target.value,
                            })
                          }
                          rows="10" // Set the number of rows for the textarea
                          className="code-edit-textarea" // Optional: Add a class for styling
                        />
                        <button onClick={() => saveEditedAnswer(i)}>
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <MyCoolCodeBlock
                          code={gpt.answer}
                          language="javascript"
                          showLineNumbers={true}
                          startingLineNumber={1}
                          onClick={() => handleElementClick(gpt._id)}
                        />
                        <button onClick={() => editAnswer(i)}>Edit</button>
                      </>
                    )}

                    {/* Add the "Select Code Block" button here, outside the editing condition */}
                    <section>
                      <button onClick={() => handleElementClick(gpt._id)}>
                        Select Code Block
                      </button>
                    </section>
                  </section>
                  <section>
                    <button onClick={() => handleDelete(gpt._id)}>
                      Delete
                    </button>
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
          {/* Render the selected code block or the last code block in the gptArray */}
          {selectedCodeBlock ? (
            <MyCoolCodeBlock
              code={selectedCodeBlock}
              language="javascript"
              showLineNumbers={true}
              startingLineNumber={1}
            />
          ) : gptArray.length > 0 ? (
            isEditing[gptArray.length - 1] ? (
              <>
                <MyCoolCodeBlock
                  code={
                    editedAnswer[gptArray.length - 1] ||
                    gptArray[gptArray.length - 1].answer
                  }
                  language="javascript"
                  showLineNumbers={true}
                  startingLineNumber={1}
                />
                {/* Replace the input element with a textarea element */}
                <textarea
                  value={
                    editedAnswer[gptArray.length - 1] ||
                    gptArray[gptArray.length - 1].answer
                  }
                  onChange={(e) =>
                    setEditedAnswer({
                      ...editedAnswer,
                      [gptArray.length - 1]: e.target.value,
                    })
                  }
                  rows="10" // Set the number of rows for the textarea
                  className="code-edit-textarea" // Optional: Add a class for styling
                />
                <button onClick={() => saveEditedAnswer(gptArray.length - 1)}>
                  Save
                </button>
              </>
            ) : (
              <>
                <MyCoolCodeBlock
                  code={gptArray[gptArray.length - 1].answer}
                  language="javascript"
                  showLineNumbers={true}
                  startingLineNumber={1}
                />
                <button onClick={() => editAnswer(gptArray.length - 1)}>
                  Edit
                </button>
              </>
            )
          ) : null}

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
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
