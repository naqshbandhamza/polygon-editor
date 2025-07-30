import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import { Circle, Square, Triangle, Shapes, Type } from "lucide-react"; // You can replace with any icons you prefer

const Toolbar = ({ activateUltron }) => {

  console.log("toolbar rendered")
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeSubIcon, setActiveSubIcon] = useState(null);

  const icons = [
    { id: "shape", label: "Shapes", icon: Shapes },
    { id: "text", label: "Text", icon: Type },
    // Add more tools here
  ];

  const shapes = ["Rectangle", "Circle", "Triangle"];

  return (
    <div>
      {/* Sidebar Toolbar */}
      <div className="absolute top-[2%] left-[10px] h-[96%] w-[60px] bg-white rounded-md shadow-md flex flex-col items-center gap-1 pt-[5px]">
        {icons.map(({ id, icon: Icon }) => (
          <button
            key={id}
            style={{ backgroundColor: activeIcon === id ? "#D8E7F7" : "white", outline: "none", padding: "10px" }}
            onClick={() => setActiveIcon(activeIcon === id ? null : id)}
          >
            <Icon className="text-black" size={24} />
          </button>
        ))}
      </div>

      {/* Shape Picker Panel */}
      {activeIcon === "shape" && (
        <div className="absolute top-[2%] left-[80px] bg-white shadow-lg rounded-md p-4 w-40">
          <ul>
            {shapes.map((shape) => (
              <li key={shape} className="inline-block">
                <button className="rounded text-black"
                  style={{ backgroundColor: "white", outline: "none", padding: "10px" }}
                  onMouseDown={() => {
                    console.log("mouse down")
                    setActiveSubIcon(shape)
                    activateUltron(shape)
                  }}
                >
                  {shape === "Rectangle" && (
                    <Square />
                  )}
                  {shape === "Circle" && (
                    <Circle />
                  )}
                  {shape === "Triangle" && (
                    <Triangle />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default function CropSelectorKonva({ fullCanvas, selectedPage, canvasScale, stagePosRef, shapesRef, trasnformerRef }) {

  console.log("canvas page rendered")
  const [image, setImage] = useState(null);
  const isDragging = useRef(false);

  const pointer = useRef({ x: 0, y: 0 });
  const drawlayerRef = useRef();
  const stageRef = useRef();

  // Load fullCanvas into image
  useEffect(() => {
    const img = new window.Image();
    img.src = fullCanvas.toDataURL();
    img.onload = () => setImage(img);
    if (stageRef?.current) {
      stageRef.current.draggable(true);
      stageRef.current.position(stagePosRef.current)
      const layer = drawlayerRef.current;
      if (!trasnformerRef?.current) {
        console.log("init transforemer")
        const transformer = new Konva.Transformer();
        trasnformerRef.current = transformer;
      }
      layer.add(trasnformerRef.current);
      stageRef.current.batchDraw();
    }
  }, [fullCanvas]);


  const handleMouseDown = (e) => {
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    const stage = stageRef.current;
    pointer.current = stage.getPointerPosition();
  };

  const handleMouseUp = () => {
    isDragging.current = true;
  };

  const handleWheel = (e) => {
    // Zoom handler
    e.evt.preventDefault();

    const stage = stageRef.current;
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer_temp = pointer.current;

    const mousePointTo = {
      x: (pointer_temp.x - stage.x()) / oldScale,
      y: (pointer_temp.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    canvasScale.current = { x: newScale, y: newScale };
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer_temp.x - mousePointTo.x * newScale,
      y: pointer_temp.y - mousePointTo.y * newScale,
    };

    stagePosRef.current = newPos;

    stage.position(newPos);
    stage.batchDraw();
  };

  const activateUltron = (shape) => {
    console.log(shape)
    if (shape === "Rectangle") {
      const rect = new Konva.Rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      });
      rect.on("click", () => {
        console.log("rect selected");
        if (trasnformerRef?.current) {
          if (!trasnformerRef.current.nodes().includes(rect)) {
            trasnformerRef.current.nodes([rect]);
          } else
            trasnformerRef.current.nodes([])
        }
      });
      rect.draggable(true);
      shapesRef.current.push(rect)
      drawlayerRef.current.add(rect)

    } else if (shape === "Circle") {
      const circle = new Konva.Circle({
        x: 100,
        y: 100,
        radius: 50,
        fill: 'blue',
      });
      circle.on("click", () => {
        console.log("Circle selected");
        if (trasnformerRef?.current) {
          if (trasnformerRef?.current) {
            if (!trasnformerRef.current.nodes().includes(circle)) {
              trasnformerRef.current.nodes([circle]);
            } else
              trasnformerRef.current.nodes([])
          }
        }
      });
      circle.draggable(true);
      shapesRef.current.push(circle)
      drawlayerRef.current.add(circle)
    } else if (shape === "Triangle") {

    }
  }

  const handleStageDragEnd = () => {
    const pos = stageRef.current.position();
    stagePosRef.current = pos;
  };

  const canvasWidth = fullCanvas?.width;
  const canvasHeight = fullCanvas?.height;

  return (
    <div className="relative border overflow-hidden w-[100%] h-[100%]"
    >
      <div
        style={{ width: "100%", height: "100%" }}
      >
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          scale={canvasScale.current}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDragEnd={handleStageDragEnd}
          style={{ background: "#fff" }}
        >
          <Layer>
            {image && <KonvaImage image={image} />}
          </Layer>
          <Layer ref={drawlayerRef} />
        </Stage>

        <Toolbar activateUltron={activateUltron} />
      </div>
    </div>
  );
}
