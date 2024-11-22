import { auth,db } from "../src/utils/firebaseClient";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
// Login function
export const login = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(error);
    }
};
export const getUserRole = async (uid: string) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        return userDoc.data().role;
    }
    throw new Error("User role not found");
};
// Logout function
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(error.message);
    }
};
