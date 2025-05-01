"use client";
import React, { useEffect } from "react";

export default function PdfBot() {
  const [pdfData, setPdfData] = React.useState([]);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");

  // Uploasd PDF
  async function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch("/api/pdf/upload", {
      method: "POST",
      body: formData,
    });

    const { id } = await res.json();
    getAllPdf();
  }

  // Format PDF Search String
  async function askQuestion() {
    if (!question) {
      alert("Please enter a question.");
      return;
    }

    try {
      const res = await fetch("/api/pdf/query", {
        method: "POST",
        body: JSON.stringify({ question: question }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.error) {
        console.error("Error:", data.error);
        setAnswer({ answer: data.error });
        return;
      }
      setAnswer(data);
    } catch (error) {
      console.error("Error querying the PDF:", error);
      setAnswer({ answer: "Failed to process your question. Please try again." });
    } finally {
      setQuestion("");
    }
  }

  //Get all PDFs
  function getAllPdf() {
    fetch("/api/pdf/getAll").then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setPdfData(data);
          console.log("All PDFs", data);
        });
      } else {
        console.error("Failed to fetch PDFs");
      }
    });
  }

  useEffect(() => {
    getAllPdf();
  }, []);

  //Delete PDF by ID
  async function handleDeleteById(id) {
    try {
      const res = await fetch(`/api/pdf/delete?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Deleted successfully");
        getAllPdf();
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
  }

console.log(answer);

  return (
    <div className="p-6 max-w-7xl m-auto">
      <div>
        <h2 className="text-2xl font-bold mb-4">Uploaded PDF</h2>
        <div className="border p-4 rounded-2xl">
          {pdfData && pdfData?.length > 0
            ? pdfData?.map((item) => {
                return (
                  <div
                    key={item._id}
                    className="mb-4 flex justify-between items-center"
                  >
                    <h3 className="text-lg font-bold">{item.filename}</h3>
                    <button
                      className="bg-red-500 text-white p-1 px-3 rounded"
                      onClick={() => handleDeleteById(item._id)}
                    >
                      x
                    </button>
                    {/* <p>{JSON.stringify(item.content)}</p> */}
                  </div>
                );
              })
            : "No PDFs found"}
        </div>
      </div>
      <div className="flex items-center h-full">
        <div>
          <form
            onSubmit={handleUpload}
            className="p-4  flex justify-center items-center gap-4"
          >
            <input
              type="file"
              name="pdfFile"
              accept="application/pdf"
              required
              className="border p-1 mr-2"
            />
            <button className="bg-gray-800 p-1 px-2" type="submit">
              Upload PDF
            </button>
          </form>

          <div className=" p-4  flex justify-center items-center gap-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDF"
              className="border p-1 mr-2 w-full"
            />
            <button className="bg-gray-800 p-1 px-2 m-2" onClick={askQuestion}>
              Ask a Question
            </button>
          </div>
        </div>

      </div>
        <div>
          {answer && (
            <div className="p-4 border mt-4">
              <h3 className="text-lg font-bold">Answer:</h3>
              <p>{JSON.stringify(answer)}</p>
            </div>
          )}
        </div>
    </div>
  );
}
