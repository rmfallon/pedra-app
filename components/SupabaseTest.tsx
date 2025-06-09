// components/SupabaseTest.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState<string>("Testing...");

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Try to select from the pois table
      const { data, error } = await supabase.from("pois").select("*").limit(1);

      if (error) {
        console.error("Supabase error:", error);
        setTestResult(`Error: ${error.message}`);
        return;
      }

      console.log("Supabase data:", data);
      setTestResult("Successfully connected to Supabase!");

      // Test insertion
      const testData = {
        name: "Test Location",
        description: "Test Description",
        latitude: 42.3601,
        longitude: -71.0589,
        additional_data: { test: true },
      };

      const { error: insertError } = await supabase
        .from("pois")
        .insert([testData]);

      if (insertError) {
        console.error("Insert error:", insertError);
        setTestResult(
          (prevResult) => `${prevResult}\nInsert Error: ${insertError.message}`,
        );
      } else {
        setTestResult(
          (prevResult) => `${prevResult}\nSuccessfully inserted test data!`,
        );
      }
    } catch (err) {
      console.error("Test error:", err);
      setTestResult(`Connection test failed: ${err}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Supabase Connection Test</h2>
      <pre className="bg-gray-100 p-4 rounded">{testResult}</pre>
    </div>
  );
};

export default SupabaseTest;
