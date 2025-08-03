import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Circle, RegularPolygon, Transformer, Shape, Line } from "react-konva";
import { Circle as Circ, Square, Triangle, Shapes, Type, Spline } from "lucide-react"; // You can replace with any icons you prefer

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
                    <Circ />
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
  const [shapes, setShapes] = useState([]);
  const [customShapes, setCustomShapes] = useState([]); // each item is an array of {x, y}

  const selectedId = useRef(null);
  const customShapesRefIndx = useRef(0)
  const trasnformerRef = useRef(null);
  const drawlayerRef = useRef();
  const stageRef = useRef();
  const canvasScale = useRef({ x: 1, y: 1 })
  const stagePosRef = useRef({ x: 0, y: 0 })
  const pointer = useRef({ x: 0, y: 0 });
  const temporary_draw_line_ref = useRef([])
  const redLineRef = useRef(null);

  const handleSelect = (shape) => {
    if (trasnformerRef?.current) {
      const selectedNode = drawlayerRef.current.findOne(`#${shape.id}`);

      if (selectedNode) {
        if (!trasnformerRef.current.nodes().includes(selectedNode)) {
          trasnformerRef.current.nodes([selectedNode]);
        } else
          trasnformerRef.current.nodes([]);
        drawlayerRef.current.batchDraw();
      }
    }
    selectedId.current = shape.id;
  };

  const handleCustomSelect = (t_id) => {
    const selectedNode = drawlayerRef.current.findOne(`#${t_id}`);
    if (selectedNode) {
      console.log("csuotm", selectedNode)
    }
    selectedId.current = t_id;
  }



  // Load fullCanvas into image
  useEffect(() => {
    const img = new window.Image();
    img.src = fullCanvas.toDataURL();
    img.onload = () => setImage(img);
    if (stageRef?.current) {
      stageRef.current.draggable(true);
      stageRef.current.position(stagePosRef.current)
      stageRef.current.batchDraw();

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

    if (activeToolRef?.current && activeToolRef.current === "spline" && customShapes.length > 0) {
      if (customShapes.length - 1 === customShapesRefIndx.current) {
        const thet = customShapes[customShapes.length - 1];
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

  const activateUltron = (shape) => {
    if (shape === "Rectangle") {

      const shape = {
        id: `${shapes.length + 1}`,
        type: 'rect',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red',
      };


      setShapes(prev => [...prev, shape])

    } else if (shape === "Circle") {

      const shape = {
        id: `${shapes.length + 1}`,
        type: 'circle',
        x: 250,
        y: 150,
        radius: 50,
        fill: 'green',
      }


      setShapes(prev => [...prev, shape])


    } else if (shape === "Triangle") {

      const shape = {
        id: `${shapes.length + 1}`,
        type: 'hexagon', // 3-sided polygon (triangle)
        x: 400,
        y: 100,
        sides: 3,
        radius: 60,
        fill: 'blue',
      };


      setShapes(prev => [...prev, shape])

    }
  }

  const activeTool = (tool) => {
    if (activeToolRef.current === "spline" && tool !== "spline") {
      if (customShapes.length - 1 !== customShapesRefIndx.current) {
        //pass
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

      setCustomShapes((prevShapes) => {
        const updated = [...prevShapes];
        if (updated.length - 1 !== customShapesRefIndx.current) {
          updated.push([point_t])
        } else {
          updated[customShapesRefIndx.current].push(point_t)
        }
        return updated;
      });

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
            {shapes.map((shape) => {

              const { type, ...rest } = shape;

              if (type === 'rect') {
                return (
                  <Rect
                    key={shape.id}
                    id={`${shape.id}`}
                    {...rest}
                    draggable
                    onClick={() => handleSelect(shape)}
                  />
                );
              } else if (type === 'circle') {
                return (
                  <Circle
                    key={shape.id}
                    id={`${shape.id}`}
                    {...rest}
                    draggable
                    onClick={() => handleSelect(shape)}
                  />
                );
              } else if (type === 'hexagon') {
                return (
                  <RegularPolygon
                    key={shape.id}
                    id={`${shape.id}`}
                    {...rest}
                    draggable
                    onClick={() => handleSelect(shape)}
                  />
                );
              } else {
                return null;
              }
            })}

            {customShapes.map((points, index) => (
              <Shape
                key={index}
                id={`custom-${index}`}
                onClick={() => handleCustomSelect(`custom-${index}`)}
                sceneFunc={(ctx, shape) => {
                  ctx.beginPath();
                  if (points.length > 0) {
                    points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
                  }
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                }}
                fill="#00D2FF"
                stroke="black"
                strokeWidth={2}
                draggable
              />
            ))}

            <Transformer
              ref={trasnformerRef}
              nodes={[]}
            />
          </Layer>
        </Stage>

        <Toolbar activateUltron={activateUltron} activeTool={activeTool} />
      </div>
    </div>
  );
}
