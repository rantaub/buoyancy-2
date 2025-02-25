import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const objects = [
  { id: 1, name: "Beach Ball", density: 0.3, color: "red", floating: true },
  { id: 2, name: "Metal Cube", density: 7.8, color: "gray", floating: false },
  { id: 3, name: "Wood Block", density: 0.6, color: "brown", floating: true },
  { id: 4, name: "Plastic Ball", density: 0.9, color: "yellow", floating: true },
];

export default function BuoyancyGame() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [result, setResult] = useState(null);

  const checkBuoyancy = (object) => {
    if (object.density < 1) {
      setResult(`${object.name} Floats!`);
    } else {
      setResult(`${object.name} Sinks!`);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Buoyancy Challenge: Sink or Float?</h1>
      <div className="grid grid-cols-2 gap-4">
        {objects.map((obj) => (
          <Card
            key={obj.id}
            onClick={() => setSelectedObject(obj)}
            className="cursor-pointer p-4 bg-white border shadow-md"
          >
            <CardContent className="flex items-center justify-center text-lg font-semibold" style={{ color: obj.color }}>
              {obj.name}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedObject && (
        <motion.div
          className="mt-6 p-4 border rounded-lg bg-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-xl font-semibold">Selected: {selectedObject.name}</h2>
          <p>Density: {selectedObject.density}</p>
          <Button onClick={() => checkBuoyancy(selectedObject)} className="mt-2">
            Test Buoyancy
          </Button>
        </motion.div>
      )}
      {result && (
        <motion.div
          className="mt-4 p-4 text-lg font-bold text-blue-600"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {result}
        </motion.div>
      )}
    </div>
  );
}
