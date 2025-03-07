import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { analyzeCanvasImage } from "../api/geminiAPI";

function DrawingCanvas() {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);
    const [color, setColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [isDrawingMode, setIsDrawingMode] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fabricCanvas = new fabric.Canvas(canvasRef.current, { isDrawingMode });

        fabricCanvas.setDimensions({ width: 800, height: 600 });

        setCanvas(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    useEffect(() => {
        if (canvas) {
            canvas.isDrawingMode = isDrawingMode;
            if (!canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
            }
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = strokeWidth;
        }
    }, [canvas, color, strokeWidth, isDrawingMode]);

    const handleClearCanvas = () => {
        if (canvas) canvas.clear();
    };

    const handleAddText = () => {
        if (!canvas) return;

        setIsDrawingMode(false);
        canvas.isDrawingMode = false;

        const text = new fabric.IText("Click to Edit", {
            left: Math.random() * (canvas.width - 100),
            top: Math.random() * (canvas.height - 50),
            fontSize: 20,
            fill: color,
            fontFamily: "Arial",
            textAlign: "center",
            borderColor: "black",
            editingBorderColor: "blue",
            hasControls: true,
            hasBorders: true,
            lockScalingFlip: true,
            selectable: true,
            evented: true,
        });

        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();

        canvas.on("mouse:move", (event) => {
            const hoveredObject = canvas.findTarget(event.e, false);
            canvas.defaultCursor = hoveredObject && hoveredObject.type === "i-text" ? "text" : "default";
        });

        canvas.renderAll();
    };

    const handleSaveImage = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({ format: "png" });
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "drawing.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleMode = () => {
        setIsDrawingMode(!isDrawingMode);
        if (canvas) {
            canvas.isDrawingMode = !isDrawingMode;
        }
    };

    const handleDeleteSelected = () => {
        if (!canvas || isDrawingMode) return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach((obj) => canvas.remove(obj));

            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    const handleAnalyzeDrawing = async () => {
        if (!canvas) return;

        setIsAnalyzing(true);

        try {
            const dataURL = canvas.toDataURL("image/png");
            const base64Image = dataURL.split(",")[1];

            const result = await analyzeCanvasImage(base64Image);
            setDescription(result || "No description available.");
        } catch (error) {
            console.error("Error analyzing drawing:", error);
            setDescription("Failed to analyze the drawing.");
        }

        setIsAnalyzing(false);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="border" style={{ position: "relative", padding: 0, margin: 0 }}>
                <canvas ref={canvasRef} width={800} height={600} />
            </div>

            <div className="mt-4 space-x-4">
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="cursor-pointer"
                />

                <input
                    type="number"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                    min="1"
                    max="50"
                    className="w-16 px-2 py-1 border rounded bg-white text-black"
                />

                <button
                    onClick={toggleMode}
                    className={`px-4 py-2 rounded ${isDrawingMode ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"} text-white`}
                >
                    {isDrawingMode ? "Switch to Edit Mode" : "Switch to Draw Mode"}
                </button>

                <button
                    onClick={handleAddText}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Text
                </button>

                {!isDrawingMode && (
                    <button
                        onClick={handleDeleteSelected}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete Selected
                    </button>
                )}

                <button
                    onClick={handleClearCanvas}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Clear Canvas
                </button>

                <button
                    onClick={handleSaveImage}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Save Image
                </button>

                <button
                    onClick={handleAnalyzeDrawing}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? "Analyzing..." : "Analyze Drawing"}
                </button>

                {description && (
                    <div className="mt-4 max-w-[800px] p-2 border rounded bg-gray-100 text-black overflow-y-auto max-h-40">
                        <strong>AI Description:</strong> {description}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DrawingCanvas;
