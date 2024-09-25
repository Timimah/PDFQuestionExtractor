import { useEffect, useState } from "react";
import pdfToText from "react-pdftotext";

function App() {
  const [files, setFiles] = useState(null);
  const [text, setText] = useState("");
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [questionsToShow, setQuestionsToShow] = useState(5);
  const [showPreview, setShowPreview] = useState(true);

  const extractText = (event) => {
    const file = event.target.files[0];
    setFiles(file);
    pdfToText(file)
      .then((text) => {
        setText(text);
      })
      .catch((error) => console.log(error, "Failed to extract text from pdf"));
  };

  const extractQuestionsAnswers = (text) => {
    // Regex to extract questions, excluding "TRUE or FALSE"
    const questionRegex =
      /(\d+\.\s+(?!.*\bTRUE\sor\sFALSE\b).*?)(?=(?:\d+\.\s|$))/gs;
    // Regex to extract options (A., B., C., D., etc.), excluding "TRUE", "FALSE", "YES", "NO"
    // const optionRegex = /([A-Z]\.\s.*?)(?=\s[A-Z]\.|TRUE|FALSE|YES|NO|(?=\d+\.\s)|$)/gs;
    const optionRegex =
      /([A-Za-z]\.\s.*?)(?=\s[A-Za-z]\.|TRUE|FALSE|YES|NO|(?=\d+\.\s)|$)/gs;

    const questions = text.match(questionRegex) || [];
    const options = text.match(optionRegex) || [];

    // Initialize an array to hold grouped questions and options
    const groupedQuestions = [];

    // Iterate through each question to find matching options
    questions.forEach((question) => {
      // Filter options that belong to the current question
      const matchedOptions = options.filter((option) =>
        question.includes(option)
      );

      // Ensure unique options by creating a Set and converting it back to array
      const uniqueOptions = [...new Set(matchedOptions)];

      // Create a grouped object with question and unique options
      const groupedQuestion = {
        question: question.trim(), // Trim to remove extra whitespace
        options: uniqueOptions.map((option) => option.trim()), // Trim each option
      };

      // Add the grouped question to the array
      groupedQuestions.push(groupedQuestion);
    });

    setGroupedQuestions(groupedQuestions);
    setShowPreview(false);
  };

  const handleQuestionChange = (index, event) => {
    const newQuestions = [...groupedQuestions];
    newQuestions[index].question = event.target.value;
    setGroupedQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, event) => {
    const newQuestions = [...groupedQuestions];
    newQuestions[questionIndex].options[optionIndex] = event.target.value;
    setGroupedQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = groupedQuestions.filter((_, i) => i !== index);
    setGroupedQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      question: "New question",
      options: ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    };
    setGroupedQuestions([...groupedQuestions, newQuestion]);
  };

  const addOption = (index) => {
    const newQuestions = [...groupedQuestions];
    newQuestions[index].options.push("");
    setGroupedQuestions(newQuestions);
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const newQuestions = [...groupedQuestions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setGroupedQuestions(newQuestions);
  };

  const saveQuestions = () => {
    console.log("Saving Questions", groupedQuestions);
    // save the questions in a new array
  };

  const showMoreQuestions = () => {
    setQuestionsToShow((prev) => prev + 5);
  };

  return (
    <>
      <header className="hero">
        <nav className="container">
          <div className="nav-content">
            <div className="logo">PDF Question Extractor</div>
            <div className="nav-links">
              <a href="#upload">Upload</a>
              <a href="#extract">Extract</a>
            </div>
          </div>
        </nav>
        <div className="hero-content">
          <h1>Transform Your PDFs</h1>
          <p>Extract and edit questions from PDF documents with ease.</p>
          <a href="#upload" className="cta-button">
            Get Started
          </a>
        </div>
      </header>

      <main className="container">
        <section id="upload">
          <h2>Upload Your PDF</h2>
          <div className="upload-part">
          <input
            type="file"
            accept="application/pdf"
            onChange={extractText}
            className="file-input"
          />
          {files && showPreview && (
            <div className="pdf-preview">
              <embed
                src={URL.createObjectURL(files)}
                type="application/pdf"
                className="pdf-embed"
              />
            </div>
          )}
          </div>
        </section>

        <section id="extract">
          <button
            onClick={() => extractQuestionsAnswers(text)}
            className="extract-button"
          >
            Extract Questions and Answers
          </button>
        </section>

        <section id="questions">
          {groupedQuestions
            .slice(0, questionsToShow)
            .map((group, questionIndex) => (
              <div key={questionIndex} className="question-group">
                <div className="question-header">
                  <h3>Question {questionIndex + 1}</h3>
                  <button
                    onClick={() => handleDeleteQuestion(questionIndex)}
                    className="delete-button"
                    title="Delete question"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  value={group.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e)}
                  className="question-input"
                />
                <button
                  onClick={() => addOption(questionIndex)}
                  className="add-option-button"
                  title="Add option"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </button>
                {group.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-group">
                    <input
                      type="text"
                      value={option}
                      onChange={(event) =>
                        handleOptionChange(questionIndex, optionIndex, event)
                      }
                      placeholder="Enter option"
                      className="option-input"
                    />
                    <button
                      onClick={() => deleteOption(questionIndex, optionIndex)}
                      className="delete-option-button"
                      title="Delete option"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </section>

        {groupedQuestions.length > 0 && (
          <div className="action-buttons">
            {questionsToShow < groupedQuestions.length && (
              <button onClick={showMoreQuestions} className="show-more-button">
                Show More
              </button>
            )}
            <button onClick={handleAddQuestion} className="add-question-button">
              Add Question
            </button>
            <button onClick={saveQuestions} className="save-button">
              Save Questions
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
