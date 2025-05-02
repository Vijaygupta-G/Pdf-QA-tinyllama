"use client";
import React, { useEffect } from "react";

export default function PdfBot() {
  const [pdfData, setPdfData] = React.useState([]);
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [selectedPdfId, setSelectedPdfId] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Upload PDF
  async function handleUpload(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.target);
      const res = await fetch("/api/pdf/upload", {
        method: "POST",
        body: formData,
      });
      console.log("Succes uploading ==>", res);
      getAllPdf();
      e.target.reset();
    } catch (error) {
      console.error("Error uploading PDF:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Ask question about PDF
  async function askQuestion() {
    if (!question) {
      alert("Please enter a question.");
      return;
    }

    if (!selectedPdfId) {
      alert("Please select a PDF first.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/pdf/query", {
        method: "POST",
        body: JSON.stringify({
          query: question,
          pdfId: selectedPdfId,
        }),
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
      setAnswer({
        answer: "Failed to process your question. Please try again.",
      });
    } finally {
      setQuestion("");
      setIsLoading(false);
    }
  }

  //Get all PDFs
  function getAllPdf() {
    fetch("/api/pdf/getAll").then((res) => {
      if (res.ok) {
        res.json().then((data) => {
          setPdfData(data);
          console.table(data);
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  console.log(answer);

  return (
    <div className="max-w-7xl min-h-screen mx-auto p-6 bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        PDF Question & Answer
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - PDF Management */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              Your PDFs
            </h2>

            {/* PDF Upload Form */}
            <form onSubmit={handleUpload} className="mb-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-gray-600 font-medium">
                  Upload New PDF
                </label>
                <div className="flex">
                  <input
                    type="file"
                    name="pdfFile"
                    accept="application/pdf"
                    id="pdfFile"
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
                >
                  Upload PDF
                </button>
              </div>
            </form>

            {/* PDF List */}
            <div className="space-y-2 max-h-[62vh] overflow-y-auto pr-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Select a PDF to query
              </h3>

              {pdfData && pdfData.length > 0 ? (
                pdfData.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3 rounded-md border transition-colors ${
                      selectedPdfId === item._id
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="pdfSelection"
                          id={`pdf-${item._id}`}
                          onChange={() => setSelectedPdfId(item._id)}
                          checked={selectedPdfId === item._id}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor={`pdf-${item._id}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer truncate max-w-[180px]"
                        >
                          {item.filename}
                        </label>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteById(item._id)}
                        aria-label="Delete PDF"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mx-auto text-gray-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm">No PDFs uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Q&A Interface */}
        <div className="lg:col-span-2">
          {/* Question Input */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              Ask a Question
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="question"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your question about{" "}
                  {selectedPdfId ? "the selected PDF" : "a PDF"}:
                </label>
                <textarea
                  id="question"
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    selectedPdfId
                      ? "What would you like to know about this PDF?"
                      : "Select a PDF first, then ask a question"
                  }
                  disabled={!selectedPdfId}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={askQuestion}
                  disabled={!selectedPdfId || !question.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Ask Question
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Answer Display */}
          <div
            className={`bg-white border rounded-lg shadow-sm transition-opacity duration-300 ${
              answer ? "opacity-100" : "opacity-0"
            }`}
          >
            {answer && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Answer
                </h2>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">
                    {answer.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
