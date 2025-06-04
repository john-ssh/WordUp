// src/EnglishPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./css/LanguagePage.css"; // Assuming you have a shared CSS file
import {
   getUserWords,
   addUserWord,
   updateWordProgress,
   resetProgress,
   removeWord,
} from "../database/userWords"; // Correct path to userWords.js

// Import Firestore functions for real-time listener
import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../database/firebase"; // Correct path to firebase.js
import { onAuthStateChanged } from "firebase/auth";


function EnglishPage({ language }) {
   // Receives 'language' prop from router
   const [newWords, setNewWords] = useState([]);
   const [newWordInput, setNewWordInput] = useState("");
   const [newMeaningInput, setNewMeaningInput] = useState("");
   const [suggestions, setSuggestions] = useState([
      { word: "Hello", meaning: "Olá" },
      { word: "Thank you", meaning: "Obrigado" },
      { word: "Please", meaning: "Por favor" },
      { word: "Goodbye", meaning: "Adeus" },
      { word: "Yes", meaning: "Sim" },
      { word: "No", meaning: "Não" },
   ]);
   const [loading, setLoading] = useState(true); // Added loading state

   const navigate = useNavigate();
   const returnMenu = () => {
      navigate('/menu')
   }

   useEffect(() => {
      setLoading(true); // Indicate loading
      // Set up a real-time listener for words specific to this language
      const user = auth.currentUser;
      if (!user) {
         console.error("User not authenticated");
         setLoading(false);
         return;
      }
      const wordsCollectionRef = collection(
         db,
         "users",
         user.uid,
         "languages",
         language,
         "words"
      );
      
      const q = query(wordsCollectionRef);

      const unsubscribe = onSnapshot(
         q,
         (snapshot) => {
            const words = snapshot.docs.map((doc) => ({
               id: doc.id, // Get the Firestore document ID
               ...doc.data(),
            }));
            setNewWords(words);
            setLoading(false); // Loading complete
         },
         (error) => {
            console.error("Error fetching words in EnglishPage:", error);
            setLoading(false);
            // You might want to display an error message to the user here
         }
      );

      // Cleanup function: unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
   }, [language]); // Effect re-runs if 'language' prop changes

   const handleAddWord = async () => {
      if (newWordInput.trim() !== "" && newMeaningInput.trim() !== "") {
         const added = await addUserWord(
            newWordInput.trim(),
            newMeaningInput.trim(),
            language
         );
         if (added) {
            setNewWordInput("");
            setNewMeaningInput("");
         } else {
            alert(`A palavra "${newWordInput.trim()}" já existe nesta lista!`);
         }
      }
   };

   const handleSuggestionClick = async (wordObj) => {
      const added = await addUserWord(wordObj.word, wordObj.meaning, language);
      if (added) {
         // Remove the suggestion if successfully added
         setSuggestions((prevSuggestions) =>
            prevSuggestions.filter(
               (suggestion) => suggestion.word !== wordObj.word
            )
         );
      }
   };

   const handleWordView = async (wordId) => {
      // Now takes wordId
      await updateWordProgress(wordId, language);
   };

   const handleRemoveWord = async (wordId) => {
      // Now takes wordId
      const confirmed = window.confirm(
         "Tem certeza que deseja remover esta palavra?"
      );
      if (confirmed) {
         await removeWord(wordId, language);
      }
   };

   // Render loading state while fetching data
   if (loading) {
      return (
         <div className="welcome-page-background">
            <div className="language-page">
               <p>Carregando palavras...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="welcome-page-background">
         <div className="language-page">
            <section className="instruction-section">
               <div className="divReturn">
                  <button onClick={returnMenu} className="returnButton">
                     <ArrowLeft size={20} />
                     &nbsp;
                     Voltar
                  </button>
               </div>
               <p>
                  Adicione palavras em inglês e seus significados em português.
               </p>
               <div className="word-input-area">
                  <input
                     type="text"
                     placeholder="Adicione uma nova palavra em inglês"
                     value={newWordInput}
                     onChange={(e) => setNewWordInput(e.target.value)}
                  />
                  <input
                     type="text"
                     placeholder="Adicione o significado em português"
                     value={newMeaningInput}
                     onChange={(e) => setNewMeaningInput(e.target.value)}
                  />
                  <button onClick={handleAddWord}>Adicionar</button>
               </div>
            </section>

            <section className="new-words-section">
               <div className="new-words-row">
                  {newWords.length === 0 && !loading ? (
                     <p>
                        Nenhuma palavra adicionada ainda. Adicione uma ou
                        escolha nas sugestões abaixo!
                     </p>
                  ) : (
                     newWords.map((wordObj) => (
                        <div
                           key={wordObj.id} // Use Firestore ID as key
                           className="new-word-item"
                           data-meaning={wordObj.meaning}
                           onClick={() => handleWordView(wordObj.id)} // Pass ID to view/update
                        >
                           <span>{wordObj.word}</span>
                           <div className="progress-bar-container">
                              <div
                                 className="progress-bar"
                                 style={{ width: `${wordObj.progress}%` }}
                              ></div>
                           </div>
                           <button
                              className="remove-button" // Add a class for styling
                              onClick={(e) => {
                                 e.stopPropagation(); // Prevent handleWordView from firing
                                 handleRemoveWord(wordObj.id); // Pass ID to remove
                              }}
                           >
                              Remover
                           </button>
                        </div>
                     ))
                  )}
               </div>
            </section>

            <section className="suggestion-section">
               <h2>Sugestões de Palavras em Inglês</h2>
               <div className="word-suggestions">
                  {suggestions.length === 0 ? (
                     <p>Nenhuma sugestão disponível.</p>
                  ) : (
                     suggestions.map((wordObj, index) => (
                        <div
                           key={index} // Can use index here as suggestions aren't persisted and don't have Firestore IDs
                           className="word-box"
                           onClick={() => handleSuggestionClick(wordObj)}
                           data-meaning={wordObj.meaning}
                        >
                           {wordObj.word}
                        </div>
                     ))
                  )}
               </div>
            </section>
         </div>
      </div>
   );
}

export default EnglishPage;
