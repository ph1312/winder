import React, { useState } from 'react';

export default function StangCalculator() {
  // Vaste papiersoorten
  const vastePapiersoorten = [
    { code: "1F090", naam: "Fluting", gewicht: 90, dichtheid: 120, dikte: 0.957 },
    { code: "1F100", naam: "Fluting", gewicht: 100, dichtheid: 120, dikte: 1.063 },
    { code: "1F110", naam: "Fluting", gewicht: 110, dichtheid: 120, dikte: 1.169 },
    { code: "1F120", naam: "Fluting", gewicht: 120, dichtheid: 120, dikte: 1.276 },
    { code: "1F130", naam: "Fluting", gewicht: 130, dichtheid: 120, dikte: 1.382 },
    { code: "1F140", naam: "Fluting", gewicht: 140, dichtheid: 120, dikte: 1.488 }
  ];

  // State variabelen
  const [soortCode, setSoortCode] = useState("1F100");
  const [stamboer, setStamboer] = useState(529);
  const [resultaat, setResultaat] = useState(null);

  // Vaste waarden
  const kokerDiameter = 821; // 3 inch koker
  const correctieFactor = 1.52; // Correctiefactor voor praktijkrealiteit
  
  // Berekende tamboer diameter
  const tamboerDiameter = stamboer * 2 + kokerDiameter;
  
  // Haal eigenschappen op voor geselecteerde papiersoort
  const eigenschappen = vastePapiersoorten.find(s => s.code === soortCode) || vastePapiersoorten[0];

  // Bereken papierlengte in tamboer
  function berekenTamboerLengte(stamboer, kokerDiam, dichtheid, dikte) {
    return Math.PI * (Math.pow(stamboer, 2) + stamboer * kokerDiam) * dikte / dichtheid;
  }

  // Bereken papierlengte voor één stang
  function berekenLengtePerStang(stangDiameter, kokerDiam, dichtheid, dikte) {
    const stangStamboer = (stangDiameter - kokerDiam) / 2;
    const basisLengte = Math.PI * (Math.pow(stangStamboer, 2) + stangStamboer * kokerDiam) * dikte / dichtheid;
    return basisLengte * correctieFactor; // Toepassing correctiefactor
  }

  // Bereken stangdiameter op basis van papierlengte
  function berekenStangDiameter(lengtePapier, kokerDiam, dichtheid, dikte) {
    // Correctie voor de inverse berekening
    const gecorrigeerdeLengte = lengtePapier / correctieFactor;
    const stangStamboer = (Math.sqrt((gecorrigeerdeLengte * 4 * dichtheid) / (Math.PI * dikte) + Math.pow(kokerDiam, 2)) - kokerDiam) / 2;
    return 2 * stangStamboer + kokerDiam;
  }

  // Bereken optimale verdeling
  function berekenOptimaleVerdeling() {
    try {
      if (!eigenschappen) return;
      
      const dichtheid = eigenschappen.dichtheid;
      const dikte = eigenschappen.dikte;
      
      // Totale papierlengte berekenen
      const totaleLengte = berekenTamboerLengte(
        stamboer, 
        kokerDiameter, 
        dichtheid, 
        dikte
      );

      // Hoeveel stangen kunnen we maken met min diameter (1200mm)
      const lengtePerMinStang = berekenLengtePerStang(
        1200,
        kokerDiameter,
        dichtheid,
        dikte
      );
      const aantalMinStangen = Math.floor(totaleLengte / lengtePerMinStang);
      
      // Als we geen enkele stang kunnen maken, vroeg stoppen
      if (aantalMinStangen === 0) {
        setResultaat({
          aantalStangen: 0,
          bericht: "Stamboer te klein: geen stangen mogelijk"
        });
        return;
      }
      
      // Strategie 1: Optimale verdeling met gelijke diameters
      // Verdeel de papierlengte gelijk over het aantal min stangen
      const lengtePer = totaleLengte / aantalMinStangen;
      const optimaleDiameter = berekenStangDiameter(
        lengtePer,
        kokerDiameter,
        dichtheid,
        dikte
      );
      
      // Controleer of optimale diameter binnen grenzen valt
      if (optimaleDiameter >= 1200 && optimaleDiameter <= 1400) {
        // Deze strategie is optimaal
        setResultaat({
          aantalStangen: aantalMinStangen,
          diameters: Array(aantalMinStangen).fill(Math.round(optimaleDiameter)),
          bericht: `Maak ${aantalMinStangen} stangen met diameter ${Math.round(optimaleDiameter)} mm`
        });
        return;
      }
      
      // Strategie 2: Maximaal aantal stangen met min/max diameters
      if (optimaleDiameter < 1200) {
        // We kunnen niet alle stangen maken met minimale diameter
        // Maak 1 minder stang en bereken nieuwe optimale diameter
        const nieuwAantal = aantalMinStangen - 1;
        const nieuweLengtePer = totaleLengte / nieuwAantal;
        const nieuweDiameter = berekenStangDiameter(
          nieuweLengtePer,
          kokerDiameter,
          dichtheid,
          dikte
        );
        
        if (nieuweDiameter <= 1400) {
          setResultaat({
            aantalStangen: nieuwAantal,
            diameters: Array(nieuwAantal).fill(Math.round(nieuweDiameter)),
            bericht: `Maak ${nieuwAantal} stangen met diameter ${Math.round(nieuweDiameter)} mm`
          });
          return;
        }
      }
      
      // Strategie 3: Combineer verschillende diameters
      // Bereken hoeveel stangen we kunnen maken met max diameter (1400mm)
      const lengtePerMaxStang = berekenLengtePerStang(
        1400,
        kokerDiameter,
        dichtheid,
        dikte
      );
      const aantalMaxStangen = Math.floor(totaleLengte / lengtePerMaxStang);
      
      // Bereken resterende lengte
      const resterend = totaleLengte - (aantalMaxStangen * lengtePerMaxStang);
      const laatsteDiameter = berekenStangDiameter(
        resterend,
        kokerDiameter,
        dichtheid,
        dikte
      );
      
      const diameters = Array(aantalMaxStangen).fill(1400);
      let bericht = `Maak ${aantalMaxStangen} stangen met diameter 1400 mm`;
      
      if (laatsteDiameter >= 1200) {
        diameters.push(Math.round(laatsteDiameter));
        bericht += ` en 1 stang met diameter ${Math.round(laatsteDiameter)} mm`;
      }
      
      setResultaat({
        aantalStangen: diameters.length,
        diameters,
        bericht
      });
      
    } catch (err) {
      console.error("Berekeningsfout:", err);
      setResultaat({
        aantalStangen: 0,
        bericht: "Fout in berekening"
      });
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Stang Calculator</h1>
      
      <div className="bg-gray-50 p-4 rounded mb-4">
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-2 items-center mb-3">
            <div className="text-right font-medium">P-code:</div>
            <div className="col-span-2">
              <select 
                value={soortCode}
                onChange={(e) => setSoortCode(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {vastePapiersoorten.map(soort => (
                  <option key={soort.code} value={soort.code}>
                    {soort.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 items-center mb-3">
            <div className="text-right font-medium">Tamboer:</div>
            <div>
              <input
                type="number"
                value={stamboer}
                onChange={(e) => setStamboer(Number(e.target.value))}
                className="w-full p-2 border rounded bg-yellow-100"
                min="200"
                max="1500"
              />
            </div>
            <div>mm</div>
          </div>
        </div>
        
        <button
          onClick={berekenOptimaleVerdeling}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Bereken
        </button>
      </div>
      
      {resultaat && (
        <div className="bg-gray-50 p-4 rounded">
          <div className="mb-4 p-3 bg-green-50 rounded text-center">
            <p className="font-bold text-lg">{resultaat.bericht}</p>
          </div>
          
          {resultaat.aantalStangen > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-center">Stangen:</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 text-center">#</th>
                    <th className="border p-2 text-center">Diameter (mm)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultaat.diameters.map((diameter, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2 text-center">{diameter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
