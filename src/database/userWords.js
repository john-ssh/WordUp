// src/data/userWords.js

import { db } from "./firebase"; // Path to your firebase.js file
import { getDoc } from "firebase/firestore";

import {
   collection,
   doc,
   getDocs,
   addDoc,
   updateDoc,
   deleteDoc,
   query,
   where,
   serverTimestamp,
   writeBatch, // Import writeBatch for batch operations
} from "firebase/firestore";

// Helper to get a reference to the words collection for a specific language
// Data structure will be: /languages/{languageId}/words/{wordId}
const getWordsCollectionRef = (language) => {
   return collection(db, "languages", language, "words");
};

export const getUserWords = async (language) => {
   try {
      const wordsCollectionRef = getWordsCollectionRef(language);
      const querySnapshot = await getDocs(wordsCollectionRef);
      const words = querySnapshot.docs.map((doc) => ({
         id: doc.id, // Include the Firestore document ID
         ...doc.data(),
      }));
      return words;
   } catch (error) {
      console.error("Error getting user words for " + language + ":", error);
      return []; // Return empty array on error
   }
};

export const addUserWord = async (word, meaning, language) => {
   try {
      const wordsCollectionRef = getWordsCollectionRef(language);
      // Check if word already exists to avoid duplicates
      const q = query(wordsCollectionRef, where("word", "==", word));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
         // Only add if it doesn't exist
         await addDoc(wordsCollectionRef, {
            word: word,
            meaning: meaning,
            progress: 0,
            lastViewed: null,
            createdAt: serverTimestamp(), // Use server timestamp for creation
         });
         return true; // Indicate success (word was added)
      }
      console.warn(`Word '${word}' already exists in ${language}.`);
      return false; // Indicate word already exists
   } catch (error) {
      console.error("Error adding word for " + language + ":", error);
      return false; // Indicate failure
   }
};

export const updateWordProgress = async (wordId, language) => {
   try {
      const wordDocRef = doc(db, "languages", language, "words", wordId);
      const docSnap = await getDoc(wordDocRef);

      if (!docSnap.exists()) {
         console.warn("Word not found.");
         return false;
      }

      const wordData = docSnap.data();
      const currentProgress = wordData.progress || 0;
      const lastViewed = wordData.lastViewed?.toDate?.(); // Convert Timestamp to JS Date

      // Get today's date (no time part)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already updated today
      if (lastViewed) {
         const lastDate = new Date(lastViewed);
         lastDate.setHours(0, 0, 0, 0);

         if (lastDate.getTime() === today.getTime()) {
            console.log("Already updated today.");
            alert('Atualizado Hoje, Atualize Amanhã!');
            return false; // No update allowed today
         }
      }

      // Increase progress by 5, max 100
      const updatedProgress = Math.min(100, currentProgress + 5);

      await updateDoc(wordDocRef, {
         progress: updatedProgress,
         lastViewed: serverTimestamp(),
      });

      return true;
   } catch (error) {
      console.error("Error updating word progress:", error);
      return false;
   }
};

export const resetProgress = async (language) => {
   try {
      const wordsCollectionRef = getWordsCollectionRef(language);
      const querySnapshot = await getDocs(wordsCollectionRef);

      const batch = writeBatch(db); // Initialize a batch for multiple updates
      querySnapshot.docs.forEach((docSnap) => {
         const wordRef = doc(db, "languages", language, "words", docSnap.id);
         batch.update(wordRef, { progress: 0, lastViewed: null });
      });
      await batch.commit(); // Commit the batch
      return true;
   } catch (error) {
      console.error("Error resetting progress for " + language + ":", error);
      return false;
   }
};

export const removeWord = async (wordId, language) => {
   try {
      const wordDocRef = doc(db, "languages", language, "words", wordId);
      await deleteDoc(wordDocRef);
      return true;
   } catch (error) {
      console.error("Error removing word for " + language + ":", error);
      return false;
   }
};
