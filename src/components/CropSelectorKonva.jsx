import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Line } from "react-konva";
import { Circle, Square, Triangle, Shapes, Type, Spline } from "lucide-react"; // You can replace with any icons you prefer

const Toolbar = ({ activateUltron, activeTool }) => {

  console.log("toolbar rendered")
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeSubIcon, setActiveSubIcon] = useState(null);

  const icons = [
    { id: "shape", label: "Shapes", icon: Shapes },
    { id: "text", label: "Text", icon: Type },
    { id: "spline", label: "Text", icon: Spline },
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
            onClick={() => {
              setActiveIcon(activeIcon === id ? null : id)
              activeTool(activeIcon === id ? null : id)
            }
            }
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

export default function CropSelectorKonva({ fullCanvas, selectedPage }) {

  console.log("canvas page rendered")
  const [image, setImage] = useState(null);
  const activeToolRef = useRef(null);
  const trasnformerRef = useRef(null);

  const pointer = useRef({ x: 0, y: 0 });
  const stageRef = useRef();
  const drawlayerRef = useRef();
  const canvasScale = useRef({ x: 1, y: 1 })
  const stagePosRef = useRef({ x: 0, y: 0 })
  const shapesRef = useRef([])
  const customShapesRef = useRef([])
  const customShapesRefIndx = useRef(0)
  const temporary_draw_line_ref = useRef([])

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
        console.log("new trans")
        const transformer = new Konva.Transformer();
        trasnformerRef.current = transformer;
        layer.add(trasnformerRef.current);
        transformer.moveToTop();
        stageRef.current.batchDraw();
      }
      const redLine = new Konva.Shape({
        sceneFunc: (context, shape) => {
          if (temporary_draw_line_ref.current.length !== 4)
            return;
          context.beginPath();

          context.lineTo(temporary_draw_line_ref.current[0], temporary_draw_line_ref.current[1]);
          context.lineTo(temporary_draw_line_ref.current[2], temporary_draw_line_ref.current[3]);
          context.closePath();
          context.fillStrokeShape(shape);
        },
        fill: '#00D2FF',
        stroke: 'red',
        strokeWidth: 2,
      });
      drawlayerRef.current.add(redLine);
      redLine.moveToTop();
      drawlayerRef.current.draw();
    }
  }, [fullCanvas]);


  const handleMouseDown = (e) => {
  };

  const handleMouseMove = (e) => {
    const tempttt = stageRef.current.getPointerPosition();
    pointer.current.x = tempttt.x;
    pointer.current.y = tempttt.y;

    const transform = stageRef.current.getAbsoluteTransform().copy().invert();
    const localPoint = transform.point(tempttt);

    if (activeToolRef?.current && activeToolRef.current === "spline" && customShapesRef.current.length > 0) {
      if (customShapesRef.current.length - 1 === customShapesRefIndx.current) {
        const thet = customShapesRef.current[customShapesRef.current.length - 1];
        temporary_draw_line_ref.current = [thet[thet.length - 1].x, thet[thet.length - 1].y, localPoint.x, localPoint.y]
        drawlayerRef.current.batchDraw();
      }
    }

  };

  const handleMouseUp = () => {
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

  const handle_shape_click = (shape) => {
    if (trasnformerRef?.current) {
      if (!trasnformerRef.current.nodes().includes(shape)) {
        trasnformerRef.current.nodes([shape]);
      } else
        trasnformerRef.current.nodes([])
    }
  }

  const activateUltron = (shape) => {
    if (shape === "Rectangle") {
      const rect = new Konva.Rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      });
      rect.on("click", () => {
        handle_shape_click(rect);
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
        handle_shape_click(circle);
      });
      circle.draggable(true);
      shapesRef.current.push(circle)
      drawlayerRef.current.add(circle)
    } else if (shape === "Triangle") {
      const hexagon = new Konva.RegularPolygon({
        x: 100,
        y: 100,
        sides: 3,
        radius: 70,
        fill: 'red',
      });

      hexagon.on("click", () => {
        handle_shape_click(hexagon);
      });
      hexagon.draggable(true);
      shapesRef.current.push(hexagon)
      drawlayerRef.current.add(hexagon)
    }
  }

  const activeTool = (tool) => {
    if (activeToolRef.current === "spline" && tool !== "spline") {
      if (customShapesRef.current.length - 1 !== customShapesRefIndx.current) {
      } else {
        temporary_draw_line_ref.current = [];
        customShapesRefIndx.current += 1
        drawlayerRef.current.batchDraw();
      }
    }
    activeToolRef.current = tool;
  }

  const handleStageDragEnd = () => {
    const pos = stageRef.current.position();
    stagePosRef.current = pos;
  };

  const handleClickCanvas = () => {
    if (activeToolRef?.current && activeToolRef.current === "spline") {
      const pointer_t = stageRef.current.getPointerPosition();
      const transform_t = stageRef.current.getAbsoluteTransform().copy().invert();
      const point_t = transform_t.point(pointer_t);

      if (customShapesRef.current.length - 1 !== customShapesRefIndx.current) {

        customShapesRef.current.push([point_t])
        const the_index = customShapesRefIndx.current;

        const shape = new Konva.Shape({
          sceneFunc: (context, shape) => {
            context.beginPath();
            for (let i = 0; i < customShapesRef.current[the_index].length; i++) {
              context.lineTo(customShapesRef.current[the_index][i].x, customShapesRef.current[the_index][i].y);
            }
            context.closePath();
            context.fillStrokeShape(shape);
          },
          fill: '#00D2FF',
          stroke: 'black',
          strokeWidth: 2,
        });

        shape.on("click", () => {

        });

        shape.draggable(true);
        shapesRef.current.push(shape)
        drawlayerRef.current.add(shape)
        drawlayerRef.current.batchDraw();
      } else {
        customShapesRef.current[customShapesRefIndx.current].push(point_t)
        drawlayerRef.current.batchDraw();
      }
    }
  }

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
          onClick={handleClickCanvas}
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
          <Layer ref={drawlayerRef}>
          </Layer>
        </Stage>

        <Toolbar activateUltron={activateUltron} activeTool={activeTool} />
      </div>
    </div>
  );
}
