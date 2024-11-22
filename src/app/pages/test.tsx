"use client"

import { db } from "../../utils/firebaseClient";
import { collection, getDocs } from "firebase/firestore";
import React from "react";
import { useEffect, useState } from "react";

const TestPage = () => {
    interface DocumentData {
        id: string;
        [key: string]: unknown; // For additional fields in the Firestore document
    }
    
    const [data, setData] = useState<DocumentData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshot = await getDocs(collection(db, "users"));
            const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setData(docs as DocumentData[]); // Ensure TypeScript recognizes the type
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Firebase Test Data</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default TestPage;
