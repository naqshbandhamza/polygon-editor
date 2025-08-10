import { useState, useEffect, useRef } from "react";
import PdfLoader from "./components/PdfLoader";
import CropSelectorKonva from "./components/CropSelectorKonva";

function App() {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pages, setPages] = useState([]); // all page canvases
  const [selectedPage, setSelectedPage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfUrl(URL.createObjectURL(file));
      setPages([]);
      setSelectedPage(null);
    }
  };

  useEffect(() => {
    console.log(selectedPage)
    console.log(pages)
  }, [pages])

  return (
    <div className="bg-[#002A54] w-[100vw] h-[100%]">
      <div className="w-[100%] h-[100%] p-4 color-black flex justify-center">
        <label
          htmlFor="pdf-upload"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-indigo-700"
        >
          📄 Upload PDF
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />      </div>
      {pdfUrl && (
        <PdfLoader
          pdfUrl={pdfUrl}
          onPagesReady={(renderedPages) => {
            setPages(renderedPages);
            setSelectedPage(renderedPages[0])
          }}
        />
      )}

      <div className="relative w-[100%] h-[100%]">
        <div>

        </div>
        <div className="relative w-[96%] h-[90vh] mx-auto">

          {/* CropSelector only shows for selected page */}
          {selectedPage && (
            <CropSelectorKonva
              fullCanvas={selectedPage.canvas}
              selectedPage={selectedPage}
            />
          )}
        </div>
      </div>

      {/* Page thumbnails */}
      {pages.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto border p-2">
          {pages.map((page) => (
            <img
              key={page.index}
              src={page.dataUrl}
              alt={`Page ${page.index}`}
              className={`w-24 border rounded cursor-pointer ${selectedPage?.index === page.index ? "border-blue-500" : ""
                }`}
              onClick={() => {
                setSelectedPage(page);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
