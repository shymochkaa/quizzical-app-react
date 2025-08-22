import { useEffect, useState } from "react";
import { decode } from "html-entities";
import { nanoid } from "nanoid";
import clsx from "clsx";

export default function QuestionsScreen({ onRestart }) {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5&category=9&difficulty=easy")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setQuestions(data.results))
      .catch((error) => setError(error.message));
  }, []);

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const questionsWithShuffledAnswers = questions.map((item) => {
    const allAnswers = [...item.incorrect_answers, item.correct_answer];
    return {
      question: item.question,
      answers: shuffleArray(allAnswers),
      correct_answer: item.correct_answer,
    };
  });

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const answers = {};
    let allAnswered = true;

    questionsWithShuffledAnswers.forEach((_, index) => {
      const value = formData.get(`question-${index}`);
      if (!value) allAnswered = false;
      answers[`question-${index}`] = value;
    });

    if (!allAnswered) {
      alert("Please answer all questions before submitting!");
      return;
    }

    setSelectedAnswers(answers);
    setSubmitted(true);

    // calculate score
    let scoreCount = 0;
    Object.keys(answers).forEach((key, index) => {
      if (answers[key] === questionsWithShuffledAnswers[index].correct_answer) {
        scoreCount += 1;
      }
    });
    setScore(scoreCount);
  }

  return (
    <div className="container question-screen-container">
      <svg
        className="right-corner-svg"
        width="162"
        height="187"
        viewBox="0 0 162 187"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M99.4095 71.3947C71.1213 40.8508 33.3179 11.7816 37.1727 -29.6933C41.4394 -75.599 75.854 -115.359 118.419 -133.133C158.797 -149.994 206.035 -140.256 241.822 -115.149C271.947 -94.0141 272.823 -53.8756 282.141 -18.271C292.17 20.0508 318.521 60.8106 296.501 93.7792C273.538 128.159 224.991 133.432 183.931 128.768C148.318 124.723 123.751 97.6768 99.4095 71.3947Z"
          fill="#FFFAD1"
        />{" "}
      </svg>
      <form className="questions" onSubmit={handleSubmit} noValidate>
        {questionsWithShuffledAnswers.map((question, index) => (
          <div key={nanoid()} className="question-container">
            <p className="question">{decode(question.question)}</p>
            <div className="answer-options">
              {question.answers.map((item, i) => {
                const id = nanoid();

                const isCorrectAnswer =
                  submitted && item === question.correct_answer;
                const isSelectedWrong =
                  submitted &&
                  selectedAnswers[`question-${index}`] === item &&
                  item !== question.correct_answer;

                const isNeutral =
                  submitted && !isCorrectAnswer && !isSelectedWrong;
                const className = clsx("answer-option", {
                  correct: isCorrectAnswer,
                  wrong: isSelectedWrong,
                  neutral: isNeutral,
                });

                return (
                  <div key={id} className="answer-option">
                    <input
                      type="radio"
                      id={id}
                      name={`question-${index}`}
                      value={item}
                      required={i === 0}
                      onInvalid={(e) =>
                        e.target.setCustomValidity(
                          "Please select an answer for this question"
                        )
                      }
                      onInput={(e) => e.target.setCustomValidity("")}
                      disabled={submitted}
                    />
                    <label className={className} htmlFor={id}>
                      {decode(item)}
                    </label>
                  </div>
                );
              })}
            </div>
            <div className="divider"></div>
          </div>
        ))}

        {!submitted && (
          <button className="check-answers-btn" type="submit">
            Check answers
          </button>
        )}

        {submitted && (
          <>
            <div className="results">
              <p className="score">
                You scored {score}/{questionsWithShuffledAnswers.length} correct
                answers
              </p>

              <button
                className="play-again-btn"
                type="button"
                onClick={onRestart}
              >
                Play again
              </button>
            </div>
          </>
        )}
      </form>

      <svg
        className="left-corner-svg"
        width="65"
        height="62"
        viewBox="0 0 65 62"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {" "}
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M-38.919 2.96445C-10.8241 1.07254 20.4975 -5.87426 40.8434 11.5469C63.3629 30.8293 69.9281 62.0589 61.4141 88.8747C53.3376 114.313 28.2818 132.992 -0.0909882 140.475C-23.9759 146.775 -45.6063 132.093 -68.3914 123.11C-92.9153 113.441 -125.606 110.575 -133.794 87.7612C-142.333 63.9714 -124.677 39.0277 -104.912 21.3621C-87.7687 6.03978 -63.0936 4.59238 -38.919 2.96445Z"
          fill="#DEEBF8"
        />{" "}
      </svg>
    </div>
  );
}
