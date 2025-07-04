// src/PortuguesePage.js

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import "./css/LanguagePage.css"; // Assuming you have a shared CSS file
import {
   getUserWords,
   addUserWord,
   updateWordProgress,
   resetProgress,
   removeWord,
} from "../database/userWords";

import { collection, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../database/firebase";
import { useNavigate } from "react-router-dom";

function PortuguesePage({ language }) {
   // Receives 'language' prop
   const [newWords, setNewWords] = useState([]);
   const [newWordInput, setNewWordInput] = useState("");
   const [newMeaningInput, setNewMeaningInput] = useState("");
   const [suggestions, setSuggestions] = useState([
      { word: "Olá", meaning: "Hello" },
      { word: "Obrigado", meaning: "Thank you" },
      { word: "Por favor", meaning: "Please" },
      { word: "Adeus", meaning: "Goodbye" },
      { word: "Sim", meaning: "Yes" },
      { word: "Não", meaning: "No" },
   ]);
   const [loading, setLoading] = useState(true);

   const navigate = useNavigate();
   const returnMenu = () => {
      navigate("/menu");
   };

   useEffect(() => {
      setLoading(true);
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
               id: doc.id,
               ...doc.data(),
            }));
            setNewWords(words);
            setLoading(false);
         },
         (error) => {
            console.error("Error fetching words in PortuguesePage:", error);
            setLoading(false);
         }
      );

      return () => unsubscribe();
   }, [language]);

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
         setSuggestions((prevSuggestions) =>
            prevSuggestions.filter(
               (suggestion) => suggestion.word !== wordObj.word
            )
         );
      }
   };

   const handleWordView = async (wordId) => {
      await updateWordProgress(wordId, language);
   };

   const handleRemoveWord = async (wordId) => {
      const confirmed = window.confirm(
         "Tem certeza que deseja remover esta palavra?"
      );
      if (confirmed) {
         await removeWord(wordId, language);
      }
   };

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
                     &nbsp; Voltar
                  </button>
               </div>
               <p>
                  Adicione palavras em português e seus significados em inglês.
               </p>
               <div className="word-input-area">
                  <input
                     type="text"
                     placeholder="Adicione uma nova palavra em português"
                     value={newWordInput}
                     onChange={(e) => setNewWordInput(e.target.value)}
                  />
                  <input
                     type="text"
                     placeholder="Adicione o significado em inglês"
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
                           key={wordObj.id}
                           className="new-word-item"
                           data-meaning={wordObj.meaning}
                           onClick={() => handleWordView(wordObj.id)}
                        >
                           <span>{wordObj.word}</span>
                           <div className="progress-bar-container">
                              <div
                                 className="progress-bar"
                                 style={{ width: `${wordObj.progress}%` }}
                              ></div>
                           </div>
                           <button
                              className="remove-button"
                              onClick={(e) => {
                                 e.stopPropagation();
                                 handleRemoveWord(wordObj.id);
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
               <h2>Sugestões de Palavras em Português</h2>
               <div className="word-suggestions">
                  {suggestions.length === 0 ? (
                     <p>Nenhuma sugestão disponível.</p>
                  ) : (
                     suggestions.map((wordObj, index) => (
                        <div
                           key={index}
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

export default PortuguesePage;
